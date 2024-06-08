import { Router } from 'express';

import AuthController from '../controllers/auth.controller';

const router = Router();
//
router.post('/', AuthController().login);
// router.get('/:id', UsersController.getUserById);
//
// router.post('/', UsersController.createUser);

export default router;
