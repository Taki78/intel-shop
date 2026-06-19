import os
import uuid
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import User
from apps.products.models import Product, Review, Brand, Category
from apps.products.serializers import BrandSerializer
from apps.orders.models import Order, OrderNote
from apps.discounts.models import DiscountCode

from .models import ShopSettings
from .serializers import (
    AdminUserListSerializer, AdminUserCreateSerializer, AdminUserUpdateSerializer,
    AdminOrderListSerializer, AdminOrderDetailSerializer, AdminOrderStatusSerializer,
    OrderNoteSerializer,
    AdminReviewSerializer, AdminReviewStatusSerializer,
    AdminDiscountSerializer,
    AdminProductListSerializer, AdminProductDetailSerializer, AdminProductWriteSerializer,
    AdminCategorySerializer,
    ShopSettingsSerializer,
)


class AdminUserListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return AdminUserListSerializer

    def get_queryset(self):
        qs = User.objects.annotate(orders_count=Count('orders'))
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(email__icontains=q) | Q(name__icontains=q) | Q(phone__icontains=q))
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = AdminUserCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        full = AdminUserListSerializer(
            User.objects.annotate(orders_count=Count('orders')).get(pk=user.pk)
        ).data
        return Response(full, status=status.HTTP_201_CREATED)


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        return User.objects.annotate(orders_count=Count('orders'))

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AdminUserListSerializer
        return AdminUserUpdateSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.is_superuser:
            return Response({'detail': 'نمی‌توان مدیر اصلی را حذف کرد'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminOrderListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Order.objects.select_related('user').prefetch_related('items')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(order_number__icontains=q) |
                Q(user__email__icontains=q) |
                Q(user__name__icontains=q)
            )
        return qs.order_by('-created_at')


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    queryset = Order.objects.select_related('user').prefetch_related('items')
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AdminOrderDetailSerializer
        return AdminOrderStatusSerializer


class AdminOrderNoteView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'detail': 'متن یادداشت الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        note = OrderNote.objects.create(order=order, created_by=request.user, text=text)
        return Response(OrderNoteSerializer(note).data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, note_id):
        try:
            note = OrderNote.objects.get(pk=note_id, order_id=pk)
        except OrderNote.DoesNotExist:
            return Response({'detail': 'یادداشت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminReviewListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminReviewSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Review.objects.select_related('product', 'user')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        rating = self.request.query_params.get('rating')
        if rating:
            qs = qs.filter(rating=int(rating))
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(user__name__icontains=q) |
                Q(user__email__icontains=q) |
                Q(text__icontains=q) |
                Q(product__name__icontains=q)
            )
        return qs.order_by('-created_at')


class AdminReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Review.objects.select_related('product', 'user')
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AdminReviewSerializer
        return AdminReviewStatusSerializer


class AdminDiscountListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminDiscountSerializer
    queryset = DiscountCode.objects.all().order_by('-created_at')
    pagination_class = None


class AdminDiscountDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminDiscountSerializer
    queryset = DiscountCode.objects.all()
    pagination_class = None


class ShopSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAdminUser()]

    def get(self, request):
        s = ShopSettings.get_solo()
        return Response(ShopSettingsSerializer(s).data)

    def patch(self, request):
        s = ShopSettings.get_solo()
        serializer = ShopSettingsSerializer(s, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


class AdminBrandListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        brands = Brand.objects.all().order_by('name')
        return Response(BrandSerializer(brands, many=True).data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'detail': 'نام برند الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        brand, created = Brand.objects.get_or_create(name=name)
        return Response(BrandSerializer(brand).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class AdminImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
    ALLOWED_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    MAX_SIZE = 5 * 1024 * 1024  # 5MB

    def post(self, request):
        file = request.FILES.get('file') or request.FILES.get('image')
        if not file:
            return Response({'detail': 'فایلی ارسال نشده است'}, status=status.HTTP_400_BAD_REQUEST)
        if file.content_type not in self.ALLOWED_TYPES:
            return Response({'detail': 'فرمت تصویر مجاز نیست (JPG, PNG, WEBP, GIF)'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > self.MAX_SIZE:
            return Response({'detail': 'حجم تصویر باید کمتر از ۵ مگابایت باشد'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(file.name)[1].lower()
        if ext not in self.ALLOWED_EXTS:
            ext = '.jpg'
        name = f'products/{uuid.uuid4().hex}{ext}'
        path = default_storage.save(name, file)
        url = settings.MEDIA_URL + path
        return Response({
            'url': url,
            'absolute_url': request.build_absolute_uri(url),
        }, status=status.HTTP_201_CREATED)


class AdminCategoryListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Category.objects.annotate(product_count=Count('products')).order_by('order', 'name')
        return Response(AdminCategorySerializer(qs, many=True).data)

    def post(self, request):
        serializer = AdminCategorySerializer(data=request.data)
        if serializer.is_valid():
            cat = serializer.save()
            out = Category.objects.annotate(product_count=Count('products')).get(pk=cat.pk)
            return Response(AdminCategorySerializer(out).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCategorySerializer

    def get_queryset(self):
        return Category.objects.annotate(product_count=Count('products'))


class AdminProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    pagination_class = None

    def get_serializer_class(self):
        return AdminProductWriteSerializer if self.request.method == 'POST' else AdminProductListSerializer

    def get_queryset(self):
        qs = Product.objects.select_related('brand', 'category').prefetch_related('images')
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(brand__name__icontains=q))
        cat = self.request.query_params.get('category')
        if cat and cat != 'all':
            qs = qs.filter(category__slug=cat)
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = AdminProductWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        product = serializer.save()
        out = Product.objects.select_related('brand', 'category').prefetch_related('images', 'specs').get(pk=product.pk)
        return Response(AdminProductDetailSerializer(out).data, status=status.HTTP_201_CREATED)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Product.objects.select_related('brand', 'category', 'specs').prefetch_related('images')

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return AdminProductWriteSerializer
        return AdminProductDetailSerializer

    def update(self, request, *args, **kwargs):
        partial  = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = AdminProductWriteSerializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        product = serializer.save()
        out = Product.objects.select_related('brand', 'category', 'specs').prefetch_related('images').get(pk=product.pk)
        return Response(AdminProductDetailSerializer(out).data)


class AdminNotificationsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        notifications = []

        # Recent orders
        recent_orders = (
            Order.objects
            .filter(created_at__gte=seven_days_ago)
            .select_related('user')
            .order_by('-created_at')[:6]
        )
        for order in recent_orders:
            notif_type = 'order_cancel' if order.status == 'cancelled' else 'order'
            text = (
                f'سفارش {order.order_number} لغو شد'
                if order.status == 'cancelled'
                else f'سفارش جدید {order.order_number} ثبت شد'
            )
            notifications.append({
                'id': f'order_{order.id}',
                'type': notif_type,
                'text': text,
                'time': order.created_at.isoformat(),
                'read': (now - order.created_at).total_seconds() > 86400,
            })

        # New users
        new_users = User.objects.filter(created_at__gte=seven_days_ago).order_by('-created_at')[:4]
        for u in new_users:
            notifications.append({
                'id': f'user_{u.id}',
                'type': 'user',
                'text': f'کاربر جدید {u.name} عضو شد',
                'time': u.created_at.isoformat(),
                'read': (now - u.created_at).total_seconds() > 86400,
            })

        # Low stock products
        low_stock = Product.objects.filter(stock__lte=3, is_active=True).order_by('stock')[:4]
        for product in low_stock:
            text = (
                f'محصول "{product.name[:40]}" به اتمام رسید'
                if product.stock == 0
                else f'موجودی "{product.name[:40]}" کم است ({product.stock} عدد)'
            )
            notifications.append({
                'id': f'stock_{product.id}',
                'type': 'stock',
                'text': text,
                'time': now.isoformat(),
                'read': False,
            })

        # Recent reviews
        recent_reviews = (
            Review.objects
            .filter(created_at__gte=seven_days_ago)
            .select_related('user', 'product')
            .order_by('-created_at')[:4]
        )
        for review in recent_reviews:
            notifications.append({
                'id': f'review_{review.id}',
                'type': 'review',
                'text': f'{review.user.name} برای "{review.product.name[:30]}" نظر داد',
                'time': review.created_at.isoformat(),
                'read': (now - review.created_at).total_seconds() > 86400,
            })

        TYPE_PRIORITY = {'order': 0, 'order_cancel': 0, 'user': 1, 'review': 2, 'stock': 3}
        def _sort_key(n):
            try:
                from datetime import datetime
                t = datetime.fromisoformat(n['time']).timestamp()
            except Exception:
                t = 0
            return (TYPE_PRIORITY.get(n['type'], 9), -t)
        notifications.sort(key=_sort_key)
        return Response(notifications[:25])


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        PERSIAN_DAYS = {0: 'دوشنبه', 1: 'سه‌شنبه', 2: 'چهارشنبه', 3: 'پنجشنبه', 4: 'جمعه', 5: 'شنبه', 6: 'یکشنبه'}
        today = now.date()
        weekly_sales = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            day_rev = Order.objects.filter(created_at__date=d).aggregate(r=Sum('total'))['r'] or 0
            weekly_sales.append({'day': PERSIAN_DAYS[d.weekday()], 'value': round(day_rev / 1_000_000, 1)})

        total_products = Product.objects.filter(is_active=True).count()
        total_orders = Order.objects.count()
        total_users = User.objects.count()
        total_revenue = Order.objects.aggregate(r=Sum('total'))['r'] or 0

        today_orders = Order.objects.filter(created_at__gte=today_start).count()
        today_revenue = Order.objects.filter(created_at__gte=today_start).aggregate(r=Sum('total'))['r'] or 0
        month_revenue = Order.objects.filter(created_at__gte=month_start).aggregate(r=Sum('total'))['r'] or 0

        pending_orders = Order.objects.filter(status='pending').count()
        pending_reviews = Review.objects.filter(status='pending').count()
        low_stock_count = Product.objects.filter(stock__lte=3, is_active=True).count()

        recent_orders = Order.objects.select_related('user').order_by('-created_at')[:5]
        recent_orders_data = [
            {
                'id': o.id,
                'order_number': o.order_number,
                'user_name': o.user.name,
                'total': o.total,
                'status': o.status,
                'created_at': o.created_at.isoformat(),
            }
            for o in recent_orders
        ]

        low_stock_products = Product.objects.filter(stock__lte=3, is_active=True).order_by('stock')[:5]
        low_stock_data = [
            {
                'id': p.id,
                'name': p.name,
                'brand': p.brand.name if p.brand else '',
                'stock': p.stock,
                'image': p.images.first().url if p.images.exists() else '',
                'price': p.discount_price or p.price,
            }
            for p in low_stock_products
        ]

        return Response({
            'total_products': total_products,
            'total_orders': total_orders,
            'total_users': total_users,
            'total_revenue': total_revenue,
            'today_orders': today_orders,
            'today_revenue': today_revenue,
            'month_revenue': month_revenue,
            'pending_orders': pending_orders,
            'pending_reviews': pending_reviews,
            'low_stock_count': low_stock_count,
            'recent_orders': recent_orders_data,
            'low_stock_products': low_stock_data,
            'weekly_sales': weekly_sales,
        })
