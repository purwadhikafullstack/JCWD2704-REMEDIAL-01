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

interface FormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  payment_preference: string;
}

const DetailClient: React.FC = () => {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();

  const initialValues: FormValues = {
    name: '',
    phone: '',
    email: '',
    address: '',
    payment_preference: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name is required'),
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

        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to update this client?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          const { data } = await axiosInstance().patch(
            `/clients/e/${clientId}`,
            payload,
          );
          toast.success('Client updated successfully');
          router.push('/client');
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message || 'An error occurred');
        } else {
          console.error('An unexpected error occurred:', error);
        }
      }
    },
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (clientId) {
          const response = await axiosInstance().get(`/clients/${clientId}`);
          const client = response.data.data;

          if (client.id) {
            formik.setValues({
              name: client.name,
              address: client.address,
              phone: client.phone,
              email: client.email,
              payment_preference: client.payment_preference,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      });

      if (result.isConfirmed) {
        await axiosInstance().delete(`/clients/d/${clientId}`);
        toast.success('Item deleted successfully');
        router.push('/client');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || 'An error occurred');
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  };

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

  return (
    <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
      <div className="text-3xl font-semibold">Edit Client</div>
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
              <div className="text-red-500 text-sm mt-2">
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
              <div className="text-red-500 text-sm mt-2">
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
              <div className="text-red-500 text-sm mt-2">
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
              <div className="text-red-500 text-sm mt-2">
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
              <div className="text-red-500 text-sm mt-2">
                {formik.errors.address}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 mt-5 items-center justify-between w-full">
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              className="bg-[#f2c675] p-2 rounded-xl font-semibold w-36"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
            >
              Back
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
    </section>
  );
};

export default DetailClient;
