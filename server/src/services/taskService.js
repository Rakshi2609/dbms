import mongoose from 'mongoose';
import { ActivityLog } from '../models/ActivityLog.js';
import { Category } from '../models/Category.js';
import { Comment } from '../models/Comment.js';
import { CompletionStat } from '../models/CompletionStat.js';
import { RecurringTask } from '../models/RecurringTask.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { parsePagination, validateTaskPayload } from '../utils/validation.js';

const toObjectId = (value, fieldName = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(400, `${fieldName} must be a valid id`);
  }

  return new mongoose.Types.ObjectId(value);
};

const mapUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email
});

const mapRecurringTask = (recurringTask) =>
  recurringTask
    ? {
        id: recurringTask._id.toString(),
        frequency: recurringTask.frequency,
        intervalValue: recurringTask.intervalValue,
        nextRunAt: recurringTask.nextRunAt,
        endDate: recurringTask.endDate
      }
    : null;

const mapTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  dueDate: task.dueDate,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  category: task.categoryId
    ? {
        id: task.categoryId._id.toString(),
        name: task.categoryId.name
      }
    : null,
  creator: {
    id: task.createdBy._id.toString(),
    fullName: task.createdBy.fullName
  },
  recurringTask: mapRecurringTask(task.recurringTaskId),
  assignees: (task.assignedUserIds || []).map(mapUser)
});

const populateTaskQuery = (query) =>
  query
    .populate('categoryId', 'name')
    .populate('createdBy', 'fullName')
    .populate('recurringTaskId')
    .populate('assignedUserIds', 'fullName email');

const fetchTaskById = async (taskId) => {
  const task = await populateTaskQuery(Task.findById(taskId));

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  return mapTask(task);
};

const insertActivity = async ({ taskId, actorUserId, actionType, oldStatus, newStatus, details }) => {
  await ActivityLog.create({
    taskId,
    actorUserId,
    actionType,
    oldStatus: oldStatus || null,
    newStatus: newStatus || null,
    details: details || {}
  });
};

const upsertRecurringDefinition = async (recurring) => {
  if (!recurring || !recurring.frequency || !recurring.nextRunAt) {
    return null;
  }

  return RecurringTask.create({
    frequency: recurring.frequency,
    intervalValue: recurring.intervalValue || 1,
    nextRunAt: recurring.nextRunAt,
    endDate: recurring.endDate || null
  });
};

const normalizeAssignedUserIds = (assignedUserIds) =>
  [...new Set((assignedUserIds || []).filter(Boolean))].map((userId) => toObjectId(userId, 'assignedUserId'));

const syncCompletionStats = async (userIds) => {
  const uniqueIds = [...new Set((userIds || []).map(String).filter(Boolean))];

  await Promise.all(
    uniqueIds.map(async (userId) => {
      const completedCount = await Task.countDocuments({
        status: 'completed',
        assignedUserIds: toObjectId(userId)
      });

      await CompletionStat.findOneAndUpdate(
        { userId: toObjectId(userId) },
        { completedCount },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );
};

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) {
    return null;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError(400, 'Category not found');
  }

  return category._id;
};

const ensureUsersExist = async (userIds) => {
  if (!userIds.length) {
    return;
  }

  const count = await User.countDocuments({ _id: { $in: userIds } });

  if (count !== userIds.length) {
    throw new AppError(400, 'One or more assigned users were not found');
  }
};

export const createTask = async (payload, actorUser) => {
  validateTaskPayload(payload);

  const assignedUserIds = normalizeAssignedUserIds(payload.assignedUserIds);
  await ensureUsersExist(assignedUserIds);
  const categoryId = await ensureCategoryExists(payload.categoryId);
  const recurringTask = await upsertRecurringDefinition(payload.recurringTask);

  const task = await Task.create({
    title: payload.title.trim(),
    description: payload.description?.trim() || null,
    categoryId,
    createdBy: toObjectId(actorUser.id, 'userId'),
    recurringTaskId: recurringTask?._id || null,
    priority: payload.priority || 3,
    status: payload.status || 'pending',
    dueDate: payload.dueDate || null,
    assignedUserIds
  });

  await insertActivity({
    taskId: task._id,
    actorUserId: toObjectId(actorUser.id, 'userId'),
    actionType: 'task_created',
    newStatus: task.status,
    details: {
      title: task.title,
      assignedUserIds: assignedUserIds.map(String)
    }
  });

  if (task.status === 'completed') {
    await syncCompletionStats(assignedUserIds);
  }

  return fetchTaskById(task._id);
};

export const listTasks = async (query, actorUser) => {
  const { page, limit, offset } = parsePagination(query);
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.priority) {
    filters.priority = Number(query.priority);
  }

  if (query.categoryId) {
    filters.categoryId = toObjectId(query.categoryId, 'categoryId');
  }

  if (query.dueBefore) {
    filters.dueDate = { $lte: new Date(query.dueBefore) };
  }

  if (query.assignedToMe === 'true') {
    filters.assignedUserIds = toObjectId(actorUser.id, 'userId');
  }

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filters),
    populateTaskQuery(
      Task.find(filters)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
    )
  ]);

  return {
    data: tasks.map(mapTask),
    pagination: {
      page,
      limit,
      total
    }
  };
};

