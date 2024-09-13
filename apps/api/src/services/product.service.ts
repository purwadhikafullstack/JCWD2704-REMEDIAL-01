import { TProduct } from '@/models/product.model';
import prisma from '@/prisma';
import { Prisma, Type } from '@prisma/client';
import { Request } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { transporter } from '@/libs/nodemiler';

class ProductService {
  async create(req: Request) {
    const userId = req.user.id;
    const { name, price, description, type } = req.body as TProduct;

    const business = await prisma.business.findUnique({
      where: { user_id: userId },
    });

    if (!business) throw new Error('business not found');
    if (type !== 'goods' && type !== 'service')
      throw new Error('wrong type input ');

    const product = await prisma.product.create({
      data: {
        business_id: business.id,
        name: name,
        price: price,
        description: description,
        type: type,
      },
    });

    return product;
  }

  async allProduct(req: Request) {
    const userId = req.user.id;
    const { name, type, sort, deleted } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    let filtering: any = {};

    if (name) {
      filtering.name = { contains: name as string };
    }

    if (type) {
      filtering.type = type as Type;
    }

    if (typeof deleted === 'string') {
      if (deleted === 'yes') {
        filtering.deletedAt = { not: null };
      } else if (deleted === 'no') {
        filtering.deletedAt = null;
      }
    } else {
      filtering.deletedAt = null;
    }

    const skip = (page - 1) * limit;

    let orderBy: any = {};

    if (sort === 'desc' || sort === 'asc') {
      orderBy.createdAt = sort === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const totalItems = await prisma.product.count({
      where: { business: { user_id: userId }, ...filtering },
    });

    const totalPages = Math.ceil(totalItems / limit);

    const products = await prisma.product.findMany({
      where: { business: { user_id: userId }, ...filtering },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        type: true,
      },
      orderBy: orderBy,
      skip: skip,
      take: limit,
    });

    return {
      products: products,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
      },
    };
  }

  async productDetail(req: Request) {
    const userId = req.user.id;
    const { productId } = req.params;

    const detail = await prisma.product.findUnique({
      where: { id: productId, business: { user_id: userId } },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        deletedAt: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return detail;
  }

  async update(req: Request) {
    const userId = req.user.id;
    const { productId } = req.params;
    const { name, price, description } = req.body as TProduct;
    const file = req.file;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        business: { user_id: userId },
      },
    });

    if (!product) throw new Error('product not found');

    const updatedData: Prisma.ProductUpdateInput = {};

    if (name !== undefined) {
      updatedData.name = name;
    }

    if (price !== undefined) {
      updatedData.price = price;
    }

    if (description !== undefined) {
      updatedData.description = description;
    }
    const updateProduct = await prisma.product.update({
      where: { id: product.id },
      data: updatedData,
    });

    return updateProduct;
  }

  async delete(req: Request) {
    const userId = req.user.id;
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        business: { user_id: userId },
      },
      include: { business: true },
    });

    if (!product) throw new Error('Product not found');

    const invoiceItems = await prisma.invoiceItem.findMany({
      where: {
        product_id: product.id,
        invoice: {
          status: 'pending',
          business_id: product.business_id,
        },
      },
      include: {
        invoice: { include: { client: true, business: true } },
      },
    });

    if (invoiceItems.length === 0) {
      const softDeletedProduct = await prisma.product.update({
        where: { id: product.id },
        data: {
          deletedAt: new Date(),
        },
      });

      return softDeletedProduct;
    }

    for (const item of invoiceItems) {
      const { invoice } = item;

      if (invoice.recurring && invoice.idNowRecurring) {
        const recurringInvoice = await prisma.recurringInvoice.findUnique({
          where: { id: invoice.idNowRecurring },
        });

        if (recurringInvoice?.status === 'pending') {
          await prisma.recurringInvoice.update({
            where: { id: invoice.idNowRecurring },
            data: {
              status: 'cancelled',
              cancelledAt: new Date(),
            },
          });

          const emailData = {
            client_name: invoice.client.name,
            invoice_no: recurringInvoice.no_invoice,
            is_stopped_due_to_product: true,
            productName: product.name,
            business_name: invoice.business.name,
            business_email: invoice.business.email,
            business_address: invoice.business.address,
            business_phone: invoice.business.phone,
          };

          const templatePath = path.join(
            __dirname,
            '../templates/stopRecurring.html',
          );
          const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
          const template = handlebars.compile(htmlTemplate);
          const htmlToSend = template(emailData);

          await transporter.sendMail({
            to: invoice.client.email,
            subject: `Recurring Invoice Cancelled from ${emailData.business_name}`,
            html: htmlToSend,
          });
        }
      }

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });
    }

    const softDeletedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return softDeletedProduct;
  }

  async productInv(req: Request) {
    const userId = req.user.id;
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        business: { user_id: userId },
      },
      include: { business: true },
    });

    if (!product) throw new Error('Product not found');

    const productInv = await prisma.invoiceItem.findMany({
      where: {
        product_id: product.id,
        invoice: {
          status: 'pending',
          business_id: product.business_id,
        },
      },
      include: {
        invoice: { include: { client: true, business: true } },
      },
    });

    return productInv;
  }
}

export default new ProductService();
