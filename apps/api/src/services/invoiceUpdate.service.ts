import { generateInvoice } from '@/helpers/invoice';
import { transporter } from '@/libs/nodemiler';
import prisma from '@/prisma';
import { $Enums, Payment, Prisma, Status, Value } from '@prisma/client';
import { addDays, isAfter, isBefore } from 'date-fns';
import { Request } from 'express';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';

class InvoiceUpdateService {
  async updateStatus(req: Request) {
    const userId = req.user.id;
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, business: { user_id: userId } },
    });

    if (!invoice) throw new Error('invoice not found');

    const today = new Date();
    const invoiceDate = new Date(invoice.invoice_date);
    const dueDate = new Date(invoice.due_date);

    if (invoice.status !== Status.unpaid) {
      throw new Error(
        'Invoice status can only be updated to "paid" from "unpaid".',
      );
    }

    const paid = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: Status.paid, paidAt: today },
    });

    if (invoice.recurring && invoice.idNowRecurring) {
      const recurringInvoice = await prisma.recurringInvoice.findUnique({
        where: { id: invoice.idNowRecurring },
      });

      if (
        recurringInvoice &&
        invoice.recurring_interval &&
        invoice.payment_terms
      ) {
        await prisma.recurringInvoice.update({
          where: { id: recurringInvoice.id },
          data: { status: Status.paid, paidAt: today },
        });

        const newInvoiceDate = addDays(
          new Date(recurringInvoice.invoice_date),
          invoice.recurring_interval,
        );
        const newDueDate = addDays(newInvoiceDate, invoice.payment_terms);

        const newRecurring = await prisma.recurringInvoice.create({
          data: {
            invoice_id: invoice.id,
            no_invoice: generateInvoice(),
            invoice_date: newInvoiceDate,
            total_price: recurringInvoice.total_price,
            shipping_cost: recurringInvoice.shipping_cost,
            discount_type: recurringInvoice.discount_type as Value,
            discount: recurringInvoice.discount,
            tax_type: recurringInvoice.tax_type as Value,
            tax: recurringInvoice.tax,
            status: 'pending',
            due_date: newDueDate,
          },
        });

        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { idNowRecurring: newRecurring.id, status: 'pending' },
        });
      }
    }

    return paid;
  }

  async cancelInvoice(req: Request) {
    const userId = req.user.id;
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, business: { user_id: userId } },
    });

    if (!invoice) throw new Error('Invoice not found');

    if (invoice.status === 'pending' || invoice.status === 'unpaid') {
      const canceledInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'cancelled', cancelledAt: new Date() },
      });

      let invoiceNumber = canceledInvoice.no_invoice;

      if (invoice.recurring && invoice.idNowRecurring) {
        const recurringInvoice = await prisma.recurringInvoice.findUnique({
          where: { id: invoice.idNowRecurring },
        });

        if (recurringInvoice) {
          await prisma.recurringInvoice.update({
            where: { id: recurringInvoice.id },
            data: { status: 'cancelled', cancelledAt: new Date() },
          });

          invoiceNumber = recurringInvoice.no_invoice;
        }
      }

      const business = await prisma.business.findUnique({
        where: { id: invoice.business_id },
      });
      const client = await prisma.client.findUnique({
        where: { id: invoice.client_id },
      });

      const emailData = {
        client_name: client?.name,
        invoice_number: invoiceNumber,
        business_name: business?.name,
        business_email: business?.email,
      };

      const templatePath = path.join(__dirname, '../templates/cancelInv.html');
      const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(htmlTemplate);
      const htmlToSend = template(emailData);

      await transporter.sendMail({
        to: client?.email,
        subject: `Your Invoice #${invoiceNumber} has been Cancelled`,
        html: htmlToSend,
      });

      return canceledInvoice;
    } else {
      throw new Error('Invalid status');
    }
  }

  async delete(req: Request) {
    const userId = req.user.id;
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        business: { user_id: userId },
      },
    });

    if (!invoice) throw new Error('invoice not found');

    if (invoice.status === 'pending' && !invoice.recurring) {
      const softDelete = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          deletedAt: new Date(),
        },
      });

      return softDelete;
    } else {
      throw new Error('invalid status');
    }
  }
}

export default new InvoiceUpdateService();
