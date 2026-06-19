from rest_framework import serializers
from .models import BlogPost


class BlogListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'slug', 'title', 'excerpt', 'cover', 'author', 'category', 'read_time', 'jalali_date']


class BlogDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'slug', 'title', 'excerpt', 'content', 'cover', 'author', 'category', 'read_time', 'jalali_date']
