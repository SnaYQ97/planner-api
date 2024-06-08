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
  USERS = '/users',
}

app.use(
  json(),
  urlencoded({ extended: true }),
  session({
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: second * secondsInMinute * 60, // 1 hour
      secure: false,
    }
  }),
);

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  optionsSuccessStatus: 200,
}

app.get(Path.HOME, cors(corsOptions),  (request, res) => {
  console.log(request.session);
  res.send("Hello World! 2");
});



app.use(Path.USERS, cors(corsOptions), usersRouter);
app.use(Path.AUTH, cors(corsOptions), authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
