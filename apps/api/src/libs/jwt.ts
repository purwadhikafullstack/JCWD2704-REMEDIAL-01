import { SECRET_KEY } from '@/config/config';
import { sign } from 'jsonwebtoken';

export const createToken = (payload: any, expiresIn: string = '1hr') => {
  return sign(payload, SECRET_KEY, { expiresIn });
};
