import { Payment, Value } from '@prisma/client';

export type TInvoice = {
  id: string;
  tax: number;
  shipping_cost: number;
  tax_type: Value;
  discount: number;
  discount_type: Value;
  total: number;
  invoice_date: Date;
};

export interface InvoiceItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateInvoiceInput {
  client_id: string;
  products: InvoiceItemInput[];
  tax: number;
  discount: number;
  shipping_cost: number;
  payment_method: Payment;
  payment_terms: number;
  expiration_days: number;
  discount_type: Value;
  tax_type: Value;
  recurring: boolean;
  recurring_interval: number;
  due_date: Date;
  invoice_date: Date;
  recurring_end: Date;
}
