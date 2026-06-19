from django.db import models
from django.utils.crypto import get_random_string


def _order_number():
    return 'ORD-' + get_random_string(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')


def _invoice_number():
    return 'INV-' + get_random_string(10, '0123456789')


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار پرداخت'),
        ('processing', 'در حال پردازش'),
        ('shipped', 'ارسال شده'),
        ('delivered', 'تحویل داده شده'),
        ('cancelled', 'لغو شده'),
    ]

    user = models.ForeignKey('accounts.User', on_delete=models.PROTECT, related_name='orders', verbose_name='کاربر')
    order_number = models.CharField(max_length=20, unique=True, default=_order_number, verbose_name='شماره سفارش')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')

    # Shipping address snapshot — we snapshot so past orders stay accurate if the user changes their address
    shipping_name = models.CharField(max_length=150, verbose_name='نام تحویل‌گیرنده')
    shipping_phone = models.CharField(max_length=15, verbose_name='موبایل')
    shipping_province = models.CharField(max_length=50, verbose_name='استان')
    shipping_city = models.CharField(max_length=50, verbose_name='شهر')
    shipping_postal = models.CharField(max_length=10, blank=True, verbose_name='کد پستی')
    shipping_detail = models.TextField(verbose_name='آدرس')

    subtotal = models.PositiveBigIntegerField(verbose_name='جمع کل')
    delivery_fee = models.PositiveBigIntegerField(default=350000, verbose_name='هزینه ارسال')
    discount_amount = models.PositiveBigIntegerField(default=0, verbose_name='مبلغ تخفیف')
    total = models.PositiveBigIntegerField(verbose_name='مبلغ قابل پرداخت')

    discount_code = models.ForeignKey(
        'discounts.DiscountCode', null=True, blank=True,
        on_delete=models.SET_NULL, verbose_name='کد تخفیف',
    )
    payment_method = models.CharField(max_length=20, default='online', verbose_name='روش پرداخت')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='زمان پرداخت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'سفارش'
        verbose_name_plural = 'سفارشات'
        ordering = ['-created_at']

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='سفارش')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, verbose_name='محصول')
    product_name = models.CharField(max_length=200, verbose_name='نام محصول')
    product_price = models.PositiveBigIntegerField(verbose_name='قیمت واحد')
    quantity = models.PositiveIntegerField(verbose_name='تعداد')

    class Meta:
        verbose_name = 'آیتم سفارش'
        verbose_name_plural = 'آیتم‌های سفارش'

    @property
    def line_total(self):
        return self.product_price * self.quantity


class OrderNote(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='notes', verbose_name='سفارش')
    created_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='+', verbose_name='نوشته‌شده توسط',
    )
    text = models.TextField(verbose_name='یادداشت')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'یادداشت'
        verbose_name_plural = 'یادداشت‌های سفارش'
        ordering = ['-created_at']

    def __str__(self):
        return f'Note on {self.order.order_number}'


class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice', verbose_name='سفارش')
    invoice_number = models.CharField(max_length=20, unique=True, default=_invoice_number, verbose_name='شماره فاکتور')
    issued_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ صدور')

    class Meta:
        verbose_name = 'فاکتور'
        verbose_name_plural = 'فاکتورها'

    def __str__(self):
        return self.invoice_number
