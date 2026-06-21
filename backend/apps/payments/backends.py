"""Pluggable payment backends — swap via settings.PAYMENT_BACKEND.

Each backend exposes:
  request(amount, callback_url, description, email='', mobile='')
    → {'authority': str, 'payment_url': str, 'provider': str}
  verify(amount, authority)
    → {'ref_id': str, 'provider': str}

Failures must raise — let the caller decide what to do.
"""
import time
import logging

logger = logging.getLogger('intel_shop.payment')


class MockPaymentBackend:
    """Dev-only: simulates a successful payment without hitting any real gateway."""
    name = 'mock'

    def request(self, amount, callback_url, description, email='', mobile=''):
        authority = f'MOCK-{amount}-{int(time.time())}'
        sep = '&' if '?' in callback_url else '?'
        payment_url = f'{callback_url}{sep}Authority={authority}&Status=OK'
        logger.info('[MOCK PAYMENT] amount=%s authority=%s', amount, authority)
        print(f'\n💳 [MOCK PAYMENT → {amount:,} ریال]\n  Callback: {payment_url}\n')
        return {'authority': authority, 'payment_url': payment_url, 'provider': self.name}

    def verify(self, amount, authority):
        if not str(authority).startswith('MOCK-'):
            raise RuntimeError('Mock verify: unexpected authority format')
        return {'ref_id': f'MOCK-REF-{int(time.time())}', 'provider': self.name}


class ZarinPalBackend:
    """ZarinPal payment gateway (zarinpal.com).

    Required settings:
      ZARINPAL_MERCHANT_ID — 36-char UUID from your ZarinPal dashboard
    Optional:
      ZARINPAL_SANDBOX = True/False (default False)
    """
    name = 'zarinpal'

    _PROD_REQUEST = 'https://payment.zarinpal.com/pg/v4/payment/request.json'
    _PROD_VERIFY  = 'https://payment.zarinpal.com/pg/v4/payment/verify.json'
    _PROD_GATE    = 'https://www.zarinpal.com/pg/StartPay/{authority}'
    _SB_REQUEST   = 'https://sandbox.zarinpal.com/pg/v4/payment/request.json'
    _SB_VERIFY    = 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json'
    _SB_GATE      = 'https://sandbox.zarinpal.com/pg/StartPay/{authority}'

    def __init__(self):
        from django.conf import settings
        self.merchant_id = getattr(settings, 'ZARINPAL_MERCHANT_ID', '')
        if not self.merchant_id:
            raise RuntimeError('ZARINPAL_MERCHANT_ID is not configured')
        sandbox = getattr(settings, 'ZARINPAL_SANDBOX', False)
        if sandbox:
            self._req_url, self._ver_url, self._gate_url = self._SB_REQUEST, self._SB_VERIFY, self._SB_GATE
        else:
            self._req_url, self._ver_url, self._gate_url = self._PROD_REQUEST, self._PROD_VERIFY, self._PROD_GATE

    def request(self, amount, callback_url, description, email='', mobile=''):
        import requests as req
        payload = {
            'merchant_id': self.merchant_id,
            'amount': amount,
            'callback_url': callback_url,
            'description': description,
            'metadata': {'email': email or '', 'mobile': mobile or ''},
        }
        resp = req.post(self._req_url, json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        code = data.get('data', {}).get('code')
        if code not in (100, 101):
            raise RuntimeError(f'ZarinPal request failed (code={code}): {data}')
        authority = data['data']['authority']
        return {
            'authority': authority,
            'payment_url': self._gate_url.format(authority=authority),
            'provider': self.name,
        }

    def verify(self, amount, authority):
        import requests as req
        payload = {
            'merchant_id': self.merchant_id,
            'amount': amount,
            'authority': authority,
        }
        resp = req.post(self._ver_url, json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        code = data.get('data', {}).get('code')
        if code not in (100, 101):
            raise RuntimeError(f'ZarinPal verify failed (code={code}): {data}')
        return {'ref_id': str(data['data']['ref_id']), 'provider': self.name}


class IDPayBackend:
    """IDPay payment gateway (idpay.ir).

    Required settings:
      IDPAY_API_KEY — from your IDPay dashboard
    Optional:
      IDPAY_SANDBOX = True/False (default False)
    """
    name = 'idpay'
    _REQUEST_URL = 'https://api.idpay.ir/v1.1/payment'
    _VERIFY_URL  = 'https://api.idpay.ir/v1.1/payment/verify'

    def __init__(self):
        from django.conf import settings
        self.api_key = getattr(settings, 'IDPAY_API_KEY', '')
        if not self.api_key:
            raise RuntimeError('IDPAY_API_KEY is not configured')
        self.sandbox = getattr(settings, 'IDPAY_SANDBOX', False)

    def _headers(self):
        h = {'X-API-KEY': self.api_key, 'Content-Type': 'application/json'}
        if self.sandbox:
            h['X-SANDBOX'] = '1'
        return h

    def request(self, amount, callback_url, description, email='', mobile=''):
        import requests as req
        order_ref = f'ORD-{int(time.time())}'
        payload = {
            'order_id': order_ref,
            'amount': amount,
            'callback': callback_url,
            'desc': description,
        }
        if email:  payload['mail']  = email
        if mobile: payload['phone'] = mobile
        resp = req.post(self._REQUEST_URL, json=payload, headers=self._headers(), timeout=15)
        resp.raise_for_status()
        data = resp.json()
        if 'id' not in data or 'link' not in data:
            raise RuntimeError(f'IDPay request error: {data}')
        return {
            'authority': data['id'],
            'payment_url': data['link'],
            'provider': self.name,
        }

    def verify(self, amount, authority):
        import requests as req
        payload = {'id': authority, 'order_id': authority}
        resp = req.post(self._VERIFY_URL, json=payload, headers=self._headers(), timeout=15)
        resp.raise_for_status()
        data = resp.json()
        if data.get('status') not in (100, 101):
            raise RuntimeError(f'IDPay verify failed: {data}')
        return {'ref_id': str(data.get('track_id', authority)), 'provider': self.name}
