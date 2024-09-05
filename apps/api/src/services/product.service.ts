import { TProduct } from '@/models/product.model';
import prisma from '@/prisma';
import { Prisma, Type } from '@prisma/client';
import { Request } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

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
    const { name, type, sort } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    let filtering: any = {};

    if (name) {
      filtering.name = { contains: name as string };
    }

    if (type) {
      filtering.type = type as Type;
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
      where: { business: { user_id: userId }, ...filtering, deletedAt: null },
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

    const softDeletedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        deletedAt: new Date(),
      },
    });

    const invoiceItems = await prisma.invoiceItem.findMany({
      where: {
        product_id: product.id,
        invoice: {
          status: {
            notIn: ['expired', 'paid', 'cancelled'],
          },
          business_id: product.business_id,
        },
      },
      include: {
        invoice: { include: { client: true } },
      },
    });

    for (const item of invoiceItems) {
      const { invoice } = item;

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      if (invoice.recurring && invoice.idNowRecurring) {
        await prisma.recurringInvoice.update({
          where: { id: invoice.idNowRecurring },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        });
      }
    }

    return softDeletedProduct;
  }
}

export default new ProductService();
