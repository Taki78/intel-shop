from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListCreateView.as_view(), name='order_list'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('by-number/<str:order_number>/', views.OrderByNumberView.as_view(), name='order_by_number'),
    path('<int:order_id>/invoice/', views.InvoiceView.as_view(), name='invoice'),
    path('<int:pk>/payment/initiate/', views.PaymentInitiateView.as_view(), name='payment_initiate'),
    path('payment/callback/', views.PaymentCallbackView.as_view(), name='payment_callback'),
]
