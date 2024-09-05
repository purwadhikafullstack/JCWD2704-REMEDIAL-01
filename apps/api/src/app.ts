import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import { UserRouter } from './routers/user.router';
import { corsOptions } from './config/config';
import { BusinessRouter } from './routers/business.router';
import { ClientRouter } from './routers/client.router';
import { ProductRouter } from './routers/product.router';
import { InvoiceRouter } from './routers/invoice.router';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors(corsOptions));
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    this.app.use(
      (error: unknown, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof Error)
          res.status(500).send({
            message: error.message,
          });
      },
    );
  }

  private routes(): void {
    const userRouter = new UserRouter();
    const businessRouter = new BusinessRouter();
    const productRouter = new ProductRouter();
    const clientRouter = new ClientRouter();
    const invoiceRouter = new InvoiceRouter();

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });

    this.app.use('/api/users', userRouter.getRouter());
    this.app.use('/api/businesses', businessRouter.getRouter());
    this.app.use('/api/products', productRouter.getRouter());
    this.app.use('/api/clients', clientRouter.getRouter());
    this.app.use('/api/invoices', invoiceRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
