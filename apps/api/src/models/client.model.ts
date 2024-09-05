import { Payment } from '@prisma/client';

export type TClient = {
  id: string;
  email: string;
  phone?: string | null;
  name: string;
  payment_preference?: Payment | null;
  address?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};
