import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import authRouter from './routes/auth.router';
import bankAccountRouter from './routes/bankAccount.router';
import userRouter from './routes/user.router';
import transactionRouter from './routes/transaction.router';
import categoryRouter from './routes/category.router';

export enum PATH {
  ROOT = '/',
  AUTH = '/auth',
  BANK_ACCOUNT = '/bank-account',
  USER = '/user',
  TRANSACTION = '/transaction',
  CATEGORY = '/category'
}

const app = express();
export const PORT = 3000;

app.use(cors({
    origin: [`http://localhost:${PORT}`, "http://localhost:5173", "http://192.168.100.5:5173", "http://192.168.100.43:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use(PATH.AUTH, authRouter);
app.use(PATH.BANK_ACCOUNT, bankAccountRouter);
app.use(PATH.USER, userRouter);
app.use(PATH.TRANSACTION, transactionRouter);
app.use(PATH.CATEGORY, categoryRouter);

app.get(PATH.ROOT, (_req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
