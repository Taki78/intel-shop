from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q, Avg, Prefetch
from .models import Category, Brand, Product, Review, ReviewLike
from .serializers import (
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer, ReviewSerializer,
)
from .filters import ProductFilter


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count('products', filter=Q(products__is_active=True))
        )


class BrandListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = BrandSerializer
    queryset = Brand.objects.all()
    pagination_class = None


class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    filterset_class = ProductFilter
    search_fields = ['name', 'brand__name']
    ordering_fields = ['price', 'created_at', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category', 'brand')
            .prefetch_related('images')
            .annotate(
                _reviews_count=Count('reviews', filter=Q(reviews__status='approved')),
                _rating_avg=Avg('reviews__rating', filter=Q(reviews__status='approved')),
            )
        )


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        approved_reviews = Review.objects.filter(status='approved').select_related('user').prefetch_related('likes')
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category', 'brand', 'specs')
            .prefetch_related('images', Prefetch('reviews', queryset=approved_reviews))
            .annotate(
                _reviews_count=Count('reviews', filter=Q(reviews__status='approved')),
                _rating_avg=Avg('reviews__rating', filter=Q(reviews__status='approved')),
            )
        )


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        from django.db.models import Avg
        try:
            product = Product.objects.get(slug=slug, is_active=True)
        except Product.DoesNotExist:
            return Response({'detail': 'محصول یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({'detail': 'شما قبلاً برای این محصول نظر ثبت کرده‌اید'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(product=product, user=request.user, status='pending')
            agg = product.reviews.filter(status='approved').aggregate(avg=Avg('rating'))
            product.reviews_count = product.reviews.filter(status='approved').count()
            product.rating = agg['avg'] or 0
            product.save(update_fields=['reviews_count', 'rating'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk, status='approved')
        except Review.DoesNotExist:
            return Response({'detail': 'نظر یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        like, created = ReviewLike.objects.get_or_create(review=review, user=request.user)
        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        return Response({'liked': liked, 'likes_count': review.likes.count()})
