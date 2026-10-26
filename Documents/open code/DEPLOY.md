# Render.com Web Service Configuration

Этот файл описывает как развернуть приложение на Render.com

## Быстрый деплой

### Шаг 1: Подготовка Git репозитория

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Шаг 2: Создание Web Service

1. Зайдите на https://dashboard.render.com
2. Нажмите "New +" → "Web Service"
3. Подключите ваш Git репозиторий
4. Заполните форму:

**Name:** `video-generator-ai`

**Environment:** `Node`

**Build Command:** 
```
npm install
```

**Start Command:**
```
npm start
```

### Шаг 3: Environment Variables

Добавьте в Dashboard → Environment:

```
NODE_ENV=production
BASE_URL=https://api.kie.ai/v1
```

### Шаг 4: Нажмите "Create Web Service"

Render.com начнет деплойment. После завершения вы получите публичный URL.

## GitHub Actions (опционально)

Для автоматического деплоя при push в main ветку, создайте файл:

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Render deploy
        run: |
          curl https://api.render.com/deploy/${{ secrets.RENDER_DEPLOY_HOOK }}
```

Затем добавьте `RENDER_DEPLOY_HOOK` в GitHub Secrets.

## Мониторинг

На Render.com Dashboard вы можете:
- Просматривать логи в реальном времени
- Управлять переменными окружения
- Перезапускать сервис
- Просматривать использование ресурсов

## Планы Render.com

- **Free** - Для разработки (спит после 15 мин неактивности)
- **Starter** - $7/месяц (всегда включен)
- **Standard** - $12/месяц (больше ресурсов)

## Поддерживаемые платежные системы

- Кредитная карта
- GitHub Sponsors

## Советы для оптимизации

1. Используйте кэширование в браузере
2. Сжимайте статические файлы
3. Используйте CDN для больших файлов
4. Мониторьте использование API запросов

## Решение проблем

**Ошибка при деплое:**
- Проверьте `package.json`
- Убедитесь что `npm start` работает локально
- Просмотрите логи в Render.com Dashboard

**Приложение падает:**
- Проверьте переменные окружения
- Убедитесь что API доступен
- Увеличьте лимит памяти

**Медленная загрузка:**
- Убедитесь что используется Starter план
- Оптимизируйте размер статических файлов
- Используйте более мощный инстанс

## Ссылки

- https://render.com/docs
- https://render.com/pricing
- https://render.com/status
