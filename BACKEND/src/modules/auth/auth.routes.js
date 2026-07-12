import { Router } from 'express';
import { login } from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/login', validate(loginSchema), login);

export default router;
