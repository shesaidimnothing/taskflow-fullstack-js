// Déclare les routes protégées de création, lecture, modification et suppression des tâches.
import { Router } from 'express';
import * as controller from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
export const taskRouter = Router();
taskRouter.use(requireAuth);
taskRouter.route('/').get(controller.list).post(controller.create);
taskRouter.route('/:id').get(controller.get).patch(controller.update).delete(controller.remove);
