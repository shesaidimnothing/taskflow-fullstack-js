export async function api(path, { token, body, method = 'GET' } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // fetch échoue seulement si le serveur est injoignable (API coupée, pas de réseau)
    throw new Error('Impossible de joindre le serveur. Vérifiez que l’API est lancée.');
  }
  if (response.status === 204) return null;
  // si l'API est coupée, le proxy Vite renvoie une page d'erreur et pas du JSON
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const error = new Error(data?.error?.message || 'Le serveur est indisponible.');
    error.status = response.status;
    throw error;
  }
  return data;
}
