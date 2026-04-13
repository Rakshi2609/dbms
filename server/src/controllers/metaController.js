import { getAssignableUsers, getCategories } from '../services/metaService.js';

export const listCategories = async (_req, res) => {
  const categories = await getCategories();
  res.json({ categories });
};

export const listUsers = async (_req, res) => {
  const users = await getAssignableUsers();
  res.json({ users });
};
