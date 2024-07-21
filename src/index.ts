import express, {json, urlencoded, Request, Response, NextFunction} from "express";
import cors, {CorsOptions} from "cors";
import session from "express-session";
import authRouter from "./routes/auth.router";
import passport from "passport";
import {PrismaClient} from "@prisma/client";
import * as passportStrategy from "passport-local";
import {pbkdf2, randomBytes, timingSafeEqual} from "node:crypto";
import router from "./routes/users.router";

const app = express();
const PORT = 3000;
const secondsInMinute = 60;
const second = 1000;
enum Path {
  HOME = '/',
  AUTH = '/auth',
  USER = '/user',
}
// after successful login, set cookie
// after one min will be deleted,
// timer will not reset

app.use(
  json(),
  urlencoded({ extended: true }),
  session({
    cookie: {
      maxAge: (second * secondsInMinute),
    },
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
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
            const { password, ...user } = result;
            return done(null, user);
        });
    }).catch((err) => {
        return done(err);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser<Express.User>((user, done) => {
    prisma.user.findUnique({
        where: {
            email: user.email,
        },
    }).then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err);
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

app.get(`${Path.AUTH}/fail`, async (req, res) => {
    res.send('Failed to login');
});

app.post(`${Path.AUTH}/login`, passport.authenticate('local', {
    failureMessage: true,
    successRedirect: `${Path.AUTH}/secured`,
    failureRedirect: `${Path.AUTH}/fail`,
}));

const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send('Unauthorized');
}

app.get(`${Path.AUTH}/secured`, ensureAuthenticated, (req, res) => {
    res.send('Secured');
});

app.get(`${Path.AUTH}/logout`, (req, res) => {
    req.logout((err) => {
        if(err) return res.send(err);
        return res.send('Logged out');
    });
});

export default app;
