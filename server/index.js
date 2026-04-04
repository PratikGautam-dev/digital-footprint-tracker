import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import scanRoutes from './routes/scanRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', scanRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
