import express, { json, urlencoded } from "express";
import cors, {CorsOptions} from "cors";
import session from "express-session";


import usersRouter from "./routes/users.router";
import authRouter from "./routes/auth.router";

const app = express();
const PORT = 3000;
const secondsInMinute = 60;
const second = 1000;
enum Path {
  HOME = '/',
  AUTH = '/auth',
  USERS = '/user',
}

app.use(
  json(),
  urlencoded({ extended: true }),
  session({
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: second * secondsInMinute * 60, // 1 hour
      secure: true,
    }
  }),
);

const corsOptions: CorsOptions = {
  origin: [`http://localhost:${PORT}`, "http://localhost:5173"],
  optionsSuccessStatus: 200,
}

app.get(Path.HOME, cors(corsOptions), async (request, res) => {
  console.log('home called');
  res.status(200).send('Hello World!');
});



app.use(Path.USERS, cors(corsOptions), usersRouter);
app.use(Path.AUTH, cors(corsOptions), authRouter);

export default app;
