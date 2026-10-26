// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    PASSWORD: 'tushino2000',
    API_KEY_STORAGE: 'videogen_api_key',
    API_BASE_URL: 'https://api.kie.ai/v1',
    POLLING_INTERVAL: 10000,
    SOUND_ENABLED_STORAGE: 'videogen_sound_enabled'
};

// ==================== КАТАЛОГ МОДЕЛЕЙ KIE ====================
// РЕАЛЬНЫЕ рабочие модели из https://kie.ai/market (проверено 2026-10-14)
const MODELS = [
    {
        id: 'grok-imagine-video-1-5-preview',
        name: '💰 Grok 1.5 [REF]',
        mode: 't2v',
        referenceSupport: 'supported',
        referenceField: 'image_urls',
        durations: ['5', '8', '10', '15'],
        resolutions: ['480p', '720p', '1080p'],
        aspects: ['auto', '1:1', '16:9', '9:16', '3:2', '2:3'],
        pricePerSecond: { '480p': 0.012, '720p': 0.0225, '1080p': 0.04 },
        hint: '🖼️ РЕФЕРЕНС: поддерживается. Можно загрузить до 7 изображений. Нативное аудио включено.'
    },
    {
        id: 'bytedance/seedance-2-5',
        name: 'Seedance 2.5 [REF]',
        mode: 'multimodal',
        referenceSupport: 'supported',
        referenceField: 'reference_image_urls',
        durations: ['4', '5', '10', '15', '20', '30'],
        resolutions: ['480p', '720p', '1080p'],
        aspects: ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9'],
        pricePerSecond: { '480p': 0.14, '720p': 0.315, '1080p': 0.79 },
        hint: '🖼️ РЕФЕРЕНС: поддерживаются изображения, видео и аудио. Для изображения добавляется reference_image_urls.'
    },
    {
        id: 'bytedance/seedance-2',
        name: 'Seedance 2.0 [REF]',
        mode: 'multimodal',
        referenceSupport: 'supported',
        referenceField: 'reference_image_urls',
        durations: ['2', '5', '10', '15', '20', '30'],
        resolutions: ['480p', '720p', '1080p'],
        aspects: ['16:9', '4:3', '1:1', '3:4', '9:16'],
        pricePerSecond: { '480p': 0.059, '720p': 0.124 },
        hint: '🖼️ РЕФЕРЕНС: поддерживаются изображения, видео и аудио. Для изображения добавляется reference_image_urls.'
    },
    {
        id: 'bytedance/seedance-2-fast',
        name: 'Seedance 2.0 Fast [REF]',
        mode: 'multimodal',
        referenceSupport: 'supported',
        referenceField: 'reference_image_urls',
        durations: ['5', '10'],
        resolutions: ['480p', '720p'],
        aspects: ['16:9', '9:16', '1:1'],
        pricePerSecond: { '480p': 0.059, '720p': 0.124 },
        hint: '🖼️ РЕФЕРЕНС: поддерживаются изображения, видео и аудио. Быстрый режим.'
    },
    {
        id: 'bytedance/seedance-2-mini',
        name: 'Seedance 2.0 Mini [REF?]',
        mode: 't2v',
        durations: ['5', '10'],
        resolutions: ['480p', '720p'],
        aspects: ['16:9', '9:16', '1:1'],
        referenceSupport: 'unknown',
        hint: 'РЕФЕРЕНС: проверьте поддержку на странице модели KIE. В текущем приложении не отправляется.'
    },
    {
        id: 'kling-3.0/video',
        name: 'Kling 3.0 [REF]',
        mode: 'multimodal',
        referenceSupport: 'supported',
        referenceField: 'image_urls',
        durations: ['3', '5', '10', '15'],
        resolutions: ['720p', '1080p'],
        aspects: ['16:9', '9:16', '1:1'],
        pricePerSecond: { '720p': 0.07, '1080p': 0.09 },
        hint: '🖼️ РЕФЕРЕНС: поддерживается как первый кадр через image_urls. Соотношение сторон с картинкой подстраивается автоматически.'
    },
    {
        id: 'kling/kling-3-0-turbo',
        name: 'Kling 3.0 Turbo [REF?]',
        mode: 't2v',
        durations: ['5', '10'],
        resolutions: ['480p', '720p'],
        aspects: ['16:9', '9:16', '1:1'],
        referenceSupport: 'unknown',
        hint: 'РЕФЕРЕНС: проверьте поддержку на странице модели KIE. В текущем приложении не отправляется.'
    },
    {
        id: 'minimax-h3/text-to-video',
        name: 'MiniMax H3 [NO REF]',
        mode: 't2v',
        durations: ['2', '5', '10', '15', '20', '30'],
        resolutions: ['480p', '720p', '1080p'],
        aspects: ['16:9', '9:16', '1:1', '4:3', '3:4'],
        referenceSupport: 'unsupported',
        hint: 'РЕФЕРЕНС: этот endpoint работает без изображения. Для фото выберите MiniMax H3 [REF].'
    },
    {
        id: 'minimax-h3/image-to-video',
        name: 'MiniMax H3 [REF]',
        mode: 'i2v',
        referenceSupport: 'supported',
        referenceField: 'first_frame_url',
        requiresReference: true,
        durations: ['4', '5', '6', '8', '10', '15'],
        resolutions: ['768P', '2K'],
        aspects: [],
        hint: '🖼️ РЕФЕРЕНС: обязателен первый кадр. Формат KIE: 768P или 2K.'
    },
    {
        id: 'wan/3-0-video',
        name: 'Wan 3.0 [REF]',
        mode: 'multimodal',
        referenceSupport: 'supported',
        referenceField: 'reference_image_urls',
        durations: ['5', '10', '15'],
        resolutions: ['480P', '720P', '1080P'],
        aspects: ['adaptive', '16:9', '9:16', '1:1'],
        pricePerSecond: { '480P': 0.04, '720P': 0.08, '1080P': 0.16 },
        hint: '🖼️ РЕФЕРЕНС: поддерживаются изображения, видео, аудио и другие материалы.'
    },
    {
        id: 'pixverse/v6-max-image-to-video',
        name: 'PixVerse V6 Max [REF]',
        mode: 'i2v',
        referenceSupport: 'supported',
        referenceField: 'image_url',
        requiresReference: true,
        durations: ['5', '8', '10'],
        resolutions: ['360p', '540p', '720p', '1080p'],
        aspects: [],
        pricePerSecond: { '360p': 0.024, '540p': 0.044, '720p': 0.06, '1080p': 0.112 },
        hint: '🖼️ РЕФЕРЕНС: обязателен. PixVerse V6 Max поддерживает image-to-video.'
    },
    {
        id: 'happyhorse/happyhorse-1-1',
        name: 'HappyHorse 1.1 [REF?]',
        mode: 't2v',
        durations: ['5', '10'],
        resolutions: ['480p', '720p'],
        aspects: ['16:9', '9:16', '1:1'],
        referenceSupport: 'unknown',
        hint: 'РЕФЕРЕНС: текущий ID требует проверки на странице модели KIE. В текущем приложении не отправляется.'
    }
];

