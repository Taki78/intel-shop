from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Address


@admin.action(description='✅ فعال کردن کاربران انتخاب‌شده')
def activate_users(modeladmin, request, queryset):
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f'{updated} کاربر فعال شد.')


@admin.action(description='🚫 غیرفعال کردن کاربران انتخاب‌شده')
def deactivate_users(modeladmin, request, queryset):
    updated = queryset.exclude(is_superuser=True).update(is_active=False)
    modeladmin.message_user(request, f'{updated} کاربر غیرفعال شد.')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'phone', 'order_count', 'total_spent', 'is_active', 'is_staff', 'created_at']
    list_filter = ['is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'name', 'phone']
    ordering = ['-created_at']
    actions = [activate_users, deactivate_users]
    list_per_page = 30
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('اطلاعات شخصی', {'fields': ('name', 'phone')}),
        ('دسترسی‌ها', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('تاریخ‌ها', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone', 'password1', 'password2'),
        }),
    )

    @admin.display(description='سفارشات', ordering='orders__count')
    def order_count(self, obj):
        count = obj.orders.count()
        if count == 0:
            return '—'
        return format_html(
            '<a href="/admin/orders/order/?user__id={}">{} سفارش</a>',
            obj.pk, count
        )

    @admin.display(description='جمع خرید')
    def total_spent(self, obj):
        from django.db.models import Sum
        total = obj.orders.filter(status='delivered').aggregate(s=Sum('total'))['s'] or 0
        if total == 0:
            return '—'
        return format_html('<span style="color:#059669;font-weight:600;">{} تومان</span>', f'{total:,}')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'province', 'city', 'phone', 'is_default', 'created_at']
    list_filter = ['province', 'is_default']
    search_fields = ['user__email', 'user__name', 'full_name', 'city', 'phone']
    raw_id_fields = ['user']
