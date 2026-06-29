"""Pluggable SMS backends. Swap implementations via settings.SMS_BACKEND.

Each backend exposes a callable `send(phone, message)` that returns a dict:
  {'sent': bool, 'provider': str, 'detail': str}
Failures must raise — don't swallow them, let the caller decide.
"""
import logging

logger = logging.getLogger('intel_shop.sms')


class ConsoleSMSBackend:
    """Logs the SMS to stdout. Default for development."""
    name = 'console'

    def send(self, phone, message):
        logger.info('[SMS → %s] %s', phone, message)
        # Also print so it's visible even without logging config
        print(f'\n📱 [SMS → {phone}]\n{message}\n')
        return {'sent': True, 'provider': self.name, 'detail': 'logged-to-console'}


class NullSMSBackend:
    """Drops messages silently. Useful when tests should not log."""
    name = 'null'

    def send(self, phone, message):
        return {'sent': True, 'provider': self.name, 'detail': 'no-op'}


class SmsIrBackend:
    """SMS.ir backend — uses verify endpoint with OTP template."""
    name = 'sms.ir'

    def send(self, phone, message):
        import requests as _req
        import os, re
        api_key = os.environ.get('SMSIR_API_KEY')
        if not api_key:
            raise RuntimeError('SMSIR_API_KEY not set in environment')
        template_id = int(os.environ.get('SMSIR_TEMPLATE_ID', '662669'))

        # extract the numeric OTP code from the message
        match = re.search(r'\b(\d{4,8})\b', message)
        if not match:
            raise RuntimeError(f'Could not extract OTP code from message: {message}')
        code = match.group(1)

        resp = _req.post(
            'https://api.sms.ir/v1/send/verify',
            headers={'x-api-key': api_key, 'Content-Type': 'application/json'},
            json={
                'mobile': phone,
                'templateId': template_id,
                'parameters': [{'name': 'Code', 'value': code}],
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get('status') != 1:
            raise RuntimeError(f'SMS.ir error: {data}')
        return {'sent': True, 'provider': self.name, 'detail': data}
