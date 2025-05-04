import { INTERNAL_SERVER_ERROR_SERVICE_RESPONSE, ALREADY_EXIST, INVALID_ID_SERVICE_RESPONSE, ServiceResponse } from "$entities/Service";
import Logger from '$pkg/logger';
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../auth/auth.utils";

const prisma = new PrismaClient();

export async function register(req: Request, res: Response):Promise<ServiceResponse<{}>>{
    try{
        const { email, password } = req.body;
        
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
    
        if (existingUser) {
            Logger.error(`AuthService.register : User Already Exist`)
            return ALREADY_EXIST
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
    
        const token = generateToken(user.id);

        return {
            status:true,
            data:{
                message: "User registered successfully",
                user: { email: user.email },
                token,
            }
        }
    }catch(err){
        Logger.error(`AuthService.register : ${err}`)
        return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
    }
}

export async function login(req: Request, res: Response):Promise<ServiceResponse<{}>>{
    try{
        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({
            where: { email },
        });
    
        if (!user) {
            Logger.error(`AuthService.login : User Not Found`)
            return INVALID_ID_SERVICE_RESPONSE
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            Logger.error(`AuthService.login : Wrong Email Or Password`)
            return INVALID_ID_SERVICE_RESPONSE
        }
    
        const token = generateToken(user.id);
    
        return {
            status:true,
            data:{
                message: "Login successfully",
                user: { email: user.email },
                token,
            }
        }
    }catch(err){
        Logger.error(`AuthService.login : ${err}`)
        return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
    }
}