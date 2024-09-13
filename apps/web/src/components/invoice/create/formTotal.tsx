'use client';
import { useEffect, useState } from 'react';
import { Product } from '@/models/product.model';
import { formatPrice, inputRupiah } from '@/helpers/format';

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
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    let cost = numericValue ? parseFloat(numericValue) : 0;
    const formattedValue = numericValue ? inputRupiah(numericValue) : '';

    if (cost === 0) {
      if (id === 'shipping_cost') {
        setFormattedPrice('');
        formik.setFieldValue('shipping_cost', '');
      } else if (id === 'discount') {
        setFormattedDisc('');
        formik.setFieldValue('discount', '');
      } else if (id === 'tax') {
        setFormattedTax('');
        formik.setFieldValue('tax', '');
      }
      return;
    }

    if (id === 'shipping_cost') {
      setFormattedPrice(formattedValue);
      formik.setFieldValue('shipping_cost', cost);
    } else if (id === 'discount') {
      if (formik.values.discount_type === 'percentage') {
        const percentageValue = Math.min(100, cost);
        setFormattedDisc(percentageValue.toString());
        formik.setFieldValue('discount', percentageValue);
      } else {
        if (cost > subtotal) {
          cost = subtotal;
        }
        const formattedDiscount = inputRupiah(cost.toString());
        setFormattedDisc(formattedDiscount);
        formik.setFieldValue('discount', cost);
      }
    } else if (id === 'tax') {
      if (formik.values.tax_type === 'percentage') {
        const percentageValue = Math.min(100, cost);
        setFormattedTax(percentageValue.toString());
        formik.setFieldValue('tax', percentageValue);
      } else {
        setFormattedTax(formattedValue);
        formik.setFieldValue('tax', cost);
      }
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
      discountValue = formik.values.discount || 0;
      if (subtotal === 0) {
        setFormattedDisc('');
        formik.setFieldValue('discount', '');
      } else if (discountValue > subtotal) {
        discountValue = subtotal;
        formik.setFieldValue('discount', discountValue);
        setFormattedDisc(inputRupiah(discountValue.toString()));
      }
    } else if (formik.values.discount_type === 'percentage') {
      discountValue = Math.round((subtotal * formik.values.discount) / 100);
      setDiscountAmount(discountValue);
    }

    let newTotal = subtotal - discountValue;

    newTotal += formik.values.shipping_cost || 0;

    let taxValue = 0;
    if (formik.values.tax_type === 'nominal') {
      taxValue = formik.values.tax || 0;
    } else if (formik.values.tax_type === 'percentage') {
      taxValue = Math.round((newTotal * formik.values.tax) / 100);
      setTaxAmount(taxValue);
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

  useEffect(() => {
    setFormattedDisc('');
    formik.setFieldValue('discount', '');
  }, [formik.values.discount_type]);

  useEffect(() => {
    setFormattedTax('');
    formik.setFieldValue('tax', '');
  }, [formik.values.tax_type]);
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
                  maxLength={
                    formik.values.discount_type === 'percentage' ? 3 : undefined
                  }
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
                  maxLength={
                    formik.values.tax_type === 'percentage' ? 3 : undefined
                  }
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
              -{' '}
              {formik.values.discount_type === 'percentage' &&
              discountAmount > 0
                ? formatPrice(discountAmount)
                : formik.values.discount > 0
                  ? formatPrice(formik.values.discount)
                  : 'Rp 0'}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Shipping</div>
            <div>
              +{' '}
              {formatPrice(
                formik.values.shipping_cost ? formik.values.shipping_cost : 0,
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Tax</div>
            <div>
              +{' '}
              {formatPrice(
                formik.values.tax_type === 'percentage'
                  ? taxAmount
                  : formik.values.tax,
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-400 pt-2 text-lg font-semibold">
            <div>Total Payment</div>
            <div>{formatPrice(totalPayment)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormTotal;
