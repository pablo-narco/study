# Quick Start Guide

## Prerequisites
- Docker and Docker Compose installed
- Git (optional, if cloning)

## 1. Clone/Navigate to Project
```bash
cd study-ai
```

## 2. Setup Environment Files

### Backend
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set:
- `SECRET_KEY` - Generate a new secret key for production
- `OPENAI_API_KEY` - (Optional) Your OpenAI API key, or leave empty for mock mode
- `DATABASE_URL` - Default is fine for local development

### Frontend
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and set:
- `VITE_API_URL` - Default `http://localhost:8000` is fine for local

## 3. Start Services
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database
- Start Django backend on port 8000
- Start React frontend on port 3000

## 4. Run Migrations
In a new terminal:
```bash
docker-compose exec backend python manage.py migrate
```

## 5. Create Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

Follow the prompts to create an admin account.

## 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/schema/swagger-ui/

## 7. Test the Application

1. **Register a new user** at http://localhost:3000/register
2. **Login** with your credentials
3. **Create a study plan** via the onboarding wizard
4. **View your plan** in the dashboard
5. **Access admin dashboard** (if you're a superuser) at http://localhost:3000/admin

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Django shell
docker-compose exec backend python manage.py shell

# Run tests
docker-compose exec backend python manage.py test
```

## Troubleshooting

### Port already in use
If ports 3000 or 8000 are in use, edit `docker-compose.yml` and change the port mappings.

### Database connection errors
Make sure the PostgreSQL container is running:
```bash
docker-compose ps
```

### CORS errors
Check that `CORS_ALLOWED_ORIGINS` in `backend/.env` includes your frontend URL.

### OpenAI API errors
The app works in mock mode without an API key. If you want real AI plans, set `OPENAI_API_KEY` in `backend/.env`.

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API_EXAMPLES.md](API_EXAMPLES.md) for API usage examples
- Review the deployment guide in README.md for production setup
