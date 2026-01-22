# 🌐 Деплой на Production сервер с доменом

Полная инструкция по деплою AI Study Planner на публичный сервер с доменом и SSL.

## 📋 Требования

- VPS сервер (Ubuntu 20.04+)
- Домен (например: example.com)
- SSH доступ к серверу
- Root или sudo права

## 🚀 Пошаговая инструкция

### Шаг 1: Подготовка сервера

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install docker-compose-plugin -y

# Установка Nginx
sudo apt install nginx -y

# Установка Certbot (для SSL)
sudo apt install certbot python3-certbot-nginx -y

# Перелогиньтесь для применения изменений
exit
ssh root@your-server-ip
```

### Шаг 2: Настройка DNS

В панели управления вашего домена добавьте A записи:

```
Type: A
Name: @
Value: IP_ВАШЕГО_СЕРВЕРА
TTL: 3600

Type: A
Name: www
Value: IP_ВАШЕГО_СЕРВЕРА
TTL: 3600

Type: A
Name: api
Value: IP_ВАШЕГО_СЕРВЕРА
TTL: 3600
```

Подождите 5-10 минут для распространения DNS.

### Шаг 3: Загрузка проекта на сервер

```bash
# На сервере
cd /opt
sudo git clone <ваш-репозиторий> study-ai
# Или загрузите файлы через scp/sftp

cd study-ai
sudo chown -R $USER:$USER .
```

### Шаг 4: Настройка окружения

```bash
# Создайте .env файлы
cat > backend/.env << 'EOF'
SECRET_KEY=сгенерируйте-секретный-ключ-здесь
DEBUG=False
DATABASE_URL=postgresql://studyai_user:studyai_password@db:5432/studyai
OPENAI_API_KEY=ваш-openai-api-ключ
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=ваш-email@gmail.com
EMAIL_HOST_PASSWORD=ваш-пароль-приложения
EOF

cat > frontend/.env << 'EOF'
VITE_API_URL=https://api.yourdomain.com
EOF

# Замените yourdomain.com на ваш домен!
```

### Шаг 5: Генерация SECRET_KEY

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(50))'
```

Скопируйте результат в `SECRET_KEY` в `backend/.env`.

### Шаг 6: Запуск приложения

```bash
# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите деплой
./deploy.sh prod

# Или вручную:
docker-compose -f docker-compose.prod.yml up -d --build
```

### Шаг 7: Первоначальная настройка

```bash
# Миграции
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Создать суперпользователя
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Собрать статические файлы
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Шаг 8: Настройка Nginx

```bash
# Скопируйте конфигурацию
sudo cp nginx-production.conf /etc/nginx/sites-available/study-ai

# Отредактируйте, заменив yourdomain.com на ваш домен
sudo nano /etc/nginx/sites-available/study-ai

# Замените все вхождения yourdomain.com на ваш домен
sudo sed -i 's/yourdomain.com/ваш-домен.com/g' /etc/nginx/sites-available/study-ai

# Активируйте сайт
sudo ln -s /etc/nginx/sites-available/study-ai /etc/nginx/sites-enabled/

# Удалите дефолтный сайт (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl reload nginx
```

### Шаг 9: Установка SSL сертификатов

```bash
# Для основного домена
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Для API поддомена
sudo certbot --nginx -d api.yourdomain.com

# Certbot автоматически обновит конфигурацию Nginx
```

### Шаг 10: Настройка автообновления SSL

```bash
# Certbot автоматически настраивает автообновление
# Проверить можно командой:
sudo certbot renew --dry-run
```

### Шаг 11: Настройка Firewall

```bash
# Разрешить HTTP, HTTPS и SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## ✅ Проверка работы

После завершения настройки проверьте:

1. **Frontend**: https://yourdomain.com
2. **API**: https://api.yourdomain.com/api/schema/
3. **Admin**: https://api.yourdomain.com/admin

## 🔧 Полезные команды

```bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Обновление кода
cd /opt/study-ai
git pull
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
sudo systemctl status nginx
```

## 🛠️ Решение проблем

### DNS не работает

```bash
# Проверьте DNS записи
dig yourdomain.com
nslookup yourdomain.com
```

### SSL сертификат не устанавливается

- Убедитесь, что DNS записи настроены правильно
- Проверьте, что порты 80 и 443 открыты
- Убедитесь, что Nginx не блокирует запросы

### Приложение не доступно

```bash
# Проверьте логи
docker-compose -f docker-compose.prod.yml logs
sudo tail -f /var/log/nginx/error.log

# Проверьте, что контейнеры запущены
docker-compose -f docker-compose.prod.yml ps

# Проверьте порты
sudo netstat -tlnp | grep -E '80|443|8000'
```

### CORS ошибки

Убедитесь, что в `backend/.env` правильно указаны:
```
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 📝 Важные замечания

1. **Безопасность**: 
   - Используйте сильные пароли
   - Регулярно обновляйте систему
   - Настройте бэкапы базы данных

2. **Производительность**:
   - Настройте мониторинг (например, Uptime Robot)
   - Настройте логирование
   - Рассмотрите использование CDN для статических файлов

3. **Бэкапы**:
   ```bash
   # Бэкап базы данных
   docker-compose -f docker-compose.prod.yml exec db pg_dump -U studyai_user studyai > backup.sql
   ```

## 🎉 Готово!

Ваше приложение теперь доступно по адресу https://yourdomain.com!
