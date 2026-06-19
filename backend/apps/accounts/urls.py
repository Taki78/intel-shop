from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('provinces/', views.ProvinceListView.as_view(), name='provinces'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),
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
