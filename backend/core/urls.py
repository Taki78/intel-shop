from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'Intel Shop — پنل مدیریت'
admin.site.site_title = 'Intel Shop'
admin.site.index_title = 'مدیریت فروشگاه اینتل شاپ'

from apps.content.urls import admin_urlpatterns as content_admin_urls

api_patterns = [
    path('', include('apps.accounts.urls')),
    path('products/', include('apps.products.urls')),
    path('orders/', include('apps.orders.urls')),
    path('discounts/', include('apps.discounts.urls')),
    path('admin/', include('apps.admin_api.urls')),
    path('admin/', include((content_admin_urls, 'content_admin'))),
    path('content/', include('apps.content.urls')),
    path('blog/', include('apps.blog.urls')),
]

urlpatterns = [
    path('djadmin/', admin.site.urls),
    path('api/', include(api_patterns)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
