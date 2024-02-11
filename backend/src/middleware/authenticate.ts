import express,{Request,Response,NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { Admin, PrismaClient, User } from '@prisma/client';
const prisma=new PrismaClient();
export interface authenicatedRequest extends Request{
user?:User,
admin?:Admin
}
export const authenticateUser = async (req: authenicatedRequest, res: express.Response, next: express.NextFunction) => {
    const  token  = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET || '')as{email:string};
      const email=decoded.email;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      req.user = user;
      next();
    } catch (error) {
      console.error('Error authenticating user:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };

  export const authenticateAdmin = async (
    req: authenicatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {email:string};
      const email=decoded.email;
      const admin = await prisma.admin.findUnique({ where: { email } });
  
  
      if (!admin) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      req.admin = admin;
      next();
    } catch (error) {
      console.error('Error authenticating user:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
  