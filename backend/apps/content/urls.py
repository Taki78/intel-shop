from django.urls import path
from . import views

# Public content endpoints (mounted at /api/content/)
urlpatterns = [
    path('slides/',     views.PublicSlideListView.as_view(),         name='public-slides'),
    path('about/',      views.PublicAboutView.as_view(),             name='public-about'),
    path('newsletter/', views.PublicNewsletterSubscribeView.as_view(),name='public-newsletter'),
    path('contact/',    views.PublicContactSubmitView.as_view(),     name='public-contact'),
]

# Admin content endpoints (mounted at /api/admin/)
admin_urlpatterns = [
    path('slides/',                views.AdminSlideListCreateView.as_view(),  name='admin-slides'),
    path('slides/<int:pk>/',       views.AdminSlideDetailView.as_view(),      name='admin-slide-detail'),
    path('about/',                 views.AdminAboutView.as_view(),            name='admin-about'),
    path('newsletter/',            views.AdminNewsletterListView.as_view(),   name='admin-newsletter'),
    path('newsletter/<int:pk>/',   views.AdminNewsletterDetailView.as_view(), name='admin-newsletter-detail'),
    path('messages/',              views.AdminMessageListView.as_view(),      name='admin-messages'),
    path('messages/<int:pk>/',     views.AdminMessageDetailView.as_view(),    name='admin-message-detail'),
]
