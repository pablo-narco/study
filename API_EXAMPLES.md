# API Examples

This document provides example API calls for the AI Study Planner API.

## Base URL
- Local: `http://localhost:8000/api`
- Production: `https://api.yourdomain.com/api`

## Authentication

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password2": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your_refresh_token_here"
  }'
```

### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your_refresh_token_here"
  }'
```

## Profile

### Get Profile
```bash
curl -X GET http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "current_level": "intermediate",
    "daily_minutes": 60,
    "focus_areas": ["reading", "writing"],
    "preferred_resources": ["videos", "books"]
  }'
```

## Plans

### List Plans
```bash
curl -X GET http://localhost:8000/api/plans/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Plan
```bash
curl -X POST http://localhost:8000/api/plans/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn English for IELTS",
    "goal_text": "I want to achieve IELTS 7.0 in 3 months",
    "deadline": "2024-06-01",
    "current_level": "intermediate",
    "daily_minutes": 60,
    "focus_areas": ["reading", "writing", "listening", "speaking"],
    "preferred_resources": ["videos", "books", "apps"]
  }'
```

### Get Plan Details
```bash
curl -X GET http://localhost:8000/api/plans/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Regenerate Plan
```bash
curl -X POST http://localhost:8000/api/plans/1/regenerate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "daily_minutes": 90,
    "focus_areas": ["speaking", "listening"]
  }'
```

## Admin Endpoints (Super Admin Only)

### List Users
```bash
curl -X GET "http://localhost:8000/api/admin/users?search=test&role=USER&is_active=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get User Details
```bash
curl -X GET http://localhost:8000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Deactivate User
```bash
curl -X POST http://localhost:8000/api/admin/users/1/deactivate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Delete User
```bash
curl -X DELETE http://localhost:8000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Metrics
```bash
curl -X GET http://localhost:8000/api/admin/metrics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Using with JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'testpass123'
  })
});

const { access, refresh } = await loginResponse.json();

// Use token for authenticated requests
const profileResponse = await fetch('http://localhost:8000/api/profile/', {
  headers: {
    'Authorization': `Bearer ${access}`,
  }
});

const profile = await profileResponse.json();
```

## Postman Collection

You can import these endpoints into Postman:

1. Create a new collection "AI Study Planner"
2. Set collection variable `base_url` = `http://localhost:8000/api`
3. Set collection variable `access_token` = (will be set after login)
4. Add a pre-request script to set Authorization header:
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.collectionVariables.get('access_token')
   });
   ```
5. Add a test script to login endpoint to save token:
   ```javascript
   if (pm.response.code === 200) {
     const jsonData = pm.response.json();
     pm.collectionVariables.set('access_token', jsonData.access);
   }
   ```
