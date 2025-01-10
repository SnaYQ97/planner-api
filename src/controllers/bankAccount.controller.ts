import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { ensureAuthenticated } from '../utils/ensureAuthenticated';
import { BankAccountResponse, BankAccountSuccessResponse, BankAccountErrorResponse, CreateBankAccountRequest, BankAccount } from '../types/bankAccount';
import { Decimal } from '@prisma/client/runtime/library';

export const getBankAccounts = async (
  req: Request,
  res: Response<BankAccountResponse>
) => 
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).send({
        message: 'Authentication failed',
        error: 'User not authenticated'
      });
    }

    try {
      const accounts = await prisma.bankAccount.findMany({
        where: {
          userId: userId
        }
      });

      res.status(200).send({
        message: 'Bank accounts retrieved successfully',
        accounts: accounts as unknown as BankAccount[]
      } as BankAccountSuccessResponse);
    } catch (error) {
      res.status(500).send({
        message: 'Error retrieving bank accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

export const getBankAccountById = async (
  req: Request<{ id: string }>,
  res: Response<BankAccountResponse>
) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;
    const accountId = req.params.id;

    if (!userId) {
      return res.status(401).send({
        message: 'Authentication failed',
        error: 'User not authenticated'
      });
    }

    try {
      const account = await prisma.bankAccount.findFirst({
        where: {
          id: accountId,
          userId: userId
        }
      });

      if (!account) {
        return res.status(404).send({
          message: 'Bank account not found',
          error: 'Bank account not found or access denied'
        } as BankAccountErrorResponse);
      }

      res.status(200).send({
        message: 'Bank account retrieved successfully',
        account
      } as BankAccountSuccessResponse);
    } catch (error) {
      res.status(500).send({
        message: 'Error retrieving bank account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

export const deleteBankAccount = async (
  req: Request<{ id: string }>,
  res: Response<BankAccountResponse>
) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;
    const accountId = req.params.id;

    if (!userId) {
      return res.status(401).send({
        message: 'Authentication failed',
        error: 'User not authenticated'
      });
    }

    try {
      // Sprawdź czy konto istnieje i należy do użytkownika
      const account = await prisma.bankAccount.findFirst({
        where: {
          id: accountId,
          userId: userId
        }
      });

      if (!account) {
        return res.status(404).send({
          message: 'Bank account not found',
          error: 'Bank account not found or access denied'
        });
      }

      // Sprawdź czy konto ma powiązane transakcje
      const transactionsCount = await prisma.transaction.count({
        where: {
          accountId: accountId
        }
      });

      if (transactionsCount > 0) {
        return res.status(400).send({
          message: 'Cannot delete bank account',
          error: 'Bank account has associated transactions'
        });
      }

      await prisma.bankAccount.delete({
        where: {
          id: accountId
        }
      });

      res.status(200).send({
        message: 'Bank account deleted successfully'
      });
    } catch (error) {
      res.status(500).send({
        message: 'Error deleting bank account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

export const createBankAccount = async (
  req: Request<{}, {}, CreateBankAccountRequest>,
  res: Response<BankAccountResponse>
) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).send({
        message: 'Authentication failed',
        error: 'User not authenticated'
      });
    }

    try {
      const accountData = {
        accountType: req.body.accountType,
        name: req.body.name,
        balance: new Decimal(req.body.balance),
        accountNumber: req.body.accountNumber.replace(/\s/g, ''),
        interestRate: req.body.interestRate ? new Decimal(req.body.interestRate) : null,
        interestRateLimit: req.body.interestRateLimit ? new Decimal(req.body.interestRateLimit) : null,
        interestStartDate: req.body.interestStartDate ? new Date(req.body.interestStartDate) : null,
        interestEndDate: req.body.interestEndDate ? new Date(req.body.interestEndDate) : null,
        targetAmount: req.body.targetAmount ? new Decimal(req.body.targetAmount) : null,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : null,
        color: req.body.color || "#9333ea",
        user: {
          connect: {
            id: userId
          }
        }
      };

      const account = await prisma.bankAccount.create({
        data: accountData
      });

      res.status(201).send({
        message: 'Bank account created successfully',
        account: account as unknown as BankAccount
      } as BankAccountSuccessResponse);
    } catch (error) {
      res.status(500).send({
        message: 'Error creating bank account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

export const updateBankAccount = async (
  req: Request<{ id: string }, {}, CreateBankAccountRequest>,
  res: Response<BankAccountResponse>
) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;
    const accountId = req.params.id;

    if (!userId) {
      return res.status(401).send({
        message: 'Authentication failed',
        error: 'User not authenticated'
      });
    }

    try {
      // Sprawdź czy konto istnieje i należy do użytkownika
      const existingAccount = await prisma.bankAccount.findFirst({
        where: {
          id: accountId,
          userId: userId
        }
      });

      if (!existingAccount) {
        return res.status(404).send({
          message: 'Bank account not found',
          error: 'Bank account not found or access denied'
        });
      }

      const updatedAccount = await prisma.bankAccount.update({
        where: {
          id: accountId
        },
        data: {
          accountType: req.body.accountType,
          name: req.body.name,
          balance: new Decimal(req.body.balance),
          accountNumber: req.body.accountNumber.replace(/\s/g, ''),
          interestRate: req.body.interestRate ? new Decimal(req.body.interestRate) : null,
          interestRateLimit: req.body.interestRateLimit ? new Decimal(req.body.interestRateLimit) : null,
          interestStartDate: req.body.interestStartDate ? new Date(req.body.interestStartDate) : null,
          interestEndDate: req.body.interestEndDate ? new Date(req.body.interestEndDate) : null,
          targetAmount: req.body.targetAmount ? new Decimal(req.body.targetAmount) : null,
          targetDate: req.body.targetDate ? new Date(req.body.targetDate) : null,
          color: req.body.color || "#9333ea",
        }
      });

      res.status(200).send({
        message: 'Bank account updated successfully',
        account: updatedAccount as unknown as BankAccount
      } as BankAccountSuccessResponse);
    } catch (error) {
      res.status(500).send({
        message: 'Error updating bank account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

export default {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
}; 