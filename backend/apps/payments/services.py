"""High-level payment helpers. Callers import from here — never touch a backend directly."""
from django.utils.module_loading import import_string
from django.conf import settings

_backend_cache = None


def _get_backend():
    global _backend_cache
    if _backend_cache is None:
        path = getattr(settings, 'PAYMENT_BACKEND', 'apps.payments.backends.MockPaymentBackend')
        _backend_cache = import_string(path)()
    return _backend_cache


def initiate_payment(order, callback_url):
    """Create a payment request for the order. Returns {'authority', 'payment_url', 'provider'}."""
    backend = _get_backend()
    return backend.request(
        amount=order.total,
        callback_url=callback_url,
        description=f'پرداخت سفارش {order.order_number} — اینتل شاپ',
        email=getattr(order.user, 'email', '') or '',
        mobile=getattr(order.user, 'phone', '') or '',
    )


def verify_payment(authority, amount):
    """Verify a payment with the gateway. Returns {'ref_id', 'provider'} or raises on failure."""
    backend = _get_backend()
    return backend.verify(amount=amount, authority=authority)
