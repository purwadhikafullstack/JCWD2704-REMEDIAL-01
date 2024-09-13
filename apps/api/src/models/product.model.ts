import { Type } from '@prisma/client';

export type TProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  type: Type;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};
