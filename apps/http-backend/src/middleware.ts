import { NextFunction,Request,Response } from "express";
import jwt from 'jsonwebtoken';

const jwt_secret = process.env.JWT_SECRET || ""
export function middleware(req:Request,res:Response,next:NextFunction){
    const token=req.headers["authorization"] ?? "";
    const decoded=jwt.verify(token,jwt_secret);
    //@ts-ignore
    if(decoded.userId){
        //@ts-ignore
        req.userId=decoded.userId
        next()

    }else{
        res.status(403).json({
            message:"unauthorized"
        })
    }

}