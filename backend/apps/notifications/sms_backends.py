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


# Future: KavenegarSMSBackend, SmsIrBackend, etc. Each only needs to implement
# `send(phone, message)` and read its API key from settings.
