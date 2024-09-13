import exp from 'constants';

export type TProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}
