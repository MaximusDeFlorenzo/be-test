import { Request, Response } from 'express';
import * as AuthService from "$services/AuthService"
import { handleServiceErrorWithResponse, response_success, response_created } from '$utils/response.utils';



export async function register(req:Request, res:Response):Promise<Response>{
    const serviceResponse = await AuthService.register(req, res)
    if(!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse)
    return response_created(res, serviceResponse.data, "Created!")
}

export async function login(req:Request, res:Response):Promise<Response>{
    const serviceResponse = await AuthService.login(req, res)
    if(!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse)
    return response_success(res, serviceResponse.data, "Success!")
}