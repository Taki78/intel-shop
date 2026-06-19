from rest_framework import serializers
from .models import Category, Brand, Product, ProductSpec, Review
from .media_utils import absolute_media_url


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'product_count']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name']


class ProductSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpec
        fields = ['cpu', 'ram', 'storage', 'gpu', 'display', 'os', 'weight', 'battery']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    likes_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'text', 'created_at', 'likes_count', 'user_liked']
        read_only_fields = ['id', 'user_name', 'created_at', 'likes_count', 'user_liked']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field='slug', read_only=True)
    brand = serializers.SlugRelatedField(slug_field='name', read_only=True)
    images = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name', 'category', 'brand',
            'condition', 'warranty', 'price', 'discount_price', 'discount_percent',
            'images', 'stock', 'rating', 'reviews_count', 'tags', 'featured',
        ]

    def get_images(self, obj):
        request = self.context.get('request')
        return [absolute_media_url(img.url, request) for img in obj.images.all()]

    def get_discount_percent(self, obj):
        return obj.discount_percent


class ProductDetailSerializer(ProductListSerializer):
    specs = ProductSpecSerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['specs', 'reviews']
