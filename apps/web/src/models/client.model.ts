export type TClient = {
  id: string;
  email: string;
  phone?: string;
  name: string;
  payment_preference?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export interface Client {
  id: string;
  name: string;
  email: string;
  payment_preference: string;
}
