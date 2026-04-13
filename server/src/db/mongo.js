import mongoose from 'mongoose';
import { env } from '../config/env.js';

export const connectDatabase = async () => {
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName
  });
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
