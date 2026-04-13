import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);

export const User = mongoose.model('User', userSchema);
