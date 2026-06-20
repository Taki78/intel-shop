from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import HeroSlide, AboutPage, NewsletterSubscription, ContactMessage
from .serializers import (
    HeroSlideSerializer, HeroSlideWriteSerializer,
    AboutPageSerializer,
    NewsletterSubscribeSerializer, NewsletterAdminSerializer,
    ContactSubmitSerializer, ContactAdminSerializer,
)


# ─── Public ──────────────────────────────────────────────────────────────────
class PublicSlideListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HeroSlideSerializer
    pagination_class = None

    def get_queryset(self):
        return HeroSlide.objects.filter(is_active=True)


class PublicAboutView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = AboutPageSerializer

    def get_object(self):
        return AboutPage.get_solo()


class PublicNewsletterSubscribeView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = NewsletterSubscribeSerializer


class PublicContactSubmitView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ContactSubmitSerializer


# ─── Admin: Hero Slides ──────────────────────────────────────────────────────
class AdminSlideListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    queryset = HeroSlide.objects.all()
    pagination_class = None

    def get_serializer_class(self):
        return HeroSlideWriteSerializer if self.request.method == 'POST' else HeroSlideSerializer


class AdminSlideDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = HeroSlide.objects.all()

    def get_serializer_class(self):
        return HeroSlideWriteSerializer if self.request.method in ('PUT', 'PATCH') else HeroSlideSerializer


# ─── Admin: About Page ───────────────────────────────────────────────────────
class AdminAboutView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AboutPageSerializer

    def get_object(self):
        return AboutPage.get_solo()


# ─── Admin: Newsletter ───────────────────────────────────────────────────────
class AdminNewsletterListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = NewsletterAdminSerializer
    queryset = NewsletterSubscription.objects.all()
    pagination_class = None


class AdminNewsletterDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = NewsletterAdminSerializer
    queryset = NewsletterSubscription.objects.all()


# ─── Admin: Contact Messages ─────────────────────────────────────────────────
class AdminMessageListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ContactAdminSerializer
    queryset = ContactMessage.objects.all()
    pagination_class = None


class AdminMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ContactAdminSerializer
    queryset = ContactMessage.objects.all()

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.status == 'new':
            obj.status = 'read'
            obj.save(update_fields=['status'])
        serializer = self.get_serializer(obj)
        return Response(serializer.data)
