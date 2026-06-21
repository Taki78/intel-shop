from rest_framework import serializers
from django.db.models import Sum
from apps.accounts.models import User
from apps.products.models import Product, Review, ProductImage, ProductSpec, Brand, Category
from apps.products.media_utils import absolute_media_url, normalize_media_url
from apps.orders.models import Order, OrderItem, OrderNote
from apps.discounts.models import DiscountCode
from .models import ShopSettings


class AdminUserListSerializer(serializers.ModelSerializer):
    orders_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'is_active', 'is_staff', 'created_at', 'orders_count', 'total_spent']

    def get_total_spent(self, obj):
        result = obj.orders.aggregate(total=Sum('total'))
        return result['total'] or 0


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'name', 'phone', 'password', 'is_active']

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('این ایمیل قبلاً ثبت شده است')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'phone', 'is_active']


class AdminOrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_price', 'quantity', 'line_total']

    def get_line_total(self, obj):
        return obj.line_total


class AdminOrderListSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'user_email', 'user_name', 'status', 'status_display', 'total', 'items_count', 'created_at']

    def get_items_count(self, obj):
        return sum(i.quantity for i in obj.items.all())


class OrderNoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = OrderNote
        fields = ['id', 'text', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_by_name', 'created_at']


class AdminOrderDetailSerializer(AdminOrderListSerializer):
    items = AdminOrderItemSerializer(many=True, read_only=True)
    notes = OrderNoteSerializer(many=True, read_only=True)

    class Meta(AdminOrderListSerializer.Meta):
        fields = AdminOrderListSerializer.Meta.fields + [
            'items', 'notes', 'shipping_name', 'shipping_phone', 'shipping_province',
            'shipping_city', 'shipping_postal', 'shipping_detail',
            'subtotal', 'delivery_fee', 'discount_amount', 'payment_method', 'paid_at',
        ]


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']


class AdminReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'product_name', 'user', 'user_name', 'user_email', 'rating', 'text', 'status', 'status_display', 'created_at']


class AdminReviewStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['status']


_SPEC_KEYS = ['cpu', 'ram', 'storage', 'gpu', 'display', 'os', 'weight', 'battery']


class AdminProductListSerializer(serializers.ModelSerializer):
    brand    = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    image    = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = ['id', 'name', 'slug', 'brand', 'category', 'price', 'discount_price',
                  'stock', 'rating', 'featured', 'is_active', 'image', 'created_at']

    def get_brand(self, obj):    return obj.brand.name   if obj.brand    else ''
    def get_category(self, obj): return obj.category.slug if obj.category else ''
    def get_image(self, obj):
        img = obj.images.first()
        return absolute_media_url(img.url, self.context.get('request')) if img else ''


class AdminProductDetailSerializer(AdminProductListSerializer):
    images = serializers.SerializerMethodField()
    specs  = serializers.SerializerMethodField()

    class Meta(AdminProductListSerializer.Meta):
        fields = AdminProductListSerializer.Meta.fields + [
            'condition', 'warranty', 'tags', 'colors', 'images', 'specs', 'reviews_count',
        ]

    def get_images(self, obj):
        request = self.context.get('request')
        return [absolute_media_url(i.url, request) for i in obj.images.all()]

    def get_specs(self, obj):
        try:
            s = obj.specs
            return {k: getattr(s, k, '') for k in _SPEC_KEYS}
        except ProductSpec.DoesNotExist:
            return {}


class AdminProductWriteSerializer(serializers.ModelSerializer):
    brand    = serializers.CharField()
    category = serializers.CharField()
    images   = serializers.ListField(child=serializers.URLField(), required=False, default=list)
    specs    = serializers.DictField(child=serializers.CharField(allow_blank=True), required=False, default=dict)
    colors   = serializers.ListField(child=serializers.DictField(), required=False, default=list)

    class Meta:
        model  = Product
        fields = ['name', 'slug', 'brand', 'category', 'condition', 'warranty',
                  'price', 'discount_price', 'stock', 'featured', 'is_active', 'tags',
                  'colors', 'images', 'specs']

    def validate(self, data):
        brand_name = data.get('brand', '').strip()
        if brand_name:
            brand, _ = Brand.objects.get_or_create(name=brand_name)
            data['brand'] = brand
        else:
            data.pop('brand', None)

        cat_slug = data.get('category', '').strip()
        if cat_slug:
            try:
                data['category'] = Category.objects.get(slug=cat_slug)
            except Category.DoesNotExist:
                raise serializers.ValidationError({'category': 'دسته‌بندی یافت نشد'})
        else:
            data.pop('category', None)
        return data

    def _request(self):
        return self.context.get('request')

    def create(self, validated_data):
        images     = validated_data.pop('images', [])
        specs_data = validated_data.pop('specs', {})
        product    = Product.objects.create(**validated_data)
        request    = self._request()
        for i, url in enumerate(images):
            ProductImage.objects.create(product=product, url=normalize_media_url(url, request), order=i)
        ProductSpec.objects.create(product=product, **{k: specs_data.get(k, '') for k in _SPEC_KEYS})
        return product

    def update(self, instance, validated_data):
        images     = validated_data.pop('images', None)
        specs_data = validated_data.pop('specs', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if images is not None:
            request = self._request()
            instance.images.all().delete()
            for i, url in enumerate(images):
                ProductImage.objects.create(product=instance, url=normalize_media_url(url, request), order=i)
        if specs_data is not None:
            spec, _ = ProductSpec.objects.get_or_create(product=instance)
            for k in _SPEC_KEYS:
                setattr(spec, k, specs_data.get(k, getattr(spec, k, '')))
            spec.save()
        return instance


class AdminCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'order', 'product_count']
        read_only_fields = ['id', 'product_count']


class AdminDiscountSerializer(serializers.ModelSerializer):
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)

    class Meta:
        model = DiscountCode
        fields = ['id', 'code', 'discount_type', 'discount_type_display', 'percent', 'amount', 'min_order', 'max_uses', 'used_count', 'is_active', 'expires_at', 'created_at']
        read_only_fields = ['id', 'used_count', 'created_at']


class ShopSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ShopSettings
        fields = [
            'store_name', 'email', 'phone', 'address',
            'free_shipping_enabled', 'free_shipping_over', 'express_enabled',
            'payment_online', 'payment_cod', 'payment_installment',
            'notify_new_order', 'notify_low_stock', 'notify_new_user',
            'enamad_html',
        ]
