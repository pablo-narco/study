from rest_framework import serializers
from .models import Plan, PlanVersion


class PlanVersionSerializer(serializers.ModelSerializer):
    """Serializer for plan version"""
    class Meta:
        model = PlanVersion
        fields = (
            'id', 'version_number', 'content_json', 'model_used',
            'created_at'
        )
        read_only_fields = ('id', 'created_at')


class PlanSerializer(serializers.ModelSerializer):
    """Serializer for plan with latest version"""
    versions = PlanVersionSerializer(many=True, read_only=True)
    latest_version = serializers.SerializerMethodField()
    
    class Meta:
        model = Plan
        fields = (
            'id', 'title', 'goal_text', 'deadline', 'is_active',
            'created_at', 'updated_at', 'versions', 'latest_version'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'versions')
    
    def get_latest_version(self, obj):
        """Get the most recent version"""
        latest = obj.versions.first()
        if latest:
            return PlanVersionSerializer(latest).data
        return None


class PlanCreateSerializer(serializers.Serializer):
    """Serializer for creating a new plan"""
    title = serializers.CharField(max_length=200, required=True)
    goal_text = serializers.CharField(required=True)
    deadline = serializers.DateField(required=False, allow_null=True)
    current_level = serializers.ChoiceField(
        choices=['beginner', 'intermediate', 'advanced'],
        required=False
    )
    daily_minutes = serializers.IntegerField(required=False, min_value=1, max_value=1440)
    focus_areas = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    preferred_resources = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    
    def validate_focus_areas(self, value):
        """Validate focus areas"""
        valid_areas = ['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary']
        for area in value:
            if area not in valid_areas:
                raise serializers.ValidationError(f"Invalid focus area: {area}. Must be one of {valid_areas}")
        return value
    
    def validate_preferred_resources(self, value):
        """Validate preferred resources"""
        valid_resources = ['videos', 'books', 'apps', 'podcasts', 'websites']
        for resource in value:
            if resource not in valid_resources:
                raise serializers.ValidationError(f"Invalid resource type: {resource}. Must be one of {valid_resources}")
        return value


class PlanRegenerateSerializer(serializers.Serializer):
    """Serializer for regenerating a plan"""
    current_level = serializers.ChoiceField(
        choices=['beginner', 'intermediate', 'advanced'],
        required=False
    )
    daily_minutes = serializers.IntegerField(required=False, min_value=1, max_value=1440)
    deadline = serializers.DateField(required=False, allow_null=True)
    focus_areas = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    preferred_resources = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
