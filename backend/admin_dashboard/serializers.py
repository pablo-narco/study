from rest_framework import serializers
from django.contrib.auth import get_user_model
from accounts.models import StudyProfile
from plans.models import Plan, PlanVersion
from accounts.serializers import UserProfileSerializer

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user list view"""
    study_profile = serializers.SerializerMethodField()
    plans_count = serializers.SerializerMethodField()
    last_plan_created = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'last_login',
            'study_profile', 'plans_count', 'last_plan_created'
        )
    
    def get_study_profile(self, obj):
        profile = getattr(obj, 'study_profile', None)
        if profile:
            return {
                'current_level': profile.current_level,
                'daily_minutes': profile.daily_minutes,
                'preferred_language': profile.preferred_language,
                'study_goal': profile.study_goal
            }
        return None
    
    def get_plans_count(self, obj):
        return Plan.objects.filter(user=obj).count()
    
    def get_last_plan_created(self, obj):
        last_plan = Plan.objects.filter(user=obj).order_by('-created_at').first()
        if last_plan:
            return last_plan.created_at.isoformat()
        return None


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Serializer for admin user detail view with plans"""
    study_profile = serializers.SerializerMethodField()
    plans = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'last_login',
            'study_profile', 'plans'
        )
    
    def get_study_profile(self, obj):
        profile = getattr(obj, 'study_profile', None)
        if profile:
            from accounts.serializers import StudyProfileSerializer
            return StudyProfileSerializer(profile).data
        return None
    
    def get_plans(self, obj):
        plans = Plan.objects.filter(user=obj).order_by('-created_at')
        return [
            {
                'id': plan.id,
                'title': plan.title,
                'goal_text': plan.goal_text,
                'is_active': plan.is_active,
                'created_at': plan.created_at.isoformat(),
                'updated_at': plan.updated_at.isoformat(),
                'versions_count': plan.versions.count(),
                'latest_version': {
                    'version_number': plan.versions.first().version_number,
                    'model_used': plan.versions.first().model_used,
                    'created_at': plan.versions.first().created_at.isoformat()
                } if plan.versions.exists() else None
            }
            for plan in plans
        ]


class AdminMetricsSerializer(serializers.Serializer):
    """Serializer for admin metrics"""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_plans = serializers.IntegerField()
    plans_today = serializers.IntegerField()
    plans_this_week = serializers.IntegerField()
    plans_this_month = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    active_users_this_week = serializers.IntegerField()
    plans_by_day = serializers.DictField()
    users_by_day = serializers.DictField()
