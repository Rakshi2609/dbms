import { http } from './http';

export const getTasks = async (params) => {
  const { data } = await http.get('/tasks', { params });
  return data;
};

export const getTask = async (taskId) => {
  const { data } = await http.get(`/tasks/${taskId}`);
  return data.task;
};

export const createTask = async (payload) => {
  const { data } = await http.post('/tasks', payload);
  return data.task;
};

export const updateTask = async (taskId, payload) => {
  const { data } = await http.put(`/tasks/${taskId}`, payload);
  return data.task;
};

export const updateTaskStatus = async (taskId, status) => {
  const { data } = await http.patch(`/tasks/${taskId}/status`, { status });
  return data.task;
};

export const deleteTask = async (taskId) => {
  const { data } = await http.delete(`/tasks/${taskId}`);
  return data;
};

export const addTaskComment = async (taskId, body) => {
  const { data } = await http.post(`/tasks/${taskId}/comments`, { body });
  return data.comment;
};

export const getCategories = async () => {
  const { data } = await http.get('/meta/categories');
  return data.categories;
};

export const getUsers = async () => {
  const { data } = await http.get('/meta/users');
  return data.users;
};

export const getWorkloadReport = async () => {
  const { data } = await http.get('/tasks/reports/workload');
  return data.data;
};

export const getCategoryReport = async () => {
  const { data } = await http.get('/tasks/reports/categories');
  return data.data;
};
