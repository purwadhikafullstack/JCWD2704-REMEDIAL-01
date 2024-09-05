export const generateInvoice = (): string => {
  const timestamp = new Date().getTime().toString(36).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}${randomChars}`;
};
