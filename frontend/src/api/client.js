import axios from 'axios';

/** Clé de stockage du token Sanctum dans le localStorage. */
export const TOKEN_KEY = 'pt16_token';

/**
 * Instance Axios partagée par toute l'application.
 * L'URL de base est configurable via VITE_API_URL (voir le fichier .env).
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/** Intercepteur de requête : injecte le token « Bearer » s'il est présent. */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Intercepteur de réponse : purge le token expiré / invalide en cas de 401. */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export default client;
