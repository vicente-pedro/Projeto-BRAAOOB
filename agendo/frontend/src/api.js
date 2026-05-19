const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(
      'Não foi possível conectar à API. Verifique se o backend está rodando (npm run dev na pasta agendo).'
    );
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.error ||
        (res.status === 503
          ? 'Banco de dados indisponível. Veja as instruções no terminal do backend.'
          : `Erro na requisição (${res.status})`)
    );
  }

  return data;
}

export const api = {
  getCategories: () => request('/categories'),
  getTasksByDate: (date) => request(`/tasks?date=${date}`),
  getTasksByMonth: (year, month) =>
    request(`/tasks?year=${year}&month=${month}`),
  getStats: () => request('/tasks/stats'),
  createTask: (body) =>
    request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) =>
    request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  patchTask: (id, body) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
