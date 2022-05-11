import { ValidationError } from "class-validator";
export class responseHandler {
  //constructor(data: any = [], msg: string | null = null, statusCode: number) {}

  static success(data: any, msg = "success", code: number) {
    return {
      message: msg,
      status: true,
      statusCode: code,
      data,
    };
  }

  static failed(msg: string, code: number, data: any) {
    return {
      message: msg,
      status: false,
      statusCode: code,
      data,
    };
  }

  /**
   * Generate a custom error from validation
   * @param data
   * @returns errors[]
   */
  static validationError(data: any = []) {
    let errors: any = [];
    if (data.length > 0) {
      data.map((e: any) => {
        const constraintsKeys = Object.keys(e.constraints as any);

        let constraintMsg: any = [];
        constraintsKeys.map((key) => {
          const msg = e.constraints[key];
          constraintMsg.push(msg);
        });
        const err = {
          property: e.property,
          message: constraintMsg,
        };

        errors.push(err);
      });
    }

    return {
      message: "Validation error",
      status: false,
      statusCode: 422,
      data: errors,
    };
  }
}
