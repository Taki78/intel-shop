import random
import secrets
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('ایمیل الزامی است')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, verbose_name='ایمیل')
    name = models.CharField(max_length=150, verbose_name='نام')
    phone = models.CharField(max_length=15, blank=True, verbose_name='موبایل')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    is_staff = models.BooleanField(default=False, verbose_name='کارمند')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'

    def __str__(self):
        return self.email


class Province(models.Model):
    name  = models.CharField(max_length=60, unique=True, verbose_name='نام استان')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='ترتیب نمایش')

    class Meta:
        verbose_name        = 'استان'
        verbose_name_plural = 'استان‌ها'
        ordering            = ['order', 'name']

    def __str__(self):
        return self.name


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses', verbose_name='کاربر')
    label = models.CharField(max_length=50, default='خانه', verbose_name='برچسب')
    full_name = models.CharField(max_length=150, verbose_name='نام تحویل‌گیرنده')
    phone = models.CharField(max_length=15, verbose_name='موبایل')
    province = models.CharField(max_length=50, verbose_name='استان')
    city = models.CharField(max_length=50, verbose_name='شهر')
    postal_code = models.CharField(max_length=10, blank=True, verbose_name='کد پستی')
    detail = models.TextField(verbose_name='آدرس کامل')
    is_default = models.BooleanField(default=False, verbose_name='پیش‌فرض')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'آدرس'
        verbose_name_plural = 'آدرس‌ها'
        ordering = ['-is_default', '-created_at']

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user.name} — {self.city}'


class OTPCode(models.Model):
    """One-time code for register-verify, password-reset, and future flows
    like email-change. The same table serves all purposes — distinguished by
    `purpose`."""
    PURPOSE_CHOICES = [
        ('register', 'تأیید ثبت‌نام'),
        ('reset',    'بازیابی رمز عبور'),
    ]
    METHOD_CHOICES = [
        ('email', 'ایمیل'),
        ('phone', 'موبایل'),
    ]

    purpose      = models.CharField(max_length=10, choices=PURPOSE_CHOICES)
    method       = models.CharField(max_length=10, choices=METHOD_CHOICES)
    value        = models.CharField(max_length=150)  # email or phone
    code         = models.CharField(max_length=6)
    # Short-lived token issued after the code is verified, used to finalize
    # the action (register-complete or password-reset) without re-sending the code.
    proof_token  = models.CharField(max_length=64, blank=True)
    used         = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    expires_at   = models.DateTimeField()

    class Meta:
        verbose_name = 'کد یک‌بارمصرف'
        verbose_name_plural = 'کدهای یک‌بارمصرف'
        indexes = [models.Index(fields=['purpose', 'method', 'value'])]

    LIFETIME = timedelta(minutes=2)

    @classmethod
    def generate(cls, purpose, method, value):
        """Invalidate any outstanding unused codes for the same (purpose,method,value)
        and issue a fresh one. Returns the new instance."""
        cls.objects.filter(purpose=purpose, method=method, value=value, used=False).update(used=True)
        return cls.objects.create(
            purpose=purpose,
            method=method,
            value=value,
            code=f'{random.randint(0, 999999):06d}',
            expires_at=timezone.now() + cls.LIFETIME,
        )

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at

    def verify(self, code):
        """If `code` matches and is still valid, mint a short proof_token and
        return it. Otherwise return None. Note: this does NOT mark the OTP as
        used — the caller marks it used on successful finalize, so the proof
        remains valid until the user completes the next step."""
        if self.code == code and self.is_valid():
            self.proof_token = secrets.token_urlsafe(32)
            self.save(update_fields=['proof_token'])
            return self.proof_token
        return None
