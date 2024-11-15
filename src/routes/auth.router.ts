import { Router } from 'express';
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post('/', AuthController.login);
router.get('/status', AuthController.getStatus);
router.get('/logout', AuthController.logout);

export default router;
