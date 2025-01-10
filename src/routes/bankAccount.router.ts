import { Router } from 'express';
import BankAccountController from '../controllers/bankAccount.controller';
import { validate } from '../middleware/validation.middleware';
import { createBankAccountSchema, updateBankAccountSchema } from '../schemas/bankAccount.schema';

const router = Router();

router.get('/', BankAccountController.getBankAccounts);
router.get('/:id', BankAccountController.getBankAccountById);
router.post('/', validate(createBankAccountSchema), BankAccountController.createBankAccount);
router.put('/:id', validate(updateBankAccountSchema), BankAccountController.updateBankAccount);
router.delete('/:id', BankAccountController.deleteBankAccount);

export default router; 