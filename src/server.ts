import { authMiddleware } from "./middleware/auth.middleware";
import { notFound } from "./exceptions/notFound";
import { errorHandler } from "./exceptions/errorHandler";
import { UserService } from "./modules/users/user.service";
import "reflect-metadata";
import "dotenv/config";
// import express from "express";
import morgan from "morgan";
import cors from "cors";

import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import "./modules/users/user.controller";
import TYPES from "./constant/types";
import * as bodyParser from "body-parser";

export const startServer = async () => {
  const container = new Container();
  const server = new InversifyExpressServer(container);

  // service
  container.bind(TYPES.UserService).to(UserService);

  // middleware
  container.bind(TYPES.authMiddleware).to(authMiddleware);

  server.setConfig((app) => {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(morgan("dev"));
    app.use(cors());
  });

  server.setErrorConfig((app) => {
    app.use([errorHandler, notFound]);
  });
  const app = server.build();
  const port = process.env.PORT || 8000;
  app.listen(port,()=>{

    console.log(`Server started at http://localhost:${port}`);
    console.log(`Press Ctrl+C to quit`);
  });

  
};
