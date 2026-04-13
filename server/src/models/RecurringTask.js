import mongoose from 'mongoose';

const recurringTaskSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    intervalValue: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    nextRunAt: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const RecurringTask = mongoose.model('RecurringTask', recurringTaskSchema);
