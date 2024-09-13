import prisma from '@/prisma';
import cron from 'node-cron';
import { startOfDay } from 'date-fns';
import { transporter } from '@/libs/nodemiler';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { formatDate } from '@/helpers/invoice';

const checkAndExpireInvoices = async () => {
  const today = startOfDay(new Date());

  const recurringInvoices = await prisma.recurringInvoice.findMany({
    where: {
      status: 'unpaid',
      invoice: {
        due_date: {
          lte: today,
        },
      },
    },
    include: {
      invoice: { include: { business: true, client: true } },
    },
  });

  for (const recurringInvoice of recurringInvoices) {
    await prisma.recurringInvoice.update({
      where: { id: recurringInvoice.id },
      data: { status: 'expired' },
    });

    if (recurringInvoice.invoice) {
      await prisma.invoice.update({
        where: { id: recurringInvoice.invoice_id },
        data: { status: 'expired' },
      });

      const emailData = {
        client_name: recurringInvoice.invoice.client.name,
        client_email: recurringInvoice.invoice.client.email,
        invoice_no: recurringInvoice.invoice.no_invoice,
        due_date: formatDate(recurringInvoice.invoice.due_date),
        current_date: formatDate(today),
        isRecurring: recurringInvoice ? true : false,
        business_email: recurringInvoice.invoice.business.email,
        business_name: recurringInvoice.invoice.business.name,
        business_phone: recurringInvoice.invoice.business.phone,
        business_address: recurringInvoice.invoice.business.address,
      };

      const templatePath = path.join(__dirname, '../templates/expInvoice.html');
      const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(htmlTemplate);
      const htmlToSend = template(emailData);

      await transporter.sendMail({
        to: emailData.client_email,
        subject: `Your Invoice from ${emailData.business_name}`,
        html: htmlToSend,
      });

      console.log(
        `Notification email sent for recurring invoice ${recurringInvoice.no_invoice}.`,
      );
    }
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      status: 'unpaid',
      due_date: {
        lte: today,
      },
      recurring: false,
    },
    include: { business: true, client: true },
  });

  for (const invoice of invoices) {
    if (!invoice.recurring) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'expired' },
      });

      const emailData = {
        client_name: invoice.client.name,
        client_email: invoice.client.email,
        invoice_no: invoice.no_invoice,
        due_date: formatDate(invoice.due_date),
        current_date: formatDate(today),
        isRecurring: invoice.recurring ? true : false,
        business_email: invoice.business.email,
        business_name: invoice.business.name,
        business_phone: invoice.business.phone,
        business_address: invoice.business.address,
      };

      console.log(emailData);

      const templatePath = path.join(__dirname, '../templates/expInvoice.html');
      const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(htmlTemplate);
      const htmlToSend = template(emailData);

      await transporter.sendMail({
        to: emailData.client_email,
        subject: `Your Invoice from ${emailData.business_name}`,
        html: htmlToSend,
      });

      console.log(`Notification email sent for invoice ${invoice.no_invoice}.`);
    }
  }

  console.log(
    `Processed ${recurringInvoices.length + invoices.length} invoices for expiration check.`,
  );
};

cron.schedule('*/10 * * * *', async () => {
  console.log('Running every 10 minutes invoice expiration check cron job');
  await checkAndExpireInvoices();
});

console.log('Invoice expiration check cron job has been scheduled');
