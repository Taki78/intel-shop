from django.db import models


class ShopSettings(models.Model):
    store_name = models.CharField(max_length=100, default='اینتل شاپ', verbose_name='نام فروشگاه')
    email      = models.EmailField(default='info@intelshop.ir', verbose_name='ایمیل')
    phone      = models.CharField(max_length=30, blank=True, verbose_name='تلفن')
    address    = models.TextField(blank=True, verbose_name='آدرس')

    free_shipping_enabled = models.BooleanField(default=True, verbose_name='ارسال رایگان')
    free_shipping_over    = models.PositiveBigIntegerField(default=5000000, verbose_name='حد ارسال رایگان')
    express_enabled       = models.BooleanField(default=True, verbose_name='ارسال اکسپرس')

    payment_online      = models.BooleanField(default=True, verbose_name='پرداخت آنلاین')
    payment_cod         = models.BooleanField(default=True, verbose_name='پرداخت در محل')
    payment_installment = models.BooleanField(default=False, verbose_name='خرید اقساطی')

    notify_new_order = models.BooleanField(default=True, verbose_name='سفارش جدید')
    notify_low_stock = models.BooleanField(default=True, verbose_name='موجودی کم')
    notify_new_user  = models.BooleanField(default=False, verbose_name='کاربر جدید')

    enamad_html = models.TextField(
        blank=True,
        verbose_name='کد نماد اعتماد الکترونیکی (اینماد)',
        help_text='کد HTML که از سایت enamad.ir دریافت می‌کنید را اینجا paste کنید',
    )

    class Meta:
        verbose_name        = 'تنظیمات فروشگاه'
        verbose_name_plural = 'تنظیمات فروشگاه'

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
