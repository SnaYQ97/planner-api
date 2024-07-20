import {PrismaClient, User} from '@prisma/client';
import { Request, Response } from 'express-serve-static-core';
import passport from 'passport';
declare global {
  namespace Express {
    interface User {
      id: string,
      email: string;
    }
  }
}

// passport.use(new LocalStrategy.Strategy(
//   async (username, password, done) => {
//     const prisma = new PrismaClient();
//     prisma.user.findUnique({
//       where: {
//         email: username,
//       },
//     }).then((result) => {
//       if (!result) {
//         return done('User not found', false);
//       }
//
//       pbkdf2(password, salt, 31000, 32,'sha256', (err, row) => {
//         if (err) {
//           return done(err);
//         }
//         if (!res) {
//           return done('Incorrect password');
//         }
//         const { password, ...user } = result;
//         return done(null, user);
//
//       });
//   }).catch((err) => {
//     return done(err);
//     });
//   }));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser<User>( (user, done) => {
  console.log('deserializeUser', user);
  const prisma = new PrismaClient();
  prisma.user.findUnique({
    where: {
      email: user.email,
    },
  }).then((result) => {
    if (!result) {
      return done('User not found', false);
    }
    const { password, ...user } = result;
    done(null, user);
  }).catch((err) => {
    done(err);
  });
});

const AuthController = () => {




  const login = passport.authenticate('local');

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
