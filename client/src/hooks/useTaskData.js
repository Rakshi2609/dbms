import { useEffect, useState } from 'react';
import {
  addTaskComment,
  createTask,
  deleteTask,
  getCategories,
  getCategoryReport,
  getTask,
  getTasks,
  getUsers,
  getWorkloadReport,
  updateTask,
  updateTaskStatus
} from '../api/taskApi';

export function useTaskData(filters) {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState({ workload: [], categories: [] });
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    const [tasksResponse, categoriesData, usersData, workloadData, categoryData] =
      await Promise.all([
        getTasks(filters),
        getCategories(),
        getUsers(),
        getWorkloadReport(),
        getCategoryReport()
      ]);

    setTasks(tasksResponse.data);
    setCategories(categoriesData);
    setUsers(usersData);
    setReports({ workload: workloadData, categories: categoryData });
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard().catch(() => setLoading(false));
  }, [filters.priority, filters.categoryId, filters.dueBefore, filters.assignedToMe]);

  const refreshTask = async (taskId) => {
    const task = await getTask(taskId);
    setSelectedTask(task);
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
  };

  const saveTask = async (taskForm) => {
    const task = taskForm.id ? await updateTask(taskForm.id, taskForm) : await createTask(taskForm);
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id);
      return exists ? current.map((item) => (item.id === task.id ? task : item)) : [task, ...current];
    });
    return task;
  };

  const moveTask = async (taskId, status) => {
    const task = await updateTaskStatus(taskId, status);
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
    if (selectedTask?.id === task.id) {
      await refreshTask(task.id);
    }
  };

  const removeTask = async (taskId) => {
    await deleteTask(taskId);
    setTasks((current) => current.filter((item) => item.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const openTask = async (taskId) => {
    const task = await getTask(taskId);
    setSelectedTask(task);
  };

  const createComment = async (taskId, body) => {
    const comment = await addTaskComment(taskId, body);
    await refreshTask(taskId);
    return comment;
  };

  return {
    tasks,
    categories,
    users,
    reports,
    selectedTask,
    loading,
    loadDashboard,
    saveTask,
    moveTask,
    removeTask,
    openTask,
    setSelectedTask,
    createComment
  };
}
