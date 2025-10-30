class Result {
  status: number;
  message: string;
  data?: any;

  constructor(status?: number, message: string = "", data?: any) {
    this.status = status || 0;
    this.message = message;
    this.data = data;
  }
}

export default Result;
