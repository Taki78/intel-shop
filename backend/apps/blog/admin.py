from django.contrib import admin
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'jalali_date', 'is_published', 'created_at']
    list_filter = ['is_published', 'category', 'author']
    search_fields = ['title', 'excerpt', 'content']
    list_editable = ['is_published']
    prepopulated_fields = {'slug': ('title',)}
    list_per_page = 20
