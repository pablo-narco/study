# Инструкция по деплою AI Study Planner

## Быстрый старт

### 1. Подготовка

```bash
# Убедитесь, что Docker установлен и запущен
docker --version
docker-compose --version
```

### 2. Настройка окружения

Создайте файлы `.env`:

**backend/.env:**
```env
SECRET_KEY=ваш-секретный-ключ-для-продакшена
DEBUG=False
DATABASE_URL=postgresql://studyai_user:studyai_password@db:5432/studyai
OPENAI_API_KEY=ваш-openai-api-ключ-или-оставьте-пустым
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost,https://yourdomain.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=ваш-email@gmail.com
EMAIL_HOST_PASSWORD=ваш-пароль
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:8000
# Для production с доменом:
# VITE_API_URL=https://api.yourdomain.com
```

### 3. Запуск

#### Режим разработки:
```bash
./deploy.sh dev
# или
docker-compose up --build
```

#### Production режим:
```bash
chmod +x deploy.sh
./deploy.sh prod
# или
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Первоначальная настройка

```bash
# Применить миграции
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Создать суперпользователя
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Собрать статические файлы
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## Доступ к приложению

После запуска приложение будет доступно:

- **Frontend**: http://localhost (или http://localhost:80)
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost/admin
- **API Docs**: http://localhost:8000/api/schema/swagger-ui/

## Полезные команды

```bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Просмотр логов конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Остановка
docker-compose -f docker-compose.prod.yml down

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Обновление кода
git pull
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## Деплой на VPS (Ubuntu)

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install docker-compose-plugin -y

# Перелогиньтесь для применения изменений
exit
```

### 2. Клонирование проекта

```bash
cd /opt
sudo git clone <ваш-репозиторий> study-ai
cd study-ai
sudo chown -R $USER:$USER .
```

### 3. Настройка

```bash
# Создать .env файлы
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Отредактировать .env файлы
nano backend/.env
nano frontend/.env
```

### 4. Запуск

```bash
chmod +x deploy.sh
./deploy.sh prod
```

### 5. Настройка Nginx (опционально, если нужен свой домен)

```bash
sudo apt install nginx -y

# Создать конфигурацию
sudo nano /etc/nginx/sites-available/study-ai
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активировать сайт
sudo ln -s /etc/nginx/sites-available/study-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Решение проблем

### Порт занят
Измените порты в `docker-compose.prod.yml`:
```yaml
ports:
  - "8080:80"  # вместо 80:80
  - "8001:8000"  # вместо 8000:8000
```

### Ошибки миграций
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py makemigrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Очистка и перезапуск
```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```

## Мониторинг

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats

# Логи ошибок
docker-compose -f docker-compose.prod.yml logs --tail=100 | grep -i error
```
