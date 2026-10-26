const MAX_BODY_SIZE = 5 * 1024 * 1024;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

function toProviderMessage(message) {
  if (!message.attachments?.length) return { role: message.role, content: message.content || '' };

  const content = [];
  if (message.content) content.push({ type: 'text', text: message.content });
  for (const attachment of message.attachments) {
    if (attachment.data && attachment.type?.startsWith('image/')) {
      content.push({ type: 'image_url', image_url: { url: attachment.data } });
    } else {
      content.push({
        type: 'text',
        text: `[Прикреплён файл: ${attachment.name}, тип: ${attachment.type || 'неизвестен'}]${attachment.data ? `\n${attachment.data.split(',')[1] || ''}` : ''}`,
      });
    }
  }
  return { role: message.role, content };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Метод не поддерживается.' });
  if (!event.body || event.body.length > MAX_BODY_SIZE) return json(413, { error: 'Суммарный размер файлов слишком велик.' });

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return json(400, { error: 'Некорректный JSON.' });
  }

  const browserKey = event.headers['x-anymodel-key'];
  const apiKey = process.env.ANYMODEL_API_KEY || browserKey;
  const configuredApiUrl = process.env.ANYMODEL_API_URL || (browserKey ? event.headers['x-anymodel-url'] : '');
  if (!apiKey) return json(401, { error: 'API-ключ не настроен. Добавьте ANYMODEL_API_KEY в Netlify или в настройках чата.' });
  if (!configuredApiUrl) return json(500, { error: 'API URL не настроен. Добавьте ANYMODEL_API_URL в Netlify или в настройках чата.' });
  let apiUrl;
  try {
    const parsedUrl = new URL(configuredApiUrl);
    if (parsedUrl.protocol !== 'https:') throw new Error();
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/$/, '');
    if (parsedUrl.pathname.endsWith('/v1')) parsedUrl.pathname += '/chat/completions';
    apiUrl = parsedUrl.toString();
  } catch {
    return json(400, { error: 'API URL должен быть корректным адресом HTTPS.' });
  }
  if (!payload.model || !Array.isArray(payload.messages) || payload.messages.length === 0) {
    return json(400, { error: 'Нужно указать модель и сообщения.' });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: payload.model,
        messages: payload.messages.map(toProviderMessage),
        stream: false,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerError = data?.error?.message || data?.message || `ANYMODEL вернул ошибку ${response.status}`;
      return json(response.status, { error: providerError });
    }
    const content = data?.choices?.[0]?.message?.content ?? data?.output_text ?? data?.response;
    return json(200, { content: typeof content === 'string' ? content : JSON.stringify(content || '') });
  } catch (error) {
    return json(502, { error: `Не удалось связаться с ANYMODEL: ${error.message}` });
  }
}
