import businessServices from '@/services/business.services';
import { NextFunction, Request, Response } from 'express';

export class BusinessController {
  async createBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      await businessServices.create(req);
      res.status(201).send({
        message: 'New business created',
      });
    } catch (error) {
      next(error);
    }
  }

  async userBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await businessServices.business(req);
      res.status(201).send({
        message: 'Fetch user business',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      await businessServices.update(req);
      res.status(201).send({
        message: 'business updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async renderLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const blob = await businessServices.render(req);
      res.set('Content-type', 'image/png');
      res.send(blob);
    } catch (error) {
      next(error);
    }
  }
}
