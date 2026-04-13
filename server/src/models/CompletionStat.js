import mongoose from 'mongoose';

const completionStatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    completedCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export const CompletionStat = mongoose.model('CompletionStat', completionStatSchema);
