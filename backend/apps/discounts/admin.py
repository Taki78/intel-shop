from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import DiscountCode


@admin.action(description='✅ فعال کردن کدهای انتخاب‌شده')
def activate_codes(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description='🚫 غیرفعال کردن کدهای انتخاب‌شده')
def deactivate_codes(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'discount_display', 'min_order_display',
        'usage_display', 'status_badge', 'is_active', 'expires_at',
    ]
    list_filter = ['is_active', 'discount_type', 'created_at']
    search_fields = ['code']
    list_editable = ['is_active']
    actions = [activate_codes, deactivate_codes]
    list_per_page = 30
    fieldsets = (
        ('کد تخفیف', {'fields': ('code', 'is_active')}),
        ('مقدار تخفیف', {'fields': ('discount_type', 'percent', 'amount')}),
        ('محدودیت‌ها', {'fields': ('min_order', 'max_uses', 'expires_at')}),
        ('آمار', {'fields': ('used_count',), 'classes': ('collapse',)}),
    )
    readonly_fields = ['used_count']

    @admin.display(description='مقدار تخفیف')
    def discount_display(self, obj):
        if obj.discount_type == 'percent':
            return format_html(
                '<b style="color:#7c3aed;">{}</b>٪ تخفیف',
                obj.percent,
            )
        return format_html(
            '<b style="color:#059669;">{}</b> تومان تخفیف',
            f'{obj.amount:,}',
        )

    @admin.display(description='حداقل سفارش')
    def min_order_display(self, obj):
        if obj.min_order:
            return f'{obj.min_order:,} تومان'
        return '—'

    @admin.display(description='استفاده')
    def usage_display(self, obj):
        if obj.max_uses:
            pct = obj.used_count / obj.max_uses * 100
            color = '#dc2626' if pct >= 80 else '#d97706' if pct >= 50 else '#16a34a'
            return format_html(
                '<span style="color:{};">{} / {}</span>',
                color, obj.used_count, obj.max_uses,
            )
        return format_html('<span>{} بار</span>', obj.used_count)

    @admin.display(description='وضعیت')
    def status_badge(self, obj):
        if not obj.is_active:
            return format_html('<span style="color:#6b7280;">غیرفعال</span>')
        if obj.expires_at and timezone.now() > obj.expires_at:
            return format_html('<span style="color:#dc2626;">منقضی شده</span>')
        if obj.max_uses and obj.used_count >= obj.max_uses:
            return format_html('<span style="color:#f59e0b;">پر شده</span>')
        return format_html('<span style="color:#16a34a;font-weight:600;">✓ فعال</span>')
