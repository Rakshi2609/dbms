import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actionType: {
      type: String,
      required: true,
      trim: true
    },
    oldStatus: {
      type: String,
      default: null
    },
    newStatus: {
      type: String,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
