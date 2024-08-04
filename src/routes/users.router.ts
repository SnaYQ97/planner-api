import { Router } from 'express';

import UsersController from '../controllers/users.controller';

const router = Router();

router.get('/', UsersController.getUsers);
router.get('/:id', UsersController.getUserById);

export default router;
