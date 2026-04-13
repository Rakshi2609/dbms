import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      default: null
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recurringTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTask',
      default: null
    },
    priority: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 5
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'in-progress', 'completed'],
      index: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    assignedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
      }
    ]
  },
  {
    timestamps: true
  }
);

taskSchema.index({ status: 1, dueDate: 1 });

export const Task = mongoose.model('Task', taskSchema);
