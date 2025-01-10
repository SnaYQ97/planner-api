import passport from 'passport';
import * as passportLocalStrategy from "passport-local";
import {Request, Response} from "express-serve-static-core";
import {ensureAuthenticated} from "../utils/ensureAuthenticated";
import { prisma } from '../lib/prisma';
import { verify } from 'argon2';

passport.use(new passportLocalStrategy.Strategy({usernameField: 'email'}, async (email, password, done) => {
  try {
    const result = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!result) {
      return done(null, false, { message: 'User not found'});
    }

    const isValid = await verify(result.password, password);
    if (!isValid) {
      return done(null, false, { message: 'Incorrect password' });
    }

    const { email: userEmail, id } = result;
    return done(null, { email: userEmail, id });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    email: user.email,
  });
});

passport.deserializeUser<Express.User>(async (user, done) => {
  await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      email: true,
    },
  }).then((user: Express.User | null) => {
    if (!user) {
      return done('Unauthorized', null);
    }

    done(null, {
      id: user.id,
      email: user.email,
    });
  }).catch((err: any) => {
    done(err, null);
  });
});

export const login = async (req: Request, res: Response) => passport.authenticate('local')(req, res, () => {
  if (!req.session.passport?.user) {
    return res.status(401).send({
      message: 'Authentication failed'
    });
  }

  res.status(200).send({
    message: 'Logged in',
    user: req.session.passport.user
  });
});

export const logout = async (req: Request, res: Response) => req.logout((err) => {
  if (err) return res.status(500).send({message: 'An error occurred while logging out'});
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({message: 'An error occurred while logging out'});
    }
    return res.status(200).send({
      message: 'Logged out',
    });
  });
});

export const getStatus = async (req: Request, res: Response) => ensureAuthenticated(req, res, () => {
  if (!req.session.passport?.user) {
    return res.status(401).send({
      message: 'Not authenticated'
    });
  }

  const { user } = req.session.passport;

  res.status(200).send({
    message: 'Authenticated',
    user: {
      id: user.id,
      email: user.email
    }
  });
});

export default {
  login,
  logout,
  getStatus,
};
