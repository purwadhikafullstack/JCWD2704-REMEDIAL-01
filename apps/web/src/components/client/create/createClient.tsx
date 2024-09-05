'use client';

import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

const CreateClient = () => {
  const router = useRouter();

  const initialValues = {
    name: '',
    phone: '',
    email: '',
    address: '',
    payment_preference: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('First name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      phone: Yup.string(),
      address: Yup.string().required('Address is required'),
      payment_preference: Yup.string()
        .oneOf(['debit', 'credit', 'bank_transfer'])
        .nullable(),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          payment_preference: values.payment_preference || null,
        };

        const { data } = await axiosInstance().post('/clients/c', payload);
        toast.success('Client created successfully');
        router.push('/client');
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message || 'An error occurred');
        } else if (error instanceof Error) {
          console.log(error.message);
        }
      }
    },
  });

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel your changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel!',
      cancelButtonText: 'No, stay!',
    });

    if (result.isConfirmed) {
      router.push('/client');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
        <div className="text-3xl font-semibold">New Client</div>
        <form
          id="create-item"
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col">
            <div className="flex items-center">
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
                <div className="text-red-500 text-sm ml-2  ">
                  {formik.errors.name}
                </div>
              ) : null}
            </div>
            <div className="flex items-center">
              <label htmlFor="email" className="w-48 py-4">
                Email
              </label>
              <input
                type="text"
                id="email"
                className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-2 focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-sm ml-2 ">
                  {formik.errors.email}
                </div>
              ) : null}
            </div>
            <div className="flex items-center">
              <label htmlFor="phone" className="w-48 py-4">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-2 focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                {...formik.getFieldProps('phone')}
              />
              {formik.touched.phone && formik.errors.phone ? (
                <div className="text-red-500 text-sm ml-2 mt-2 ">
                  {formik.errors.phone}
                </div>
              ) : null}
            </div>
            <div className="flex items-center">
              <label htmlFor="payment_preference" className="w-48 py-4">
                Payment Preference
              </label>
              <select
                id="payment_preference"
                className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-2 focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                {...formik.getFieldProps('payment_preference')}
              >
                <option value="">Select a payment</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
              {formik.touched.payment_preference &&
              formik.errors.payment_preference ? (
                <div className="text-red-500 text-sm ml-2 ">
                  {formik.errors.payment_preference}
                </div>
              ) : null}
            </div>

            <div className="flex items-start h-36">
              <label htmlFor="address" className="w-48 py-4">
                Address
              </label>
              <div className="py-2">
                <textarea
                  id="address"
                  placeholder="Enter address"
                  className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-2 focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  rows={3}
                  {...formik.getFieldProps('address')}
                ></textarea>
              </div>
              {formik.touched.address && formik.errors.address ? (
                <div className="text-red-500 text-sm ml-2 mt-4">
                  {formik.errors.address}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="submit"
              className="bg-[#f2c675] p-2 rounded-xl font-semibold w-36"
            >
              Create
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
            >
              Back
            </button>{' '}
          </div>
        </form>
      </section>
    </>
  );
};

export default CreateClient;
