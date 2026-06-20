from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.notifications.services import send_otp, send_welcome

from .models import User, Address, Province, OTPCode
from .serializers import (
    LoginSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    AddressSerializer,
)


# ─── Helpers ─────────────────────────────────────────────────────────────────
OTP_RATE_LIMIT_PER_HOUR = 3


def _normalize(method, value):
    """Lowercase emails, strip whitespace."""
    value = (value or '').strip()
    if method == 'email':
        value = value.lower()
    return value


def _validate_method_value(method, value):
    """Return (error_response, normalized_value). error_response is None on success."""
    if method not in ('email', 'phone'):
        return Response({'detail': 'روش نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST), None
    if not value:
        return Response({'detail': 'مقدار الزامی است'}, status=status.HTTP_400_BAD_REQUEST), None
    value = _normalize(method, value)
    if method == 'email' and '@' not in value:
        return Response({'detail': 'ایمیل نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST), None
    if method == 'phone' and not (value.isdigit() and len(value) in (10, 11)):
        return Response({'detail': 'شماره موبایل نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST), None
    return None, value


def _rate_limited(purpose, method, value):
    """True if the (purpose,method,value) tuple has exceeded its OTP request budget
    for the past hour. Prevents spam-sending SMS/email."""
    one_hour_ago = timezone.now() - timedelta(hours=1)
    count = OTPCode.objects.filter(
        purpose=purpose, method=method, value=value, created_at__gte=one_hour_ago,
    ).count()
    return count >= OTP_RATE_LIMIT_PER_HOUR


def _user_already_exists(method, value):
    if method == 'email':
        return User.objects.filter(email__iexact=value).exists()
    return User.objects.filter(phone=value).exists()


def _dispatch_otp(otp):
    """Send the OTP and (in DEBUG) include the code in the response so devs
    don't need to dig through logs. Returns the response payload dict."""
    try:
        send_otp(otp.method, otp.value, otp.code, otp.purpose)
    except Exception as exc:  # noqa: BLE001
        return {'detail': f'ارسال کد با خطا مواجه شد: {exc}', '_error': True}
    payload = {'detail': 'کد ۶ رقمی ارسال شد', 'method': otp.method, 'value': otp.value,
               'expires_in_seconds': int(OTPCode.LIFETIME.total_seconds())}
    if getattr(settings, 'DEBUG', False):
        payload['debug_code'] = otp.code
    return payload


# ─── Registration: 3-step verify-first flow ──────────────────────────────────
class RegisterRequestView(APIView):
    """Step 1 — send an OTP to the email or phone the user wants to register with."""
    permission_classes = [AllowAny]

    def post(self, request):
        method = request.data.get('method', '')
        value  = request.data.get('value', '')

        err, value = _validate_method_value(method, value)
        if err:
            return err
        if _user_already_exists(method, value):
            label = 'ایمیل' if method == 'email' else 'شماره موبایل'
            return Response({'detail': f'این {label} قبلاً ثبت‌نام کرده است'},
                            status=status.HTTP_400_BAD_REQUEST)
        if _rate_limited('register', method, value):
            return Response({'detail': 'تعداد درخواست‌ها زیاد است؛ کمی صبر کنید'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp = OTPCode.generate('register', method, value)
        payload = _dispatch_otp(otp)
        if payload.get('_error'):
            return Response({'detail': payload['detail']}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(payload)


class RegisterVerifyView(APIView):
    """Step 2 — exchange the OTP for a short-lived registration token."""
    permission_classes = [AllowAny]

    def post(self, request):
        method = request.data.get('method', '')
        value  = request.data.get('value', '')
        code   = (request.data.get('code') or '').strip()

        err, value = _validate_method_value(method, value)
        if err:
            return err

        otp = (OTPCode.objects
               .filter(purpose='register', method=method, value=value, used=False)
               .order_by('-created_at').first())
        if not otp:
            return Response({'detail': 'ابتدا کد را درخواست کنید'}, status=status.HTTP_400_BAD_REQUEST)

        token = otp.verify(code)
        if not token:
            return Response({'detail': 'کد اشتباه یا منقضی شده است'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'registration_token': token, 'method': method, 'value': value})


class RegisterCompleteView(APIView):
    """Step 3 — finalize: the user supplies name + password (and optionally the
    other contact field) and the account is created + JWT issued."""
    permission_classes = [AllowAny]

    def post(self, request):
        token    = (request.data.get('registration_token') or '').strip()
        name     = (request.data.get('name') or '').strip()
        password = request.data.get('password') or ''
        confirm  = request.data.get('confirm') or ''
        # When registering by email the user may optionally supply a phone, and vice versa.
        extra_email = (request.data.get('email') or '').strip().lower()
        extra_phone = (request.data.get('phone') or '').strip()

        if not token:
            return Response({'detail': 'توکن تأیید الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        if not name:
            return Response({'detail': 'نام الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        if password != confirm:
            return Response({'detail': 'رمز عبور و تکرار آن مطابقت ندارند'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            otp = OTPCode.objects.get(purpose='register', proof_token=token, used=False)
        except OTPCode.DoesNotExist:
            return Response({'detail': 'توکن نامعتبر یا منقضی است'}, status=status.HTTP_400_BAD_REQUEST)
        if not otp.is_valid():
            return Response({'detail': 'توکن منقضی شده — لطفاً دوباره کد بگیرید'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Build user fields from the verified channel + whatever optional contact was added
        if otp.method == 'email':
            email = otp.value
            phone = extra_phone
        else:
            email = extra_email
            phone = otp.value
        if not email:
            return Response({'detail': 'ایمیل الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        # Double-check uniqueness — someone may have registered with the same email/phone
        # between request and complete.
        if User.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'این ایمیل قبلاً ثبت‌نام کرده است'}, status=status.HTTP_400_BAD_REQUEST)
        if phone and User.objects.filter(phone=phone).exists():
            return Response({'detail': 'این شماره موبایل قبلاً ثبت‌نام کرده است'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password)
        except ValidationError as e:
            return Response({'detail': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, name=name, phone=phone, password=password)
        otp.used = True
        otp.save(update_fields=['used'])

        # Welcome email is best-effort; don't fail the whole registration on it
        try:
            send_welcome(user)
        except Exception:
            pass

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


# ─── Login / Logout ──────────────────────────────────────────────────────────
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if not user or not user.is_active:
            return Response({'detail': 'ایمیل یا رمز عبور اشتباه است'},
                            status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# ─── Password reset: 3-step OTP flow (same OTPCode table) ────────────────────
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        method = request.data.get('method', '')
        value  = request.data.get('value', '')

        err, value = _validate_method_value(method, value)
        if err:
            return err

        if method == 'email':
            exists = User.objects.filter(email__iexact=value, is_active=True).exists()
            label = 'ایمیل'
        else:
            exists = User.objects.filter(phone=value, is_active=True).exists()
            label = 'شماره موبایل'

        if not exists:
            return Response({'detail': f'کاربری با این {label} یافت نشد'},
                            status=status.HTTP_400_BAD_REQUEST)

        if _rate_limited('reset', method, value):
            return Response({'detail': 'تعداد درخواست‌ها زیاد است؛ کمی صبر کنید'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp = OTPCode.generate('reset', method, value)
        payload = _dispatch_otp(otp)
        if payload.get('_error'):
            return Response({'detail': payload['detail']}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(payload)


class PasswordResetVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        method = request.data.get('method', '')
        value  = request.data.get('value', '')
        code   = (request.data.get('code') or '').strip()

        err, value = _validate_method_value(method, value)
        if err:
            return err

        otp = (OTPCode.objects
               .filter(purpose='reset', method=method, value=value, used=False)
               .order_by('-created_at').first())
        if not otp:
            return Response({'detail': 'ابتدا کد را درخواست کنید'}, status=status.HTTP_400_BAD_REQUEST)

        # Keep response shape backward-compatible (frontend uses `reset_token`)
        token = otp.verify(code)
        if not token:
            return Response({'detail': 'کد اشتباه یا منقضی شده است'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'reset_token': token})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        reset_token  = (request.data.get('reset_token') or '').strip()
        new_password = request.data.get('new_password') or ''

        try:
            otp = OTPCode.objects.get(purpose='reset', proof_token=reset_token, used=False)
        except OTPCode.DoesNotExist:
            return Response({'detail': 'توکن نامعتبر یا منقضی شده است'},
                            status=status.HTTP_400_BAD_REQUEST)
        if not otp.is_valid():
            return Response({'detail': 'توکن منقضی شده است'}, status=status.HTTP_400_BAD_REQUEST)

        filter_kw = {'email__iexact': otp.value} if otp.method == 'email' else {'phone': otp.value}
        try:
            user = User.objects.get(**filter_kw, is_active=True)
        except User.DoesNotExist:
            return Response({'detail': 'کاربر یافت نشد'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'detail': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password'])
        otp.used = True
        otp.save(update_fields=['used'])
        return Response({'detail': 'رمز عبور با موفقیت تغییر کرد'})


# ─── Profile / Addresses (unchanged) ─────────────────────────────────────────
class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save(update_fields=['password'])
            return Response({'detail': 'رمز عبور با موفقیت تغییر کرد'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProvinceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        names = list(Province.objects.values_list('name', flat=True))
        return Response(names)


class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    pagination_class = None

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-is_default', 'created_at')

    def perform_create(self, serializer):
        user = self.request.user
        is_default = serializer.validated_data.get('is_default', False)
        if is_default or not Address.objects.filter(user=user).exists():
            Address.objects.filter(user=user).update(is_default=False)
            serializer.save(user=user, is_default=True)
        else:
            serializer.save(user=user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).exclude(pk=self.get_object().pk).update(is_default=False)
        serializer.save()


class SetDefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            address = Address.objects.get(pk=pk, user=request.user)
            Address.objects.filter(user=request.user).update(is_default=False)
            address.is_default = True
            address.save(update_fields=['is_default'])
            return Response({'detail': 'آدرس پیش‌فرض تنظیم شد'})
        except Address.DoesNotExist:
            return Response({'detail': 'آدرس یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
