export interface ServiceResponse<T> {
  data?: T;
  err?: ServiceError;
  status: boolean;
}

interface ServiceError {
  message: string;
  code: number;
}

export const UNAUTHORIZED: ServiceResponse<{}> = {
  status: false,
  data: {},
  err: {
    message: "Unauthorized",
    code: 401 
  }
}
export const ALREADY_EXIST: ServiceResponse<{}> = {
  status: false,
  data: {},
  err: {
    message: "Data/User Already Exist",
    code: 403
  }
}

export const INTERNAL_SERVER_ERROR_SERVICE_RESPONSE: ServiceResponse<{}> = {
  status: false,
  data: {},
  err: {
    message: "Internal Server Error",
    code: 500
  }
}

export const INVALID_ID_SERVICE_RESPONSE: ServiceResponse<{}> = {
  status: false,
  data: {},
  err: {
    message: "Invalid ID, Data not Found",
    code: 404
  }
}

export function BadRequestWithMessage(message: string): ServiceResponse<{}> {
  return {
    status: false,
    data: {},
    err: {
      message,
      code: 404
    }
  }
}