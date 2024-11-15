import { Router } from 'express';

import UsersController from '../controllers/user.controller';

const router = Router();

router.get('/', UsersController.getUsers);
router.get('/:id', UsersController.getUserById);
router.post('/create', UsersController.createUser);

export default router;
