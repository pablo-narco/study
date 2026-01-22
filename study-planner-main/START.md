# Как запустить приложение (Русский)

## Шаг 1: Установите Docker

### Для macOS:
1. Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Установите и запустите Docker Desktop
3. Убедитесь, что Docker запущен (иконка в меню должна быть зелёной)

### Для Linux:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Шаг 2: Откройте терминал в папке проекта

```bash
cd /Users/lazizjanasatov/Desktop/study-ai
```

## Шаг 3: Запустите приложение

```bash
docker-compose up --build
```

Эта команда:
- Скачает все необходимые образы (PostgreSQL, Python, Node.js)
- Соберёт контейнеры
- Запустит базу данных, backend и frontend

**Первый запуск может занять 5-10 минут** (скачивание образов и установка зависимостей)

## Шаг 4: В новом окне терминала - создайте миграции БД

Откройте **новый терминал** и выполните:

```bash
cd /Users/lazizjanasatov/Desktop/study-ai
docker-compose exec backend python manage.py migrate
```

## Шаг 5: Создайте суперпользователя (админа)

В том же терминале:

```bash
docker-compose exec backend python manage.py createsuperuser
```

Введите:
- Username: (любое имя, например `admin`)
- Email: (ваш email)
- Password: (придумайте пароль)

## Шаг 6: Откройте приложение в браузере

- **Frontend (веб-интерфейс)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Админ-панель Django**: http://localhost:8000/admin
- **API документация**: http://localhost:8000/api/schema/swagger-ui/

## Что делать дальше?

1. **Зарегистрируйте нового пользователя** на http://localhost:3000/register
2. **Войдите** в систему
3. **Создайте план обучения** через мастер настройки
4. **Просмотрите план** в дашборде

Если вы создали суперпользователя, вы можете:
- Войти в админ-панель Django: http://localhost:8000/admin
- Войти в админ-дашборд React: http://localhost:3000/admin (после входа как суперпользователь)

## Остановка приложения

Нажмите `Ctrl+C` в терминале, где запущен `docker-compose up`

Или в другом терминале:
```bash
docker-compose down
```

## Полезные команды

```bash
# Посмотреть логи
docker-compose logs -f

# Остановить все контейнеры
docker-compose down

# Перезапустить
docker-compose restart

# Запустить в фоне
docker-compose up -d

# Остановить фоновые контейнеры
docker-compose down
```

## Решение проблем

### Порт уже занят
Если порты 3000 или 8000 заняты, измените их в файле `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # вместо 3000:3000
  - "8001:8000"  # вместо 8000:8000
```

### Ошибка подключения к БД
Убедитесь, что контейнер `db` запущен:
```bash
docker-compose ps
```

### Очистить всё и начать заново
```bash
docker-compose down -v  # удалит все данные БД
docker-compose up --build
```

## Без Docker (альтернативный способ)

Если Docker не установлен, можно запустить вручную:

### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

Но для этого нужны:
- Python 3.11+
- PostgreSQL (установленный отдельно)
- Node.js 18+
