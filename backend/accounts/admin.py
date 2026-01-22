from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudyProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )


@admin.register(StudyProfile)
class StudyProfileAdmin(admin.ModelAdmin):
    """Admin interface for StudyProfile model"""
    list_display = ('user', 'current_level', 'daily_minutes', 'preferred_language', 'created_at')
    list_filter = ('current_level', 'preferred_language', 'created_at')
    search_fields = ('user__username', 'user__email', 'study_goal')
    readonly_fields = ('created_at', 'updated_at')
