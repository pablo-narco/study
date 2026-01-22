from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Plan, PlanVersion

User = get_user_model()


class PlanTests(TestCase):
    """Tests for plan endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Login to get token
        login_response = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        
        self.token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_create_plan(self):
        """Test creating a study plan"""
        plan_data = {
            'title': 'Learn English',
            'goal_text': 'I want to learn English for IELTS 7.0',
            'current_level': 'beginner',
            'daily_minutes': 60,
            'focus_areas': ['reading', 'writing'],
            'preferred_resources': ['videos', 'books']
        }
        
        response = self.client.post('/api/plans/', plan_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Learn English')
        
        # Verify plan was created
        plan = Plan.objects.get(title='Learn English')
        self.assertEqual(plan.user, self.user)
        self.assertTrue(plan.is_active)
        
        # Verify version was created
        self.assertTrue(plan.versions.exists())
        version = plan.versions.first()
        self.assertIn('weekly_roadmap', version.content_json)
        self.assertIn('daily_tasks', version.content_json)
    
    def test_list_plans(self):
        """Test listing user's plans"""
        # Create a plan
        Plan.objects.create(
            user=self.user,
            title='Test Plan',
            goal_text='Test goal'
        )
        
        response = self.client.get('/api/plans/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_plan_detail(self):
        """Test getting plan details"""
        plan = Plan.objects.create(
            user=self.user,
            title='Test Plan',
            goal_text='Test goal'
        )
        
        response = self.client.get(f'/api/plans/{plan.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Plan')
    
    def test_regenerate_plan(self):
        """Test regenerating a plan"""
        plan = Plan.objects.create(
            user=self.user,
            title='Test Plan',
            goal_text='Test goal'
        )
        
        PlanVersion.objects.create(
            plan=plan,
            version_number=1,
            content_json={'test': 'data'},
            prompt_used='test prompt',
            model_used='mock-mode'
        )
        
        response = self.client.post(
            f'/api/plans/{plan.id}/regenerate',
            {
                'daily_minutes': 90,
                'focus_areas': ['speaking', 'listening']
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify new version was created
        self.assertEqual(plan.versions.count(), 2)
