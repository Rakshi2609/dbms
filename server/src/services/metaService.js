import { Category } from '../models/Category.js';
import { User } from '../models/User.js';

export const getCategories = async () => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    description: category.description
  }));
};

export const getAssignableUsers = async () => {
  const users = await User.find().sort({ fullName: 1, email: 1 }).lean();

  return users.map((user) => ({
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role
  }));
};
