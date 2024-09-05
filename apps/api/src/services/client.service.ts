import { TClient } from '@/models/client.model';
import prisma from '@/prisma';
import { $Enums, Payment, Prisma } from '@prisma/client';
import { Request } from 'express';
import sharp from 'sharp';

class ClientService {
  async create(req: Request) {
    const userId = req.user.id;
    const { name, phone, email, address, payment_preference } =
      req.body as TClient;

    const business = await prisma.business.findUnique({
      where: { user_id: userId },
    });

    if (!business) throw new Error('business not found');

    const validPaymentPreference = payment_preference || null;

    if (validPaymentPreference) {
      if (
        validPaymentPreference !== 'debit' &&
        validPaymentPreference !== 'credit' &&
        validPaymentPreference !== 'bank_transfer'
      ) {
        throw new Error('Invalid payment preference');
      }
    }

    const client = await prisma.client.create({
      data: {
        business_id: business.id,
        name: name,
        email: email,
        phone: phone || null,
        payment_preference: payment_preference,
        address: address,
      },
    });

    return client;
  }

  async allClient(req: Request) {
    const userId = req.user.id;
    const { search, payment, sort } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    let filtering: any = {};

    if (search) {
      filtering.OR = [
        { name: { contains: search as string } },
        {
          phone: { contains: search as string },
        },
        {
          email: { contains: search as string },
        },
      ];
    }

    if (payment) {
      filtering.payment_preference = payment as Payment;
    }

    const skip = (page - 1) * limit;

    let orderBy: any = {};

    if (sort === 'desc' || sort === 'asc') {
      orderBy.createdAt = sort === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const totalItems = await prisma.client.count({
      where: {
        business: { user_id: userId },
        deletedAt: null,
        ...filtering,
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    const clients = await prisma.client.findMany({
      where: {
        business: { user_id: userId },
        deletedAt: null,
        ...filtering,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        payment_preference: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        address: true,
      },
      orderBy: orderBy,
      skip: skip,
      take: limit,
    });

    return {
      clients: clients,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
      },
    };
  }

  async clientDetail(req: Request) {
    const userId = req.user.id;
    const { clientId } = req.params;

    const detail = await prisma.client.findUnique({
      where: { id: clientId, business: { user_id: userId } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        payment_preference: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        address: true,
      },
    });

    return detail;
  }

  async update(req: Request) {
    const userId = req.user.id;
    const { clientId } = req.params;
    const { name, phone, email, address, payment_preference } =
      req.body as TClient;

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        business: { user_id: userId },
      },
    });

    if (!client) throw new Error('product not found');

    const updatedData: Prisma.ClientUpdateInput = {};

    if (name !== undefined) {
      updatedData.name = name;
    }

    if (phone !== undefined) {
      updatedData.phone = phone;
    }

    if (email !== undefined) {
      updatedData.email = email;
    }

    if (phone !== undefined) {
      updatedData.phone = phone;
    }

    if (address !== undefined) {
      updatedData.address = address;
    }

    if (payment_preference !== undefined) {
      updatedData.payment_preference = payment_preference;
    }

    const updateClient = await prisma.client.update({
      where: { id: client.id },
      data: updatedData,
    });

    return updateClient;
  }

  async delete(req: Request) {
    const userId = req.user.id;
    const { clientId } = req.params;

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        business: { user_id: userId },
      },
    });

    if (!client) throw new Error('Client not found');

    const softDeletedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        deletedAt: new Date(),
      },
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        client_id: client.id,
        status: {
          notIn: ['expired', 'paid', 'cancelled'],
        },
      },
    });

    for (const invoice of invoices) {
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

    return softDeletedClient;
  }
}

export default new ClientService();
