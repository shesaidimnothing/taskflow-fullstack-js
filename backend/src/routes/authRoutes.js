// Declare registration, login, and password routes.
import { Router } from 'express';
import * as controller from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
export const authRouter = Router();
authRouter.post('/register', controller.register);
authRouter.post('/login', controller.login);
authRouter.patch('/password', requireAuth, controller.changePassword);
