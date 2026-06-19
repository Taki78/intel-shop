from django.urls import path
from . import views

urlpatterns = [
    path('validate/', views.ValidateDiscountView.as_view(), name='discount_validate'),
]
