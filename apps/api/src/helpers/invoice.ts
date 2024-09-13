import { format } from 'date-fns';

export const generateInvoice = (): string => {
  const timestamp = new Date().getTime().toString(36).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}${randomChars}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd MMMM yyyy');
};
