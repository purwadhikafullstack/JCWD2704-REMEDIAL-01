import prisma from '@/prisma';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { transporter } from '@/libs/nodemiler';
import { endOfDay, startOfDay } from 'date-fns';
import { formatCurrency, formatDate } from '@/helpers/invoice';

const sendRecurringInvoice = async () => {
  const now = new Date();
  const startOfToday = startOfDay(now);
  const endOfToday = endOfDay(now);

  const pendingInvoices = await prisma.recurringInvoice.findMany({
    where: {
      status: 'pending',
      invoice_date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: {
      invoice: { include: { client: true, business: true } },
    },
  });

  for (const invoice of pendingInvoices) {
    const invoiceItems = await prisma.invoiceItem.findMany({
      where: { invoice_id: invoice.invoice.id },
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
      //business
      business_name: invoice.invoice.business.name,
      business_address: invoice.invoice.business.address,
      business_email: invoice.invoice.business.email,
      business_phone: invoice.invoice.business.phone,

      //client
      client_name: invoice.invoice.client.name,
      client_address: invoice.invoice.client.address,
      client_email: invoice.invoice.client.email,
      had_phone: invoice.invoice.client.phone
        ? invoice.invoice.client.phone
        : null,
      client_phone: invoice.invoice.client.phone,

      //items
      items: invoiceItems.map((item) => ({
        quantity: item.quantity,
        price: formatCurrency(item.product.price),
        total: formatCurrency(item.total_price),
        name: item.product.name,
        description: item.product.description,
      })),

      //tax
      tax: invoice.tax ? invoice.tax : null,
      is_tax_percentage: invoice.tax_type === 'percentage' ? invoice.tax : null,
      tax_rate: invoice.tax_type === 'percentage' ? invoice.tax : null,
      tax_value: formatCurrency(taxAmount),
      tax_amount: invoice.tax ? formatCurrency(invoice.tax) : null,

      //discount
      discount: invoice.discount ? invoice.discount : null,
      is_discount_percentage:
        invoice.discount_type === 'percentage' ? invoice.discount : null,
      discount_rate:
        invoice.discount_type === 'percentage' ? invoice.discount : null,
      discount_value: formatCurrency(discountAmount),
      discount_amount: invoice.discount
        ? formatCurrency(invoice.discount)
        : null,

      //shipping
      shipping_cost: invoice.shipping_cost
        ? formatCurrency(invoice.shipping_cost)
        : null,
      total_amount_due: formatCurrency(invoice.total_price),
      subtotal: formatCurrency(subtotal),

      //payment
      business_bank_account: invoice.invoice.business.bank_account,
      business_bank: invoice.invoice.business.bank,

      //invoice
      invoice_no: invoice.no_invoice,
      invoice_date: formatDate(invoice.invoice_date),
      due_date: formatDate(invoice.due_date),
    };

    const templatePath = path.join(__dirname, '../templates/inv.html');
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(htmlTemplate);
    const htmlToSend = template(emailData);

    await transporter.sendMail({
      to: emailData.client_email,
      subject: `Your Invoice from ${emailData.business_name}`,
      html: htmlToSend,
    });

    await prisma.invoice.update({
      where: { id: invoice.invoice_id, idNowRecurring: invoice.id },
      data: { status: 'unpaid', sendAt: new Date() },
    });

    await prisma.recurringInvoice.update({
      where: { id: invoice.id },
      data: { status: 'unpaid', sendAt: new Date() },
    });
  }

  console.log(
    `Processed ${pendingInvoices.length} recurring invoices for today.`,
  );
};

cron.schedule('*/10 * * * *', async () => {
  console.log('Running every 10 minutes invoice email cron job');
  await sendRecurringInvoice();
});

console.log('Recurring invoice email cron job has been scheduled');
