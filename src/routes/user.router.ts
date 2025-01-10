import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema } from '../schemas/user.schema';

const router = Router();

router.get('/:id', UserController.getUserById);
router.post('/', validate(createUserSchema), UserController.createUser);
router.delete('/:id', UserController.deleteUser);

export default router;
