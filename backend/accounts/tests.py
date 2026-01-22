from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import StudyProfile

User = get_user_model()


class AuthenticationTests(TestCase):
    """Tests for authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_user_registration(self):
        """Test user registration"""
        response = self.client.post('/api/auth/register', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
        
        # Verify user was created
        user = User.objects.get(username='testuser')
        self.assertEqual(user.email, 'test@example.com')
        
        # Verify study profile was created
        self.assertTrue(hasattr(user, 'study_profile'))
    
    def test_user_registration_password_mismatch(self):
        """Test registration with mismatched passwords"""
        data = self.user_data.copy()
        data['password2'] = 'different'
        response = self.client.post('/api/auth/register', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_login(self):
        """Test user login"""
        # Create user first
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        response = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_user_profile_access(self):
        """Test accessing user profile"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Login to get token
        login_response = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Get profile
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
    
    def test_user_profile_update(self):
        """Test updating user profile"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        StudyProfile.objects.create(user=user)
        
        # Login
        login_response = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Update profile
        response = self.client.put('/api/profile/', {
            'first_name': 'Updated',
            'current_level': 'intermediate',
            'daily_minutes': 60
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Updated')
        self.assertEqual(user.study_profile.current_level, 'intermediate')
        self.assertEqual(user.study_profile.daily_minutes, 60)
