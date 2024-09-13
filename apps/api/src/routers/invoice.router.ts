import { BusinessController } from '@/controllers/business.controller';
import { InvoiceController } from '@/controllers/invoice.controller';
import { UserController } from '@/controllers/user.controller';
import { blobUploader } from '@/libs/multer';
import {
  validateRefreshToken,
  validateToken,
} from '@/middlewares/auth.middleware';
import { isVerified } from '@/middlewares/verified.middleware';
import { Router } from 'express';

export class InvoiceRouter {
  private router: Router;
  private invoiceController: InvoiceController;

  constructor() {
    this.invoiceController = new InvoiceController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/c',
      validateToken,
      isVerified,
      this.invoiceController.createInvoice,
    );
    this.router.get('/all', validateToken, this.invoiceController.allInvoice);
    this.router.get(
      '/rec/:invoiceId',
      validateToken,
      this.invoiceController.allRecurring,
    );
    this.router.patch(
      '/p/:invoiceId',
      validateToken,
      isVerified,
      this.invoiceController.paidInvoice,
    );
    this.router.patch(
      '/ci/:invoiceId',
      validateToken,
      isVerified,
      this.invoiceController.cancelInvoice,
    );
    this.router.delete(
      '/d/:invoiceId',
      validateToken,
      isVerified,
      this.invoiceController.deleteInvoice,
    );
    this.router.get(
      '/recdet/:invoiceId',
      validateToken,
      this.invoiceController.detailRecurring,
    );
    this.router.get(
      '/:invoiceId',
      validateToken,
      this.invoiceController.detailInvoice,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
