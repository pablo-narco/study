from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
from .serializers import (
    AdminUserSerializer,
    AdminUserDetailSerializer,
    AdminMetricsSerializer
)
from accounts.permissions import IsSuperAdmin
from plans.models import Plan

User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    """List all users (super admin only)"""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        queryset = User.objects.all().select_related('study_profile')
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Role filter
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Active filter
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset.order_by('-date_joined')


class AdminUserDetailView(generics.RetrieveAPIView):
    """Get user details with plans (super admin only)"""
    serializer_class = AdminUserDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    queryset = User.objects.all().select_related('study_profile').prefetch_related('plans', 'plans__versions')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsSuperAdmin])
def deactivate_user(request, user_id):
    """Deactivate a user (super admin only)"""
    try:
        user = User.objects.get(id=user_id)
        if user.is_superuser and user != request.user:
            return Response(
                {'error': 'Cannot deactivate another superuser'},
                status=status.HTTP_403_FORBIDDEN
            )
        user.is_active = False
        user.save()
        return Response({'message': f'User {user.username} deactivated'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated, IsSuperAdmin])
def delete_user(request, user_id):
    """Delete a user (super admin only)"""
    try:
        user = User.objects.get(id=user_id)
        if user.is_superuser:
            return Response(
                {'error': 'Cannot delete superuser'},
                status=status.HTTP_403_FORBIDDEN
            )
        username = user.username
        user.delete()
        return Response({'message': f'User {username} deleted'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsSuperAdmin])
def admin_metrics(request):
    """Get admin dashboard metrics (super admin only)"""
    now = timezone.now()
    today = now.date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Basic counts
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    total_plans = Plan.objects.count()
    
    # Plans by time period
    plans_today = Plan.objects.filter(created_at__date=today).count()
    plans_this_week = Plan.objects.filter(created_at__date__gte=week_ago).count()
    plans_this_month = Plan.objects.filter(created_at__date__gte=month_ago).count()
    
    # Active users by time period (users who logged in)
    active_users_today = User.objects.filter(last_login__date=today).count()
    active_users_this_week = User.objects.filter(last_login__date__gte=week_ago).count()
    
    # Plans by day for last 30 days
    plans_by_day = {}
    users_by_day = {}
    for i in range(30):
        date = today - timedelta(days=i)
        plans_by_day[date.isoformat()] = Plan.objects.filter(created_at__date=date).count()
        users_by_day[date.isoformat()] = User.objects.filter(last_login__date=date).count()
    
    metrics = {
        'total_users': total_users,
        'active_users': active_users,
        'total_plans': total_plans,
        'plans_today': plans_today,
        'plans_this_week': plans_this_week,
        'plans_this_month': plans_this_month,
        'active_users_today': active_users_today,
        'active_users_this_week': active_users_this_week,
        'plans_by_day': plans_by_day,
        'users_by_day': users_by_day
    }
    
    serializer = AdminMetricsSerializer(metrics)
    return Response(serializer.data, status=status.HTTP_200_OK)
