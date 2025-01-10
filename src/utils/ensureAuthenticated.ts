import {Request, Response} from "express-serve-static-core";
import {NextFunction} from "express";

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
}
