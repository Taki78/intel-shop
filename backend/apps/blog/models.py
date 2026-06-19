from django.db import models


class BlogPost(models.Model):
    title      = models.CharField(max_length=200, verbose_name='عنوان')
    slug       = models.SlugField(max_length=200, unique=True, allow_unicode=True, verbose_name='نشانک')
    excerpt    = models.TextField(verbose_name='خلاصه')
    content    = models.TextField(blank=True, verbose_name='محتوا')
    cover      = models.CharField(max_length=500, blank=True, default='', verbose_name='تصویر')
    author     = models.CharField(max_length=100, default='تیم اینتل شاپ', verbose_name='نویسنده')
    category   = models.CharField(max_length=50, blank=True, default='', verbose_name='دسته‌بندی')
    read_time  = models.CharField(max_length=20, blank=True, default='', verbose_name='زمان مطالعه')
    jalali_date = models.CharField(max_length=20, blank=True, default='', verbose_name='تاریخ انتشار (جلالی)')
    is_published = models.BooleanField(default=True, verbose_name='منتشر شده')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'مقاله'
        verbose_name_plural = 'مقالات بلاگ'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
