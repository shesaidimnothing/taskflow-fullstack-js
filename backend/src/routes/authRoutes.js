import { Router } from 'express';
import * as controller from '../controllers/authController.js';
export const authRouter = Router();
authRouter.post('/register', controller.register);
authRouter.post('/login', controller.login);
