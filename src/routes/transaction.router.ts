import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller';
import { validate } from '../middleware/validation.middleware';
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transaction.schema';

const router = Router();

router.get('/', TransactionController.getAllTransactions);
router.get('/:id', TransactionController.getTransactionById);
router.post('/', validate(createTransactionSchema), TransactionController.createTransaction);
router.put('/:id', validate(updateTransactionSchema), TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;
// Use in App
