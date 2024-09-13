import 'dotenv/config';
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: `http://localhost:3000`,
  credentials: true,
};

export const SECRET_KEY = process.env.SECRET_KEY || '';
export const user = process.env.NODEMAILER_EMAIL;
export const pass = process.env.NODEMAILER_PASS;
