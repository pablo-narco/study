from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserDetailView,
    deactivate_user,
    delete_user,
    admin_metrics
)

urlpatterns = [
    path('users', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:user_id>/deactivate', deactivate_user, name='admin-deactivate-user'),
    path('users/<int:user_id>/delete', delete_user, name='admin-delete-user'),
    path('metrics', admin_metrics, name='admin-metrics'),
]
