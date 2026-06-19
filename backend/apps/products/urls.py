from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='product_list'),
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('brands/', views.BrandListView.as_view(), name='brand_list'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('<slug:slug>/reviews/', views.ReviewCreateView.as_view(), name='review_create'),
    path('reviews/<int:pk>/like/', views.ReviewLikeView.as_view(), name='review_like'),
]
