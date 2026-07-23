import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import partnerRoutes from './routes/partners';
import connectorRoutes from './routes/connectors';
import transactionRoutes from './routes/transactions';
import reconciliationRoutes from './routes/reconciliation';
import balanceRoutes from './routes/balance';
import dashboardRoutes from './routes/dashboard';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/connectors', connectorRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Graceful shutdown - Only run server listen if not in serverless environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      console.log('HTTP server closed');
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

export default app;
