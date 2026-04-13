import bcrypt from 'bcryptjs';
import { ActivityLog } from '../models/ActivityLog.js';
import { Category } from '../models/Category.js';
import { Comment } from '../models/Comment.js';
import { CompletionStat } from '../models/CompletionStat.js';
import { RecurringTask } from '../models/RecurringTask.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { connectDatabase, disconnectDatabase } from './mongo.js';

const upsertCategory = (name, description) =>
  Category.findOneAndUpdate(
    { name },
    { $setOnInsert: { name, description } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const upsertUser = async ({ fullName, email, role, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);

  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        fullName,
        email,
        role,
        passwordHash
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const upsertRecurringTask = ({ frequency, intervalValue, nextRunAt, endDate }) =>
  RecurringTask.findOneAndUpdate(
    { frequency, intervalValue, nextRunAt: new Date(nextRunAt) },
    {
      $set: {
        frequency,
        intervalValue,
        nextRunAt: new Date(nextRunAt),
        endDate: endDate ? new Date(endDate) : null
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const upsertTask = ({ title, update }) =>
  Task.findOneAndUpdate(
    { title },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const upsertComment = ({ taskId, userId, body }) =>
  Comment.findOneAndUpdate(
    { taskId, userId, body },
    { $set: { taskId, userId, body } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const upsertActivity = ({ taskId, actorUserId, actionType, oldStatus = null, newStatus = null, details = {} }) =>
  ActivityLog.findOneAndUpdate(
    { taskId, actorUserId, actionType, oldStatus, newStatus },
    { $set: { taskId, actorUserId, actionType, oldStatus, newStatus, details } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const run = async () => {
  await connectDatabase();

  const [productCategory, engineeringCategory, operationsCategory] = await Promise.all([
    upsertCategory('Product', 'Product backlog and delivery work'),
    upsertCategory('Engineering', 'Development and technical maintenance'),
    upsertCategory('Operations', 'Operational and support tasks')
  ]);

  const [adminUser, monkUser, riyaUser, kabirUser] = await Promise.all([
    upsertUser({
      fullName: 'Admin Lead',
      email: 'admin@taskflow.dev',
      role: 'admin',
      password: 'password123'
    }),
    upsertUser({
      fullName: 'Monk User',
      email: 'monk@taskflow.dev',
      role: 'user',
      password: 'password123'
    }),
    upsertUser({
      fullName: 'Riya Patel',
      email: 'riya@taskflow.dev',
      role: 'user',
      password: 'password123'
    }),
    upsertUser({
      fullName: 'Kabir Singh',
      email: 'kabir@taskflow.dev',
      role: 'user',
      password: 'password123'
    })
  ]);

  const recurringWeekly = await upsertRecurringTask({
    frequency: 'weekly',
    intervalValue: 1,
    nextRunAt: '2026-04-15T09:00:00.000Z',
    endDate: '2026-08-15T09:00:00.000Z'
  });

  const taskDefinitions = [
    {
      title: 'Launch landing page refresh',
      update: {
        description: 'Finalize copy, visuals, and deployment checklist for the new landing page.',
        categoryId: productCategory._id,
        createdBy: adminUser._id,
        priority: 5,
        status: 'completed',
        dueDate: new Date('2026-04-07T18:00:00.000Z'),
        assignedUserIds: [monkUser._id, riyaUser._id]
      }
    },
    {
      title: 'Prepare API monitoring dashboard',
      update: {
        description: 'Set up service alerts, response-time charts, and incident widgets.',
        categoryId: engineeringCategory._id,
        createdBy: adminUser._id,
        priority: 4,
        status: 'in-progress',
        dueDate: new Date('2026-04-14T12:00:00.000Z'),
        assignedUserIds: [kabirUser._id, monkUser._id]
      }
    },
    {
      title: 'Run backup verification drill',
      update: {
        description: 'Verify restore steps and document recovery timings for the ops handbook.',
        categoryId: operationsCategory._id,
        createdBy: monkUser._id,
        priority: 3,
        status: 'pending',
        dueDate: new Date('2026-04-18T10:30:00.000Z'),
        assignedUserIds: [kabirUser._id]
      }
    },
    {
      title: 'Weekly sprint review',
      update: {
        description: 'Collect sprint outcomes and recurring action items for the weekly review.',
        categoryId: productCategory._id,
        createdBy: riyaUser._id,
        recurringTaskId: recurringWeekly._id,
        priority: 2,
        status: 'completed',
        dueDate: new Date('2026-04-08T16:00:00.000Z'),
        assignedUserIds: [riyaUser._id, kabirUser._id]
      }
    },
    {
      title: 'Database indexing audit',
      update: {
        description: 'Review high-traffic queries and confirm indexes are still aligned with access patterns.',
        categoryId: engineeringCategory._id,
        createdBy: monkUser._id,
        priority: 5,
        status: 'completed',
        dueDate: new Date('2026-04-06T14:00:00.000Z'),
        assignedUserIds: [monkUser._id]
      }
    }
  ];

  const tasks = [];
  for (const definition of taskDefinitions) {
    tasks.push(await upsertTask(definition));
  }

  const taskByTitle = Object.fromEntries(tasks.map((task) => [task.title, task]));

  const commentDefinitions = [
    {
      taskId: taskByTitle['Launch landing page refresh']._id,
      userId: monkUser._id,
      body: 'Final review done. Hero section and CTA copy are ready.'
    },
    {
      taskId: taskByTitle['Prepare API monitoring dashboard']._id,
      userId: kabirUser._id,
      body: 'Grafana panels are in place. I still need to wire one latency alert.'
    },
    {
      taskId: taskByTitle['Database indexing audit']._id,
      userId: monkUser._id,
      body: 'Added notes for compound indexes and archived two unused query paths.'
    }
  ];

  for (const commentDefinition of commentDefinitions) {
    await upsertComment(commentDefinition);
  }

  const activityDefinitions = [
    {
      taskId: taskByTitle['Launch landing page refresh']._id,
      actorUserId: adminUser._id,
      actionType: 'task_created',
      newStatus: 'completed',
      details: { seeded: true }
    },
    {
      taskId: taskByTitle['Launch landing page refresh']._id,
      actorUserId: monkUser._id,
      actionType: 'status_changed',
      oldStatus: 'in-progress',
      newStatus: 'completed',
      details: { seeded: true }
    },
    {
      taskId: taskByTitle['Prepare API monitoring dashboard']._id,
      actorUserId: kabirUser._id,
      actionType: 'task_updated',
      oldStatus: 'pending',
      newStatus: 'in-progress',
      details: { seeded: true }
    },
    {
      taskId: taskByTitle['Weekly sprint review']._id,
      actorUserId: riyaUser._id,
      actionType: 'task_created',
      newStatus: 'completed',
      details: { seeded: true }
    },
    {
      taskId: taskByTitle['Database indexing audit']._id,
      actorUserId: monkUser._id,
      actionType: 'task_created',
      newStatus: 'completed',
      details: { seeded: true }
    }
  ];

  for (const activityDefinition of activityDefinitions) {
    await upsertActivity(activityDefinition);
  }

  const completionUsers = [adminUser, monkUser, riyaUser, kabirUser];
  for (const user of completionUsers) {
    const completedCount = await Task.countDocuments({
      status: 'completed',
      assignedUserIds: user._id
    });

    await CompletionStat.findOneAndUpdate(
      { userId: user._id },
      { $set: { completedCount } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('MongoDB seed data initialized with users, tasks, comments, activity logs, and completion stats');
  await disconnectDatabase();
};

run().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});
