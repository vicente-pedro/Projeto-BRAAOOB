const API_URL = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('agendo_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export const api = {
  // auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login:    (payload) => request('/auth/login',    { method: 'POST', body: JSON.stringify(payload) }),
  me:       ()        => request('/auth/me'),

  // tasks
  listTasks:  (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },
  getStats:        ()              => request('/tasks/stats'),
  getTask:         (id)            => request(`/tasks/${id}`),
  createTask:      (payload)       => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTask:      (id, payload)   => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  toggleComplete:  (id)            => request(`/tasks/${id}/complete`, { method: 'PATCH' }),
  toggleCompleteDay: (id, date)    => request(`/tasks/${id}/complete-day`, { method: 'PATCH', body: JSON.stringify({ date }) }),
  deleteTask:      (id)            => request(`/tasks/${id}`, { method: 'DELETE' }),

  // categories
  listCategories:  ()        => request('/categories'),
  createCategory:  (label)   => request('/categories', { method: 'POST', body: JSON.stringify({ label }) }),
};

export { getToken };
