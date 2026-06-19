from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Brand, Product, ProductImage, ProductSpec, Review


# ── Actions ──────────────────────────────────────────────────────────────────

@admin.action(description='✅ فعال کردن محصولات انتخاب‌شده')
def activate_products(modeladmin, request, queryset):
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f'{updated} محصول فعال شد.')


@admin.action(description='🚫 غیرفعال کردن محصولات انتخاب‌شده')
def deactivate_products(modeladmin, request, queryset):
    updated = queryset.update(is_active=False)
    modeladmin.message_user(request, f'{updated} محصول غیرفعال شد.')


@admin.action(description='⭐ اضافه کردن به ویژه‌ها')
def mark_featured(modeladmin, request, queryset):
    updated = queryset.update(featured=True)
    modeladmin.message_user(request, f'{updated} محصول به ویژه‌ها اضافه شد.')


@admin.action(description='☆ حذف از ویژه‌ها')
def unmark_featured(modeladmin, request, queryset):
    updated = queryset.update(featured=False)
    modeladmin.message_user(request, f'{updated} محصول از ویژه‌ها حذف شد.')


# ── Inlines ───────────────────────────────────────────────────────────────────

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['url', 'order', 'preview']
    readonly_fields = ['preview']

    @admin.display(description='پیش‌نمایش')
    def preview(self, obj):
        if obj.url:
            return format_html(
                '<img src="{}" style="max-height:55px;max-width:75px;object-fit:cover;border-radius:4px;" />',
                obj.url,
            )
        return '—'


class ProductSpecInline(admin.StackedInline):
    model = ProductSpec
    can_delete = False
    extra = 0
    fieldsets = (
        ('مشخصات پایه', {'fields': (('cpu', 'ram'), ('storage', 'gpu'))}),
        ('سایر', {'fields': (('display', 'os'), ('weight', 'battery'))}),
    )


# ── ModelAdmin ────────────────────────────────────────────────────────────────

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'thumbnail', 'name', 'category', 'brand', 'condition_badge',
        'price_display', 'stock_display', 'rating', 'featured', 'is_active',
    ]
    list_filter = ['category', 'brand', 'condition', 'is_active', 'featured']
    search_fields = ['name', 'brand__name']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['featured', 'is_active']
    actions = [activate_products, deactivate_products, mark_featured, unmark_featured]
    inlines = [ProductImageInline, ProductSpecInline]
    list_per_page = 25
    save_on_top = True
    fieldsets = (
        ('اطلاعات اصلی', {'fields': ('name', 'slug', ('category', 'brand'), ('condition', 'warranty'))}),
        ('قیمت و موجودی', {'fields': (('price', 'discount_price'), 'stock')}),
        ('آمار', {'fields': (('rating', 'reviews_count'), 'tags')}),
        ('نمایش', {'fields': (('featured', 'is_active'),)}),
    )

    @admin.display(description='')
    def thumbnail(self, obj):
        img = obj.images.first()
        if img:
            return format_html(
                '<img src="{}" style="width:48px;height:38px;object-fit:cover;border-radius:4px;" />',
                img.url,
            )
        return format_html('<span style="color:#ccc;">—</span>')

    @admin.display(description='وضعیت', ordering='condition')
    def condition_badge(self, obj):
        if obj.condition == 'new':
            return format_html('<span style="background:#dcfce7;color:#166534;padding:2px 7px;border-radius:10px;font-size:.75em;font-weight:600;">نو</span>')
        return format_html('<span style="background:#fef3c7;color:#92400e;padding:2px 7px;border-radius:10px;font-size:.75em;font-weight:600;">کارکرده</span>')

    @admin.display(description='قیمت', ordering='price')
    def price_display(self, obj):
        if obj.discount_price:
            return format_html(
                '<s style="color:#9ca3af;font-size:.8em;">{}</s><br>'
                '<b style="color:#059669;">{} تومان</b>',
                f'{obj.price:,}', f'{obj.discount_price:,}',
            )
        return format_html('<b>{} تومان</b>', f'{obj.price:,}')

    @admin.display(description='موجودی', ordering='stock')
    def stock_display(self, obj):
        if obj.stock == 0:
            return format_html('<b style="color:#dc2626;">ناموجود</b>')
        if obj.stock <= 3:
            return format_html('<b style="color:#d97706;">{} عدد (کم)</b>', obj.stock)
        return format_html('<span style="color:#16a34a;">{} عدد</span>', obj.stock)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'order', 'product_count']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order']

    @admin.display(description='تعداد محصول')
    def product_count(self, obj):
        return obj.products.filter(is_active=True).count()


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'product_count']
    search_fields = ['name']

    @admin.display(description='تعداد محصول')
    def product_count(self, obj):
        return obj.products.filter(is_active=True).count()


@admin.action(description='✅ تأیید نظرات انتخاب‌شده')
def approve_reviews(modeladmin, request, queryset):
    updated = queryset.update(status='approved')
    modeladmin.message_user(request, f'{updated} نظر تأیید شد.')


@admin.action(description='❌ رد نظرات انتخاب‌شده')
def reject_reviews(modeladmin, request, queryset):
    updated = queryset.update(status='rejected')
    modeladmin.message_user(request, f'{updated} نظر رد شد.')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'stars', 'status_badge', 'text_preview', 'created_at']
    list_filter = ['status', 'rating', 'created_at']
    search_fields = ['product__name', 'user__email', 'text']
    raw_id_fields = ['user', 'product']
    actions = [approve_reviews, reject_reviews]
    list_per_page = 30

    @admin.display(description='امتیاز', ordering='rating')
    def stars(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        color = '#f59e0b' if obj.rating >= 4 else '#9ca3af'
        return format_html('<span style="color:{};">{}</span>', color, stars)

    @admin.display(description='وضعیت', ordering='status')
    def status_badge(self, obj):
        colors = {
            'approved': ('تأیید شده', '#dcfce7', '#166534'),
            'pending':  ('در انتظار', '#fef3c7', '#92400e'),
            'rejected': ('رد شده',    '#fee2e2', '#991b1b'),
        }
        label, bg, fg = colors.get(obj.status, ('—', '#f3f4f6', '#374151'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 8px;border-radius:10px;font-size:.75em;font-weight:600;">{}</span>',
            bg, fg, label,
        )

    @admin.display(description='متن نظر')
    def text_preview(self, obj):
        return obj.text[:70] + ('...' if len(obj.text) > 70 else '')
