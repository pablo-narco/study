from django.db import models
from django.conf import settings


class Plan(models.Model):
    """Study plan created for a user"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plans')
    title = models.CharField(max_length=200)
    goal_text = models.TextField(help_text='User\'s study goal description')
    deadline = models.DateField(null=True, blank=True, help_text='Optional deadline for the goal')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, help_text='Whether this is the user\'s current active plan')
    
    class Meta:
        db_table = 'plans'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username}'s Plan: {self.title}"
    
    def save(self, *args, **kwargs):
        # If this plan is set as active, deactivate other plans for the user
        if self.is_active:
            Plan.objects.filter(user=self.user, is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)


class PlanVersion(models.Model):
    """Version history of a study plan"""
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField(default=1)
    content_json = models.JSONField(help_text='Structured plan content: weekly roadmap, daily tasks, topics, resources, checkpoints')
    prompt_used = models.TextField(help_text='The prompt sent to OpenAI')
    model_used = models.CharField(max_length=50, default='gpt-4-turbo-preview')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'plan_versions'
        ordering = ['-created_at']
        unique_together = ['plan', 'version_number']
        indexes = [
            models.Index(fields=['plan', '-created_at']),
        ]
    
    def __str__(self):
        return f"Plan {self.plan.id} - Version {self.version_number}"
