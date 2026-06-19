from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'Intel Shop — پنل مدیریت'
admin.site.site_title = 'Intel Shop'
admin.site.index_title = 'مدیریت فروشگاه اینتل شاپ'

api_patterns = [
    path('', include('apps.accounts.urls')),
    path('products/', include('apps.products.urls')),
    path('orders/', include('apps.orders.urls')),
    path('discounts/', include('apps.discounts.urls')),
    path('admin/', include('apps.admin_api.urls')),
    path('blog/', include('apps.blog.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_patterns)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
