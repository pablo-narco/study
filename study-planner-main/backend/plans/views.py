from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django.db import transaction
from .models import Plan, PlanVersion
from .serializers import (
    PlanSerializer,
    PlanCreateSerializer,
    PlanRegenerateSerializer
)
from .services import generate_study_plan
from accounts.models import StudyProfile


class PlanGenerationThrottle(UserRateThrottle):
    """Custom throttle for plan generation"""
    rate = '10/hour'


class PlanListView(generics.ListCreateAPIView):
    """List user's plans or create a new plan"""
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Plan.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlanCreateSerializer
        return PlanSerializer
    
    @throttle_classes([PlanGenerationThrottle])
    def create(self, request, *args, **kwargs):
        serializer = PlanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        profile = getattr(user, 'study_profile', None)
        
        # Get plan parameters
        title = serializer.validated_data['title']
        goal_text = serializer.validated_data['goal_text']
        deadline = serializer.validated_data.get('deadline')
        
        # Get profile data or use provided values
        current_level = serializer.validated_data.get('current_level') or (profile.current_level if profile else 'beginner')
        daily_minutes = serializer.validated_data.get('daily_minutes') or (profile.daily_minutes if profile else 30)
        focus_areas = serializer.validated_data.get('focus_areas') or (profile.focus_areas if profile else [])
        preferred_resources = serializer.validated_data.get('preferred_resources') or (profile.preferred_resources if profile else [])
        preferred_language = profile.preferred_language if profile else 'en'
        
        # Generate plan using AI service
        plan_content = generate_study_plan(
            goal_text=goal_text,
            current_level=current_level,
            daily_minutes=daily_minutes,
            deadline=str(deadline) if deadline else None,
            focus_areas=focus_areas,
            preferred_resources=preferred_resources,
            preferred_language=preferred_language
        )
        
        # Create plan and version
        with transaction.atomic():
            plan = Plan.objects.create(
                user=user,
                title=title,
                goal_text=goal_text,
                deadline=deadline,
                is_active=True  # New plan is active by default
            )
            
            # Get next version number
            latest_version = plan.versions.order_by('-version_number').first()
            next_version = (latest_version.version_number + 1) if latest_version else 1
            
            PlanVersion.objects.create(
                plan=plan,
                version_number=next_version,
                content_json=plan_content,
                prompt_used=plan_content.get('prompt_used', ''),
                model_used=plan_content.get('model_used', 'mock-mode')
            )
        
        return Response(PlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class PlanDetailView(generics.RetrieveAPIView):
    """Get plan details"""
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Plan.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([PlanGenerationThrottle])
def regenerate_plan(request, plan_id):
    """Regenerate a plan with updated parameters"""
    try:
        plan = Plan.objects.get(id=plan_id, user=request.user)
    except Plan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PlanRegenerateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = request.user
    profile = getattr(user, 'study_profile', None)
    
    # Get updated parameters or use existing
    current_level = serializer.validated_data.get('current_level') or (profile.current_level if profile else plan.versions.first().content_json.get('current_level', 'beginner'))
    daily_minutes = serializer.validated_data.get('daily_minutes') or (profile.daily_minutes if profile else 30)
    deadline = serializer.validated_data.get('deadline') or plan.deadline
    focus_areas = serializer.validated_data.get('focus_areas') or (profile.focus_areas if profile else [])
    preferred_resources = serializer.validated_data.get('preferred_resources') or (profile.preferred_resources if profile else [])
    preferred_language = profile.preferred_language if profile else 'en'
    
    # Generate new plan version
    plan_content = generate_study_plan(
        goal_text=plan.goal_text,
        current_level=current_level,
        daily_minutes=daily_minutes,
        deadline=str(deadline) if deadline else None,
        focus_areas=focus_areas,
        preferred_resources=preferred_resources,
        preferred_language=preferred_language
    )
    
    # Create new version
    latest_version = plan.versions.order_by('-version_number').first()
    next_version = (latest_version.version_number + 1) if latest_version else 1
    
    PlanVersion.objects.create(
        plan=plan,
        version_number=next_version,
        content_json=plan_content,
        prompt_used=plan_content.get('prompt_used', ''),
        model_used=plan_content.get('model_used', 'mock-mode')
    )
    
    # Update plan if deadline changed
    if deadline:
        plan.deadline = deadline
        plan.save()
    
    return Response(PlanSerializer(plan).data, status=status.HTTP_200_OK)
