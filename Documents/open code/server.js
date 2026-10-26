const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Базовый URL реального KIE API
const KIE_BASE_URL = process.env.BASE_URL || 'https://api.kie.ai';
const KIE_UPLOAD_URL = process.env.UPLOAD_BASE_URL || 'https://kieai.redpandaai.co';

// Статические файлы
app.use(express.static(path.join(__dirname, '/')));

// Парсинг JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Основной маршрут
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Иконка не обязательна для работы приложения.
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// ==================== ПРОКСИ МАРШРУТЫ (KIE API) ====================

// Прокси для создания задачи генерации видео
// Реальный эндпоинт: POST https://api.kie.ai/api/v1/jobs/createTask
app.post('/api/proxy/generate', async (req, res) => {
    try {
        const { model, input, callBackUrl } = req.body;
        const apiKey = req.body.apiKey;

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        if (!model) {
            return res.status(400).json({ error: 'Model is required' });
        }

        // Тело запроса для KIE: model + input (параметры модели)
        const payload = { model, input };
        if (callBackUrl) {
            payload.callBackUrl = callBackUrl;
        }

        console.log(`[Proxy] createTask - Model: ${model}`);
        console.log(`[Proxy] input:`, JSON.stringify(input));
        if (input.image_urls || input.reference_image_urls || input.first_frame_url || input.image_url) {
            console.log('[Proxy] reference field:', {
                image_urls: Boolean(input.image_urls),
                reference_image_urls: Boolean(input.reference_image_urls),
                first_frame_url: Boolean(input.first_frame_url),
                image_url: Boolean(input.image_url)
            });
        }

        const response = await fetch(`${KIE_BASE_URL}/api/v1/jobs/createTask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // KIE возвращает HTTP 200 даже при ошибке, статус в поле code
        console.log(`[Proxy] createTask response - code: ${data.code}, msg: ${data.msg}`);

        if (data.code !== 200) {
            return res.status(400).json(data);
        }

        console.log(`[Proxy] Task created - Task ID: ${data.data?.taskId}`);
        res.json(data);
    } catch (error) {
        console.error('[Proxy] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Загружает локальный референс в KIE и возвращает публичный downloadUrl.
app.post('/api/proxy/upload', async (req, res) => {
    try {
        const { base64Data, fileName } = req.body;
        const apiKey = req.body.apiKey;

        if (!apiKey) return res.status(401).json({ error: 'API key required' });
        if (!base64Data) return res.status(400).json({ error: 'base64Data is required' });

        const response = await fetch(`${KIE_UPLOAD_URL}/api/file-base64-upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                base64Data,
                uploadPath: 'images/video-generator',
                fileName
            })
        });
        const data = await response.json();
        console.log(`[Proxy] upload response - code: ${data.code}, msg: ${data.msg}`);
        if (!response.ok || data.code !== 200 || data.success === false) {
            return res.status(response.ok ? 400 : response.status).json({
                error: data.msg || data.error || `KIE upload error: ${response.status}`,
                ...data
            });
        }
        res.json(data);
    } catch (error) {
        console.error('[Proxy] Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Прокси для проверки статуса задачи
// Реальный эндпоинт: GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...
app.get('/api/proxy/status/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        console.log(`[Proxy] recordInfo - Task ID: ${taskId}`);

        const response = await fetch(`${KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const data = await response.json();

        if (data.code !== 200) {
            console.error(`[Proxy] Status Error - code: ${data.code}, msg: ${data.msg}`);
            return res.status(400).json(data);
        }

        console.log(`[Proxy] Task state: ${data.data?.state}`);
        // При сбое выводим причину в консоль сервера
        if (data.data?.state === 'fail') {
            console.error(`[Proxy] FAIL reason - failCode: ${data.data?.failCode}, failMsg: ${data.data?.failMsg}`);
        }
        res.json(data);
    } catch (error) {
        console.error('[Proxy] Status Check Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Прокси для проверки API ключа
// В KIE нет отдельного /verify. Проверяем ключ через запрос recordInfo
// с фиктивным taskId: code 401 = неверный ключ, иначе ключ валиден.
app.get('/api/proxy/verify', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        console.log('[Proxy] verify (via recordInfo probe)');

        const response = await fetch(`${KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=verify_probe`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const data = await response.json();

        // code 401 = неверный/отсутствующий ключ
        // code 422 = ключ валиден, но задача не найдена (это нормально для проверки)
        if (data.code === 401) {
            console.log('[Proxy] Verify: INVALID key');
            return res.status(401).json({ valid: false, msg: data.msg });
        }

        console.log('[Proxy] Verify: VALID key');
        res.json({ valid: true, msg: 'API key is valid' });
    } catch (error) {
        console.error('[Proxy] Verify Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Обработка 404 - возвращаем index.html для SPA
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 KIE Base URL: ${KIE_BASE_URL}`);
    console.log(`✅ Ready to accept requests!`);
});

module.exports = app;
