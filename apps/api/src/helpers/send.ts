import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { transporter } from '@/libs/nodemiler';

export async function sendInvoiceEmail(invoiceData: {
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  client_name: string;
  client_address: string;
  client_email: string;
  client_phone: string;
  items: Array<{
    quantity: number;
    unit_price: number;
    total: number;
    name: string;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  shipping_cost: number;
  total_amount_due: number;
}) {
  const templatePath = path.join(__dirname, '../templates/invoice.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

  const template = handlebars.compile(htmlTemplate);
  const htmlToSend = template(invoiceData);

  const sendEmail = await transporter.sendMail({
    to: invoiceData.client_email,
    subject: `Your Invoice from ${invoiceData.business_name}`,
    html: htmlToSend,
  });

  return sendEmail;
}
