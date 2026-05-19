const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
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
