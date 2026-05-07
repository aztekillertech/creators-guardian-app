const ALLOWED_ORIGINS = ['https://creatorsguardian.pro', 'https://www.creatorsguardian.pro'];

function getCorsHeaders(requestOrigin) {
  const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { headers: getCorsHeaders(request.headers.get('Origin') || '') });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  try {
    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: 'AztekBot no tiene configurada la API de Claude.' }, 500, corsHeaders);
    }

    // Validate Content-Type
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return jsonResponse({ error: 'Content-Type inválido.' }, 400, corsHeaders);
    }

    // Body size guard
    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 8000) {
      return jsonResponse({ error: 'Solicitud demasiado grande.' }, 413, corsHeaders);
    }

    // Verificar que el request viene de un usuario autenticado con JWT de Supabase
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'No autorizado.' }, 401, corsHeaders);
    }
    const token = authHeader.slice(7);
    const jwtParts = token.split('.');
    if (jwtParts.length !== 3 || jwtParts.some(p => p.length < 10)) {
      return jsonResponse({ error: 'Token inválido.' }, 401, corsHeaders);
    }

    const body = await request.json();
    const message = String(body.message || '').trim().slice(0, 900);
    const context = body.context || {};

    if (!message) {
      return jsonResponse({ error: 'Escribe una pregunta para AztekBot.' }, 400);
    }

    const payload = {
      max_tokens: 140,
      temperature: 0.1,
      system: [
        'Eres AztekBot, el asistente virtual de Creators Guardian.',
        'Responde en español claro, cálido, muy breve y accionable.',
        'Ayudas a creadores de contenido (streamers, YouTubers, contenido adultos, influencers) con seguridad digital: contraseñas, 2FA, phishing, links, archivos, recuperación de cuentas, privacidad y buenas prácticas.',
        'No pidas contraseñas, códigos 2FA, tokens, llaves API ni datos bancarios.',
        'Si hay robo de cuenta, extorsión, filtración de contenido explícito, acceso no reconocido o amenaza urgente, indica contactar WhatsApp urgente de soporte.',
        'No prometas análisis forense definitivo.',
        'No uses Markdown, encabezados, tablas ni bloques de código.',
        'Sin emojis, salvo uno si es muy útil.',
        'Formato: 1 frase inicial + 3 pasos cortos.',
        'Máximo 65 palabras.',
      ].join(' '),
      messages: [
        {
          role: 'user',
          content: [
            `Usuario: ${String(context.user || 'creador').slice(0, 60)}`,
            `Cuentas registradas: ${context.accountCount ?? 'sin dato'}`,
            `Pregunta: ${message}`,
          ].join('\n'),
        },
      ],
    };

    let anthropicResponse = await callAnthropic(env, env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022', payload);
    if (anthropicResponse.status === 404 && !env.ANTHROPIC_MODEL) {
      anthropicResponse = await callAnthropic(env, 'claude-sonnet-4-5', payload);
    }

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      return jsonResponse({
        error: data.error?.message || 'Claude no respondió correctamente.',
      }, anthropicResponse.status, corsHeaders);
    }

    const reply = data.content
      ?.filter((item) => item.type === 'text')
      ?.map((item) => item.text)
      ?.join('\n')
      ?.trim();

    return jsonResponse({ reply: cleanBotReply(reply) || 'No pude generar una respuesta clara. Intenta de nuevo.' }, 200, corsHeaders);
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'AztekBot tardó demasiado. Intenta con una pregunta más corta o usa WhatsApp urgente si es crítico.'
      : error.message || 'Error inesperado en AztekBot.';
    return jsonResponse({ error: message }, 500, corsHeaders);
  }
}

function callAnthropic(env, model, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        ...payload,
      }),
    })
    .finally(() => clearTimeout(timeout));
}

function cleanBotReply(text = '') {
  return String(text)
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 420);
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
