from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='نام')
    slug = models.SlugField(unique=True, allow_unicode=True, verbose_name='اسلاگ')
    icon = models.CharField(max_length=50, blank=True, verbose_name='آیکون')
    order = models.IntegerField(default=0, verbose_name='ترتیب')

    class Meta:
        verbose_name = 'دسته‌بندی'
        verbose_name_plural = 'دسته‌بندی‌ها'
        ordering = ['order']

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='نام')

    class Meta:
        verbose_name = 'برند'
        verbose_name_plural = 'برندها'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    CONDITION_CHOICES = [('new', 'نو'), ('used', 'دست دوم')]

    name = models.CharField(max_length=200, verbose_name='نام محصول')
    slug = models.SlugField(unique=True, allow_unicode=True, verbose_name='اسلاگ')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products', verbose_name='دسته‌بندی')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name='products', verbose_name='برند')
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='new', verbose_name='وضعیت')
    warranty = models.CharField(max_length=100, blank=True, verbose_name='گارانتی')
    price = models.PositiveBigIntegerField(verbose_name='قیمت (تومان)')
    discount_price = models.PositiveBigIntegerField(null=True, blank=True, verbose_name='قیمت با تخفیف')
    stock = models.PositiveIntegerField(default=0, verbose_name='موجودی')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0, verbose_name='امتیاز')
    reviews_count = models.PositiveIntegerField(default=0, verbose_name='تعداد نظر')
    tags = models.JSONField(default=list, verbose_name='برچسب‌ها')
    colors = models.JSONField(default=list, verbose_name='رنگ‌بندی', blank=True)
    featured = models.BooleanField(default=False, verbose_name='ویژه')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ افزودن')

    class Meta:
        verbose_name = 'محصول'
        verbose_name_plural = 'محصولات'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def effective_price(self):
        return self.discount_price if self.discount_price else self.price

    @property
    def discount_percent(self):
        if self.discount_price and self.price > 0:
            return round((self.price - self.discount_price) / self.price * 100)
        return 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    url = models.URLField(max_length=500)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


class ProductSpec(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='specs')
    cpu = models.CharField(max_length=100, blank=True, verbose_name='پردازنده')
    ram = models.CharField(max_length=50, blank=True, verbose_name='رم')
    storage = models.CharField(max_length=100, blank=True, verbose_name='حافظه')
    gpu = models.CharField(max_length=100, blank=True, verbose_name='پردازنده گرافیکی')
    display = models.CharField(max_length=100, blank=True, verbose_name='نمایشگر')
    os = models.CharField(max_length=100, blank=True, verbose_name='سیستم عامل')
    weight = models.CharField(max_length=50, blank=True, verbose_name='وزن')
    battery = models.CharField(max_length=50, blank=True, verbose_name='باتری')

    class Meta:
        verbose_name = 'مشخصات فنی'


class Review(models.Model):
    STATUS_CHOICES = [('pending', 'در انتظار'), ('approved', 'تأیید شده'), ('rejected', 'رد شده')]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    rating = models.IntegerField(verbose_name='امتیاز')
    text = models.TextField(verbose_name='متن نظر')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')
        verbose_name = 'نظر'
        verbose_name_plural = 'نظرها'
        ordering = ['-created_at']


class ReviewLike(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='+')

    class Meta:
        unique_together = ('review', 'user')
