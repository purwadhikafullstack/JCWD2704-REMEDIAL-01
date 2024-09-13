import prisma from '@/prisma';
import { Request } from 'express';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import { transporter } from '@/libs/nodemiler';
import { formatCurrency, formatDate, generateInvoice } from '@/helpers/invoice';
import { CreateInvoiceInput } from '@/models/invoice.model';
import { Value } from '@prisma/client';
import {
  addDays,
  differenceInDays,
  format,
  isBefore,
  startOfDay,
} from 'date-fns';
import puppeteer from 'puppeteer';

class InvoiceService {
  async create(req: Request) {
    const userId = req.user.id;
    const {
      client_id,
      products,
      tax,
      tax_type,
      discount,
      discount_type,
      shipping_cost,
      payment_method,
      payment_terms,
      recurring,
      recurring_interval,
      invoice_date,
      recurring_end,
    } = req.body as CreateInvoiceInput;

    if (
      !client_id ||
      !products ||
      !payment_method ||
      !invoice_date ||
      payment_terms === null
    ) {
      throw new Error('Missing required fields');
    }

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Products must be a non-empty array');
    }

    const today = startOfDay(new Date());
    const invoiceDate = startOfDay(new Date(invoice_date));
    const recurringEnd = startOfDay(new Date(recurring_end));

    if (isBefore(invoiceDate, today)) {
      throw new Error('Invoice date cannot be before today');
    }

    if (payment_terms < 0)
      throw new Error('payment terms must be after invoice date');

    if (recurring) {
      const daysDifference = differenceInDays(recurringEnd, invoiceDate);

      if (typeof recurring_interval !== 'number' || recurring_interval <= 0) {
        throw new Error('Recurring interval must be a positive number');
      } else if (isBefore(recurringEnd, invoiceDate)) {
        throw new Error('Recurring end date must be after the invoice date');
      } else if (payment_terms > recurring_interval) {
        throw new Error(
          'Payment terms should be less than the repetition interval',
        );
      } else if (!recurring_end) {
        throw new Error('Recurring end date must be provided');
      } else if (recurring_interval > daysDifference) {
        throw new Error(
          'Recurring interval cannot be greater than the difference between invoice date and recurring end date',
        );
      }
    } else if (!recurring) {
      if (recurring_interval) {
        throw new Error(
          'Recurring interval is not allowed if recurring is false',
        );
      } else if (recurring_end) {
        throw new Error(
          'Reccuring end date is not allowed if recurring is false',
        );
      }
    }

    if (discount && !['nominal', 'percentage'].includes(discount_type)) {
      throw new Error(
        'Invalid discount type. Must be either "nominal" or "percentage"',
      );
    }

    if (tax && !['nominal', 'percentage'].includes(tax_type)) {
      throw new Error(
        'Invalid tax type. Must be either "nominal" or "percentage"',
      );
    }

    try {
      const invoice = await prisma.$transaction(async (prisma) => {
        const business = await prisma.business.findUnique({
          where: { user_id: userId },
          include: { Product: true },
        });

        if (!business) {
          throw new Error('Business not found');
        }

        const client = await prisma.client.findUnique({
          where: { id: client_id },
        });

        if (!client || client.business_id !== business.id) {
          throw new Error(
            'Client not found or does not belong to your business',
          );
        }

        const productIds = products.map((p) => p.product_id);

        const allProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            business_id: business.id,
          },
        });

        if (allProducts.length !== productIds.length) {
          throw new Error('One or more products are invalid');
        }

        const productPriceMap: Record<string, number> = {};
        allProducts.forEach((product) => {
          productPriceMap[product.id] = product.price;
        });

        let subtotal = 0;
        const itemsData = products.map((item) => {
          const price = productPriceMap[item.product_id];
          if (price === undefined) {
            throw new Error(
              `Price not found for product ID: ${item.product_id}`,
            );
          }

          const totalItemPrice = price * item.quantity;
          subtotal += totalItemPrice;

          return {
            product_id: item.product_id,
            quantity: item.quantity,
            price: price,
            total_price: totalItemPrice,
          };
        });

        let total_invoice_price = subtotal;

        let discount_value = 0;
        if (discount && discount_type === 'nominal') {
          discount_value = discount;
          total_invoice_price -= discount;
        } else if (discount && discount_type === 'percentage') {
          discount_value = Math.round((total_invoice_price * discount) / 100);
          total_invoice_price -= discount_value;
        }

        if (shipping_cost) {
          total_invoice_price += shipping_cost;
        }

        let tax_value = 0;
        if (tax && tax_type === 'nominal') {
          tax_value = tax;
          total_invoice_price += tax;
        } else if (tax && tax_type === 'percentage') {
          tax_value = Math.round((total_invoice_price * tax) / 100);
          total_invoice_price += tax_value;
        }

        const start = new Date(invoice_date);
        const dueDate = addDays(start, payment_terms);

        const createdInvoice = await prisma.invoice.create({
          data: {
            no_invoice: generateInvoice(),
            business_id: business.id,
            client_id: client.id,
            tax: tax,
            tax_type: tax_type,
            discount: discount,
            discount_type: discount_type,
            payment_method: payment_method,
            payment_terms: payment_terms,
            total_price: total_invoice_price,
            due_date: dueDate,
            status: 'pending',
            recurring: recurring,
            recurring_interval: recurring ? recurring_interval : null,
            shipping_cost: shipping_cost,
            invoice_date: new Date(invoice_date),
            recurring_end: recurring_end ? new Date(recurring_end) : null,
          },
          include: {
            business: true,
            InvoiceItem: true,
            RecurringInvoice: true,
            client: true,
          },
        });