export const getTaskDetails = async (taskId) => {
  const objectId = toObjectId(taskId, 'taskId');
  const task = await fetchTaskById(objectId);

  const [comments, logs] = await Promise.all([
    Comment.find({ taskId: objectId }).populate('userId', 'fullName').sort({ createdAt: -1 }),
    ActivityLog.find({ taskId: objectId }).populate('actorUserId', 'fullName').sort({ createdAt: -1 })
  ]);

  return {
    ...task,
    comments: comments.map((comment) => ({
      id: comment._id.toString(),
      body: comment.body,
      createdAt: comment.createdAt,
      user: {
        id: comment.userId._id.toString(),
        fullName: comment.userId.fullName
      }
    })),
    activityLogs: logs.map((log) => ({
      id: log._id.toString(),
      actionType: log.actionType,
      oldStatus: log.oldStatus,
      newStatus: log.newStatus,
      details: log.details,
      createdAt: log.createdAt,
      actor: log.actorUserId
        ? { id: log.actorUserId._id.toString(), fullName: log.actorUserId.fullName }
        : null
    }))
  };
};

export const updateTask = async (taskId, payload, actorUser) => {
  validateTaskPayload({ ...payload, title: payload.title ?? 'kept' });

  const objectId = toObjectId(taskId, 'taskId');
  const task = await Task.findById(objectId);

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  const previousStatus = task.status;
  const previousAssignees = task.assignedUserIds.map(String);

  if (payload.title !== undefined) {
    task.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    task.description = payload.description?.trim() || null;
  }

  if (payload.categoryId !== undefined) {
    task.categoryId = payload.categoryId ? await ensureCategoryExists(payload.categoryId) : null;
  }

  if (payload.priority !== undefined) {
    task.priority = payload.priority;
  }

  if (payload.status !== undefined) {
    task.status = payload.status;
  }

  if (payload.dueDate !== undefined) {
    task.dueDate = payload.dueDate || null;
  }

  if (payload.assignedUserIds !== undefined) {
    const assignedUserIds = normalizeAssignedUserIds(payload.assignedUserIds);
    await ensureUsersExist(assignedUserIds);
    task.assignedUserIds = assignedUserIds;
  }

  if (payload.recurringTask !== undefined) {
    if (payload.recurringTask) {
      if (task.recurringTaskId) {
        await RecurringTask.findByIdAndDelete(task.recurringTaskId);
      }

      const recurring = await upsertRecurringDefinition(payload.recurringTask);
      task.recurringTaskId = recurring?._id || null;
    } else {
      if (task.recurringTaskId) {
        await RecurringTask.findByIdAndDelete(task.recurringTaskId);
      }
      task.recurringTaskId = null;
    }
  }

  await task.save();

  await insertActivity({
    taskId: task._id,
    actorUserId: toObjectId(actorUser.id, 'userId'),
    actionType: 'task_updated',
    oldStatus: previousStatus,
    newStatus: task.status,
    details: payload
  });

  const affectedUsers = [...new Set([...previousAssignees, ...task.assignedUserIds.map(String)])];
  if (previousStatus === 'completed' || task.status === 'completed') {
    await syncCompletionStats(affectedUsers);
  }

  return getTaskDetails(task._id.toString());
};

