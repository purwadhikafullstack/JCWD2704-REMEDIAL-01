import clientService from '@/services/client.service';
import { NextFunction, Request, Response } from 'express';

export class ClientController {
  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      await clientService.create(req);
      res.status(201).send({
        message: 'New client created',
      });
    } catch (error) {
      next(error);
    }
  }

  async allClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.allClient(req);
      res.status(201).send({
        message: 'Fetch user client',
        data: client.clients,
        paginations: client.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async detailClient(req: Request, res: Response, next: NextFunction) {
    try {
      const detail = await clientService.clientDetail(req);
      res.status(201).send({
        message: 'fetch client detail',
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      await clientService.update(req);
      res.status(201).send({
        message: 'client updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      await clientService.delete(req);
      res.status(201).send({
        message: 'client deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}
