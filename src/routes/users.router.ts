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

export default router;
