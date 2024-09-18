import express, { json, urlencoded } from "express";
import cors, {CorsOptions} from "cors";
import expressSession from "express-session";
import authRouter from "./routes/auth.router";
import {PrismaClient} from "@prisma/client";
import userRouter from "./routes/users.router";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import passport from "passport";

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
  passport.initialize(),
  passport.authenticate('session'),
);

app.get(Path.HOME, cors({
  origin: [`http://localhost:${PORT}`, "http://localhost:5173", "http://192.168.100.5:5173"],
}), async (req, res) => {
  console.log('home called');
  res.status(200).send('Hello World!');
});

app.use(Path.AUTH, cors({
  origin: [`http://localhost:${PORT}`, "http://localhost:5173", "http://192.168.100.5:5173"],
  allowedHeaders: ['Cookie', 'content-type'],
  credentials: true,
}), authRouter);
app.use(Path.USER, cors({
  origin: [`http://localhost:${PORT}`, "http://localhost:5173", "http://192.168.100.5:5173"],
}), userRouter);

export default app;

declare global {
    namespace Express {
        interface User {
            id: string,
            email: string;
        }
    }
}
