from django.db import models


class HeroSlide(models.Model):
    """Slides shown in the homepage HeroSlider."""
    GRADIENT_CHOICES = [
        ('primary', 'آبی پررنگ (پیش‌فرض)'),
        ('amber',   'کهربایی'),
        ('violet',  'بنفش'),
        ('emerald', 'سبز زمردی'),
        ('rose',    'صورتی'),
    ]

    title       = models.CharField(max_length=200, verbose_name='عنوان')
    subtitle    = models.CharField(max_length=300, blank=True, verbose_name='زیرعنوان')
    badge       = models.CharField(max_length=80, blank=True, verbose_name='برچسب بالا')
    offer       = models.CharField(max_length=80, blank=True, verbose_name='برچسب پیشنهاد')
    cta_label   = models.CharField(max_length=80, blank=True, verbose_name='متن دکمه')
    cta_link    = models.CharField(max_length=300, blank=True, verbose_name='لینک دکمه')
    image       = models.CharField(max_length=500, blank=True, verbose_name='تصویر (URL یا مسیر مدیا)')
    gradient    = models.CharField(max_length=20, choices=GRADIENT_CHOICES, default='primary', verbose_name='پالت رنگی')
    chips       = models.JSONField(default=list, blank=True, verbose_name='چیپس‌ها (لیست متن)')
    order       = models.IntegerField(default=0, verbose_name='ترتیب')
    is_active   = models.BooleanField(default=True, verbose_name='فعال')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'اسلاید بنر'
        verbose_name_plural = 'اسلایدهای بنر'
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


class AboutPage(models.Model):
    """Singleton: content shown on the public About page."""
    hero_title    = models.CharField(max_length=200, default='درباره اینتل شاپ')
    hero_subtitle = models.TextField(blank=True)
    story_title   = models.CharField(max_length=200, default='داستان ما')
    story_body    = models.TextField(blank=True)
    why_title     = models.CharField(max_length=200, default='چرا اینتل شاپ؟')
    why_items     = models.JSONField(default=list, blank=True, verbose_name='موارد فهرست (لیست متن)')
    stats         = models.JSONField(default=list, blank=True,
                                     verbose_name='آمارها (لیست {label,value,icon})')
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'صفحه درباره ما'
        verbose_name_plural = 'صفحه درباره ما'

    def __str__(self):
        return 'صفحه درباره ما'

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class NewsletterSubscription(models.Model):
    """Public-facing newsletter signups (footer form)."""
    email      = models.EmailField(unique=True, verbose_name='ایمیل')
    is_active  = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')

    class Meta:
        verbose_name = 'مشترک خبرنامه'
        verbose_name_plural = 'مشترکین خبرنامه'
        ordering = ['-created_at']

    def __str__(self):
        return self.email


class ContactMessage(models.Model):
    """Public-facing contact form submissions."""
    STATUS_CHOICES = [
        ('new',     'جدید'),
        ('read',    'خوانده‌شده'),
        ('replied', 'پاسخ داده‌شده'),
        ('archived','بایگانی'),
    ]

    name       = models.CharField(max_length=120, verbose_name='نام')
    email      = models.EmailField(verbose_name='ایمیل')
    subject    = models.CharField(max_length=200, verbose_name='موضوع')
    message    = models.TextField(verbose_name='پیام')
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new', verbose_name='وضعیت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ارسال')

    class Meta:
        verbose_name = 'پیام تماس'
        verbose_name_plural = 'پیام‌های تماس'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.subject}'
