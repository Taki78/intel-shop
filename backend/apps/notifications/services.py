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
    """Dispatch an OTP via the right channel with a localized message.
    `purpose` is one of 'register', 'reset' — drives the wording."""
    if purpose == 'register':
        sms_text = f'کد تأیید ثبت‌نام شما در اینتل شاپ: {code}\nاین کد تا ۲ دقیقه معتبر است.'
        email_subject = 'کد تأیید ثبت‌نام — اینتل شاپ'
        email_text = (
            f'کاربر گرامی،\n\n'
            f'کد تأیید ثبت‌نام شما در فروشگاه اینتل شاپ:\n\n'
            f'    {code}\n\n'
            f'این کد تا ۲ دقیقه معتبر است.\n'
            f'اگر شما درخواست ثبت‌نام نکرده‌اید، این پیام را نادیده بگیرید.\n\n'
            f'با احترام،\nتیم اینتل شاپ'
        )
    elif purpose == 'reset':
        sms_text = f'کد بازیابی رمز عبور اینتل شاپ: {code}\nاین کد تا ۲ دقیقه معتبر است.'
        email_subject = 'کد بازیابی رمز عبور — اینتل شاپ'
        email_text = (
            f'کاربر گرامی،\n\n'
            f'کد بازیابی رمز عبور شما در اینتل شاپ:\n\n'
            f'    {code}\n\n'
            f'این کد تا ۲ دقیقه معتبر است.\n'
            f'اگر شما درخواست بازیابی نکرده‌اید، این پیام را نادیده بگیرید.\n\n'
            f'با احترام،\nتیم اینتل شاپ'
        )
    else:
        raise ValueError(f'unknown OTP purpose: {purpose}')

    if method == 'phone':
        return send_sms(value, sms_text)
    elif method == 'email':
        return send_email(value, email_subject, email_text)
    else:
        raise ValueError(f'unknown OTP method: {method}')


def send_welcome(user):
    """Sent once after a successful registration."""
    if user.email:
        send_email(
            user.email,
            'خوش آمدید به اینتل شاپ',
            (f'سلام {user.name}،\n\n'
             f'حساب کاربری شما در فروشگاه اینتل شاپ با موفقیت ساخته شد.\n'
             f'با آرزوی خریدی خوب،\n\n'
             f'تیم اینتل شاپ'),
        )
