import nodemailer from 'nodemailer';
import { pass, user } from '@/config/config';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
});
