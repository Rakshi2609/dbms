import {
  addComment,
  createTask,
  deleteTask,
  getCategoryReport,
  getOthersCompletedReport,
  getTaskDetails,
  getTaskIdFromParams,
  getWorkloadReport,
  listTasks,
  updateTask,
  updateTaskStatus
} from '../services/taskService.js';

export const listAllTasks = async (req, res) => {
  const result = await listTasks(req.query, req.user);
  res.json(result);
};

export const createNewTask = async (req, res) => {
  const task = await createTask(req.body, req.user);
  res.status(201).json({ task });
};

export const getTask = async (req, res) => {
  const task = await getTaskDetails(getTaskIdFromParams(req.params));
  res.json({ task });
};

export const updateExistingTask = async (req, res) => {
  const task = await updateTask(getTaskIdFromParams(req.params), req.body, req.user);
  res.json({ task });
};

export const patchTaskStatus = async (req, res) => {
  const task = await updateTaskStatus(getTaskIdFromParams(req.params), req.body.status, req.user);
  res.json({ task });
};

export const removeTask = async (req, res) => {
  const result = await deleteTask(getTaskIdFromParams(req.params), req.user);
  res.json(result);
};

export const createTaskComment = async (req, res) => {
  const comment = await addComment(getTaskIdFromParams(req.params), req.body.body, req.user);
  res.status(201).json({ comment });
};

export const workloadReport = async (_req, res) => {
  const data = await getWorkloadReport();
  res.json({ data });
};

export const categoryReport = async (_req, res) => {
  const data = await getCategoryReport();
  res.json({ data });
};

export const othersCompletedReport = async (req, res) => {
  const data = await getOthersCompletedReport(req.user.id);
  res.json({ data });
};
