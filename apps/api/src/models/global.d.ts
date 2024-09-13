import { TUser } from '@/models/user.model';
import { Request } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user: TUser;
    }
  }
}
