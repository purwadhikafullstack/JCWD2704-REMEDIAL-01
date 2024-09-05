export const formatPrice = (price: number): string => {
  return `Rp ${price.toLocaleString('id-ID')}`;
};

export const formatPrice2 = (price: number): string => {
  return `${price.toLocaleString('id-ID')}`;
};

export const inputRupiah = (value: string) => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api/';

export const profileSrc = `${baseUrl}users/image/`;
export const logoSrc = `${baseUrl}businesses/logo/`;
