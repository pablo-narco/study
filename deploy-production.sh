#!/bin/bash

# Скрипт для деплоя на production сервер с доменом

set -e

echo "🚀 Деплой AI Study Planner на Production сервер"
echo ""

# Проверка аргументов
if [ -z "$1" ]; then
    echo "Использование: ./deploy-production.sh <domain>"
    echo "Пример: ./deploy-production.sh example.com"
    exit 1
fi

DOMAIN=$1
API_DOMAIN="api.${DOMAIN}"

echo "📋 Домен: $DOMAIN"
echo "📋 API домен: $API_DOMAIN"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

# Обновление .env файлов
echo "📝 Обновление конфигурации..."

# Backend .env
cat > backend/.env << EOF
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
DEBUG=False
DATABASE_URL=postgresql://studyai_user:studyai_password@db:5432/studyai
OPENAI_API_KEY=${OPENAI_API_KEY:-}
ALLOWED_HOSTS=${DOMAIN},www.${DOMAIN},${API_DOMAIN},localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN},http://${DOMAIN},http://www.${DOMAIN}
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=${EMAIL_HOST_USER:-}
EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD:-}
EOF

# Frontend .env
cat > frontend/.env << EOF
VITE_API_URL=https://${API_DOMAIN}
EOF

echo "✅ Конфигурация обновлена"
echo ""

# Остановка старых контейнеров
echo "🛑 Остановка старых контейнеров..."
docker-compose -f docker-compose.prod.yml down || true

# Сборка образов
echo "🔨 Сборка образов..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Запуск контейнеров
echo "🚀 Запуск контейнеров..."
docker-compose -f docker-compose.prod.yml up -d

# Ожидание запуска БД
echo "⏳ Ожидание запуска базы данных..."
sleep 15

# Миграции
echo "📊 Применение миграций..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput

# Статические файлы
echo "📦 Сборка статических файлов..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

echo ""
echo "✅ Деплой завершён!"
echo ""
echo "📱 Приложение доступно:"
echo "   - Frontend: https://${DOMAIN}"
echo "   - API: https://${API_DOMAIN}"
echo ""
echo "⚠️  Следующие шаги:"
echo "   1. Настройте DNS записи для ${DOMAIN} и ${API_DOMAIN}"
echo "   2. Установите SSL сертификаты (Let's Encrypt)"
echo "   3. Настройте Nginx на сервере"
echo ""
echo "📋 Для создания суперпользователя:"
echo "   docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser"
