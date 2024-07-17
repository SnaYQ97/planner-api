import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express-serve-static-core';
import { compare } from 'bcrypt';

const AuthController = () => {
  let tries = 0;
  const login = async (req: Request, res: Response) => {
    try {
      const prisma = new PrismaClient();
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      tries++;
      if (tries > 3) {
        // Block user after 3 failed login attempts until will not logged in with 2FA
        return res.status(429).json({ message: 'Too many login attempts' });
      }
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!await compare(password, user.password))  {
        console.log('isSame? ', await compare(password, user.password))
        return res.status(401).json({ message: 'Invalid password' });
      }
      req.session.cookie = {
        ...req.session.cookie,
        user: {
          email: user.email,
          id: user.id,
        },
      } as any;
      tries = 0;
      return res.status(200).send({ message: 'User logged in', cookie: req.session.cookie });
    }
    catch (error) {
      return res.status(500).send({ message: 'An error occurred while logging in' });
    }
  }

  const logout = async (req: Request, res: Response) => {
    return req.session.destroy((err) => {
      if (err) {
        return res.status(500).send({message: 'An error occurred while logging out'});
      }
      return res.status(200).send({
        message: 'User logged out'
      });
    });
  }
  return {
    login,
    logout,
  }
}

export default AuthController;
