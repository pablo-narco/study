from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom user model with role support"""
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
        ('SUPERADMIN', 'Super Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='USER')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.username
    
    @property
    def is_super_admin(self):
        return self.role == 'SUPERADMIN' or self.is_superuser
    
    @property
    def is_admin(self):
        return self.role in ['ADMIN', 'SUPERADMIN'] or self.is_staff


class StudyProfile(models.Model):
    """User study preferences and profile"""
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('ru', 'Russian'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='study_profile')
    current_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    daily_minutes = models.IntegerField(default=30, help_text='Available study time per day in minutes')
    preferred_language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    study_goal = models.TextField(blank=True, help_text='User\'s study goal description')
    focus_areas = models.JSONField(default=list, help_text='List of focus areas: speaking, listening, reading, writing, grammar, vocabulary')
    preferred_resources = models.JSONField(default=list, help_text='List of preferred resource types: videos, books, apps, podcasts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'study_profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Study Profile"
