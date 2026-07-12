import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import departmentRoutes from './modules/settings/department.routes.js';
import employeeRoutes from './modules/settings/employee.routes.js';
import environmentalRoutes from './modules/environmental/environmental.routes.js';
import socialRoutes from './modules/social/social.routes.js';
import governanceRoutes from './modules/governance/governance.routes.js';
import gamificationRoutes from './modules/gamification/gamification.routes.js';
import scoringRoutes from './modules/scoring/scoring.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, env.FRONTEND_URL);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(pinoHttp());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/reports', reportsRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
