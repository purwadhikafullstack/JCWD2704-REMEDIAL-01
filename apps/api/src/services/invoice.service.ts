import prisma from '@/prisma';
import { Request } from 'express';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import { transporter } from '@/libs/nodemiler';
import { generateInvoice } from '@/helpers/invoice';
import { CreateInvoiceInput } from '@/models/invoice.model';
import { Value } from '@prisma/client';
import { addDays } from 'date-fns';

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
      throw new Error('Missing required fields woy');
    }

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Products must be a non-empty array');
    }

    if (recurring) {
      if (typeof recurring_interval !== 'number' || recurring_interval <= 0) {
        throw new Error('Recurring interval must be a positive number');
      } else if (!recurring_end) {
        throw new Error('Reccuring end date must provided');
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

        if (discount && discount_type === 'nominal') {
          total_invoice_price -= discount;
        } else if (discount && discount_type === 'percentage') {
          total_invoice_price -= (total_invoice_price * discount) / 100;
        }

        if (shipping_cost) {
          total_invoice_price += shipping_cost;
        }

        if (tax && tax_type === 'nominal') {
          total_invoice_price += tax;
        } else if (tax && tax_type === 'percentage') {
          total_invoice_price += (total_invoice_price * tax) / 100;
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

        const invoiceItems = await prisma.invoiceItem.findMany({
          where: { invoice_id: createdInvoice.id },
          include: { product: true },
        });

        const invoiceItemsData = invoiceItems.map((item) => ({
          quantity: item.quantity,
          price: item.product.price,
          total: item.total_price,
          name: item.product.name,
        }));

        const today = new Date().toISOString().split('T')[0];
        const invoiceDate = new Date(invoice_date).toISOString().split('T')[0];

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

        if (invoiceDate === today) {
          const emailData = {
            business_name: business.name,
            business_address: business.address,
            business_email: business.email,
            business_phone: business.phone,
            client_name: client.name,
            client_address: client.address,
            client_email: client.email,
            client_phone: client.phone,
            items: invoiceItemsData,
            subtotal: subtotal,
            tax_amount: createdInvoice.tax ? createdInvoice.tax : null,
            is_tax_percentage: createdInvoice.tax_type === 'percentage',
            tax_rate:
              createdInvoice.tax_type === 'percentage'
                ? createdInvoice.tax
                : null,
            discount_amount: createdInvoice.discount
              ? createdInvoice.discount
              : null,
            is_discount_percentage:
              createdInvoice.discount_type === 'percentage',
            discount:
              createdInvoice.discount_type === 'percentage'
                ? createdInvoice.discount
                : null,
            shipping_cost: createdInvoice.shipping_cost
              ? createdInvoice.shipping_cost
              : null,
            total_amount_due: createdInvoice.total_price,
          };

          const templatePath = path.join(__dirname, '../templates/inv.html');
          const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

          const template = handlebars.compile(htmlTemplate);
          const htmlToSend = template(emailData);

          const sendEmail = await transporter.sendMail({
            to: emailData.client_email,
            subject: `Your Invoice from ${emailData.business_name}`,
            html: htmlToSend,
          });

          const update = await prisma.invoice.update({
            where: { id: createdInvoice.id },
            data: { status: 'unpaid' },
          });

          if (recurringInvoice) {
            await prisma.recurringInvoice.update({
              where: { id: recurringInvoice.id },
              data: { status: 'unpaid' },
            });
          }
        }

        return createdInvoice;
      });

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }
}

export default new InvoiceService();
