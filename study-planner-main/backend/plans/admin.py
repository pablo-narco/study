from django.contrib import admin
from .models import Plan, PlanVersion


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    """Admin interface for Plan model"""
    list_display = ('id', 'user', 'title', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'title', 'goal_text')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(PlanVersion)
class PlanVersionAdmin(admin.ModelAdmin):
    """Admin interface for PlanVersion model"""
    list_display = ('id', 'plan', 'version_number', 'model_used', 'created_at')
    list_filter = ('model_used', 'created_at')
    search_fields = ('plan__title', 'plan__user__username')
    readonly_fields = ('created_at',)
    raw_id_fields = ('plan',)
