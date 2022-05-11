import { User } from "./../entities/user.entity";
import { UserRepository } from "../Repository";
import { jwt } from "./../constant/jwt";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { ParsedQs } from "qs";

@injectable()
export class authMiddleware extends BaseMiddleware {
  constructor() {
    super();
  }

  public async handler(
    req: Request & { user: User },
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const btoken = req.headers["authorization"];

      if (!btoken) {
        return res.status(401).json({
          message: "unauthorized",
        });
      }

      const token = btoken.split(" ")[1];

      const payload = jwt.decode(token);
      console.log("payload", payload);
      if (Date.now() >= payload.exp * 1000) {
        return res.status(401).json({ message: "Token Expired" });
      }

      const user = await UserRepository.findOneBy({
        id: payload.userId,
      });

      if (!user) {
        return res.status(401).json({ message: "unauthorized" });
      }
      req.user = user;
    } catch (e) {
      console.log(e);
      if ((e as Error).message === "jwt expired") {
        return res.status(401).json({
          message: "Token Expired",
        });
      }

      if ((e as Error).message === "invalid token") {
        return res.status(401).json({
          message: "Invalid token",
        });
      }

      if ((e as Error).message === "invalid signature") {
        return res.status(401).json({
          message: "Invalid token",
        });
      }

      return res.status(500).json({
        message: "An error occurred",
      });
    }
    next();
  }
}
