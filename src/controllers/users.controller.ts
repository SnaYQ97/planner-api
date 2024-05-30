import { Request, Response } from 'express-serve-static-core';
import UsersRouter from "../routes/users.router";
import {json, urlencoded} from "express";

interface User {
  id?: number;
  email: string;
  password: string;
}

interface UserQueryParams {
  loginAfterCreate?: boolean;
}

interface UserResponse {
  id: number;
  email: string;
}

const getUsers= (_request: Request, response: Response<UserResponse[]>) => {
  response.send([
    {
      id: 1,
      email: "test user",
    },
  ]);
};

const getUserById = (request: Request, response: Response) => {
  response.send({});
}

const createUser = (request: Request<{}, {}, User, UserQueryParams>, response: Response<UserResponse>) => {
    console.log(request.body);
    response.status(201).send({
      id: 1,
      email: request.body.email
    });
}

export default {
  getUsers,
  getUserById,
  createUser
}
