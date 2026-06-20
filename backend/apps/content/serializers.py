from rest_framework import serializers
from apps.products.media_utils import absolute_media_url, normalize_media_url
from .models import HeroSlide, AboutPage, NewsletterSubscription, ContactMessage


# ─── Hero Slides ─────────────────────────────────────────────────────────────
class HeroSlideSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = ['id', 'title', 'subtitle', 'badge', 'offer', 'cta_label',
                  'cta_link', 'image', 'gradient', 'chips', 'order', 'is_active']
        read_only_fields = ['id']

    def get_image(self, obj):
        return absolute_media_url(obj.image, self.context.get('request'))


class HeroSlideWriteSerializer(serializers.ModelSerializer):
    """Accepts incoming `image` URLs (absolute or relative) and stores them
    as host-independent paths via normalize_media_url."""

    class Meta:
        model = HeroSlide
        fields = ['id', 'title', 'subtitle', 'badge', 'offer', 'cta_label',
                  'cta_link', 'image', 'gradient', 'chips', 'order', 'is_active']
        read_only_fields = ['id']

    def validate_image(self, value):
        return normalize_media_url(value or '', self.context.get('request'))


# ─── About Page ──────────────────────────────────────────────────────────────
class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = ['hero_title', 'hero_subtitle', 'story_title', 'story_body',
                  'why_title', 'why_items', 'stats', 'updated_at']
        read_only_fields = ['updated_at']


# ─── Newsletter ──────────────────────────────────────────────────────────────
class NewsletterSubscribeSerializer(serializers.ModelSerializer):
    """Public submit: only email, idempotent on duplicate (re-submitting an
    existing email re-activates it instead of erroring)."""
    # Drop the auto-generated UniqueValidator so we can do get_or_create below
    email = serializers.EmailField(validators=[])

    class Meta:
        model = NewsletterSubscription
        fields = ['email']

    def validate_email(self, value):
        return value.strip().lower()

    def create(self, validated_data):
        obj, _ = NewsletterSubscription.objects.get_or_create(
            email=validated_data['email'],
            defaults={'is_active': True},
        )
        if not obj.is_active:
            obj.is_active = True
            obj.save(update_fields=['is_active'])
        return obj


class NewsletterAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ['id', 'email', 'is_active', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']


# ─── Contact Messages ────────────────────────────────────────────────────────
class ContactSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']


class ContactAdminSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'status', 'status_display', 'created_at']
        read_only_fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