        const invoiceItemsToCreate = itemsData.map((item) => ({
          invoice_id: createdInvoice.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total_price: item.total_price,
        }));

        await prisma.invoiceItem.createMany({
          data: invoiceItemsToCreate,
        });

        const recurringInvoice = createdInvoice.recurring
          ? await prisma.recurringInvoice.create({
              data: {
                invoice_id: createdInvoice.id,
                no_invoice: generateInvoice(),
                invoice_date: createdInvoice.invoice_date,
                total_price: createdInvoice.total_price,
                shipping_cost: createdInvoice.shipping_cost,
                discount_type: createdInvoice.discount_type as Value,
                discount: createdInvoice.discount,
                tax_type: createdInvoice.tax_type as Value,
                tax: createdInvoice.tax,
                status: 'pending',
                due_date: createdInvoice.due_date,
              },
            })
          : null;

        if (recurringInvoice) {
          await prisma.invoice.update({
            where: { id: createdInvoice.id },
            data: { idNowRecurring: recurringInvoice.id },
          });
        }

        return {
          createdInvoice,
          subtotal,
          discount_value,
          tax_value,
        };
      });

      const invoiceItems = await prisma.invoiceItem.findMany({
        where: { invoice_id: invoice.createdInvoice.id },
        include: { product: true },
      });

      const invoiceItemsData = invoiceItems.map((item) => ({
        quantity: item.quantity,
        price: formatCurrency(item.product.price),
        total: formatCurrency(item.total_price),
        name: item.product.name,
        description: item.product.description,
      }));

      let invNo = invoice.createdInvoice.no_invoice;
      let invDate = invoice.createdInvoice.invoice_date;
      let dueDate = invoice.createdInvoice.due_date;
      if (
        invoice.createdInvoice.recurring &&
        invoice.createdInvoice.idNowRecurring
      ) {
        const recurring = await prisma.recurringInvoice.findUnique({
          where: { id: invoice.createdInvoice.idNowRecurring },
        });

        if (recurring) {
          invNo = recurring.no_invoice;
          invDate = recurring.invoice_date;
          dueDate = recurring.due_date;
        }
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const invoiceDate = format(
        new Date(invoice.createdInvoice.invoice_date),
        'yyyy-MM-dd',
      );
      if (invoiceDate === today) {
        const emailData = {
          business_name: invoice.createdInvoice.business.name,
          business_address: invoice.createdInvoice.business.address,
          business_email: invoice.createdInvoice.business.email,
          business_phone: invoice.createdInvoice.business.phone,
          client_name: invoice.createdInvoice.client.name,
          client_address: invoice.createdInvoice.client.address,
          client_email: invoice.createdInvoice.client.email,
          had_phone: invoice.createdInvoice.client.phone
            ? invoice.createdInvoice.client.phone
            : false,
          client_phone: invoice.createdInvoice.client.phone,
          items: invoiceItemsData,
          subtotal: formatCurrency(invoice.subtotal),

          //if tax
          tax: invoice.createdInvoice.tax ? invoice.createdInvoice.tax : null,
          is_tax_percentage: invoice.createdInvoice.tax_type === 'percentage',
          tax_rate:
            invoice.createdInvoice.tax_type === 'percentage'
              ? invoice.createdInvoice.tax
              : null,
          tax_value: formatCurrency(invoice.tax_value),
          tax_amount: invoice.createdInvoice.tax
            ? formatCurrency(invoice.createdInvoice.tax)
            : null,

          //if disc
          discount: invoice.createdInvoice.discount
            ? invoice.createdInvoice.discount
            : null,
          is_discount_percentage:
            invoice.createdInvoice.discount_type === 'percentage',
          discount_rate:
            invoice.createdInvoice.discount_type === 'percentage'
              ? invoice.createdInvoice.discount
              : null,
          discount_value: formatCurrency(invoice.discount_value),
          discount_amount: invoice.createdInvoice.discount
            ? formatCurrency(invoice.createdInvoice.discount)
            : null,

          //if shipping
          shipping_cost: invoice.createdInvoice.shipping_cost
            ? formatCurrency(invoice.createdInvoice.shipping_cost)
            : null,
          total_amount_due: formatCurrency(invoice.createdInvoice.total_price),

          //payment
          business_bank_account: invoice.createdInvoice.business.bank_account,
          business_bank: invoice.createdInvoice.business.bank,

          //invoice
          invoice_no: invNo,
          invoice_date: formatDate(invDate),
          due_date: formatDate(dueDate),
        };

        const templatePath = path.join(__dirname, '../templates/inv.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const template = handlebars.compile(htmlTemplate);
        const htmlToSend = template(emailData);

        const pdfBuffer = await this.generatePdfFromHtml(htmlToSend);

        const sendEmail = await transporter.sendMail({
          to: emailData.client_email,
          subject: `Your Invoice from ${emailData.business_name}`,
          html: htmlToSend,
          attachments: [
            {
              filename: `invoice-${invoice.createdInvoice.no_invoice}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        const update = await prisma.invoice.update({
          where: { id: invoice.createdInvoice.id },
          data: { status: 'unpaid', sendAt: new Date() },
        });

        if (
          invoice.createdInvoice.recurring &&
          invoice.createdInvoice.idNowRecurring
        ) {
          await prisma.recurringInvoice.update({
            where: { id: invoice.createdInvoice.idNowRecurring },
            data: { status: 'unpaid', sendAt: new Date() },
          });
        }
      }

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBufferUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdfBufferUint8Array);

    return pdfBuffer;
  }
}

export default new InvoiceService();
