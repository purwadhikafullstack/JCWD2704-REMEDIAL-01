'use client';
import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { ChangeEvent, useState } from 'react';
import { Client, TClient } from '@/models/client.model';
import FormClient from './formClient';
import FormTerms from './formTerms';
import { Product } from '@/models/product.model';
import FormItem from './formItem';
import FormTotal from './formTotal';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const InvoiceForm = () => {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<
    { product_id: string; quantity: number; price?: number }[]
  >([{ product_id: '', quantity: 0 }]);
  const [productData, setProductData] = useState<Product[]>([]);

  const today = dayjs().startOf('day').format('YYYY-MM-DD');

  const initialValues = {
    client_id: '',
    recurring: false,
    invoice_date: today,
    discount_type: 'nominal',
    tax_type: 'nominal',
    tax: '',
    discount: '',
    shipping_cost: '',
    recurring_end: '',
    recurring_interval: '',
    payment_method: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({}),
    onSubmit: async (values) => {
      try {
        const filteredProducts = selectedProducts.filter(
          (product) => product.product_id !== '',
        );

        const payload = {
          ...values,
          recurring_interval: values.recurring_interval
            ? values.recurring_interval
            : null,
          products: filteredProducts,
        };

        if (!values.tax) {
          delete (payload as { tax_type?: string }).tax_type;
          delete (payload as { tax?: string }).tax;
        }

        if (!values.recurring) {
          delete (payload as { recurring_interval?: string })
            .recurring_interval;
          delete (payload as { recurring_end?: string }).recurring_end;
        }

        if (!values.discount) {
          delete (payload as { discount_type?: string }).discount_type;
          delete (payload as { discount?: string }).discount;
        }

        console.log('Payload:', payload);
        const { data } = await axiosInstance().post('/invoices/c', payload);
        toast.success('Invoice created successfully');
        router.push('/invoice');
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message || 'An error occurred');
        } else if (error instanceof Error) {
          console.log(error.message);
        }
      }
    },
  });

  const handlePaymentMethodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    formik.setFieldValue('payment_method', value);
  };

  const handleOrderNow = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    });

    if (result.isConfirmed) {
      formik.handleSubmit();
    }
  };

  return (
    <>
      <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
        <div className="text-3xl font-semibold">New Invoice</div>
        <form
          id="create-invoice"
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-5"
        >
          <FormClient
            clients={clients}
            selectedClientName={selectedClientName}
            setSelectedClientName={setSelectedClientName}
            formik={formik}
            setClients={setClients}
          />
          <hr />
          <FormTerms formik={formik} />
          <hr />
          <div className="flex items-start">
            <label htmlFor="payment_method" className="w-48 py-4">
              Payment Method
            </label>
            <div className="">
              <select
                id="payment_method"
                name="payment_method"
                value={formik.values.payment_method}
                onChange={handlePaymentMethodChange}
                onBlur={formik.handleBlur}
                className={`cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                  formik.touched.payment_method && formik.errors.payment_method
                    ? 'border-red-500'
                    : ''
                }`}
              >
                <option value="">Select Method</option>
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <hr />
          <div className="flex flex-col gap-5 mt-2 mb-10">
            <FormItem
              formik={formik}
              selectedProducts={selectedProducts}
              productData={productData}
              setSelectedProducts={setSelectedProducts}
              setProductData={setProductData}
            />
            <FormTotal
              formik={formik}
              selectedProducts={selectedProducts}
              productData={productData}
            />
          </div>
          <div></div>

          <button
            type="submit"
            // type="button"
            // onClick={handleOrderNow}
            className="bg-amber-200 p-2 rounded-xl font-semibold w-36"
          >
            Create
          </button>
        </form>
      </section>
    </>
  );
};

export default InvoiceForm;
