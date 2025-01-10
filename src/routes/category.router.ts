import { Router } from 'express';
import CategoryController from '../controllers/category.controller';
import { validate } from '../middleware/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';
import { ensureAuthenticated } from '../utils/ensureAuthenticated';
import { Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => ensureAuthenticated(req, res, () => CategoryController.getAllCategories(req, res)));
router.get('/:id', (req: Request<{ id: string }>, res: Response) => ensureAuthenticated(req, res, () => CategoryController.getCategoryById(req, res)));
router.post('/', validate(createCategorySchema), (req: Request, res: Response) => ensureAuthenticated(req, res, () => CategoryController.createCategory(req, res)));
router.put('/:id', validate(updateCategorySchema), (req: Request<{ id: string }>, res: Response) => ensureAuthenticated(req, res, () => CategoryController.updateCategory(req, res)));
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => ensureAuthenticated(req, res, () => CategoryController.deleteCategory(req, res)));

export default router; 