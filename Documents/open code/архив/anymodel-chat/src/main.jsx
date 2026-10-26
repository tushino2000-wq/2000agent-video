import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  File,
  Image,
  KeyRound,
  Menu,
  MessageSquarePlus,
  Paperclip,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import './styles.css';

const DEFAULT_MODELS = [
  'claude-opus-4-8',
  'claude-opus-5',
  'deepseek-v4-pro',
  'gemimi-2.5-pro',
  'gemini-3.1-flash-lite-preview',
  'glm-5.2',
  'gpt-5.6-sol',
  'grok-4.20-multi-agent',
  'k3',
  'minimax-m3',
  'nemotron-3-ultra-550b-a55b',
];

const STARTER_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: 'Чем я могу помочь сегодня?',
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function uid() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function storeHistory(history) {
  try {
    localStorage.setItem('anychat-history', JSON.stringify(history));
  } catch {
    // The chat remains usable if private browsing blocks local storage.
  }
}

function App() {
  const [models, setModels] = useState(() => readStored('anychat-models', DEFAULT_MODELS));
  const [model, setModel] = useState(() => localStorage.getItem('anychat-model') || 'gpt-5.6-sol');
  const [messages, setMessages] = useState([STARTER_MESSAGE]);
  const [history, setHistory] = useState(() => readStored('anychat-history', []));
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelOpen, setModelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anychat-key') || sessionStorage.getItem('anychat-key') || '');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('anychat-url') || sessionStorage.getItem('anychat-url') || '');
  const fileInput = useRef(null);
  const messageEnd = useRef(null);

  useEffect(() => {
    localStorage.setItem('anychat-models', JSON.stringify(models));
    localStorage.setItem('anychat-model', model);
  }, [models, model]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!currentChatId || !messages.some((item) => item.role === 'user')) return;

    const firstUserMessage = messages.find((item) => item.role === 'user');
    const savedMessages = messages.map((message) => ({
      ...message,
      attachments: message.attachments?.map(({ name, type, size }) => ({ name, type, size })),
    }));
    setHistory((current) => {
      const chat = {
        id: currentChatId,
        title: firstUserMessage?.content.slice(0, 38) || firstUserMessage?.attachments?.[0]?.name || 'Новый диалог',
        messages: savedMessages,
        model,
        updatedAt: Date.now(),
      };
      const updated = [chat, ...current.filter((item) => item.id !== currentChatId)].slice(0, 20);
      storeHistory(updated);
      return updated;
    });
  }, [currentChatId, messages, model]);

  function startNewChat() {
    if (loading) return;
    setCurrentChatId(null);
    setMessages([STARTER_MESSAGE]);
    setAttachments([]);
    setInput('');
    setError('');
    setSidebarOpen(false);
  }

  function openChat(chat) {
    if (loading) return;
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
    setModel(chat.model || model);
    setSidebarOpen(false);
  }

  function deleteChat(event, chatId) {
    event.stopPropagation();
    const updated = history.filter((chat) => chat.id !== chatId);
    setHistory(updated);
    storeHistory(updated);
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([STARTER_MESSAGE]);
    }
  }

  function clearHistory() {
    setHistory([]);
    storeHistory([]);
    setCurrentChatId(null);
    setMessages([STARTER_MESSAGE]);
    setSidebarOpen(false);
  }

  function addModel(event) {
    event.preventDefault();
    const clean = newModel.trim();
    if (!clean) return;
    if (!models.includes(clean)) setModels([...models, clean]);
    setModel(clean);
    setNewModel('');
    setModelOpen(false);
  }

  function selectFiles(event) {
    const files = Array.from(event.target.files || []);
    const totalSize = [...attachments.map((item) => item.size), ...files.map((file) => file.size)]
      .reduce((sum, size) => sum + size, 0);
    if (totalSize > 3 * 1024 * 1024) {
      setError('Суммарный размер вложений не должен превышать 3 МБ.');
      event.target.value = '';
      return;
    }
    const next = files.map((file) => ({
      id: uid(),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setAttachments((current) => [...current, ...next].slice(0, 4));
    event.target.value = '';
  }

  function removeAttachment(id) {
    setAttachments((current) => {
      const item = current.find((file) => file.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return current.filter((file) => file.id !== id);
    });
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading) return;

    setError('');
    setLoading(true);
    const pendingAttachments = attachments;
    const displayAttachments = pendingAttachments.map(({ name, type, size, preview }) => ({ name, type, size, preview }));
    const userMessage = { id: uid(), role: 'user', content: text, attachments: displayAttachments };
    const nextMessages = [...messages, userMessage];
    if (!currentChatId) setCurrentChatId(uid());
    setMessages(nextMessages);
    setInput('');
    setAttachments([]);

    try {
      const encodedFiles = await Promise.all(
        pendingAttachments.map(async ({ file, name, type }) => ({
          name,
          type,
          data: await fileToDataUrl(file),
        })),
      );
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-anymodel-key': apiKey } : {}),
          ...(apiKey && apiUrl ? { 'x-anymodel-url': apiUrl } : {}),
        },
        body: JSON.stringify({
          model,
          messages: nextMessages
            .filter((item) => item.id !== 'welcome')
            .map((item) => ({
              role: item.role,
              content: item.content,
              attachments: item.id === userMessage.id
                ? encodedFiles
                : item.attachments?.map(({ name, type }) => ({ name, type })),
            })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Ошибка API: ${response.status}`);
      setMessages((current) => [...current, { id: uid(), role: 'assistant', content: data.content || 'Пустой ответ модели.' }]);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось получить ответ. Проверьте подключение и API-ключ.');
    } finally {
      setLoading(false);
    }
  }

  function saveKey() {
    if (apiKey) localStorage.setItem('anychat-key', apiKey);
    else localStorage.removeItem('anychat-key');
    if (apiUrl) localStorage.setItem('anychat-url', apiUrl.trim());
    else localStorage.removeItem('anychat-url');
    sessionStorage.removeItem('anychat-key');
    sessionStorage.removeItem('anychat-url');
    setSettingsOpen(false);
  }

  return (
    <div className="app-shell">
      <div className={`mobile-shade ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <span>ANYCHAT</span>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню"><X /></button>
        </div>
        <button className="new-chat" onClick={startNewChat} disabled={loading}>
          <MessageSquarePlus size={18} />
          Новый диалог
          <span className="shortcut">Ctrl K</span>
        </button>
        <div className="history-head">
          <div className="history-label">Недавние</div>
          {history.length > 0 && <button className="clear-history" onClick={clearHistory} title="Очистить историю"><Trash2 size={14} /> Очистить</button>}
        </div>
        <div className="history-list">
          {history.length === 0 && <p className="empty-history">История диалогов появится здесь</p>}
          {history.map((chat) => (
            <div key={chat.id} className={`history-row ${chat.id === currentChatId ? 'active' : ''}`} onClick={() => openChat(chat)}>
              <button className="history-item">{chat.title}</button>
              <button className="delete-chat" onClick={(event) => deleteChat(event, chat.id)} title="Удалить диалог" aria-label={`Удалить диалог ${chat.title}`}><X size={14} /></button>
            </div>
          ))}
        </div>
        <div className="sidebar-foot">
          <div className="connection"><span className="status-dot" /> ANYMODEL API</div>
          <button className="settings-button" onClick={() => setSettingsOpen(true)}><Settings size={18} /> Настройки</button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Открыть меню"><Menu /></button>
          <div className="model-wrap">
            <span className="top-label">Модель</span>
            <button className="model-button" onClick={() => setModelOpen(!modelOpen)}>
              <Bot size={17} />
              <span>{model}</span>
              <ChevronDown size={16} />
            </button>
            {modelOpen && (
              <div className="model-menu">
                <div className="model-menu-title">Выберите модель</div>
                <div className="model-list">
                  {models.map((item) => (
                    <button key={item} className={item === model ? 'selected' : ''} onClick={() => { setModel(item); setModelOpen(false); }}>
                      <span>{item}</span>{item === model && <Check size={16} />}
                    </button>
                  ))}
                </div>
                <form className="add-model" onSubmit={addModel}>
                  <input value={newModel} onChange={(event) => setNewModel(event.target.value)} placeholder="ID новой модели" aria-label="ID новой модели" />
                  <button type="submit" aria-label="Добавить модель"><Plus size={18} /></button>
                </form>
              </div>
            )}
          </div>
          <button className="key-button" onClick={() => setSettingsOpen(true)}><KeyRound size={16} /><span>API ключ</span></button>
        </header>

        <section className="chat-area">
          <div className="messages">
            {messages.map((message) => (
              <article className={`message ${message.role}`} key={message.id}>
                <div className="avatar">{message.role === 'assistant' ? <Sparkles size={17} /> : 'ВЫ'}</div>
                <div className="message-body">
                  <div className="message-meta">{message.role === 'assistant' ? model : 'Вы'}</div>
                  {message.content && <p>{message.content}</p>}
                  {message.attachments?.length > 0 && (
                    <div className="message-files">
                      {message.attachments.map((item, index) => (
                        <div className="message-file" key={`${item.name}-${index}`}>
                          {item.preview ? <img src={item.preview} alt={item.name} /> : <File size={18} />}
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {loading && <div className="thinking"><span /><span /><span /> Модель думает</div>}
            <div ref={messageEnd} />
          </div>

          <div className="composer-zone">
            {error && <div className="error-banner">{error}<button onClick={() => setError('')}><X size={15} /></button></div>}
            {attachments.length > 0 && (
              <div className="attachment-strip">
                {attachments.map((item) => (
                  <div className="attachment" key={item.id}>
                    {item.preview ? <img src={item.preview} alt="" /> : <File size={20} />}
                    <div><strong>{item.name}</strong><small>{Math.ceil(item.size / 1024)} КБ</small></div>
                    <button onClick={() => removeAttachment(item.id)} aria-label={`Удалить ${item.name}`}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <form className="composer" onSubmit={sendMessage}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Напишите сообщение..."
                rows="1"
              />
              <div className="composer-actions">
                <div className="attach-wrap">
                  <button type="button" className="attach-button" onClick={() => fileInput.current?.click()} aria-label="Добавить фото или файл"><Plus size={21} /></button>
                  <span className="attach-hint"><Paperclip size={13} /> фото или файл</span>
                </div>
                <input ref={fileInput} hidden type="file" multiple accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx" onChange={selectFiles} />
                <button className="send-button" type="submit" disabled={loading || (!input.trim() && attachments.length === 0)} aria-label="Отправить"><ArrowUp size={20} /></button>
              </div>
            </form>
            <p className="disclaimer">Ответы ИИ могут содержать ошибки. Проверяйте важную информацию.</p>
          </div>
        </section>
      </main>

      {settingsOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSettingsOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="modal-head"><div><span className="eyebrow">Подключение</span><h2 id="settings-title">Подключение ANYMODEL</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)}><X /></button></div>
            <p>Введите ключ и точный OpenAI-совместимый URL, выданные вашим провайдером. Для постоянного общего подключения задайте их в переменных Netlify.</p>
            <label htmlFor="api-key">API-ключ на этом устройстве</label>
            <input id="api-key" className="key-input" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="sk-..." autoComplete="off" />
            <label htmlFor="api-url">ANYMODEL API URL</label>
            <input id="api-url" className="key-input" type="url" value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="https://anymodel.org/v1" autoComplete="url" />
            <div className="security-note"><KeyRound size={17} /> Ключ и URL сохраняются в этом браузере до нажатия «Удалить». Не используйте эту функцию на чужом устройстве. Разрешены только адреса HTTPS.</div>
            <div className="modal-actions"><button className="ghost-button" onClick={() => { setApiKey(''); setApiUrl(''); localStorage.removeItem('anychat-key'); localStorage.removeItem('anychat-url'); sessionStorage.removeItem('anychat-key'); sessionStorage.removeItem('anychat-url'); }}>Удалить</button><button className="primary-button" onClick={saveKey}>Сохранить</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
