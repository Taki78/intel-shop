from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem, Invoice
from apps.products.models import Product
from apps.discounts.models import DiscountCode


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)
    shipping_name = serializers.CharField(max_length=150)
    shipping_phone = serializers.CharField(max_length=15)
    shipping_province = serializers.CharField(max_length=50)
    shipping_city = serializers.CharField(max_length=50)
    shipping_postal = serializers.CharField(max_length=10, allow_blank=True, default='')
    shipping_detail = serializers.CharField()
    discount_code = serializers.CharField(max_length=20, allow_blank=True, default='')
    payment_method = serializers.CharField(default='online')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('سبد خرید خالی است')
        return value

    def validate(self, attrs):
        products = {}
        for item in attrs['items']:
            try:
                product = Product.objects.get(pk=item['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f'محصول #{item["product_id"]} یافت نشد')
            if product.stock < item['quantity']:
                raise serializers.ValidationError(f'موجودی "{product.name}" کافی نیست')
            products[item['product_id']] = product
        attrs['_products'] = products

        code = attrs.get('discount_code', '').strip().upper()
        if code:
            try:
                discount = DiscountCode.objects.get(code=code)
                valid, msg = discount.validate()
                if not valid:
                    raise serializers.ValidationError({'discount_code': msg})
                attrs['_discount'] = discount
            except DiscountCode.DoesNotExist:
                raise serializers.ValidationError({'discount_code': 'کد تخفیف معتبر نیست'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        products = validated_data.pop('_products')
        discount_obj = validated_data.pop('_discount', None)
        items_data = validated_data.pop('items')
        validated_data.pop('discount_code', None)

        subtotal = sum(
            (products[i['product_id']].discount_price or products[i['product_id']].price) * i['quantity']
            for i in items_data
        )
        delivery_fee = 0 if subtotal >= 5_000_000 else 350_000
        discount_amount = 0
        if discount_obj:
            if discount_obj.discount_type == 'percent':
                discount_amount = round(subtotal * discount_obj.percent / 100)
            else:
                discount_amount = min(discount_obj.amount, subtotal)
            DiscountCode.objects.filter(pk=discount_obj.pk).update(used_count=discount_obj.used_count + 1)

        total = subtotal + delivery_fee - discount_amount

        order = Order.objects.create(
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount_amount=discount_amount,
            total=total,
            discount_code=discount_obj,
            paid_at=None,
            status='pending',
            **validated_data,
        )

        for item in items_data:
            product = products[item['product_id']]
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_price=product.discount_price or product.price,
                quantity=item['quantity'],
            )
            Product.objects.filter(pk=product.pk).update(stock=product.stock - item['quantity'])

        Invoice.objects.create(order=order)
        return order


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'line_total']

    def get_line_total(self, obj):
        return obj.line_total


class OrderListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'status_display', 'total', 'items_count', 'created_at', 'invoice_number']

    def get_items_count(self, obj):
        return sum(i.quantity for i in obj.items.all())

    def get_invoice_number(self, obj):
        try:
            return obj.invoice.invoice_number
        except Exception:
            return None


class OrderDetailSerializer(OrderListSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta(OrderListSerializer.Meta):
        fields = OrderListSerializer.Meta.fields + [
            'items',
            'shipping_name', 'shipping_phone', 'shipping_province',
            'shipping_city', 'shipping_postal', 'shipping_detail',
            'subtotal', 'delivery_fee', 'discount_amount', 'paid_at',
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    order = OrderDetailSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'issued_at', 'order']
