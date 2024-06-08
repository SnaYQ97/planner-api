import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express-serve-static-core';

const AuthController = () => {
  const login = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user || user.password !== password) return res.status(404).json({ message: 'User not found' });

    req.session.cookie = {
      ...req.session.cookie,
      user: user,
    } as any;
    return res.status(200).send({ message: 'User logged in', cookie: req.session.cookie });
  }


  return {
    login,
  }
}

export default AuthController;
