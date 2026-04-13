import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { requireFields, validateEmail } from '../utils/validation.js';

const mapUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role, fullName: user.fullName },
    env.jwtSecret,
    { expiresIn: '7d' }
  );

export const registerUser = async (payload) => {
  requireFields(payload, ['fullName', 'email', 'password']);
  validateEmail(payload.email);

  if (payload.password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters');
  }

  const hash = await bcrypt.hash(payload.password, env.saltRounds);

  const user = await User.create({
    fullName: payload.fullName.trim(),
    email: payload.email.toLowerCase().trim(),
    passwordHash: hash,
    role: payload.role || 'user'
  });

  return {
    token: createToken(user),
    user: mapUser(user)
  };
};

export const loginUser = async ({ email, password }) => {
  requireFields({ email, password }, ['email', 'password']);

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  return {
    token: createToken(user),
    user: mapUser(user)
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return mapUser(user);
};
