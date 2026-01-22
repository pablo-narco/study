from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    RefreshTokenView,
    logout_view,
    ProfileView
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('refresh', RefreshTokenView.as_view(), name='token_refresh'),
    path('logout', logout_view, name='logout'),
    path('', ProfileView.as_view(), name='profile'),
]
