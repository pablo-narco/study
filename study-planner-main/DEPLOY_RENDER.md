# 🚀 Деплой на Render (Бесплатно, без сервера)

Render - самый простой способ задеплоить ваше приложение бесплатно!

## Преимущества Render:
- ✅ Бесплатный tier
- ✅ Автоматический SSL
- ✅ Деплой из GitHub
- ✅ Не нужен отдельный сервер
- ✅ Автоматические обновления

## Пошаговая инструкция:

### 1. Регистрация
1. Перейдите на https://render.com
2. Нажмите "Get Started for Free"
3. Зарегистрируйтесь через GitHub

### 2. Подготовка проекта

Создайте файл `render.yaml` в корне проекта:

```yaml
services:
  - type: web
    name: study-ai-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile.prod
    plan: free
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: study-ai-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: "False"
      - key: ALLOWED_HOSTS
        sync: false
      - key: CORS_ALLOWED_ORIGINS
        sync: false
      - key: OPENAI_API_KEY
        sync: false

  - type: web
    name: study-ai-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile.prod
    plan: free
    envVars:
      - key: VITE_API_URL
        fromService:
          name: study-ai-backend
          type: web
          property: host

databases:
  - name: study-ai-db
    plan: free
    databaseName: studyai
    user: studyai_user
```

### 3. Загрузка в GitHub

```bash
# Если проект ещё не в Git
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ваш-username/study-ai.git
git push -u origin main
```

### 4. Деплой на Render

1. В Render Dashboard нажмите "New" → "Blueprint"
2. Подключите ваш GitHub репозиторий
3. Выберите репозиторий `study-ai`
4. Render автоматически обнаружит `render.yaml`
5. Нажмите "Apply"

### 5. Настройка переменных окружения

После создания сервисов:

1. **Backend** → Environment:
   - `ALLOWED_HOSTS`: `study-ai-backend.onrender.com`
   - `CORS_ALLOWED_ORIGINS`: `https://study-ai-frontend.onrender.com`
   - `OPENAI_API_KEY`: (ваш ключ, если есть)

2. **Frontend** → Environment:
   - `VITE_API_URL`: `https://study-ai-backend.onrender.com`

### 6. Первоначальная настройка

После деплоя выполните миграции:

1. В Render Dashboard откройте Backend сервис
2. Перейдите в "Shell"
3. Выполните:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

## ✅ Готово!

Ваше приложение будет доступно по адресам:
- Frontend: `https://study-ai-frontend.onrender.com`
- Backend: `https://study-ai-backend.onrender.com`
- Admin: `https://study-ai-backend.onrender.com/admin`

## ⚠️ Важные замечания:

1. **Бесплатный tier**: Приложение "засыпает" после 15 минут неактивности
2. **Первый запуск**: Может занять 1-2 минуты после "пробуждения"
3. **База данных**: Бесплатная PostgreSQL с ограничениями

## 🔧 Обновление кода:

Просто сделайте `git push` - Render автоматически задеплоит изменения!

```bash
git add .
git commit -m "Update"
git push
```

## 💡 Альтернатива: Railway

Railway работает похоже, но даёт $5 кредитов в месяц:

1. Регистрация: https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Выберите репозиторий
4. Railway автоматически определит Docker и задеплоит
