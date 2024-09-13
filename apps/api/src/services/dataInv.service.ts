import prisma from '@/prisma';
import { Payment, Prisma, Status } from '@prisma/client';
import { Request } from 'express';

class DataInvService {
  async allInvoice(req: Request) {
    const userId = req.user.id;
    const {
      search,
      payment,
      status,
      recurring,
      sort,
      startDate,
      endDate,
      byDate,
    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    let filtering: any = {};

    if (search) {
      const searchTerm = search as string;
      filtering.OR = [
        { no_invoice: { contains: searchTerm } },
        { client: { name: { contains: searchTerm } } },
        { client: { email: { contains: searchTerm } } },
      ];
    }

    if (payment) {
      filtering.payment_preference = payment as Payment;
    }

    if (status) {
      filtering.status = status as Status;
    }

    if (typeof recurring === 'string') {
      if (recurring === 'yes') {
        filtering.recurring = true;
      } else if (recurring === 'no') {
        filtering.recurring = false;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (byDate === 'yes' && startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        throw new Error('start date must be before end date');
      }

      if (start.getTime() === end.getTime()) {
        filtering.invoice_date = {
          gte: start,
          lte: end,
        };
      } else {
        filtering.invoice_date = {
          gte: start,
          lte: end,
        };
      }
    }

    const skip = (page - 1) * limit;

    let orderBy: any = {};
    if (sort === 'desc' || sort === 'asc') {
      orderBy.createdAt = sort === 'desc' ? 'desc' : 'asc';
    } else if (sort === 'descStart' || sort === 'ascStart') {
      orderBy.invoice_date = sort === 'descStart' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const totalItems = await prisma.invoice.count({
      where: {
        business: { user_id: userId },
        deletedAt: null,
        ...filtering,
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    const invoices = await prisma.invoice.findMany({
      where: {
        business: { user_id: userId },
        deletedAt: null,
        ...filtering,
      },
      select: {
        id: true,
        no_invoice: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        total_price: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        payment_method: true,
        shipping_cost: true,
        tax: true,
        discount: true,
        recurring: true,
        recurring_interval: true,
        invoice_date: true,
        recurring_end: true,
        due_date: true,
      },
      orderBy: orderBy,
      skip: skip,
      take: limit,
    });

    return {
      invoices: invoices,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
      },
    };
  }

  async invoiceDetail(req: Request) {
    const userId = req.user.id;
    const { invoiceId } = req.params;

    const detail = await prisma.invoice.findUnique({
      where: { id: invoiceId, business: { user_id: userId } },
      include: {
        InvoiceItem: { include: { product: true } },
        client: true,
        business: true,
      },
    });

    return detail;
  }

  async recurring(req: Request) {
    const userId = req.user.id;
    const { invoiceId } = req.params;
    const { search, payment, status, sort } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 7;

    let filtering: any = {};

    if (search) {
      filtering.no_invoice = {
        contains: search as string,
      };
    }

    if (payment) {
      filtering.payment_preference = payment as Payment;
    }

    if (status) {
      filtering.status = status as Status;
    }

    const skip = (page - 1) * limit;

    let orderBy: any = {};
    if (sort === 'desc' || sort === 'asc') {
      orderBy.createdAt = sort === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const totalItems = await prisma.recurringInvoice.count({
      where: {
        invoice_id: invoiceId,
        ...filtering,
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    const recurringInvoices = await prisma.recurringInvoice.findMany({
      where: {
        ...filtering,
        invoice_id: invoiceId,
        invoice: { business: { user_id: userId } },
      },
      include: {
        invoice: { include: { client: true } },
      },
      orderBy: orderBy,
      skip: skip,
      take: limit,
    });

    if (!recurringInvoices) throw new Error('user not permited');

    return {
      invoices: recurringInvoices,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
      },
    };
  }

  async recurringDetail(req: Request) {
    const userId = req.user.id;
    const { invoiceId } = req.params;

    const detail = await prisma.recurringInvoice.findUnique({
      where: { id: invoiceId, invoice: { business: { user_id: userId } } },
      include: {
        invoice: {
          include: {
            InvoiceItem: { include: { product: true } },
            client: true,
            business: true,
          },
        },
      },
    });

    if (!detail) throw new Error('recurring item not found');

    return detail;
  }
}

export default new DataInvService();
