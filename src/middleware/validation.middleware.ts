import { Request, Response, NextFunction } from 'express';
import { Schema } from 'yup';

export const validate = (schema: Schema) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (err: any) {
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
}; 