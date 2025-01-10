import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Transaction, Prisma } from '@prisma/client';
import { ensureAuthenticated } from '../utils/ensureAuthenticated';

type TransactionResponse = 
  | { data: Transaction | Transaction[] }
  | { error: string }
  | { message: string };

const getAllTransactions = async (req: Request, res: Response<TransactionResponse>) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;
    const { month, year } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    try {
      const startDate = month && year 
        ? new Date(Number(year), Number(month), 1)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const endDate = month && year
        ? new Date(Number(year), Number(month) + 1, 0)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const transactions = await prisma.transaction.findMany({
        where: { 
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          category: true,
          bankAccount: true
        },
        orderBy: {
          date: 'desc'
        }
      });
      res.json({ data: transactions });
    } catch (error) {
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas pobierania transakcji' 
      });
    }
  });

const createTransaction = async (req: Request, res: Response<TransactionResponse>) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    try {
      const categoryConnect = req.body.type === 'EXPENSE' && req.body.categoryId
        ? { category: { connect: { id: req.body.categoryId } } }
        : { category: { connect: undefined } };

      const transactionData: Prisma.TransactionCreateInput = {
        amount: new Prisma.Decimal(req.body.amount),
        description: req.body.description,
        date: new Date(req.body.date),
        type: req.body.type,
        ...categoryConnect,
        bankAccount: {
          connect: { id: req.body.accountId }
        },
        user: {
          connect: { id: userId }
        }
      };

      const transaction = await prisma.$transaction(async (prisma) => {
        // Tworzenie transakcji
        const newTransaction = await prisma.transaction.create({
          data: transactionData,
          include: {
            category: true,
            bankAccount: true
          }
        });

        // Aktualizacja salda konta
        if (req.body.type === 'EXPENSE') {
          await prisma.bankAccount.update({
            where: { id: req.body.accountId },
            data: {
              balance: {
                decrement: req.body.amount
              }
            }
          });
        } else {
          await prisma.bankAccount.update({
            where: { id: req.body.accountId },
            data: {
              balance: {
                increment: req.body.amount
              }
            }
          });
        }

        return newTransaction;
      });

      res.status(201).json({ data: transaction });
    } catch (error) {
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas tworzenia transakcji' 
      });
    }
  });

const updateTransaction = async (req: Request<{ id: string }>, res: Response<TransactionResponse>) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    try {
      // Pobierz aktualną transakcję
      const currentTransaction = await prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          userId
        }
      });

      if (!currentTransaction) {
        return res.status(404).json({
          error: 'Transakcja nie została znaleziona'
        });
      }

      const categoryConnect = req.body.type === 'EXPENSE' && req.body.categoryId
        ? { category: { connect: { id: req.body.categoryId } } }
        : { category: { connect: undefined } };

      const transactionData: Prisma.TransactionUpdateInput = {
        amount: new Prisma.Decimal(req.body.amount),
        description: req.body.description,
        date: new Date(req.body.date),
        type: req.body.type,
        ...categoryConnect,
        bankAccount: {
          connect: { id: req.body.accountId }
        }
      };

      const transaction = await prisma.$transaction(async (prisma) => {
        // Aktualizacja salda konta
        if (currentTransaction.accountId !== req.body.accountId || 
            currentTransaction.amount.toString() !== req.body.amount ||
            currentTransaction.type !== req.body.type) {
          // Cofnij poprzednią transakcję
          await prisma.bankAccount.update({
            where: { id: currentTransaction.accountId },
            data: {
              balance: currentTransaction.type === 'EXPENSE' 
                ? { increment: currentTransaction.amount }
                : { decrement: currentTransaction.amount }
            }
          });

          // Dodaj nową transakcję
          await prisma.bankAccount.update({
            where: { id: req.body.accountId },
            data: {
              balance: req.body.type === 'EXPENSE'
                ? { decrement: req.body.amount }
                : { increment: req.body.amount }
            }
          });
        }

        return prisma.transaction.update({
          where: { id: req.params.id },
          data: transactionData,
          include: {
            category: true,
            bankAccount: true
          }
        });
      });

      res.json({ data: transaction });
    } catch (error) {
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas aktualizacji transakcji' 
      });
    }
  });

const deleteTransaction = async (req: Request<{ id: string }>, res: Response<TransactionResponse>) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    try {
      // Pobierz transakcję przed usunięciem
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          userId
        }
      });

      if (!transaction) {
        return res.status(404).json({
          error: 'Transakcja nie została znaleziona'
        });
      }

      await prisma.$transaction([
        // Usuń transakcję
        prisma.transaction.delete({
          where: { id: req.params.id }
        }),
        // Zaktualizuj saldo konta
        prisma.bankAccount.update({
          where: { id: transaction.accountId },
          data: {
            balance: transaction.type === 'EXPENSE'
              ? { increment: transaction.amount }
              : { decrement: transaction.amount }
          }
        })
      ]);

      res.status(200).json({
        message: 'Transakcja została pomyślnie usunięta'
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas usuwania transakcji' 
      });
    }
  });

const getTransactionById = async (req: Request<{ id: string }>, res: Response<TransactionResponse>) =>
  ensureAuthenticated(req, res, async () => {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    try {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          userId
        },
        include: {
          category: true,
          bankAccount: true
        }
      });

      if (!transaction) {
        return res.status(404).json({
          error: 'Transakcja nie została znaleziona'
        });
      }

      res.json({ data: transaction });
    } catch (error) {
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas pobierania transakcji' 
      });
    }
  });

export default {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionById
};
