from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, Invoice


# ── Actions ───────────────────────────────────────────────────────────────────

@admin.action(description='📦 در حال پردازش')
def mark_processing(modeladmin, request, queryset):
    queryset.update(status='processing')
    modeladmin.message_user(request, 'وضعیت به "در حال پردازش" تغییر کرد.')


@admin.action(description='🚚 ارسال شده')
def mark_shipped(modeladmin, request, queryset):
    queryset.update(status='shipped')
    modeladmin.message_user(request, 'وضعیت به "ارسال شده" تغییر کرد.')


@admin.action(description='✅ تحویل داده شده')
def mark_delivered(modeladmin, request, queryset):
    queryset.update(status='delivered')
    modeladmin.message_user(request, 'وضعیت به "تحویل داده شده" تغییر کرد.')


@admin.action(description='❌ لغو شده')
def mark_cancelled(modeladmin, request, queryset):
    queryset.update(status='cancelled')
    modeladmin.message_user(request, 'وضعیت به "لغو شده" تغییر کرد.')


# ── Inlines ───────────────────────────────────────────────────────────────────

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    fields = ['product_name', 'product_price_display', 'quantity', 'line_total_display']
    readonly_fields = ['product_name', 'product_price_display', 'quantity', 'line_total_display']

    @admin.display(description='قیمت واحد')
    def product_price_display(self, obj):
        return f'{obj.product_price:,} تومان'

    @admin.display(description='جمع ردیف')
    def line_total_display(self, obj):
        return format_html('<b>{} تومان</b>', f'{obj.line_total:,}')


# ── ModelAdmin ────────────────────────────────────────────────────────────────

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'customer_info', 'status_badge',
        'total_display', 'items_count', 'payment_info', 'created_at',
    ]
    list_filter = ['status', 'created_at', 'payment_method']
    search_fields = ['order_number', 'user__email', 'user__name', 'shipping_name', 'shipping_phone']
    readonly_fields = [
        'order_number', 'subtotal', 'delivery_fee', 'discount_amount', 'total', 'paid_at',
        'shipping_summary',
    ]
    actions = [mark_processing, mark_shipped, mark_delivered, mark_cancelled]
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'
    list_per_page = 25
    save_on_top = True
    fieldsets = (
        ('اطلاعات سفارش', {'fields': ('order_number', 'user', 'status', 'payment_method')}),
        ('آدرس ارسال', {'fields': ('shipping_summary',)}),
        ('مالی', {'fields': (('subtotal', 'delivery_fee'), ('discount_amount', 'total'), ('discount_code', 'paid_at'))}),
    )

    @admin.display(description='مشتری')
    def customer_info(self, obj):
        return format_html(
            '<b>{}</b><br><span style="color:#6b7280;font-size:.85em;">{}</span>',
            obj.shipping_name, obj.user.email,
        )

    @admin.display(description='وضعیت')
    def status_badge(self, obj):
        COLORS = {
            'pending':    ('#f59e0b', 'white'),
            'processing': ('#3b82f6', 'white'),
            'shipped':    ('#8b5cf6', 'white'),
            'delivered':  ('#10b981', 'white'),
            'cancelled':  ('#ef4444', 'white'),
        }
        bg, fg = COLORS.get(obj.status, ('#6b7280', 'white'))
        return format_html(
            '<span style="background:{};color:{};padding:3px 9px;border-radius:12px;font-size:.8em;font-weight:700;">{}</span>',
            bg, fg, obj.get_status_display(),
        )

    @admin.display(description='مبلغ', ordering='total')
    def total_display(self, obj):
        return format_html('<b style="color:#1d4ed8;">{} تومان</b>', f'{obj.total:,}')

    @admin.display(description='کالاها')
    def items_count(self, obj):
        count = sum(i.quantity for i in obj.items.all())
        return f'{count} عدد'

    @admin.display(description='پرداخت')
    def payment_info(self, obj):
        if obj.paid_at:
            return format_html('<span style="color:#16a34a;">✓ پرداخت شده</span>')
        return format_html('<span style="color:#dc2626;">✗ پرداخت نشده</span>')

    @admin.display(description='آدرس تحویل')
    def shipping_summary(self, obj):
        return format_html(
            '<b>{}</b> | {}<br>{} — {} | کد پستی: {}<br>{}',
            obj.shipping_name, obj.shipping_phone,
            obj.shipping_province, obj.shipping_city,
            obj.shipping_postal or '—', obj.shipping_detail,
        )


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'order_link', 'customer', 'amount', 'issued_at']
    readonly_fields = ['invoice_number', 'issued_at']
    search_fields = ['invoice_number', 'order__order_number', 'order__user__email']
    date_hierarchy = 'issued_at'

    @admin.display(description='سفارش')
    def order_link(self, obj):
        return format_html(
            '<a href="/admin/orders/order/{}/change/">{}</a>',
            obj.order.pk, obj.order.order_number,
        )

    @admin.display(description='مشتری')
    def customer(self, obj):
        return obj.order.user.name

    @admin.display(description='مبلغ')
    def amount(self, obj):
        return f'{obj.order.total:,} تومان'
