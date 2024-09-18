import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express-serve-static-core';
import {NextFunction} from "express";
import {pbkdf2, randomBytes} from "node:crypto";
import {ensureAuthenticated} from "../utils/ensureAuthenticated";
import {createUserValidation} from "../validators/user.validation";
import {login} from "./auth.controller";

interface User {
  id?: number;
  email: string;
  password: string;
}

interface UserQueryParams {
  loginAfterCreate?: boolean;
}

interface UserResponse {
  data?: Omit<User, 'password'>;
  error?: string;
}

const prisma = new PrismaClient();


const getUsers = async (req: Request, res: Response) =>
  ensureAuthenticated(req, res, async () => {
  const users = await prisma.user.findMany();
  res.send({
    data: users,
  });
});

const getUserById = (request: Request<{id: string}>, response: Response) => {
  try {
    const user = prisma.user.findUnique({
      where: {
        id: request.params.id
      }
    });
    response.send({
      data: user,
      error: ''
    });
  } catch (error) {
    response.status(500).send({
      data: null,
      error: 'An error occurred while getting the user.'
    });
  }
}

const createUser = async (req: Request<{
  email: string;
  password: string;
  passwordConfirmation: string;
}>, res: Response, next: NextFunction) => {
  const salt = randomBytes(32);

  if (req.body.password !== req.body.passwordConfirmation) {
    return res.status(400).send('Passwords do not match');
  }
  console.log(req.body, 'something');

  pbkdf2(req.body.password, salt, 31000, 32, 'sha256', async (err,  hashedPassword) => {
    if (err) return next(err);
    await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
        salt: salt,
      }
    }).then((user) => {
      if (req.body.loginAfterCreate) {
        login(req, res);
      } else {
        res.status(201).send({
          data: {
            email: user.email,
            id: user.id,
          }
        });
      }
    }).catch((err) => next(err));
  });
}

export default {
  getUsers,
  getUserById,
  createUser,
}
