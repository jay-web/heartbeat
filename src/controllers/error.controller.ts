export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
   }

export class AppError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpStatusCode;
    public readonly isOperational: boolean;
    
    constructor(name: string, httpCode: HttpStatusCode, description: string, isOperational: boolean) {
      super(description);
      Object.setPrototypeOf(this, new.target.prototype);
    
      this.name = name;
      this.httpCode = httpCode;
      this.isOperational = isOperational;
    
      Error.captureStackTrace(this);
    }

}

class HTTP400Error extends AppError {
    constructor(description = 'bad request') {
      super('NOT FOUND', HttpStatusCode.BAD_REQUEST,  description, true);
    }
   }