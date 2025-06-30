import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkDbConnection } from './config/db.js';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/', taskRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await checkDbConnection(); // ✅ Check DB on startup
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('💥 Could not connect to DB. Shutting down...');
    process.exit(1);
  }
});
