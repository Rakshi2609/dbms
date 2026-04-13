import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './db/mongo.js';

connectDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
