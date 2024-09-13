'use client';

import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import { IoBagRemoveOutline } from 'react-icons/io5';
import { inputRupiah } from '@/helpers/format';
import { useAppSelector } from '@/app/hooks';
import Unauthorized from '@/components/unauthorized';
import Loading from '@/components/loading';

const DetailItem = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const { productId } = useParams();
  const [formattedPrice, setFormattedPrice] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialServerValues, setInitialServerValues] = useState({
    name: '',
    description: '',
    type: '',
    price: '',
  });

  const user = useAppSelector((state) => state.auth);
  const [loadingPage, setLoadingPage] = useState(true);

  const initialValues = {
    name: '',
    description: '',
    type: '',
    price: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required('Name is required')
        .min(5, 'Name must be at least 5 characters long'),
      price: Yup.string().required('Price is required'),
      description: Yup.string().required('Description is required'),
      type: Yup.string()
        .oneOf(['goods', 'service'])
        .required('Type is required'),
    }),
    onSubmit: async (values) => {
      try {
        const numericPrice = parseInt(values.price.replace(/\./g, ''), 10);

        const payload = {
          ...values,
          price: numericPrice,
        };

        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to update this item?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          const { data } = await axiosInstance().patch(
            `/products/e/${productId}`,
            payload,
          );
          toast.success('Item updated successfully');
          router.push('/item');
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message || 'An error occurred');
        } else if (error instanceof Error) {
          console.log(error.message);
        }
      }
    },
  });

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormattedPrice(inputRupiah(value));
    formik.setFieldValue('price', value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    formik.setFieldTouched('price', true);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (productId) {
          const response = await axiosInstance().get(`/products/${productId}`);
          const product = response.data.data;

          if (product.id) {
            const values = {
              name: product.name,
              description: product.description,
              type: product.type,
              price: inputRupiah(product.price.toString()),
            };
            formik.setValues(values);
            setFormattedPrice(inputRupiah(product.price.toString()));
            setInitialServerValues(values);
          }
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (productId) {
          const response = await axiosInstance().get(
            `/products/inv/${productId}`,
          );
          const product = response.data.data;

          setInvoices(product);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchInvoice();
  }, []);

  const handleDelete = async () => {
    try {
      if (invoices.length === 0) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to delete this item?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          await axiosInstance().delete(`/products/d/${productId}`);
          toast.success('Item deleted successfully');
          router.push('/item');
        }
      } else {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: `All pending invoices associated with this product will be canceled if you delete the item.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          await axiosInstance().delete(`/products/d/${productId}`);
          toast.success('Item and associated invoices canceled successfully');
          router.push('/item');
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || 'An error occurred');
      } else if (error instanceof Error) {
        console.log(error.message);
      }
    }
  };

  const handleCancel = async () => {
    if (initialServerValues) {
      if (hasChanges) {
        const result = await Swal.fire({
          title: 'Are you sure ?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, cancel!',
          cancelButtonText: 'No, stay!',
        });

        if (result.isConfirmed) {
          router.push('/item');
        }
      } else {
        router.push('/item');
      }
    }
  };

  useEffect(() => {
    const isChanged = Object.keys(formik.values).some(
      (key) =>
        formik.values[key as keyof typeof formik.values] !==
        initialServerValues[key as keyof typeof initialServerValues],
    );
    setHasChanges(isChanged);
  }, [formik.values, initialServerValues]);

  return (
    <>
      {loadingPage ? (
        <Loading />
      ) : (
        <>
          {!user?.user?.is_verified || !user.business?.id ? (
            <Unauthorized page={`item`} user={user} />
          ) : (
            <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
              <div className="text-3xl font-semibold flex gap-2 items-center border-b border-gray-300 pb-3">
                <IoBagRemoveOutline />
                Item Details
              </div>
              <div className="flex justify-between">
                <form
                  id="create-item"
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col justify-between h-full gap-8"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-10 w-60 mb-5">
                      <div className="text-gray-600 text-sm font-medium">
                        Type
                      </div>
                      <div className="flex items-center gap-5 ">
                        <div className="flex items-center gap-2 ">
                          <input
                            type="radio"
                            name="type"
                            value="goods"
                            id="type_goods"
                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                            onChange={formik.handleChange}
                            checked={formik.values.type === 'goods'}
                          />
                          <div>
                            <label htmlFor="type_goods" className="text-md">
                              Goods
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="type"
                            value="service"
                            id="type_service"
                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                            onChange={formik.handleChange}
                            checked={formik.values.type === 'service'}
                          />
                          <div>
                            <label htmlFor="type_service" className="text-md">
                              Service
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-5">
                      <div className="h-24">
                        <div className="flex flex-col  w-60">
                          <label
                            htmlFor="name"
                            className="text-gray-600 mb-2 text-sm font-medium"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                            {...formik.getFieldProps('name')}
                            value={formik.values.name}
                          />
                        </div>
                        {formik.touched.name && formik.errors.name ? (
                          <div className="text-red-500 text-sm mt-1">
                            {formik.errors.name}
                          </div>
                        ) : null}
                      </div>
                      <div className="h-24">
                        <div className="flex flex-col  w-60">
                          <label
                            htmlFor="price"
                            className="text-gray-600 mb-2 text-sm font-medium"
                          >
                            Price
                          </label>
                          <div className="w-full flex items-center">
                            <div
                              className={`rounded-bl-xl rounded-tl-xl w-10 outline-none  ${
                                isFocused
                                  ? 'border-amber-200 border-y border-l bg-amber-200 p-2'
                                  : 'border-gray-300 border-y border-l bg-gray-100 p-2 '
                              } transition-colors duration-300 ease-in-out  text-gray-900 placeholder-gray-500`}
                            >
                              <div>Rp</div>
                            </div>
                            <input
                              type="text"
                              id="price"
                              value={formattedPrice}
                              onChange={handlePriceChange}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              className="rounded-br-xl rounded-tr-xl w-full p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out  focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        </div>
                        {formik.touched.price && formik.errors.price ? (
                          <div className="text-red-500 text-sm mt-2">
                            {formik.errors.price}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="h-32">
                      <div className="flex flex-col w-full">
                        <label
                          htmlFor="description"
                          className="text-gray-600 mb-2 text-sm font-medium"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          className="rounded-xl w-full resize-none p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                          {...formik.getFieldProps('description')}
                          value={formik.values.description}
                          rows={3}
                        />
                      </div>
                      {formik.touched.description &&
                      formik.errors.description ? (
                        <div className="text-red-500 text-sm mt-2">
                          {formik.errors.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-3 items-center justify-center">
                    <div className="flex gap-3 items-center">
                      <button
                        type="submit"
                        className={`bg-amber-300 p-2 rounded-xl font-semibold w-36 ${!hasChanges ? 'opacity-60' : 'hover:bg-amber-400'}`}
                        disabled={!hasChanges}
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
                      >
                        Cancel
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-red-500 text-white p-2 rounded-xl font-semibold w-36"
                    >
                      Delete
                    </button>
                  </div>
                </form>
                <div className="w-80 flex flex-col gap-2 h-100%">
                  <div>
                    Item is used in {invoices.length} pending invoice
                    {invoices.length > 1 ? 's' : ''}:
                  </div>
                  <div className="bg-gray-100 rounded-xl w-80 h-full text-sm border border-gray-300 overflow-hidden">
                    <div className="overflow-auto h-full">
                      <table className="w-full table-auto text-left">
                        <thead className="bg-gray-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-center w-10">No</th>
                            <th className="px-3 py-2 w-40">Invoice</th>
                            <th className="px-3 py-2 text-center">Start</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.length === 0 ? (
                            <tr className="h-64 w-full">
                              <td colSpan={3}>
                                <div className="flex flex-col items-center justify-center h-full w-full">
                                  <div className="text-gray-500 mt-4 text-base">
                                    No pending invoice found
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            invoices.map((invoice, index) => (
                              <tr
                                key={invoice.id}
                                className="cursor-pointer hover:bg-gray-50 border-b border-gray-300"
                              >
                                <td className="p-2 w-10 text-center">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-2 w-40">
                                  <Link
                                    href={`/invoice/${invoice.invoice.id}`}
                                    aria-label={`View invoice ${invoice.invoice.no_invoice}`}
                                    className="flex items-center gap-3"
                                  >
                                    {invoice.invoice.no_invoice}
                                    <FiExternalLink />
                                  </Link>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {dayjs(invoice.invoice.invoice_date).format(
                                    'DD MMM YY',
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
};

export default DetailItem;
