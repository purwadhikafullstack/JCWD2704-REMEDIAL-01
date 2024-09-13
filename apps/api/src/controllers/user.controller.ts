import userServices from '@/services/user.services';
import { NextFunction, Request, Response } from 'express';

export class UserController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      await userServices.signUp(req);
      res.status(201).send({
        message: 'New user has been registered',
      });
    } catch (error) {
      next(error);
    }
  }

  async finalizeSignUp(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = await userServices.finalizeSignUp(req);
      res.status(201).send({
        message: 'Verification of user account registration is successful',
        userData,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await userServices.login(req);

      res
        .cookie('access_token', accessToken, {
          secure: false,
          domain: 'localhost',
          sameSite: 'strict',
        })
        .cookie('refresh_token', refreshToken, {
          secure: false,
          domain: 'localhost',
          sameSite: 'strict',
        })
        .send({
          message: 'Login successful',
        });
    } catch (error) {
      next(error);
    }
  }

  async validateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const access_token = await userServices.validate(req);
      res.send({
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await userServices.forgotPassword(req);
      res.status(201).send({
        message: 'Email has been send to reset your password',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await userServices.resetPassword(req);
      res.status(201).send({
        message: 'Password has been reset',
      });
    } catch (error) {
      next(error);
    }
  }

  async editUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userServices.editProfile(req);

      res.cookie('access_token', result.token, {
        secure: false,
        domain: 'localhost',
        sameSite: 'strict',
      });
      res.status(200).json({
        message: 'User profile data has been updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async reverifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userServices.reverifyEmail(req);

      res.cookie('access_token', result.token, {
        secure: false,
        domain: 'localhost',
        sameSite: 'strict',
      });
      res.status(200).json({
        message: 'User email has been verified',
      });
    } catch (error) {
      // if (error instanceof Error) {
      //   if (
      //     error.message === 'Token is required' ||
      //     error.message === 'Invalid or expired token'
      //   ) {
      //     res.status(400).json({ message: error.message });
      //   } else {
      //     res.status(500).json({ message: error.message });
      //   }
      // } else {
      //   res.status(500).json({ message: 'Unknown error occurred' });
      // }
      next(error);
    }
  }

  async resendEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await userServices.resendVerification(req);

      if (result.message === 'Internal server error') {
        res.status(500).send({ message: result.message });
      } else {
        res
          .status(200)
          .send({ message: result.message, email: result.email || '' });
      }
    } catch (error) {
      next(error);
    }
  }

  async sendVerif(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userServices.sendVerification(req);

      if (result) {
        res.status(200).json({
          is_verified: result.is_verified,
          message: result.message,
          user: result.user,
        });
      } else {
        res.status(400).send({ message: 'Verification failed' });
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyTokenUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userServices.verifyTokenUser(req);

      if (result) {
        res.status(200).json({
          result,
        });
      } else {
        res.status(400).send({ message: 'Verification failed' });
      }
    } catch (error) {
      next(error);
    }
  }

  async resendReverify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userServices.resendReverify(req);

      if (result.message === 'Internal server error') {
        res.status(500).send({ message: result.message });
      } else {
        res
          .status(200)
          .send({ message: result.message, email: result.email || '' });
      }
    } catch (error) {
      next(error);
    }
  }

  async renderProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const blob = await userServices.render(req);
      res.set('Content-type', 'image/png');
      res.send(blob);
    } catch (error) {
      next(error);
    }
  }
}
