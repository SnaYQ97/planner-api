import {Request, Response} from "express-serve-static-core";
import {ensureAuthenticated} from "../utils/ensureAuthenticated";
import {PrismaClient} from "@prisma/client";
import exp from "node:constants";

const prisma = new PrismaClient();

// draft not used
const getAccounts  =  (req: Request<{
  userId: string;
}>, res: Response) => ensureAuthenticated(req, res, () => {
  prisma.bankAccount.findMany({
    where: {
      userId: req.params.userId,
    },
  }).then((accounts) => {
    if (!accounts || accounts.length === 0) {
      res.status(404).json({error: 'No accounts found'});
    }
    res.status(200).json(accounts);
  }).catch((err) => {
    res.status(500).json({error: err});
  });
})

export default {
  getAccounts,
}
