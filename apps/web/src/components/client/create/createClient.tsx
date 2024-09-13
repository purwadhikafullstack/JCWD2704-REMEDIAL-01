'use client';

import { useAppSelector } from '@/app/hooks';
import Unauthorized from '@/components/unauthorized';
import { axiosInstance } from '@/libs/axios';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { BsPeople } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

const libraries: ['places'] = ['places'];

const CreateClient = () => {
  const router = useRouter();
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const user = useAppSelector((state) => state.auth);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

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

        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to create this client?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, create it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          const { data } = await axiosInstance().post('/clients/c', payload);
          toast.success('Client created successfully', {
            autoClose: 2000,
          });

          setTimeout(() => {
            router.push('/client');
          }, 3000);
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

  const handleCancel = async () => {
    const formIsFilled = Object.keys(formik.values).some(
      (key) => formik.values[key as keyof typeof formik.values] !== '',
    );

    if (formIsFilled) {
      const result = await Swal.fire({
        title: 'Unsaved changes!',
        text: 'Do you want to leave without saving?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave!',
        cancelButtonText: 'No, stay',
      });

      if (result.isConfirmed) {
        router.push('/client');
      }
    } else {
      router.push('/client');
    }
  };

  const handlePlaceChanged = () => {
    const place = autocomplete?.getPlace();
    if (place && place.formatted_address) {
      formik.setFieldValue('address', place.formatted_address);
    }
  };

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/[^0-9]/g, '');
    formik.setFieldValue('phone', numericValue);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-4 h-screen">
        <div className="animate-spin w-20 h-20 border-4 border-t-transparent border-amber-300 rounded-full"></div>
        <p className="text-gray-500 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {!user?.user?.is_verified || !user.business?.id ? (
        <Unauthorized page={`client`} user={user} />
      ) : (
        <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
          <div className="text-3xl font-semibold flex gap-2 items-center border-b border-gray-300 pb-3">
            <BsPeople />
            New Client
          </div>
          <form
            id="create-item"
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-8 h-full"
          >
            <div className="flex gap-20">
              <div className="flex flex-col gap-2 w-72">
                <div className="h-24">
                  <div className=" w-full flex flex-col">
                    <label
                      htmlFor="name"
                      className="text-gray-600 mb-2 text-sm font-medium"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter client name"
                      className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                      {...formik.getFieldProps('name')}
                    />
                  </div>
                  {formik.touched.name && formik.errors.name ? (
                    <div className="text-red-700 text-xs mt-1">
                      {formik.errors.name}
                    </div>
                  ) : null}
                </div>
                <div className="h-24">
                  <div className=" w-full flex flex-col">
                    <label
                      htmlFor="email"
                      className="text-gray-600 mb-2 text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      type="text"
                      id="email"
                      className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                      placeholder="client-email@example.com"
                      {...formik.getFieldProps('email')}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-700 text-xs mt-1">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>
                <div className="h-24">
                  <div className=" w-full flex flex-col">
                    <label
                      htmlFor="phone"
                      className="text-gray-600 mb-2 text-sm font-medium"
                    >
                      Phone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                      {...formik.getFieldProps('phone')}
                      onChange={handlePhoneChange}
                      placeholder="Enter client phone number"
                    />
                  </div>
                  {formik.touched.phone && formik.errors.phone ? (
                    <div className="text-red-700 text-xs mt-1">
                      {formik.errors.phone}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-72">
                <div className="h-24">
                  <div className=" w-full flex flex-col">
                    <label
                      htmlFor="address"
                      className="text-gray-600 mb-2 text-sm font-medium"
                    >
                      Address
                    </label>
                    <Autocomplete
                      onLoad={onLoad}
                      onPlaceChanged={handlePlaceChanged}
                    >
                      <input
                        id="address"
                        placeholder="Enter address"
                        className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                        {...formik.getFieldProps('address')}
                      />
                    </Autocomplete>
                  </div>
                  {formik.touched.address && formik.errors.address ? (
                    <div className="text-red-700 text-xs mt-1">
                      {formik.errors.address}
                    </div>
                  ) : null}
                </div>

                <div className="h-24">
                  <div className=" w-full flex flex-col">
                    <label
                      htmlFor="payment_preference"
                      className="text-gray-600 mb-2 text-sm font-medium"
                    >
                      Payment Preference
                    </label>
                    <select
                      id="payment_preference"
                      className="rounded-xl w-72 px-2 py-2.5 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                      {...formik.getFieldProps('payment_preference')}
                    >
                      <option value="">Select a payment</option>
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                      <option value="bank_transfer">Bank transfer</option>
                    </select>
                  </div>
                  {formik.touched.payment_preference &&
                  formik.errors.payment_preference ? (
                    <div className="text-red-500 text-sm ml-2 ">
                      {formik.errors.payment_preference}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5 ">
              <button
                type="submit"
                className="bg-[#f2c675] p-2 rounded-xl font-semibold w-36"
              >
                Create
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
              >
                Back
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default CreateClient;
