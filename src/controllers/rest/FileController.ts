import { Request, Response } from 'express';
import * as FileService from "$services/FileService"
import { handleServiceErrorWithResponse, response_success, response_created } from '$utils/response.utils';

export async function get(req:Request, res:Response):Promise<Response>{
    const serviceResponse = await FileService.get(req, res)
    if(!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse)
    return response_success(res, serviceResponse.data, "Success!")
}

export async function upload(req:Request, res:Response):Promise<Response>{
    const serviceResponse = await FileService.upload(req, res)
    if(!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse)
    return response_created(res, serviceResponse.data, "Created!")
}