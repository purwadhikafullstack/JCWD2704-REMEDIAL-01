import { TBusiness } from './business.model';
import { TClient } from './client.model';
import { TProduct } from './product.model';

export type TInvoice = {
  id: string;
  no_invoice: string;
  invoice_date: Date;
  tax?: number;
  tax_type: string;
  discount?: number;
  shipping_cost?: number;
  total_price: number;
  payment_method: string;
  payment_terms: number;
  due_date: Date;
  discount_type: string;
  recurring: boolean;
  recurring_interval: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  sendAt?: Date;
  deletedAt?: Date;
  client: TClient;
  business: TBusiness;
  InvoiceItem: [TInvoiceItem];
  paidAt: Date;
  cancelledAt?: Date;
  unpaidAt: Date;
  RecurringInvoice: [TRecurring];
  recurring_end: Date;
};

export type TInvoiceItem = {
  id: string;
  product: TProduct;
  quantity: number;
  total_price: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TRecurring = {
  id: string;
  invoice_id: string;
  no_invoice: string;
  invoice_date: Date;
  total_price: number;
  shipping_cost?: number;
  discount_type?: string;
  discount: number;
  tax_type?: string;
  tax?: number;
  status: string;
  due_date: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  cancelledAt?: Date;
  sendAt?: Date;
};
