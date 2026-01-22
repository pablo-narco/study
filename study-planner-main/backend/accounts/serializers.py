from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, StudyProfile


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer to include user data"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        # Create study profile
        StudyProfile.objects.create(user=user)
        return user


class StudyProfileSerializer(serializers.ModelSerializer):
    """Serializer for study profile"""
    class Meta:
        model = StudyProfile
        fields = (
            'current_level', 'daily_minutes', 'preferred_language',
            'study_goal', 'focus_areas', 'preferred_resources',
            'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with study profile"""
    study_profile = StudyProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'last_login',
            'study_profile'
        )
        read_only_fields = ('id', 'username', 'role', 'date_joined', 'last_login', 'is_active')


class UserProfileUpdateSerializer(serializers.Serializer):
    """Serializer for updating user profile"""
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    
    # Study profile fields
    current_level = serializers.ChoiceField(choices=StudyProfile.LEVEL_CHOICES, required=False)
    daily_minutes = serializers.IntegerField(required=False, min_value=1, max_value=1440)
    preferred_language = serializers.ChoiceField(choices=StudyProfile.LANGUAGE_CHOICES, required=False)
    study_goal = serializers.CharField(required=False, allow_blank=True)
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
    
    def update(self, instance, validated_data):
        # Update user fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        if 'email' in validated_data:
            instance.email = validated_data['email']
        instance.save()
        
        # Update study profile
        profile, created = StudyProfile.objects.get_or_create(user=instance)
        profile.current_level = validated_data.get('current_level', profile.current_level)
        profile.daily_minutes = validated_data.get('daily_minutes', profile.daily_minutes)
        profile.preferred_language = validated_data.get('preferred_language', profile.preferred_language)
        profile.study_goal = validated_data.get('study_goal', profile.study_goal)
        if 'focus_areas' in validated_data:
            profile.focus_areas = validated_data['focus_areas']
        if 'preferred_resources' in validated_data:
            profile.preferred_resources = validated_data['preferred_resources']
        profile.save()
        
        return instance
