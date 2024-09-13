import { BusinessController } from '@/controllers/business.controller';
import { UserController } from '@/controllers/user.controller';
import { blobUploader } from '@/libs/multer';
import {
  validateRefreshToken,
  validateToken,
} from '@/middlewares/auth.middleware';
import { isVerified } from '@/middlewares/verified.middleware';
import { Router } from 'express';

export class BusinessRouter {
  private router: Router;
  private businessController: BusinessController;

  constructor() {
    this.businessController = new BusinessController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/c',
      validateToken,
      isVerified,
      blobUploader().single('logo'),
      this.businessController.createBusiness,
    );
    this.router.patch(
      '/e/:businessId',
      validateToken,
      isVerified,
      blobUploader().single('logo'),
      this.businessController.updateBusiness,
    );
    this.router.get('/s', validateToken, this.businessController.userBusiness);
    this.router.get('/logo/:businessId', this.businessController.renderLogo);
  }

  getRouter(): Router {
    return this.router;
  }
}
