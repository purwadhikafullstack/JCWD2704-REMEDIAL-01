import { BusinessController } from '@/controllers/business.controller';
import { ClientController } from '@/controllers/client.controller';
import { UserController } from '@/controllers/user.controller';
import { blobUploader } from '@/libs/multer';
import {
  validateRefreshToken,
  validateToken,
} from '@/middlewares/auth.middleware';
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
      blobUploader().single('image'),
      this.clientController.createClient,
    );
    this.router.patch(
      '/e/:clientId',
      validateToken,
      this.clientController.updateClient,
    );
    this.router.delete(
      '/d/:clientId',
      validateToken,
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
