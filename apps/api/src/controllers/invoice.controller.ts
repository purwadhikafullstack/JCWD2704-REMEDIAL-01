import dataInvService from '@/services/dataInv.service';
import dataService from '@/services/dataInv.service';
import invoiceService from '@/services/invoice.service';
import invoiceUpdateService from '@/services/invoiceUpdate.service';
import { NextFunction, Request, Response } from 'express';

export class InvoiceController {
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceService.create(req);
      res.status(201).send({
        message: 'New invoice created',
      });
    } catch (error) {
      next(error);
    }
  }

  async allInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await dataInvService.allInvoice(req);
      res.status(201).send({
        message: 'Fetch user invoice',
        data: invoice.invoices,
        paginations: invoice.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async allRecurring(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await dataInvService.recurring(req);
      res.status(201).send({
        message: 'Fetch recurring for selected invoice',
        data: invoice.invoices,
        paginations: invoice.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async detailInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const detail = await dataInvService.invoiceDetail(req);
      res.status(201).send({
        message: 'fetch invoice detail',
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }

  async detailRecurring(req: Request, res: Response, next: NextFunction) {
    try {
      const detail = await dataInvService.recurringDetail(req);
      res.status(201).send({
        message: 'fetch invoice recurring detail',
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }

  async paidInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceUpdateService.updateStatus(req);
      res.status(201).send({
        message: 'invoice is paid',
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceUpdateService.cancelInvoice(req);
      res.status(201).send({
        message: 'invoice updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceUpdateService.delete(req);
      res.status(201).send({
        message: 'invoice deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}
