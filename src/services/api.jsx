export const SESSION_KEY = 'utr_labs_session';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const APP_TOKEN = import.meta.env.VITE_API_APP_TOKEN || '';

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const apiFetch = async (endpoint, options = {}) => {
  let userToken = null;

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      userToken = parsed.token || null;
    }
  } catch (error) {
    console.error('Error leyendo sesión en localStorage:', error);
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-token': APP_TOKEN,
    ...(options.headers || {}),
  };

  if (userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const rawText = await response.text();
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = { message: rawText };
  }

  if (response.status === 401) {
    localStorage.removeItem(SESSION_KEY);
    if (unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new Error(data?.message || 'Sesión expirada o credenciales inválidas (401).');
  }

  if (response.status === 403) {
    throw new Error(
      data?.message || 'Acceso restringido: no tienes permisos para esta acción (403).'
    );
  }

  if (response.status === 404) {
    throw new Error(data?.message || 'Recurso no encontrado (404).');
  }

  if (response.status >= 500) {
    throw new Error(data?.message || 'Error interno del servidor (500). Intenta de nuevo.');
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
};