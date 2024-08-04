import express, {json, urlencoded, Request, Response, NextFunction} from "express";
import cors, {CorsOptions} from "cors";
import expressSession from "express-session";
import authRouter from "./routes/auth.router";
import passport from "passport";
import {PrismaClient} from "@prisma/client";
import * as passportStrategy from "passport-local";
import {pbkdf2, randomBytes, timingSafeEqual} from "node:crypto";
import router from "./routes/users.router";
import { PrismaSessionStore} from "@quixo3/prisma-session-store";

const app = express();
const PORT = 3000;
const secondsInMinute = 60;
const second = 1000;
enum Path {
  HOME = '/',
  AUTH = '/auth',
  USER = '/user',
}

const prisma = new PrismaClient();

app.use(
  json(),
  urlencoded({ extended: true }),
  expressSession({
      cookie: {
      maxAge: (second * secondsInMinute * 30),
    },
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true,
      store: new PrismaSessionStore(
        prisma,
        {
            checkPeriod: 10 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
      )
  }),
);

app.use(passport.initialize())
app.use(passport.authenticate('session'));

const corsOptions: CorsOptions = {
  origin: [`http://localhost:${PORT}`, "http://localhost:5173"],
  optionsSuccessStatus: 200,
}

app.get(Path.HOME, cors(corsOptions), async (req, res) => {
  console.log('home called');
  res.status(200).send('Hello World!');
});

app.use(Path.AUTH, cors(corsOptions), authRouter);
app.use(Path.USER, cors(corsOptions), router);

passport.use(new passportStrategy.Strategy({usernameField: 'email'}, async (email, password, done) => {
    console.log(email, password);
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
    console.log('serializer')
    done(null, user.id);
});

passport.deserializeUser<string>(async (id, done) => {
    console.log('deserializer')
    await prisma.user.findUnique({
        where: {
            id: id,
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

router.post(`${Path.USER}/create`, (req, res, next) => {
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

app.post(`${Path.AUTH}/`, passport.authenticate('local'), (req, res) => {
    console.log(req.session.id)
    res.sendStatus(200);
});

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(401);
}

app.get(`${Path.AUTH}/status`, ensureAuthenticated, (req, res) => {
    res.status(200).send({
        message: 'Authenticated',
    });
});

app.get(`${Path.AUTH}/logout`, (req, res) => {
    req.logout((err) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send({message: 'An error occurred while logging out'});
            }
            return res.status(200).send({
                message: 'Logged out',
            });
        });
    });
});

export default app;

declare global {
    namespace Express {
        interface User {
            id: string,
            email: string;
        }
    }
}
