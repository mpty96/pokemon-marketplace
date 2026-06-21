// Caché en memoria por sesión (clave = querystring). Siempre se revalida,
// así que solo sirve para pintar al instante; los datos se refrescan igual.
const cache = new Map<string, unknown>();

export function getCache<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCache<T>(key: string, value: T): void {
  cache.set(key, value);
}