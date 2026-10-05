export async function api(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Le serveur est indisponible.');
    error.status = response.status;
    throw error;
  }
  return data;
}
