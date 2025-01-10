import { Router } from 'express';
import { login, logout, getStatus } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/', validate(loginSchema), login);
router.get('/status', getStatus);
router.get('/logout', logout);

export default router;