function getModelById(id) {
    return MODELS.find(m => m.id === id) || MODELS[0];
}

// ==================== УТИЛИТЫ ====================

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

class Toast {
    constructor() {
        this.container = document.getElementById('toastContainer') || this.createContainer();
    }
    createContainer() {
        const div = document.createElement('div');
        div.id = 'toastContainer';
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    }
    show(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const iconMap = { success: '✓', error: '✕', info: 'ℹ' };
        toast.innerHTML = `
            <div class="toast-icon">${iconMap[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${escapeHtml(title)}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
        `;
        this.container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}
const toast = new Toast();

class AudioNotifier {
    constructor() {
        this.audioContext = null;
        this.enabled = localStorage.getItem(CONFIG.SOUND_ENABLED_STORAGE) !== 'false';
    }
    playBeep(frequency = 800, duration = 200) {
        if (!this.enabled) return;
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this.audioContext;
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration / 1000);
        } catch (e) {
            console.error('Audio error:', e);
        }
    }
    playSuccess() {
        this.playBeep(800, 100);
        setTimeout(() => this.playBeep(1000, 100), 150);
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem(CONFIG.SOUND_ENABLED_STORAGE, enabled);
    }
}
const audio = new AudioNotifier();

class AppState {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('videogen_tasks')) || [];
        this.currentTask = JSON.parse(localStorage.getItem('videogen_current_task')) || null;
        this.pollingIntervals = new Map();
    }
    addTask(task) {
        const taskWithId = { ...task, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'queued' };
        this.tasks.unshift(taskWithId);
        this.save();
        return taskWithId;
    }
    setCurrentTask(task) {
        this.currentTask = task;
        this.save();
    }
    updateTaskStatus(taskId, status) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            if (task.id === this.currentTask?.id) {
                this.currentTask.status = status;
            }
            this.save();
        }
    }
    completeTask(taskId, result) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            task.result = result;
            if (task.id === this.currentTask?.id) {
                this.currentTask = null;
            }
            this.save();
        }
    }
    save() {
        localStorage.setItem('videogen_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('videogen_current_task', JSON.stringify(this.currentTask));
    }
}
const state = new AppState();

