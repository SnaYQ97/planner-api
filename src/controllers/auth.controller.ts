import passport from "passport";
import * as passportStrategy from "passport-local";
import {pbkdf2, timingSafeEqual} from "node:crypto";
import {PrismaClient, User} from "@prisma/client";
import {Request, Response} from "express-serve-static-core";
import {ensureAuthenticated} from "../utils/ensureAuthenticated";

const prisma = new PrismaClient();

passport.use(new passportStrategy.Strategy({usernameField: 'email'}, async (email, password, done) => {

  prisma.user.findUnique({
    where: {
      email: email,
    },
  }).then((result) => {
    if (!result) {
      return done(null, false, { message: 'User not found'});
    }
    pbkdf2(password, result.salt, 31000, 32, 'sha256', (err, hashedPassword) => {
      if (err) {
        return done(err);
      }
      if (!timingSafeEqual(result.password, hashedPassword)) {
        return done(null, false, { message: 'Incorrect password' });
      }
      const { email, id, ...rest } = result;
      return done(null, { email, id });
    });
  }).catch((err) => {
    return done(err);
  });
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
  }).then((user) => {
    if (!user) {
      return done('Unauthorized', null);
    }

    const { id: userId, email } = user;
    done(null, {
      id: userId,
      email,
    });
  }).catch((err) => {
    done(err, null);
  });
});

export const login = (req: Request, res: Response) => passport.authenticate('local')(req, res, () => {
  res.status(200).send({
    message: 'Logged in',
    user: (req.session as any)?.passport.user
  });
});

const getStatus =  (req: Request, res: Response) => ensureAuthenticated(req, res, () => {
  res.status(200).send({
    message: 'Authenticated',
  });
})

const logout = (req: Request, res: Response) => req.logout((err) => {
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

export default {
  login,
  logout,
  getStatus,
}
