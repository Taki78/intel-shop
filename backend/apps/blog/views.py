from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import BlogPost
from .serializers import BlogListSerializer, BlogDetailSerializer


class BlogListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = BlogListSerializer
    pagination_class = None

    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True)


class BlogDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = BlogDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True)
