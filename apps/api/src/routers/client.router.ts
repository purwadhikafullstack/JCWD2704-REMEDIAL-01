import { BusinessController } from '@/controllers/business.controller';
import { ClientController } from '@/controllers/client.controller';
import { UserController } from '@/controllers/user.controller';
import { blobUploader } from '@/libs/multer';
import {
  validateRefreshToken,
  validateToken,
} from '@/middlewares/auth.middleware';
import { isVerified } from '@/middlewares/verified.middleware';
import { Router } from 'express';

export class ClientRouter {
  private router: Router;
  private clientController: ClientController;

  constructor() {
    this.clientController = new ClientController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/c',
      validateToken,
      isVerified,
      blobUploader().single('image'),
      this.clientController.createClient,
    );
    this.router.patch(
      '/e/:clientId',
      validateToken,
      isVerified,
      this.clientController.updateClient,
    );
    this.router.delete(
      '/d/:clientId',
      validateToken,
      isVerified,
      this.clientController.deleteClient,
    );
    this.router.get('/all', validateToken, this.clientController.allClient);
    this.router.get(
      '/:clientId',
      validateToken,
      this.clientController.detailClient,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
