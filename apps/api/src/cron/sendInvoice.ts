import prisma from '@/prisma';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { transporter } from '@/libs/nodemiler';

const sendInvoiceEmails = async () => {
  const startOfDay = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(
    new Date().setUTCHours(23, 59, 59, 999),
  ).toISOString();

  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      status: 'pending',
      invoice_date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      business: true,
      client: true,
      RecurringInvoice: true,
    },
  });

  for (const invoice of pendingInvoices) {
    const invoiceItems = await prisma.invoiceItem.findMany({
      where: { invoice_id: invoice.id },
      include: { product: true },
    });

    const subtotal = invoiceItems.reduce((sum, item) => {
      return sum + item.total_price;
    }, 0);

    let discountAmount = 0;
    if (invoice.discount) {
      if (invoice.discount_type === 'percentage') {
        discountAmount = (subtotal * invoice.discount) / 100;
      } else if (invoice.discount_type === 'nominal') {
        discountAmount = invoice.discount;
      }
    }
    const afterDiscount = subtotal - discountAmount;
    const afterShipping = invoice.shipping_cost
      ? afterDiscount + invoice.shipping_cost
      : afterDiscount;
    let taxAmount = 0;
    if (invoice.tax) {
      if (invoice.tax_type === 'percentage') {
        taxAmount = (afterShipping * invoice.tax) / 100;
      } else if (invoice.tax_type === 'nominal') {
        taxAmount = invoice.tax;
      }
    }

    const emailData = {
      business_name: invoice.business.name,
      business_address: invoice.business.address,
      business_email: invoice.business.email,
      business_phone: invoice.business.phone,
      client_name: invoice.client.name,
      client_address: invoice.client.address,
      client_email: invoice.client.email,
      client_phone: invoice.client.phone,
      items: invoiceItems.map((item) => ({
        quantity: item.quantity,
        unit_price: item.price,
        total: item.total_price,
        name: item.product.name,
      })),
      subtotal: subtotal,
      discount: discountAmount,
      tax_amount: taxAmount,
      shipping_cost: invoice.shipping_cost,
      total_amount_due: invoice.total_price,
    };

    const templatePath = path.join(__dirname, '../templates/invoice.html');
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(htmlTemplate);
    const htmlToSend = template(emailData);

    await transporter.sendMail({
      to: emailData.client_email,
      subject: `Your Invoice from ${emailData.business_name}`,
      html: htmlToSend,
    });

    console.log(`Invoice email sent to ${emailData.client_email}`);

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'unpaid' },
    });

    if (invoice.recurring && invoice.idNowRecurring) {
      await prisma.recurringInvoice.update({
        where: { id: invoice.idNowRecurring },
        data: { status: 'unpaid' },
      });
    }
  }

  console.log(`Processed ${pendingInvoices.length} invoices for today.`);
};

// cron.schedule('0 0 * * *', async () => {
//   console.log('Running daily invoice email cron job');
//   await sendInvoiceEmails();
// });
cron.schedule('*/5 * * * *', async () => {
  console.log('Running every 5 minutes invoice email cron job');
  await sendInvoiceEmails();
});

console.log('Invoice email cron job has been scheduled');
