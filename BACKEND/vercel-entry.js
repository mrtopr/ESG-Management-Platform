import app from './src/app.js';
import prisma from './src/config/db.js';
import './src/shared/cron/index.js'; // Starts crons inside function warm-up if needed

// Pre-warm the database connection
try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Neon Database pre-warm check: CONNECTED.");
} catch (err) {
  console.error("Neon Database pre-warm check failed:", err);
}

export default app;
