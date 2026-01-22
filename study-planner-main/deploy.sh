#!/bin/bash

# Скрипт для деплоя AI Study Planner

set -e

echo "🚀 Начинаем деплой AI Study Planner..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен."
    exit 1
fi

# Выбор режима
MODE=${1:-prod}

if [ "$MODE" = "dev" ]; then
    echo "📦 Запуск в режиме разработки..."
    docker-compose up --build
elif [ "$MODE" = "prod" ]; then
    echo "📦 Запуск в production режиме..."
    
    # Проверка .env файлов
    if [ ! -f "backend/.env" ]; then
        echo "⚠️  Файл backend/.env не найден. Создаю из примера..."
        cp backend/.env.example backend/.env 2>/dev/null || true
        echo "⚠️  Пожалуйста, отредактируйте backend/.env перед запуском!"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        echo "⚠️  Файл frontend/.env не найден. Создаю из примера..."
        echo "VITE_API_URL=http://localhost:8000" > frontend/.env
        echo "⚠️  Пожалуйста, отредактируйте frontend/.env перед запуском!"
    fi
    
    # Остановка старых контейнеров
    echo "🛑 Останавливаем старые контейнеры..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Сборка и запуск
    echo "🔨 Собираем образы..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    echo "🚀 Запускаем контейнеры..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Ждём запуска БД
    echo "⏳ Ждём запуска базы данных..."
    sleep 10
    
    # Миграции
    echo "📊 Применяем миграции..."
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput
    
    # Сбор статических файлов
    echo "📦 Собираем статические файлы..."
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput
    
    echo ""
    echo "✅ Деплой завершён!"
    echo ""
    echo "📱 Приложение доступно по адресам:"
    echo "   - Frontend: http://localhost"
    echo "   - Backend API: http://localhost:8000"
    echo "   - Admin: http://localhost/admin"
    echo ""
    echo "📝 Для создания суперпользователя выполните:"
    echo "   docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser"
    echo ""
    echo "📋 Для просмотра логов:"
    echo "   docker-compose -f docker-compose.prod.yml logs -f"
else
    echo "❌ Неизвестный режим: $MODE"
    echo "Использование: ./deploy.sh [dev|prod]"
    exit 1
fi
