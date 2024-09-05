'use client';

import { inputRupiah } from '@/helpers/format';
import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';

const CreateItem = () => {
  const router = useRouter();
  const [formattedPrice, setFormattedPrice] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const initialValues = {
    name: '',
    description: '',
    type: 'goods',
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

        const { data } = await axiosInstance().post('/products/c', payload);
        toast.success('Item created successfully');
        router.push('/item');
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

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
        <div className="text-3xl font-semibold">New Item</div>
        <form
          id="create-item"
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="w-48">Type</div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
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
            <div className="flex items-center mt-5">
              <label htmlFor="name" className="w-48 py-4">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-2 focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name ? (
                <div className="text-red-500 text-sm ml-2">
                  {formik.errors.name}
                </div>
              ) : null}
            </div>
            <div className="flex items-center mt-5">
              <label htmlFor="price" className="w-48 py-4">
                Price
              </label>
              <div className="w-72 flex items-center">
                <div
                  className={`rounded-bl-xl rounded-tl-xl w-10 outline-none  ${
                    isFocused
                      ? 'border-amber-200 border-y-2 border-l-2 bg-amber-200 p-2'
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
                  className="rounded-br-xl rounded-tr-xl w-full p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-2 focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>

              {formik.touched.price && formik.errors.price ? (
                <div className="text-red-500 text-sm ml-2">
                  {formik.errors.price}
                </div>
              ) : null}
            </div>
            <div className="flex items-start mt-5 h-36">
              <label htmlFor="description" className="w-48 py-4">
                Description
              </label>
              <div className="py-2">
                <textarea
                  id="description"
                  placeholder="Enter description"
                  className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-2 focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  rows={3}
                  {...formik.getFieldProps('description')}
                ></textarea>
              </div>
              {formik.touched.description && formik.errors.description ? (
                <div className="text-red-500 text-sm ml-2 mt-4">
                  {formik.errors.description}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-[#f2c675] p-2 rounded-xl font-semibold w-36"
            >
              Create
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default CreateItem;
