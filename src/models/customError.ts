class CustomError extends Error {
  status: number;
  data: any;

  constructor(message: string = "", status: number = 500, data: any = null) {
    super(message);
    this.message = message;
    this.status = status;
    this.data = data;

    Object.setPrototypeOf(this, CustomError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    const stackWithoutError = this.stack?.replace(`${this.name}: `, "") || "";
    return `${this.message}\n${stackWithoutError}`;
  }
}

export default CustomError;
