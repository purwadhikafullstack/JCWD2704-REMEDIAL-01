import { UserController } from '@/controllers/user.controller';
import { blobUploader } from '@/libs/multer';
import {
  validateRefreshToken,
  validateToken,
} from '@/middlewares/auth.middleware';
import { Router } from 'express';

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/v1', this.userController.signUp);
    this.router.patch('/v2', this.userController.finalizeSignUp);
    this.router.post('/v3', this.userController.login);
    this.router.get(
      '/v4',
      validateRefreshToken,
      this.userController.validateUser,
    );
    this.router.post('/forgotPassword', this.userController.forgotPassword);
    this.router.patch('/resetPassword', this.userController.resetPassword);
    this.router.patch(
      '/editProfile',
      validateToken,
      blobUploader().single('image'),
      this.userController.editUserProfile,
    );
    this.router.get('/reverify/:token', this.userController.reverifyEmail);
    this.router.get('/image/:userId', this.userController.renderProfile);
  }

  getRouter(): Router {
    return this.router;
  }
}
