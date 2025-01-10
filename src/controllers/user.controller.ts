import { Request, Response, NextFunction } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { ensureAuthenticated } from '../utils/ensureAuthenticated';
import { hash } from 'argon2';
import { login } from './auth.controller';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { InferType } from 'yup';
import { Prisma } from '@prisma/client';

type CreateUserRequest = InferType<typeof createUserSchema>['body'];
type UpdateUserRequest = InferType<typeof updateUserSchema>['body'];

interface UserData {
  id: string;
  email: string;
}

type UserResponse = 
  | { data: UserData }
  | { error: string }
  | { message: string };

const getUserById = async (request: Request<{ id: string }>, response: Response<UserResponse>) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: request.params.id
      },
      select: {
        id: true,
        email: true,
      }
    });

    if (!user) {
      return response.status(404).send({
        error: 'User not found'
      });
    }

    response.send({
      data: user
    });
  } catch (error) {
    response.status(500).send({
      error: 'An error occurred while getting the user.'
    });
  }
};

const createUser = async (
  req: Request<{}, {}, CreateUserRequest>,
  res: Response<UserResponse>,
  next: NextFunction
) => {
  try {
    // Sprawdź, czy użytkownik o takim emailu już istnieje (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: {
        email: req.body.email.toLowerCase(),
      }
    });

    if (existingUser) {
      return res.status(400).send({
        error: 'User with this email already exists'
      });
    }

    const hashedPassword = await hash(req.body.password, {
      type: 2,           // argon2id
      memoryCost: 19456, // 19 MiB
      timeCost: 2,       // 2 iteracje
      parallelism: 1
    });
    
    const user = await prisma.$transaction(async (prisma) => {
      // Tworzenie użytkownika
      const newUser = await prisma.user.create({
        data: {
          email: req.body.email.toLowerCase(),
          password: hashedPassword,
          firstName: '',
          lastName: '',
        },
        select: {
          id: true,
          email: true
        }
      });

      // Tworzenie konta głównego
      await prisma.bankAccount.create({
        data: {
          accountType: 'DAILY',
          name: 'Konto główne',
          balance: new Prisma.Decimal(0),
          accountNumber: '0000000000000000',
          user: {
            connect: {
              id: newUser.id
            }
          }
        }
      });

      return newUser;
    });

    if (req.body.loginAfterCreate) {
      return login(req, res);
    }

    return res.status(201).send({
      data: user
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req: Request<{ id: string }>, res: Response<UserResponse>) =>
  ensureAuthenticated(req, res, async () => {
    const authenticatedUserId = req.session.passport?.user?.id;
    const targetUserId = req.params.id;

    if (!authenticatedUserId) {
      return res.status(401).send({
        error: 'User not authenticated'
      });
    }

    // Sprawdzamy czy użytkownik próbuje usunąć swoje własne konto
    if (authenticatedUserId !== targetUserId) {
      return res.status(403).send({
        error: 'You can only delete your own account'
      });
    }

    try {
      // Najpierw usuwamy wszystkie powiązane konta bankowe i transakcje
      await prisma.$transaction([
        prisma.transaction.deleteMany({
          where: { userId: targetUserId }
        }),
        prisma.category.deleteMany({
          where: { userId: targetUserId }
        }),
        prisma.bankAccount.deleteMany({
          where: { userId: targetUserId }
        }),
        prisma.user.delete({
          where: { id: targetUserId }
        })
      ]);

      // Wylogowujemy użytkownika
      req.logout((err) => {
        if (err) {
          console.error('Error during logout:', err);
        }
      });

      res.status(200).send({
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({
          error: error.message
        });
      } else {
        res.status(500).send({
          error: 'An unknown error occurred'
        });
      }
    }
  });

export default {
  getUserById,
  createUser,
  deleteUser
};
