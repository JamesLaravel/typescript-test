import { injectable } from "inversify";
import { DataSource, ObjectType } from "typeorm";
import "dotenv/config";
import { join } from "path";
import { User } from "../entities/user.entity";

@injectable()
export class DatabaseService {
  private static connection: DataSource;

  constructor() {}

  getConnection(): DataSource {
    if (DatabaseService.connection instanceof DataSource) {
      return DatabaseService.connection;
    }
    try {
      DatabaseService.connection = new DataSource({
        type: "postgres",
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASS,
        database: process.env.POSTGRES_DATABASE,
        entities: [__dirname + "/../**/*.entity.{js,ts}"],
        //migrations: ["dist/migration/**/*.ts"],
        logging: "all",
        synchronize: true,
      });

      DatabaseService.connection
        .initialize()
        .then(() => {
          console.log("Data source connected");
        })
        .catch((err) => {
          console.error("Error during Data Source initialization", err);
        });
      return DatabaseService.connection;
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }

  // async getRepository<T>(repo: ObjectType<T>): Promise<T> {
  //   const connection = this.getConnection();
  //   return await connection.getCustomRepository<T>(repo);
  // }
}
