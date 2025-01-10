import {Request, Response} from "express-serve-static-core";
import {ensureAuthenticated} from "../utils/ensureAuthenticated";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const getAccounts = (req: Request<{
  userId: string;
}>, res: Response) => ensureAuthenticated(req, res, () => {
  prisma.bankAccount.findMany({
    where: {
      userId: req.params.userId,
    }
  }).then((accounts) => {
    if (!accounts || accounts.length === 0) {
      res.status(404).json({error: 'No accounts found'});
    }
    res.status(200).json(accounts);
  }).catch((err: Error) => {
    res.status(500).json({error: err.message});
  });
})

export default {
  getAccounts,
} 