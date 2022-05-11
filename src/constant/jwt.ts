import { User } from "./../entities/user.entity";
import { sign, verify } from "jsonwebtoken";

export class jwt {
  private static key = "123456789";

  static encode(user: User): string {
    return sign({ userId: user.id }, this.key, { expiresIn: "1d" });
  }

  static decode(token: string): any {
    return verify(token, this.key);
  }

  static generateRef(size: number = 4, alpha = true) {
    const pool =
      alpha == true
        ? "ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789abcdefghijklmnpqrstuvwxyz"
        : "0123456789";
    const rands = [];
    let i = -1;

    while (++i < size)
      rands.push(pool.charAt(Math.floor(Math.random() * pool.length)));

    return rands.join("");
  }
}
