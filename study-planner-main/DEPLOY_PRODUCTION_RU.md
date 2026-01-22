# 🌐 Деплой на публичный сервер с доменом

## ⚠️ ВАЖНО: Эти команды выполняются на LINUX СЕРВЕРЕ, не на Mac!

Если вы на Mac, вам нужен отдельный Linux VPS сервер для production деплоя.

## Быстрая инструкция

### 1. Подготовка сервера

**Подключитесь к вашему Linux серверу через SSH:**
```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```

**Затем на сервере выполните:**

```bash
# Подключитесь к серверу
ssh root@IP_ВАШЕГО_СЕРВЕРА

# Установите Docker и Nginx
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo apt install docker-compose-plugin nginx certbot python3-certbot-nginx -y
sudo usermod -aG docker $USER
```

### 2. Настройка DNS

В панели управления домена добавьте:

```
A запись: @ → IP_СЕРВЕРА
A запись: www → IP_СЕРВЕРА  
A запись: api → IP_СЕРВЕРА
```

### 3. Загрузка проекта

```bash
cd /opt
git clone <ваш-репозиторий> study-ai
cd study-ai
```

### 4. Настройка

Отредактируйте `backend/.env`:
```env
SECRET_KEY=сгенерируйте-ключ
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Отредактируйте `frontend/.env`:
```env
VITE_API_URL=https://api.yourdomain.com
```

**Замените `yourdomain.com` на ваш домен!**

### 5. Запуск

```bash
chmod +x deploy.sh
./deploy.sh prod

# Миграции и суперпользователь
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### 6. Настройка Nginx

```bash
# Скопируйте конфигурацию
sudo cp nginx-production.conf /etc/nginx/sites-available/study-ai

# Замените yourdomain.com на ваш домен
sudo sed -i 's/yourdomain.com/ваш-домен.com/g' /etc/nginx/sites-available/study-ai

# Активируйте
sudo ln -s /etc/nginx/sites-available/study-ai /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL сертификаты

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

### 8. Firewall

```bash
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

## ✅ Готово!

- Frontend: https://yourdomain.com
- API: https://api.yourdomain.com
- Admin: https://api.yourdomain.com/admin

## 🔧 Полезные команды

```bash
# Логи
docker-compose -f docker-compose.prod.yml logs -f

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Обновление
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

Подробная инструкция в файле `DEPLOY_PRODUCTION.md`
