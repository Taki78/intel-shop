from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.conf import settings
from .models import User, Address, Province, PasswordResetOTP
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ProfileUpdateSerializer, ChangePasswordSerializer, AddressSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            return Response({'detail': 'ایمیل یا رمز عبور اشتباه است'}, status=status.HTTP_401_UNAUTHORIZED)

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


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email        = request.data.get('email', '').strip().lower()
        phone        = request.data.get('phone', '').strip()
        new_password = request.data.get('new_password', '')

        try:
            user = User.objects.get(email=email, phone=phone, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'detail': 'ایمیل یا شماره موبایل اشتباه است'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'detail': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'رمز عبور با موفقیت تغییر کرد'})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        method = request.data.get('method', '')
        value  = request.data.get('value', '').strip()

        if method not in ('email', 'phone'):
            return Response({'detail': 'روش نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        if not value:
            return Response({'detail': 'مقدار الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        if method == 'email':
            exists = User.objects.filter(email__iexact=value, is_active=True).exists()
            label = 'ایمیل'
        else:
            exists = User.objects.filter(phone=value, is_active=True).exists()
            label = 'شماره موبایل'

        if not exists:
            return Response({'detail': f'کاربری با این {label} یافت نشد'}, status=status.HTTP_400_BAD_REQUEST)

        otp = PasswordResetOTP.generate(method, value)

        data = {'detail': f'کد ۶ رقمی به {label} شما ارسال شد'}
        if getattr(settings, 'DEBUG', False):
            data['debug_code'] = otp.code
        return Response(data)


class PasswordResetVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        method = request.data.get('method', '')
        value  = request.data.get('value', '').strip()
        code   = request.data.get('code', '').strip()

        try:
            otp = PasswordResetOTP.objects.filter(
                method=method, value=value, used=False
            ).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            return Response({'detail': 'کد نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        reset_token = otp.verify_and_get_token(code)
        if not reset_token:
            return Response({'detail': 'کد اشتباه یا منقضی شده است'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'reset_token': reset_token})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        reset_token  = request.data.get('reset_token', '').strip()
        new_password = request.data.get('new_password', '')

        try:
            otp = PasswordResetOTP.objects.get(reset_token=reset_token, used=False)
        except PasswordResetOTP.DoesNotExist:
            return Response({'detail': 'توکن نامعتبر یا منقضی شده است'}, status=status.HTTP_400_BAD_REQUEST)

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


class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    pagination_class = None

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-is_default', 'created_at')

    def perform_create(self, serializer):
        user = self.request.user
        is_default = serializer.validated_data.get('is_default', False)
        # First address auto-becomes default; explicit default clears others
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