export const updateTaskStatus = async (taskId, status, actorUser) => {
  if (!['pending', 'in-progress', 'completed'].includes(status)) {
    throw new AppError(400, 'Invalid task status');
  }

  const objectId = toObjectId(taskId, 'taskId');
  const task = await Task.findById(objectId);

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  const oldStatus = task.status;
  task.status = status;
  await task.save();

  await insertActivity({
    taskId: task._id,
    actorUserId: toObjectId(actorUser.id, 'userId'),
    actionType: 'status_changed',
    oldStatus,
    newStatus: status,
    details: {}
  });

  if (oldStatus === 'completed' || status === 'completed') {
    await syncCompletionStats(task.assignedUserIds.map(String));
  }

  return fetchTaskById(objectId);
};

export const deleteTask = async (taskId, actorUser) => {
  const objectId = toObjectId(taskId, 'taskId');
  const task = await Task.findById(objectId);

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  await insertActivity({
    taskId: task._id,
    actorUserId: toObjectId(actorUser.id, 'userId'),
    actionType: 'task_deleted',
    oldStatus: task.status,
    details: { title: task.title }
  });

  await Promise.all([
    Comment.deleteMany({ taskId: task._id }),
    ActivityLog.deleteMany({ taskId: task._id }),
    task.recurringTaskId ? RecurringTask.findByIdAndDelete(task.recurringTaskId) : Promise.resolve(),
    Task.findByIdAndDelete(task._id)
  ]);

  if (task.status === 'completed') {
    await syncCompletionStats(task.assignedUserIds.map(String));
  }

  return { success: true };
};

export const addComment = async (taskId, body, actorUser) => {
  if (!body?.trim()) {
    throw new AppError(400, 'Comment body is required');
  }

  const objectId = toObjectId(taskId, 'taskId');
  const task = await Task.findById(objectId);

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  const comment = await Comment.create({
    taskId: task._id,
    userId: toObjectId(actorUser.id, 'userId'),
    body: body.trim()
  });

  await insertActivity({
    taskId: task._id,
    actorUserId: toObjectId(actorUser.id, 'userId'),
    actionType: 'comment_added',
    details: { commentId: comment._id.toString() }
  });

  return {
    id: comment._id.toString(),
    body: comment.body,
    createdAt: comment.createdAt,
    user: {
      id: actorUser.id,
      fullName: actorUser.fullName
    }
  };
};

export const getWorkloadReport = async () => {
  const data = await Task.aggregate([
    { $unwind: { path: '$assignedUserIds', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$assignedUserIds',
        assignedTasks: { $sum: { $cond: [{ $ifNull: ['$assignedUserIds', false] }, 1, 0] } },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ifNull: ['$assignedUserIds', false] },
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$status', 'completed'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    { $match: { _id: { $ne: null } } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $sort: { overdueTasks: -1, assignedTasks: -1, 'user.fullName': 1 } }
  ]);

  return data.map((item) => ({
    id: item.user._id.toString(),
    fullName: item.user.fullName,
    assignedTasks: item.assignedTasks,
    overdueTasks: item.overdueTasks
  }));
};

export const getCategoryReport = async () => {
  const data = await Category.aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'tasks'
      }
    },
    {
      $project: {
        name: 1,
        total_tasks: { $size: '$tasks' },
        completed_tasks: {
          $size: {
            $filter: {
              input: '$tasks',
              as: 'task',
              cond: { $eq: ['$$task.status', 'completed'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        completion_rate: {
          $cond: [
            { $eq: ['$total_tasks', 0] },
            0,
            {
              $round: [
                {
                  $multiply: [{ $divide: ['$completed_tasks', '$total_tasks'] }, 100]
                },
                2
              ]
            }
          ]
        }
      }
    },
    { $sort: { completion_rate: -1, total_tasks: -1, name: 1 } }
  ]);

  return data.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    total_tasks: item.total_tasks,
    completed_tasks: item.completed_tasks,
    completion_rate: item.completion_rate
  }));
};

export const getOthersCompletedReport = async (currentUserId) => {
  const objectId = toObjectId(currentUserId, 'userId');

  const data = await CompletionStat.find({ userId: { $ne: objectId } })
    .populate('userId', 'fullName email')
    .sort({ completedCount: -1 });

  return data.map((item) => ({
    userId: item.userId._id.toString(),
    fullName: item.userId.fullName,
    email: item.userId.email,
    completedCount: item.completedCount
  }));
};

export const getTaskIdFromParams = (params) => params.taskId;
