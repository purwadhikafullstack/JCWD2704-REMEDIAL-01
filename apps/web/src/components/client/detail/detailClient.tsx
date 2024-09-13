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
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { BsPeople } from 'react-icons/bs';
import { useAppSelector } from '@/app/hooks';
import Unauthorized from '@/components/unauthorized';
import Loading from '@/components/loading';

interface FormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  payment_preference: string;
}
const libraries: ['places'] = ['places'];

const DetailClient: React.FC = () => {
  const router = useRouter();
  const { clientId } = useParams();
  const [clientNotFound, setClientNotFound] = useState(false);
  const [initialServerValues, setInitialServerValues] =
    useState<FormValues | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });
  const [loadingPage, setLoadingPage] = useState(true);

  const user = useAppSelector((state) => state.auth);

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
      phone: Yup.string().notRequired(),
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

          toast.success('Client updated successfully', {
            autoClose: 2000,
          });

          setTimeout(() => {
            router.push('/client');
          }, 3000);
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

          if (client) {
            const values: FormValues = {
              name: client.name || '',
              address: client.address || '',
              phone: client.phone || '',
              email: client.email || '',
              payment_preference: client.payment_preference || '',
            };

            formik.setValues(values);
            setInitialServerValues(values);
            setClientNotFound(false);
          } else {
            setClientNotFound(true);
          }
        }
      } catch (error) {
        setClientNotFound(true);
        console.error('Error fetching client data:', error);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this client?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      });

      if (result.isConfirmed) {
        await axiosInstance().delete(`/clients/d/${clientId}`);
        toast.success('Client deleted successfully', {
          autoClose: 2000,
        });

        setTimeout(() => {
          router.push('/client');
        }, 3000);
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
    if (initialServerValues) {
      const hasChanges = Object.keys(formik.values).some(
        (key) =>
          formik.values[key as keyof FormValues] !==
          initialServerValues[key as keyof FormValues],
      );

      if (hasChanges) {
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

  if (clientNotFound) {
    router.push('/client');
    return (
      <div className="flex flex-col items-center justify-center w-full gap-4 h-screen">
        <div className="text-2xl font-semibold text-red-500">
          Client Not Found
        </div>
      </div>
    );
  }

  return (
    <>
      {loadingPage ? (
        <Loading />
      ) : (
        <>
          {!user?.user?.is_verified || !user.business?.id ? (
            <Unauthorized page={`client`} user={user} />
          ) : (
            <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
              <div className="text-3xl font-semibold flex gap-2 items-center border-b border-gray-300 pb-3">
                <BsPeople />
                Client Details
              </div>
              <form
                id="create-item"
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-3 h-full"
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
                      <div className="w-full flex flex-col">
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
                      <div className="w-full flex flex-col">
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
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-center justify-between w-full">
                  <div className="flex gap-5 items-center">
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
                  {/* <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500 text-white p-2 rounded-xl font-semibold w-36"
                  >
                    Delete
                  </button> */}
                </div>
              </form>
            </section>
          )}
        </>
      )}
    </>
  );
};

export default DetailClient;
