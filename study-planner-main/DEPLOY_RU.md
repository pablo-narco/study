# 🚀 Деплой AI Study Planner

## Быстрый запуск (всё вместе)

### 1. Запуск в режиме разработки (для тестирования)

```bash
# Просто запустите:
docker-compose up --build

# Или используйте скрипт:
./deploy.sh dev
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Admin: http://localhost:8000/admin

### 2. Запуск в production режиме (для продакшена)

```bash
# Сделайте скрипт исполняемым (один раз)
chmod +x deploy.sh

# Запустите production деплой
./deploy.sh prod
```

Приложение будет доступно:
- Frontend: http://localhost (порт 80)
- Backend: http://localhost:8000
- Admin: http://localhost/admin

## Настройка перед запуском

### 1. Создайте файлы окружения

**backend/.env:**
```bash
cat > backend/.env << 'EOF'
SECRET_KEY=ваш-секретный-ключ-сгенерируйте-новый
DEBUG=False
DATABASE_URL=postgresql://studyai_user:studyai_password@db:5432/studyai
OPENAI_API_KEY=
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EOF
```

**frontend/.env:**
```bash
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:8000
EOF
```

### 2. Первый запуск

```bash
# Запустите контейнеры
./deploy.sh prod

# Подождите 10-15 секунд, затем выполните миграции
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Создайте суперпользователя
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## Полезные команды

```bash
# Просмотр статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Остановка
docker-compose -f docker-compose.prod.yml down

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Обновление после изменений кода
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## Структура проекта

```
study-ai/
├── backend/          # Django backend
├── frontend/         # React frontend
├── docker-compose.yml        # Development конфигурация
├── docker-compose.prod.yml   # Production конфигурация
├── deploy.sh         # Скрипт автоматического деплоя
└── DEPLOY.md         # Подробная инструкция
```

## Что делает скрипт deploy.sh

1. ✅ Проверяет наличие Docker
2. ✅ Создаёт .env файлы если их нет
3. ✅ Останавливает старые контейнеры
4. ✅ Собирает новые образы
5. ✅ Запускает все сервисы
6. ✅ Применяет миграции БД
7. ✅ Собирает статические файлы

## Решение проблем

### Порт 80 занят

Измените в `docker-compose.prod.yml`:
```yaml
ports:
  - "8080:80"  # вместо "80:80"
```

### Ошибки при запуске

```bash
# Посмотрите логи
docker-compose -f docker-compose.prod.yml logs

# Пересоздайте контейнеры
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```

### База данных не подключается

Убедитесь, что контейнер `db` запущен:
```bash
docker-compose -f docker-compose.prod.yml ps
```

## Готово! 🎉

После запуска вы можете:
1. Зарегистрировать пользователя на http://localhost (или http://localhost:3000 в dev режиме)
2. Войти в админ-панель на http://localhost/admin
3. Создавать планы обучения
4. Использовать админ-дашборд для управления пользователями
