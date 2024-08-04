import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express-serve-static-core';
import {ensureAuthenticated} from "../index";

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

interface GetUserByIdResponse {
  data: {  id: string ;  email: string ;  password: string; } | null;
  error?: string | null;
}

const getUserById = (request: Request<{id: string}>, response: Response<any>) => {
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

export default {
  getUsers,
  getUserById,
}
