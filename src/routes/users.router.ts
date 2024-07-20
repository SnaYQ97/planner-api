import { Router } from 'express';

import UsersController from '../controllers/users.controller';
import {pbkdf2, randomBytes, timingSafeEqual} from "node:crypto";
import {PrismaClient, User} from "@prisma/client";
import passport from "passport";
// LocalStartegy = require('passport-local');
import LocalStrategy from 'passport-local';

const router = Router();

router.get('/', UsersController.getUsers);
router.get('/:id', UsersController.getUserById);

// overide expess reponse type
// declare global {
//   namespace Express {
//     interface Request {
//       body: {
//         email: string,
//         password: string,
//       }
//     }
//   }
// }

const prisma = new PrismaClient();

passport.use(new LocalStrategy.Strategy((email, password, done) => {
  prisma.user.findUnique({
    where: {
      email: email,
    },
  }).then((result) => {
    if (!result) {
      return done('User not found', false);
    }
    pbkdf2(password, result.salt, 31000, 32, 'sha256', (err, hashedPassword) => {
      if (err) {
        return done(err);
      }
      if (!timingSafeEqual(result.password, hashedPassword)) {
        return done(null, false, { message: 'Incorrect password' });
      }
      const { password, ...user } = result;
      return done(null, user);
    });
  }).catch((err) => {
    return done(err);
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, email: user.email });
  });
});

passport.deserializeUser<User>(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});



router.post('/', (req, res, next) => {
  const salt = randomBytes(32);
  pbkdf2(req.body.password, salt, 31000, 32, 'sha256', async (err,  hashedPassword) => {
    if (err) return next(err);
    await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
        salt: salt,
      }
    }).then((user) => {
      res.send('User created');
      }).catch((err) => next(err));
    });
});

router.post('/login', passport.authenticate('local', {
  failureMessage: true,
}));

export default router;
