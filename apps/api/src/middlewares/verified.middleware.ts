import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const isVerified = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user.id;
  
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  
    if (!user || !user.is_verified ) {
      return res.status(403).json({
        message: 'Unauthorized: Only user with verified account can accses',
      });
    }
  
    next();
  };