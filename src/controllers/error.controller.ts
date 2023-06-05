export enum HttpStatusCode {
    OK = 200,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    NOT_AUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    
    INTERNAL_SERVER = 500,
   }

export class AppError extends Error {
    public readonly status:string;
    public readonly statusCode: HttpStatusCode;
    public readonly isOperational: boolean;
    
    constructor(statusCode: HttpStatusCode, message: string) {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
  
      this.statusCode = statusCode;
      this.status =  `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
    
      Error.captureStackTrace(this, this.constructor);
    }

}

// class HTTP400Error extends AppError {
//     constructor(description = 'bad request') {
//       super('NOT FOUND', HttpStatusCode.BAD_REQUEST,  description, true);
//     }
//    }


export function instanceOfNodeError<T extends new (...args: any) => Error>(
  value: Error,
  errorType: T
): value is InstanceType<T> & NodeJS.ErrnoException {
  return value instanceof errorType;
}

export class HTTP401Error extends AppError {
      constructor(message = 'Not Authorized') {
      super(HttpStatusCode.NOT_AUTHORIZED,  message);
    }
}

export class HTTP404Error extends AppError {
  constructor(message = 'Not Found') {
  super( HttpStatusCode.NOT_FOUND,  message);
}
}

export class HTTP500Error extends AppError {
  constructor(message = 'Internal Server Error 😓😓🥵') {
  super( HttpStatusCode.INTERNAL_SERVER,  message);
}
}