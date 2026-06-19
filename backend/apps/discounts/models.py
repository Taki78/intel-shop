from django.db import models
from django.utils import timezone


class DiscountCode(models.Model):
    TYPE_CHOICES = [('percent', 'درصدی'), ('fixed', 'مبلغ ثابت')]

    code = models.CharField(max_length=20, unique=True, verbose_name='کد')
    discount_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='percent', verbose_name='نوع')
    percent = models.IntegerField(default=0, verbose_name='درصد تخفیف')
    amount = models.PositiveBigIntegerField(default=0, verbose_name='مبلغ تخفیف (تومان)')
    min_order = models.PositiveBigIntegerField(default=0, verbose_name='حداقل سفارش')
    max_uses = models.IntegerField(null=True, blank=True, verbose_name='حداکثر استفاده')
    used_count = models.IntegerField(default=0, verbose_name='دفعات استفاده')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ انقضا')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'کد تخفیف'
        verbose_name_plural = 'کدهای تخفیف'

    def __str__(self):
        return self.code

    def validate(self):
        if not self.is_active:
            return False, 'کد تخفیف غیرفعال است'
        if self.expires_at and timezone.now() > self.expires_at:
            return False, 'کد تخفیف منقضی شده است'
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False, 'ظرفیت استفاده از این کد تمام شده'
        return True, None
