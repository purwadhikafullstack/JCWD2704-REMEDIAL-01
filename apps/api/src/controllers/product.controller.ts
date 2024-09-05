import productService from '@/services/product.service';
import { NextFunction, Request, Response } from 'express';

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.create(req);
      res.status(201).send({
        message: 'New product created',
      });
    } catch (error) {
      next(error);
    }
  }

  async allProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await productService.allProduct(req);
      res.status(201).send({
        message: 'Fetch user product',
        data: business.products,
        paginations: business.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async detailProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const detail = await productService.productDetail(req);
      res.status(201).send({
        message: 'fetch product detail',
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.update(req);
      res.status(201).send({
        message: 'product updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req);
      res.status(201).send({
        message: 'product deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}
