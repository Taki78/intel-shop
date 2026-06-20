from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('provinces/', views.ProvinceListView.as_view(), name='provinces'),
    # 3-step verify-first register
    path('auth/register/request/',  views.RegisterRequestView.as_view(),  name='register_request'),
    path('auth/register/verify/',   views.RegisterVerifyView.as_view(),   name='register_verify'),
    path('auth/register/complete/', views.RegisterCompleteView.as_view(), name='register_complete'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/password-reset/request/', views.PasswordResetRequestView.as_view(), name='otp_request'),
    path('auth/password-reset/verify/',  views.PasswordResetVerifyView.as_view(),  name='otp_verify'),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='otp_confirm'),

    # Profile
    path('users/me/', views.ProfileView.as_view(), name='profile'),
    path('users/me/change-password/', views.ChangePasswordView.as_view(), name='change_password'),

    # Addresses
    path('users/addresses/', views.AddressListCreateView.as_view(), name='address_list'),
    path('users/addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address_detail'),
    path('users/addresses/<int:pk>/set-default/', views.SetDefaultAddressView.as_view(), name='address_set_default'),
]
