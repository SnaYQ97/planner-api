import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express-serve-static-core';

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

const getUsers= async(_request: Request, response: Response<any>) => {
  const users = await prisma.user.findMany();
  response.send({
    data: users,
  });
};

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

const createUser = async(request: Request<{}, {}, User, UserQueryParams>, response: Response<UserResponse>) => {
    console.log(request.body);
    try {
      const createUser = await prisma.user.create({
        data: {
          email: request.body.email,
          password: request.body.password
        }
      });
      response.status(200).send({
        data: {
          email: createUser.email,
        },
        error: '',
      });
      console.log(createUser);
    }
    catch (error) {
      response.status(500).send({ error: 'An error occurred while creating the user.' });
    }
}

export default {
  getUsers,
  getUserById,
  createUser
}