class VideoGenAPI {
    constructor() {
        this.apiKey = localStorage.getItem(CONFIG.API_KEY_STORAGE);
    }
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem(CONFIG.API_KEY_STORAGE, key);
    }
    getApiKey() {
        return this.apiKey;
    }

    // Новый метод для прокси запросов
    async proxyRequest(method, endpoint, data = null) {
        const headers = { 'Content-Type': 'application/json' };
        const options = { method, headers };
        
        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`/api/proxy${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.msg || `Proxy Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Proxy Request Error:', error);
            throw error;
        }
    }

    // Старый метод для обратной совместимости
    async request(method, endpoint, data = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        const options = { method, headers };
        if (data) {
            options.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async generateVideo(params) {
        try {
            const modelDef = getModelById(params.model);

            // KIE API принимает { model, input: {...} }
            // input содержит параметры конкретной модели
            const input = {
                prompt: params.prompt,
                duration: String(params.duration),
                resolution: params.resolution
            };

            const hasReference = Boolean(params.referenceImage);
            const singleImageReference = hasReference && modelDef.referenceField === 'image_urls';
            if (params.aspectRatio && modelDef.referenceField !== 'first_frame_url' && !singleImageReference) {
                input.aspect_ratio = params.aspectRatio;
            }

            if (hasReference && modelDef.referenceField) {
                if (modelDef.referenceField === 'image_urls' || modelDef.referenceField === 'reference_image_urls') {
                    input[modelDef.referenceField] = [params.referenceImage];
                    if (modelDef.referenceField === 'image_urls' && !input.prompt.includes('@image1')) {
                        input.prompt += ' @image1';
                    }
                } else {
                    input[modelDef.referenceField] = params.referenceImage;
                }
            }

            if (modelDef.id === 'kling-3.0/video') {
                input.sound = false;
                input.mode = params.resolution === '1080p' ? 'pro' : 'std';
                input.multi_shots = false;
            } else if (modelDef.id === 'wan/3-0-video') {
                input.audio = true;
                input.nsfw_checker = true;
            } else if (modelDef.id === 'minimax-h3/image-to-video') {
                input.duration = Number(params.duration);
            } else if (modelDef.id === 'grok-imagine-video-1-5-preview') {
                input.nsfw_checker = true;
            } else if (modelDef.referenceField === 'reference_image_urls') {
                input.nsfw_checker = true;
            }

            const payload = {
                model: params.model,
                input,
                apiKey: this.apiKey
            };

            // Используем прокси вместо прямого вызова API
            return await this.proxyRequest('POST', '/generate', payload);
        } catch (error) {
            toast.show('Ошибка', 'Не удалось отправить запрос: ' + error.message, 'error');
            throw error;
        }
    }

    async uploadReference(dataUrl, fileName) {
        const result = await this.proxyRequest('POST', '/upload', {
            base64Data: dataUrl,
            fileName,
            apiKey: this.apiKey
        });
        const downloadUrl = result.data?.downloadUrl;
        if (!downloadUrl) throw new Error('KIE не вернул URL загруженного файла');
        if (!/^https?:\/\//i.test(downloadUrl)) {
            throw new Error('KIE вернул некорректный URL изображения');
        }
        return downloadUrl;
    }

    async checkStatus(taskId) {
        try {
            const headers = { 'X-API-Key': this.apiKey };
            const response = await fetch(`/api/proxy/status/${taskId}`, {
                method: 'GET',
                headers
            });
            if (!response.ok) {
                throw new Error(`Status Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    async verifyApiKey() {
        try {
            const headers = { 'X-API-Key': this.apiKey };
            const response = await fetch('/api/proxy/verify', {
                method: 'GET',
                headers
            });
            if (!response.ok) {
                throw new Error(`Verify Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}
const api = new VideoGenAPI();

// ==================== UI МЕНЕДЖЕР ====================

class UIManager {
    constructor() {
        this.authModal = document.getElementById('authModal');
        this.app = document.getElementById('app');
        this.passwordInput = document.getElementById('passwordInput');
        this.loginBtn = document.getElementById('loginBtn');
        this.menuItems = document.querySelectorAll('.menu-item[data-section]');
        this.contentSections = document.querySelectorAll('.content-section');
        this.sectionTitle = document.getElementById('sectionTitle');
        this.timerInterval = null;
    }

    async init() {
        this.setupAuth();
        this.setupMenu();
        this.setupTheme();
        this.setupCollapsible();
        this.setupResizer();
        this.setupMobileMenu();
        this.setupFormHandlers();
        this.setupAPISettings();
        this.setupVideoViewer();
        this.startTimerUpdate();
    }

    setupVideoViewer() {
        const viewer = document.getElementById('videoViewer');
        const viewerVideo = document.getElementById('viewerVideo');
        const closeButton = document.getElementById('closeVideoViewer');
        if (!viewer || !viewerVideo || !closeButton) return;

        const close = () => {
            viewer.classList.add('hidden');
            viewerVideo.pause();
            viewerVideo.removeAttribute('src');
            viewerVideo.load();
        };

        closeButton.addEventListener('click', close);
        viewer.addEventListener('click', (event) => {
            if (event.target === viewer) close();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !viewer.classList.contains('hidden')) close();
        });
        viewer.dataset.ready = 'true';
    }

    setupAuth() {
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    handleLogin() {
        const password = this.passwordInput.value;
        const errorDiv = document.getElementById('authError');
        if (password === CONFIG.PASSWORD) {
            errorDiv.textContent = '';
            localStorage.setItem('videogen_auth', 'true');
            this.authModal.classList.add('hidden');
            this.app.classList.remove('hidden');
            toast.show('Успешно', 'Добро пожаловать!', 'success');
        } else {
            errorDiv.textContent = 'Неверный пароль';
        }
    }

    setupMenu() {
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => this.switchSection(item));
        });
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('videogen_auth');
            location.reload();
        });
    }

    switchSection(menuItem) {
        this.menuItems.forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');
        const section = menuItem.getAttribute('data-section');
        const titleMap = {
            'create': 'Создать видео',
            'history': 'История',
            'settings': 'Настройки API'
        };
        this.sectionTitle.textContent = titleMap[section] || 'Создать видео';
        this.contentSections.forEach(s => s.classList.remove('active'));
        document.getElementById(`${section}Section`)?.classList.add('active');
        const leftColumn = document.getElementById('leftColumn');
        const burger = document.getElementById('burgerMenu');
        if (leftColumn.classList.contains('mobile-open')) {
            leftColumn.classList.remove('mobile-open');
            burger.classList.remove('active');
        }
    }

    setupTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('videogen_theme');
        const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        const themeToggle = document.getElementById('themeToggle');
        const mobileThemeToggle = document.getElementById('mobileThemeToggle');
        if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());
        if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('videogen_theme', isDark ? 'dark' : 'light');
    }

    setupCollapsible() {
        document.querySelectorAll('.collapse-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const column = btn.getAttribute('data-column');
                const columnEl = column === 'left'
                    ? document.getElementById('leftColumn')
                    : document.getElementById('rightColumn');
                columnEl.classList.toggle('collapsed');
            });
        });
    }

    setupResizer() {
        const resizer = document.getElementById('resizer');
        const rightColumn = document.getElementById('rightColumn');
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = rightColumn.offsetWidth;
            resizer.classList.add('resizing');
            document.body.style.cursor = 'ew-resize';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const diff = startX - e.clientX;
            const newWidth = startWidth + diff;
            if (newWidth > 280 && newWidth < 500) {
                rightColumn.style.width = newWidth + 'px';
            }
        });
        document.addEventListener('mouseup', () => {
            isResizing = false;
            resizer.classList.remove('resizing');
            document.body.style.cursor = 'auto';
        });
    }

    setupMobileMenu() {
        const burger = document.getElementById('burgerMenu');
        const leftColumn = document.getElementById('leftColumn');
        burger.addEventListener('click', () => {
            leftColumn.classList.toggle('mobile-open');
            burger.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!leftColumn.contains(e.target) && !burger.contains(e.target)) {
                leftColumn.classList.remove('mobile-open');
                burger.classList.remove('active');
            }
        });
    }

    setupFormHandlers() {
        const promptInput = document.getElementById('promptInput');
        const charCount = document.getElementById('charCount');
        promptInput.addEventListener('input', () => {
            charCount.textContent = promptInput.value.length;
        });

        const uploadBtn = document.getElementById('uploadReferenceBtn');
        const referenceInput = document.getElementById('referenceInput');
        const removeBtn = document.getElementById('removeReferenceBtn');
        const preview = document.getElementById('referencePreview');
        const previewImage = document.getElementById('previewImage');

        uploadBtn.addEventListener('click', () => referenceInput.click());
        referenceInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
                toast.show('Ошибка', 'Размер файла превышает 10MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const image = new Image();
                image.onload = () => {
                    // KIE-модели надёжнее принимают обычный JPEG с расширением .jpg.
                    const canvas = document.createElement('canvas');
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    canvas.getContext('2d').drawImage(image, 0, 0);
                    const jpegData = canvas.toDataURL('image/jpeg', 0.92);

                    previewImage.src = jpegData;
                    preview.classList.remove('hidden');
                    uploadBtn.dataset.imageData = jpegData;
                    uploadBtn.dataset.fileName = `reference-${Date.now()}.jpg`;
                };
                image.onerror = () => {
                    toast.show('Ошибка', 'Не удалось прочитать изображение', 'error');
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });

        removeBtn.addEventListener('click', () => {
            preview.classList.add('hidden');
            referenceInput.value = '';
            delete uploadBtn.dataset.imageData;
            delete uploadBtn.dataset.fileName;
        });

        // Заполняем список моделей и параметры
        this.populateModels();

        document.getElementById('generateBtn').addEventListener('click', () => this.handleGenerateVideo());
        document.getElementById('modelSelect').addEventListener('change', () => this.onModelChange());
        document.getElementById('durationSelect').addEventListener('change', () => this.updateCostEstimate());
        document.getElementById('resolutionSelect').addEventListener('change', () => this.updateCostEstimate());
    }

    // Заполняет выпадающий список моделей
    populateModels() {
        const modelSelect = document.getElementById('modelSelect');
        modelSelect.innerHTML = MODELS.map(m =>
            `<option value="${m.id}">${escapeHtml(m.name)}</option>`
        ).join('');
        this.renderModelsReference();
        this.onModelChange();
    }

    renderModelsReference() {
        const grid = document.getElementById('modelsReferenceGrid');
        if (!grid) return;

        grid.innerHTML = MODELS.map(model => {
            const referenceText = model.referenceSupport === 'supported'
                ? 'Референс: поддерживается'
                : model.referenceSupport === 'unknown'
                    ? 'Референс: не подтверждён'
                    : 'Референс: не поддерживается';
            const durationText = `${model.durations[0]}-${model.durations[model.durations.length - 1]} сек`;
            const resolutionText = model.resolutions.join(', ');
            const priceText = model.pricePerSecond
                ? `от $${Math.min(...Object.values(model.pricePerSecond)).toFixed(4)}/сек`
                : 'Цена уточняется';

            return `
                <article class="model-card">
                    <h4>${escapeHtml(model.name)}</h4>
                    <p><strong>Режим:</strong> ${escapeHtml(model.mode.toUpperCase())}</p>
                    <p><strong>${escapeHtml(referenceText)}</strong></p>
                    <p><strong>Длительность:</strong> ${escapeHtml(durationText)}</p>
                    <p><strong>Разрешение:</strong> ${escapeHtml(resolutionText)}</p>
                    <p><strong>Стоимость:</strong> ${escapeHtml(priceText)}</p>
                </article>
            `;
        }).join('');
    }

    // Срабатывает при смене модели: обновляет доступные параметры
    onModelChange() {
        const modelDef = getModelById(document.getElementById('modelSelect').value);

        // Подсказка про модель
        document.getElementById('modelHint').textContent = modelDef.hint || '';

        // Продолжительность
        const durationSelect = document.getElementById('durationSelect');
        durationSelect.innerHTML = modelDef.durations.map(d =>
            `<option value="${d}">${d} сек</option>`
        ).join('');

        // Разрешение
        const resolutionSelect = document.getElementById('resolutionSelect');
        resolutionSelect.innerHTML = modelDef.resolutions.map(r =>
            `<option value="${r}">${r}</option>`
        ).join('');

        // Соотношение сторон (только для text-to-video)
        const aspectGroup = document.getElementById('aspectGroup');
        const aspectSelect = document.getElementById('aspectSelect');
        if (modelDef.aspects && modelDef.aspects.length > 0) {
            aspectGroup.style.display = '';
            aspectSelect.innerHTML = modelDef.aspects.map(a =>
                `<option value="${a}">${a}</option>`
            ).join('');
        } else {
            // Для image-to-video соотношение берётся из картинки
            aspectGroup.style.display = 'none';
            aspectSelect.innerHTML = '';
        }

        const capability = document.getElementById('modelCapability');
        const referenceLabel = document.getElementById('referenceLabel');
        const capabilityText = {
            supported: '🖼️ Референс поддерживается',
            unknown: '⚠️ Поддержка референса не подтверждена',
            unsupported: '✕ Референс не поддерживается'
        }[modelDef.referenceSupport || 'unsupported'];
        capability.textContent = capabilityText;
        capability.classList.toggle('unknown', modelDef.referenceSupport === 'unknown');

        // Показываем, будет ли загруженное изображение использовано моделью
        const refGroup = document.getElementById('uploadReferenceBtn')?.closest('.form-group');
        if (refGroup) {
            if (modelDef.requiresReference) {
                referenceLabel.textContent = 'Референсное изображение (обязательно)';
                refGroup.classList.remove('reference-disabled');
            } else if (modelDef.referenceSupport === 'supported') {
                referenceLabel.textContent = 'Референсное изображение (будет использовано)';
                refGroup.classList.remove('reference-disabled');
            } else if (modelDef.referenceSupport === 'unknown') {
                referenceLabel.textContent = 'Референсное изображение (не проверено для этой модели)';
                refGroup.classList.add('reference-disabled');
            } else {
                referenceLabel.textContent = 'Референсное изображение (не поддерживается)';
                refGroup.classList.add('reference-disabled');
            }
        }

        this.updateCostEstimate();
    }

    updateCostEstimate() {
        const duration = document.getElementById('durationSelect').value;
        const resolution = document.getElementById('resolutionSelect').value;
        const model = getModelById(document.getElementById('modelSelect').value);
        const costValue = document.getElementById('costValue');
        const costDetails = document.getElementById('costDetails');
        if (!duration || !resolution) {
            costValue.textContent = 'Расчёт временно недоступен';
            costDetails.textContent = '';
            return;
        }
        const perSec = model.pricePerSecond?.[resolution];
        if (!perSec) {
            costValue.textContent = 'Цена для этого условия не подтверждена';
            costDetails.textContent = `${model.name} · ${duration} сек · ${resolution}`;
            return;
        }
        const estimatedCost = (perSec * parseInt(duration)).toFixed(3);
        costValue.textContent = `≈ $${estimatedCost}`;
        costDetails.textContent = `$${perSec.toFixed(4)}/сек × ${duration} сек · ${model.name} · ${resolution}`;
    }

    async handleGenerateVideo() {
        const prompt = document.getElementById('promptInput').value.trim();
        const model = document.getElementById('modelSelect').value;
        const modelDef = getModelById(model);
        const duration = document.getElementById('durationSelect').value;
        const aspectRatio = document.getElementById('aspectSelect').value;
        const resolution = document.getElementById('resolutionSelect').value;
        const uploadBtn = document.getElementById('uploadReferenceBtn');
        const referenceImage = uploadBtn.dataset.imageData;

        if (!prompt) {
            toast.show('Ошибка', 'Введите описание сцены', 'error');
            return;
        }
        if (!api.getApiKey()) {
            toast.show('Ошибка', 'Установите API ключ в настройках', 'error');
            return;
        }
        if (modelDef.requiresReference && !referenceImage) {
            toast.show('Ошибка', 'Эта модель требует референсное изображение', 'error');
            return;
        }
        if (referenceImage && modelDef.referenceSupport !== 'supported') {
            toast.show('Ошибка', 'Эта модель не подтверждена для работы с референсом. Выберите модель с меткой [REF].', 'error');
            return;
        }

        try {
            const btn = document.getElementById('generateBtn');
            btn.disabled = true;
            btn.textContent = '⏳ Отправка...';

            let referenceUrl = referenceImage;
            if (referenceImage && modelDef.referenceSupport === 'supported') {
                btn.textContent = '⏳ Загрузка референса...';
                referenceUrl = await api.uploadReference(referenceImage, uploadBtn.dataset.fileName);
            }

            // В API отправляем ЧИСТЫЙ промпт (без HTML-экранирования)
            const result = await api.generateVideo({
                model,
                prompt: prompt,
                duration: parseInt(duration),
                aspectRatio,
                resolution,
                referenceImage: referenceUrl
            });

            // В историю сохраняем название модели (для показа) и чистый промпт
            const task = state.addTask({
                model: modelDef.name,
                modelId: model,
                prompt: prompt,
                duration: parseInt(duration),
                aspectRatio,
                resolution,
                hasReference: !!referenceImage
            });

            // KIE возвращает структуру { code, data: { taskId, ...} }
            const taskId = result.data?.taskId || result.taskId;
            if (!taskId) {
                throw new Error('No taskId in response');
            }

            state.setCurrentTask({
                ...task,
                apiTaskId: taskId,
                startTime: Date.now()
            });

            this.updateCurrentTask();
            this.startPolling(taskId, task.id);

            document.getElementById('promptInput').value = '';
            document.getElementById('charCount').textContent = '0';
            document.getElementById('referenceInput').value = '';
            document.getElementById('referencePreview').classList.add('hidden');
            delete uploadBtn.dataset.imageData;
            delete uploadBtn.dataset.fileName;

            toast.show('Успешно', 'Видео отправлено в обработку', 'success');
            audio.playBeep(600, 150);
        } catch (error) {
            toast.show('Ошибка', `${modelDef.name}: ${error.message}`, 'error');
        } finally {
            const btn = document.getElementById('generateBtn');
            btn.disabled = false;
            btn.textContent = '🎥 Создать видео';
        }
    }

    startPolling(apiTaskId, localTaskId) {
        if (state.pollingIntervals.has(apiTaskId)) {
            clearInterval(state.pollingIntervals.get(apiTaskId));
        }
        this.checkTaskStatus(apiTaskId, localTaskId);
        const interval = setInterval(() => {
            this.checkTaskStatus(apiTaskId, localTaskId);
        }, CONFIG.POLLING_INTERVAL);
        state.pollingIntervals.set(apiTaskId, interval);
    }

    async checkTaskStatus(apiTaskId, localTaskId) {
        try {
            const statusResponse = await api.checkStatus(apiTaskId);
            
            // KIE возвращает { code, data: { state, ... } }
            if (statusResponse.code !== 200) {
                console.error('Status check failed:', statusResponse.msg);
                return;
            }

            const currentState = statusResponse.data?.state;
            
            // Маппируем состояния KIE на наши
            const stateMap = {
                'waiting': 'queued',
                'queuing': 'queued',
                'generating': 'processing',
                'success': 'completed',
                'fail': 'failed'
            };

            const mappedStatus = stateMap[currentState] || currentState;
            state.updateTaskStatus(localTaskId, mappedStatus);
            this.updateCurrentTask();

            if (currentState === 'success') {
                state.completeTask(localTaskId, statusResponse.data);
                clearInterval(state.pollingIntervals.get(apiTaskId));
                state.pollingIntervals.delete(apiTaskId);
                toast.show('Готово!', 'Видео доступно в Галерее', 'success');
                audio.playSuccess();
                this.updateCurrentTask();
                this.updateGallery();
            } else if (currentState === 'fail') {
                state.updateTaskStatus(localTaskId, 'failed');
                clearInterval(state.pollingIntervals.get(apiTaskId));
                state.pollingIntervals.delete(apiTaskId);
                const failMsg = statusResponse.data?.failMsg || 'Неизвестная ошибка';
                toast.show('Ошибка', `Генерация не удалась: ${failMsg}`, 'error');
                this.updateCurrentTask();
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }

    updateCurrentTask() {
        const currentTaskEl = document.getElementById('currentTask');
        const currentTask = state.currentTask;

        this.updateMiniHistory();

        if (!currentTask) {
            currentTaskEl.classList.add('hidden');
            return;
        }

        currentTaskEl.classList.remove('hidden');
        document.getElementById('taskModel').textContent = currentTask.model;

        const statusMap = {
            'queued': 'В очереди',
            'processing': 'Обработка',
            'completed': 'Готово',
            'failed': 'Ошибка'
        };
        document.getElementById('taskStatus').textContent = statusMap[currentTask.status] || currentTask.status;
    }

    startTimerUpdate() {
        this.timerInterval = setInterval(() => {
            if (state.currentTask) {
                this.updateCurrentTask();
            }
        }, 1000);
    }

    updateMiniHistory() {
        const miniHistory = document.getElementById('historySidebar');
        if (!miniHistory) return;
        // Показываем только завершённые задачи в истории
        const completedTasks = state.tasks.filter(t => t.status === 'completed').slice(0, 5);

        if (completedTasks.length === 0) {
            miniHistory.innerHTML = '<p class="empty-state">История пока пуста</p>';
            return;
        }

        miniHistory.innerHTML = completedTasks.map((task) => {
            const taskTime = task.completedAt 
                ? new Date(task.completedAt).toLocaleTimeString('ru-RU')
                : new Date(task.createdAt).toLocaleTimeString('ru-RU');
            
            const statusIcon = task.status === 'completed' ? '✅' : '❌';
            
            return `
                <div class="history-item">
                    <div class="date">${statusIcon} ${taskTime}</div>
                    <strong>${escapeHtml(task.model)}</strong>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                        ${escapeHtml(task.prompt.substring(0, 60))}${task.prompt.length > 60 ? '...' : ''}
                    </p>
                </div>
            `;
        }).join('');
    }

    // Извлекает URL результата из данных задачи KIE
    extractResultUrls(result) {
        if (!result) return [];
        try {
            // resultJson — это строка JSON вида {resultUrls: [...]}
            if (result.resultJson) {
                const parsed = typeof result.resultJson === 'string'
                    ? JSON.parse(result.resultJson)
                    : result.resultJson;
                return parsed.resultUrls || [];
            }
            if (result.response && result.response.resultUrls) {
                return result.response.resultUrls;
            }
        } catch (e) {
            console.error('Error parsing result:', e);
        }
        return [];
    }

    updateGallery() {
        const gallery = document.getElementById('gallery');
        const completedTasks = state.tasks.filter(t => t.status === 'completed' && t.result);

        if (completedTasks.length === 0) {
            gallery.innerHTML = '<p class="empty-state">Созданных видео пока нет</p>';
            return;
        }

        gallery.innerHTML = completedTasks.map(task => {
            const urls = this.extractResultUrls(task.result);
            if (urls.length === 0) return '';
            const videoUrl = urls[0];
            return `
                <div class="gallery-item" title="${escapeHtml(task.prompt.substring(0, 100))}">
                    <video src="${escapeHtml(videoUrl)}" controls preload="metadata" playsinline></video>
                </div>
            `;
        }).join('');

        gallery.querySelectorAll('video').forEach(video => {
            video.addEventListener('dblclick', () => this.openVideoViewer(video.currentSrc || video.src));
        });
    }

    openVideoViewer(videoUrl) {
        const viewer = document.getElementById('videoViewer');
        const viewerVideo = document.getElementById('viewerVideo');
        if (!viewer || !viewerVideo) return;
        viewerVideo.src = videoUrl;
        viewer.classList.remove('hidden');
        viewerVideo.focus();
    }

    setupAPISettings() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const toggleBtn = document.getElementById('toggleApiKeyBtn');
        const saveBtn = document.getElementById('saveApiKeyBtn');
        const soundToggle = document.getElementById('soundToggle');

        const savedKey = api.getApiKey();
        if (savedKey) {
            apiKeyInput.value = savedKey;
        }

        toggleBtn.addEventListener('click', () => {
            const type = apiKeyInput.type === 'password' ? 'text' : 'password';
            apiKeyInput.type = type;
            toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });

        saveBtn.addEventListener('click', async () => {
            const key = apiKeyInput.value.trim();
            if (!key) {
                toast.show('Ошибка', 'Введите API ключ', 'error');
                return;
            }

            try {
                saveBtn.disabled = true;
                saveBtn.textContent = '⏳ Проверка...';
                api.setApiKey(key);
                const result = await api.verifyApiKey();
                document.getElementById('apiKeyStatus').textContent = '✓ API ключ сохранен';
                document.getElementById('apiKeyStatus').className = 'status-message success';
                toast.show('Успешно', 'API ключ проверен', 'success');
            } catch (error) {
                document.getElementById('apiKeyStatus').textContent = '✕ Ошибка при проверке';
                document.getElementById('apiKeyStatus').className = 'status-message error';
                toast.show('Ошибка', 'Неверный API ключ', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Проверить и сохранить';
            }
        });

        soundToggle.checked = audio.enabled;
        soundToggle.addEventListener('change', (e) => {
            audio.setEnabled(e.target.checked);
            toast.show('', e.target.checked ? 'Звук включен' : 'Звук отключен', 'info');
        });
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthorized = localStorage.getItem('videogen_auth') === 'true';
    
    if (!isAuthorized) {
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    } else {
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }

    const ui = new UIManager();
    await ui.init();
    ui.updateCurrentTask();
    ui.updateMiniHistory();
    ui.updateCostEstimate();
    ui.updateGallery();
});

window.addEventListener('error', (e) => {
    console.error('Global error:', e);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection:', e);
});
