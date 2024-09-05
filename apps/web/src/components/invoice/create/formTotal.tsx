'use client';
import { ChangeEvent, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { Product } from '@/models/product.model';
import { formatPrice, inputRupiah } from '@/helpers/format';
import { axiosInstance } from '@/libs/axios';
import { useDebounce } from 'use-debounce';

interface ProductListProps {
  formik: any;
  selectedProducts: { product_id: string; quantity: number; price?: number }[];
  productData: Product[];
}

const FormTotal: React.FC<ProductListProps> = ({
  formik,
  selectedProducts,
  productData,
}) => {
  const [formattedPrice, setFormattedPrice] = useState('');
  const [formattedTax, setFormattedTax] = useState('');
  const [formattedDisc, setFormattedDisc] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    const cost = numericValue ? parseFloat(numericValue) : '';
    const formattedValue = numericValue ? inputRupiah(numericValue) : '';
    if (id === 'shipping_cost') {
      setFormattedPrice(formattedValue);
      formik.setFieldValue('shipping_cost', cost);
    } else if (id === 'discount') {
      setFormattedDisc(formattedValue);
      formik.setFieldValue('discount', cost);
    } else if (id === 'tax') {
      setFormattedTax(formattedValue);
      formik.setFieldValue('tax', cost);
    }
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, product) => {
      const productDataItem = productData.find(
        (p) => p?.id === product.product_id,
      );
      const price = productDataItem?.price || 0;
      return total + price * product.quantity;
    }, 0);
  };
  useEffect(() => {
    setSubtotal(calculateSubtotal());
  }, [selectedProducts, productData]);

  useEffect(() => {
    let discountValue = 0;
    if (formik.values.discount_type === 'nominal') {
      discountValue = formik.values.discount;
    } else if (formik.values.discount_type === 'percentage') {
      discountValue = (subtotal * formik.values.discount) / 100;
    }

    let newTotal = subtotal - discountValue;

    newTotal += formik.values.shipping_cost || 0;

    let taxValue = 0;
    if (formik.values.tax_type === 'nominal') {
      taxValue = formik.values.tax;
    } else if (formik.values.tax_type === 'percentage') {
      taxValue = Math.round((newTotal * formik.values.tax) / 100);
    }

    newTotal += taxValue;
    setTotalPayment(newTotal);
  }, [
    formik.values.discount,
    formik.values.discount_type,
    formik.values.shipping_cost,
    formik.values.tax,
    formik.values.tax_type,
    subtotal,
  ]);

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex flex-col p-5 rounded-xl  w-96 gap-5 justify-between">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div>Discount</div>
              <div className="w-40 flex items-center h-10">
                <select
                  id="discount_type"
                  className={`rounded-bl-xl rounded-tl-xl text-center outline-none border-gray-300 border-y border-l bg-gray-100 p-2 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:border-r h-full text-gray-900 "
                        `}
                  {...formik.getFieldProps('discount_type')}
                >
                  <option value="nominal">Rp</option>
                  <option value="percentage">%</option>
                </select>
                <input
                  type="text"
                  id="discount"
                  onChange={handlePriceChange}
                  value={formattedDisc}
                  className="rounded-br-xl rounded-tr-xl w-full h-full p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out  focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div>Tax</div>
              <div className="w-40 flex items-center h-10">
                <select
                  id="tax_type"
                  className={`rounded-bl-xl rounded-tl-xl text-center outline-none border-gray-300 border-y border-l bg-gray-100 p-2 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:border-r h-full text-gray-900 "
                        `}
                  {...formik.getFieldProps('tax_type')}
                >
                  <option value="nominal">Rp</option>
                  <option value="percentage">%</option>
                </select>
                <input
                  type="text"
                  id="tax"
                  value={formattedTax}
                  onChange={handlePriceChange}
                  className="rounded-br-xl rounded-tr-xl w-full h-full p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out  focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div>Shipping</div>
            <div className="w-40 flex items-center">
              <div
                className={`rounded-bl-xl rounded-tl-xl w-20 text-center outline-none flex justify-center  border-gray-300 border-y border-l bg-gray-100 p-2
                    `}
              >
                <div className="">Rp</div>
              </div>
              <input
                type="text"
                id="shipping_cost"
                value={formattedPrice}
                onChange={handlePriceChange}
                className="rounded-br-xl rounded-tr-xl w-full p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out  focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col p-5 rounded-xl bg-amber-50 w-96 gap-2">
          <div className="flex items-center justify-between">
            <div>Subtotal</div>
            <div>{formatPrice(subtotal)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Discount</div>
            <div>
              -{''}
              {formatPrice(
                formik.values.discount_type === 'percentage'
                  ? (subtotal * formik.values.discount) / 100
                  : formik.values.discount,
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Shipping</div>
            <div>{formatPrice(formik.values.shipping_cost)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Tax</div>
            <div>
              {formatPrice(
                formik.values.tax_type === 'percentage'
                  ? (totalPayment * formik.values.tax) / 100
                  : formik.values.tax,
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-400 pt-2">
            <div>Total Payment</div>
            <div>{formatPrice(totalPayment)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormTotal;
