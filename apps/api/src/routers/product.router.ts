import { BusinessController } from '@/controllers/business.controller';
import { ProductController } from '@/controllers/product.controller';
import { UserController } from '@/controllers/user.controller';
import { blobUploader } from '@/libs/multer';
import {
  validateRefreshToken,
  validateToken,
} from '@/middlewares/auth.middleware';
import { Router } from 'express';

export class ProductRouter {
  private router: Router;
  private productController: ProductController;

  constructor() {
    this.productController = new ProductController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/c',
      validateToken,
      blobUploader().single('image'),
      this.productController.createProduct,
    );
    this.router.patch(
      '/e/:productId',
      validateToken,
      blobUploader().single('image'),
      this.productController.updateProduct,
    );
    this.router.delete(
      '/d/:productId',
      validateToken,
      this.productController.deleteProduct,
    );
    this.router.get('/all', validateToken, this.productController.allProduct);
    this.router.get(
      '/:productId',
      validateToken,
      this.productController.detailProduct,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
