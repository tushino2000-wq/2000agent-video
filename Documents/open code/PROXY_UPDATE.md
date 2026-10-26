# ОБНОВЛЕНИЕ: ПРОКСИ ДЛЯ ОБХОДА CORS

## Что изменилось

Добавлены прокси-маршруты в `server.js` для безопасного обхода CORS ошибок при прямых запросах к KIE API.

## Новые маршруты в server.js

### 1. POST /api/proxy/generate
```
Отправляет видео на генерацию через локальный сервер
Body: {
  model: string,
  prompt: string,
  duration: number,
  aspect_ratio: string,
  resolution: string,
  image_url?: string (опционально),
  apiKey: string (API ключ KIE)
}
```

**Пример:**
```bash
curl -X POST http://localhost:3000/api/proxy/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedance-2",
    "prompt": "Красивый закат",
    "duration": 10,
    "aspect_ratio": "16:9",
    "resolution": "1080p",
    "apiKey": "your-api-key-here"
  }'
```

### 2. GET /api/proxy/status/:taskId
```
Проверяет статус генерации видео
Header: X-API-Key: your-api-key
```

**Пример:**
```bash
curl -X GET http://localhost:3000/api/proxy/status/task-123 \
  -H "X-API-Key: your-api-key-here"
```

### 3. GET /api/proxy/verify
```
Проверяет валидность API ключа
Header: X-API-Key: your-api-key
```

**Пример:**
```bash
curl -X GET http://localhost:3000/api/proxy/verify \
  -H "X-API-Key: your-api-key-here"
```

## Изменения в app.js

### VideoGenAPI класс

**Новый метод:**
```javascript
proxyRequest(method, endpoint, data = null)
  // Отправляет запросы на локальный прокси вместо прямых вызовов API
```

**Обновленные методы:**
```javascript
generateVideo(params)
  // Теперь использует /api/proxy/generate вместо прямого вызова

checkStatus(taskId)
  // Теперь использует /api/proxy/status/:taskId с X-API-Key заголовком

verifyApiKey()
  // Теперь использует /api/proxy/verify с X-API-Key заголовком
```

## Преимущества

✅ **Обход CORS**: Все запросы идут через локальный сервер
✅ **Безопасность**: API ключ хранится на сервере, не передается в браузер
✅ **Логирование**: Все запросы логируются в консоль сервера
✅ **Обработка ошибок**: Улучшенная обработка ошибок
✅ **Совместимость**: Старые маршруты (/api/generate, /api/status, /api/verify) все еще работают

## Как это работает

1. **Браузер** → отправляет запрос на `/api/proxy/generate` с API ключом в body
2. **Node.js сервер** → получает запрос, извлекает API ключ
3. **Node.js сервер** → отправляет запрос на `https://api.kie.ai/v1/generate` с API ключом в заголовках
4. **KIE API** → обрабатывает запрос
5. **Node.js сервер** → получает ответ и отправляет браузеру
6. **Браузер** → получает ответ без CORS ошибок

## Логи сервера

Теперь в консоли сервера можно увидеть:

```
[Proxy] POST /api/proxy/generate - Model: seedance-2, Duration: 10s
[Proxy] Success - Task ID: abc123xyz
[Proxy] GET /api/proxy/status/abc123xyz
[Proxy] Status: processing
[Proxy] GET /api/proxy/verify
[Proxy] Verify: Success
```

## Обработка ошибок

**Ошибка: API ключ не передан**
```json
{
  "error": "API key required"
}
```

**Ошибка: Ошибка от KIE API**
```json
{
  "error": "Invalid model",
  "details": "..."
}
```

## Совместимость

Существующие маршруты все еще поддерживаются:
- `POST /api/generate` - со старой логикой
- `GET /api/status/:taskId` - со старой логикой
- `GET /api/verify` - со старой логикой

## Миграция (опционально)

Если вы хотите использовать новые прокси маршруты напрямую:

**Старый способ (Authorization header):**
```javascript
fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer api-key-here'
  },
  body: JSON.stringify(payload)
})
```

**Новый способ (в body и X-API-Key):**
```javascript
fetch('/api/proxy/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...payload,
    apiKey: 'api-key-here'
  })
})

// Для статуса и проверки:
fetch('/api/proxy/status/task-id', {
  headers: { 'X-API-Key': 'api-key-here' }
})
```

## Тестирование

Используйте Postman или cURL для тестирования:

1. **Проверка API ключа:**
```bash
curl -X GET http://localhost:3000/api/proxy/verify \
  -H "X-API-Key: your-api-key"
```

2. **Отправка видео:**
```bash
curl -X POST http://localhost:3000/api/proxy/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedance-2",
    "prompt": "Test video",
    "duration": 5,
    "aspect_ratio": "16:9",
    "resolution": "720p",
    "apiKey": "your-api-key"
  }'
```

3. **Проверка статуса:**
```bash
curl -X GET http://localhost:3000/api/proxy/status/task-123 \
  -H "X-API-Key: your-api-key"
```

## Решение проблем

**Проблема: "API key required"**
- Убедитесь, что передали API ключ (в body для generate, в header для status/verify)

**Проблема: "Invalid model"**
- Проверьте название модели (должно быть точное, как в dropdown)

**Проблема: "Network error"**
- Убедитесь, что Node.js сервер запущен (npm start)
- Проверьте консоль сервера на ошибки

**Проблема: Видео генерируется очень долго**
- Это нормально, может быть 1-10 минут в зависимости от модели
- Проверяйте статус через polling

## Дополнительно

Прокси маршруты также полезны для:
- Кэширования результатов на сервере
- Логирования всех запросов
- Ограничения частоты запросов (rate limiting)
- Трансформации ответов перед отправкой в браузер
- Сбора статистики использования

---

**Дата обновления:** Октябрь 2026
**Версия:** 1.1.0
