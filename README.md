# AI Study Planner

A production-ready web application that creates individualized learning roadmaps using AI. Built with Django REST Framework backend and React frontend.

## Features

- 🔐 JWT Authentication with refresh tokens
- 👤 User profiles with study preferences
- 🤖 AI-powered study plan generation (OpenAI API)
- 📊 Admin dashboard for user management and metrics
- 📱 Responsive, modern UI
- 🐳 Docker containerization
- 🚀 Production deployment ready

## Tech Stack

- **Backend**: Django 4.2+ with Django REST Framework
- **Authentication**: SimpleJWT
- **Database**: PostgreSQL
- **Frontend**: React 18+ with Vite and TailwindCSS
- **API Docs**: Swagger/OpenAPI (drf-spectacular)
- **Deployment**: Docker + docker-compose (local), VPS with Nginx + Let's Encrypt (production)

## Quick Start

### Option 1: Automatic Deployment (Recommended)

```bash
# Make script executable (one time)
chmod +x deploy.sh

# Development mode
./deploy.sh dev

# Production mode
./deploy.sh prod
```

### Option 2: Manual Setup

#### Prerequisites

- Docker and Docker Compose
- Git

#### Setup Steps

1. **Navigate to the project directory**

2. **Create environment files**:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Edit `backend/.env`** and set:
   - `OPENAI_API_KEY` (optional - app works in mock mode without it)
   - `SECRET_KEY` (generate a new one for production)
   - `DATABASE_URL` (defaults to postgresql://user:password@db:5432/studyai)

4. **Build and start services**:

   ```bash
   # Development
   docker-compose up --build
   
   # Production
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

5. **Run migrations**:

   ```bash
   docker-compose exec backend python manage.py migrate
   ```

6. **Create superuser**:

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

7. **Access the application**:
   - **Development**: Frontend: http://localhost:3000, Backend: http://localhost:8000
   - **Production**: Frontend: http://localhost, Backend: http://localhost:8000
   - Django Admin: http://localhost:8000/admin (dev) or http://localhost/admin (prod)
   - API Docs: http://localhost:8000/api/schema/swagger-ui/

## Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

## Project Structure

```
study-ai/
├── backend/                 # Django backend
│   ├── studyai/            # Main project settings
│   ├── accounts/           # User authentication & profiles
│   ├── plans/              # Study plan models & views
│   ├── admin_dashboard/    # Admin API endpoints
│   ├── manage.py
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml      # Docker orchestration
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT tokens)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile

### Plans
- `GET /api/plans` - List user's plans
- `POST /api/plans` - Create new plan
- `GET /api/plans/{id}` - Get plan details
- `POST /api/plans/{id}/regenerate` - Regenerate plan

### Admin (Super Admin only)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/{id}/deactivate` - Deactivate user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/metrics` - Get usage metrics

Full API documentation available at `/api/schema/swagger-ui/` when running the server.

## Environment Variables

### Backend (.env)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@db:5432/studyai
OPENAI_API_KEY=sk-...  # Optional, app works in mock mode without it
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## Creating a Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

Or manually:
```bash
cd backend
python manage.py createsuperuser
```

## Running Tests

```bash
docker-compose exec backend python manage.py test
```

Or manually:
```bash
cd backend
python manage.py test
```

## Production Deployment (VPS with Ubuntu + Nginx + Let's Encrypt)

### Prerequisites

- Ubuntu 20.04+ VPS
- Domain name pointing to your VPS IP
- SSH access to the server

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Clone and Configure

```bash
# Clone your repository
git clone <your-repo-url> /opt/study-ai
cd /opt/study-ai

# Create production environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env for production
nano backend/.env
# Set:
# - DEBUG=False
# - SECRET_KEY=<generate-new-secret>
# - ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
# - DATABASE_URL=postgresql://user:password@db:5432/studyai
# - OPENAI_API_KEY=sk-...
# - CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Edit frontend/.env for production
nano frontend/.env
# Set:
# - VITE_API_URL=https://api.yourdomain.com (or same domain with /api prefix)
```

### Step 3: Build and Start Services

```bash
cd /opt/study-ai
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/study-ai`:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/study-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# For frontend domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For API subdomain
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
```

### Step 6: Update Nginx for HTTPS

Certbot will automatically update your Nginx config. Verify it includes:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config
}
```

### Step 7: Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 8: Monitoring and Maintenance

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application
cd /opt/study-ai
git pull
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

## Development Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f [service_name]

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build

# Run migrations
docker-compose exec backend python manage.py migrate

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Django shell
docker-compose exec backend python manage.py shell

# Frontend dev server (if not using Docker)
cd frontend && npm run dev

# Backend dev server (if not using Docker)
cd backend && python manage.py runserver
```

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check DATABASE_URL in backend/.env

### CORS errors
- Verify CORS_ALLOWED_ORIGINS in backend/.env matches your frontend URL

### OpenAI API errors
- App works in mock mode without API key
- Check OPENAI_API_KEY is set correctly if using real AI

### Port conflicts
- Change ports in docker-compose.yml if 3000 or 8000 are in use

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
