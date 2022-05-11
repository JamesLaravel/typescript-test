import { Request, Response, NextFunction } from "express";
import HttpException from "./HttpException";

export const errorHandler = (
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.status).send({
    error: true,
    message: err.message,
  });
};
