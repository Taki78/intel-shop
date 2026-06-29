"""High-level send_sms / send_email helpers + OTP templates.

Callers should use these — never instantiate a backend directly. That way
swapping providers is a one-line change in settings.
"""
from importlib import import_module
from django.conf import settings
from django.core.mail import send_mail
from django.utils.module_loading import import_string


# ─── SMS ─────────────────────────────────────────────────────────────────────
_sms_backend_cache = None


def _get_sms_backend():
    global _sms_backend_cache
    if _sms_backend_cache is None:
        path = getattr(settings, 'SMS_BACKEND',
                       'apps.notifications.sms_backends.ConsoleSMSBackend')
        _sms_backend_cache = import_string(path)()
    return _sms_backend_cache


def send_sms(phone, message):
    """Send an SMS via the configured backend. Returns a result dict; raises on transport error."""
    backend = _get_sms_backend()
    return backend.send(phone, message)


# ─── Email ───────────────────────────────────────────────────────────────────
def send_email(to, subject, body, html_body=None):
    """Send a plain (and optionally HTML) email via Django's configured EMAIL_BACKEND.
    With the dev console backend the message prints to stdout."""
    from django.core.mail import EmailMultiAlternatives
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@intelshop.ir')
    msg = EmailMultiAlternatives(subject, body, from_email, [to])
    if html_body:
        msg.attach_alternative(html_body, 'text/html')
    return msg.send(fail_silently=False)


# ─── High-level helpers used by auth views ───────────────────────────────────
def send_otp(method, value, code, purpose):
    """Send OTP via SMS. method must be 'phone'."""
    if purpose == 'register':
        sms_text = f'کد تأیید ثبت‌نام اینتل شاپ: {code}'
    elif purpose == 'reset':
        sms_text = f'کد بازیابی رمز عبور اینتل شاپ: {code}'
    else:
        raise ValueError(f'unknown OTP purpose: {purpose}')
    return send_sms(value, sms_text)
