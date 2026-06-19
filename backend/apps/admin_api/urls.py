from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('notifications/', views.AdminNotificationsView.as_view(), name='admin-notifications'),
    path('users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('orders/', views.AdminOrderListView.as_view(), name='admin-orders'),
    path('orders/<int:pk>/', views.AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('orders/<int:pk>/notes/', views.AdminOrderNoteView.as_view(), name='admin-order-notes'),
    path('orders/<int:pk>/notes/<int:note_id>/', views.AdminOrderNoteView.as_view(), name='admin-order-note-delete'),
    path('reviews/', views.AdminReviewListView.as_view(), name='admin-reviews'),
    path('reviews/<int:pk>/', views.AdminReviewDetailView.as_view(), name='admin-review-detail'),
    path('discounts/', views.AdminDiscountListCreateView.as_view(), name='admin-discounts'),
    path('discounts/<int:pk>/', views.AdminDiscountDetailView.as_view(), name='admin-discount-detail'),
    path('brands/', views.AdminBrandListCreateView.as_view(), name='admin-brands'),
    path('upload/', views.AdminImageUploadView.as_view(), name='admin-upload'),
    path('categories/', views.AdminCategoryListCreateView.as_view(), name='admin-categories'),
    path('categories/<int:pk>/', views.AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('products/', views.AdminProductListCreateView.as_view(), name='admin-products'),
    path('products/<int:pk>/', views.AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('settings/', views.ShopSettingsView.as_view(), name='admin-settings'),
]
