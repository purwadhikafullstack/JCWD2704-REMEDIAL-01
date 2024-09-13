'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { decode as jwtDecode } from 'jsonwebtoken';
import { axiosInstance } from '@/libs/axios';
import Image from 'next/image';

interface DecodedToken {
  id: string;
}

const FinalizeData = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const params = useParams();
  const { token } = params;

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axiosInstance().get(
          `/users/verification/${token}`,
        );

        const { is_verified: verified, message, user } = response.data;

        if (user === null) {
          router.push('/');
        } else if (verified === false) {
          setIsVerified(false);
          console.log('Token is valid but user is not verified:', message);
        } else if (verified === true) {
          toast.success(
            'Your account is already verified. Redirecting to home page...',
          );
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        router.push('/');
      }
    };

    verifyToken();
  }, [token]);

  YupPassword(Yup);

  const initialValues = {
    first_name: '',
    last_name: '',
    password: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      first_name: Yup.string()
        .required('First name is required')
        .min(3, 'Must have at least 3 characters'),
      last_name: Yup.string()
        .required('Last name is required')
        .min(3, 'Must have at least 3 characters'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must have at least 6 characters')
        .minNumbers(1, 'Password must contain at least 1 number')
        .minUppercase(
          1,
          'Password must contain at least 1 letter in uppercase',
        ),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await axiosInstance().patch(
          '/users/v2',
          {
            token: Array.isArray(token) ? token[0] : token,
            first_name: values.first_name,
            last_name: values.last_name,
            password: values.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const { updatedUser } = response.data;
        toast.success('Successfully Registed');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.data.message === 'User is already verified') {
            toast.error('You have already verified your account.');
          } else {
            toast.error(
              error.response?.data.message ||
                'An error occurred while signing up.',
            );
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="w-screen h-screen flex items-center justify-between">
      <div className="bg-amber-50 h-screen w-1/2 flex flex-col items-center justify-center gap-5 ">
        <div className="flex justify-center gap-2 items-center">
          <Image
            src={'/invozy-fill2.png'}
            width={35}
            height={35}
            alt="invozy"
          />
          <div className="font-semibold text-2xl ">Invozy</div>
        </div>
        <Image src="/register.png" alt="signup" width={400} height={400} />
      </div>
      <div className="flex flex-col items-center justify-center w-1/2">
        <div className=" mb-1 flex items-center justify-center flex-col">
          <h1 className="font-bold text-3xl">Complete Your Registration</h1>
        </div>
        <div className=" mb-3 flex items-center justify-center flex-col px-24">
          <h2 className="text-center text-gray-500">
            Please input your name & create your password
          </h2>
        </div>

        <div className="">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col w-[450px] border border-gray-300 p-5 rounded-xl gap-2"
          >
            <div className="flex justify-between">
              <div className="flex flex-col">
                <div className=" w-48 flex flex-col">
                  <label
                    htmlFor="first_name"
                    className="text-gray-600 mb-2 text-sm font-medium"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                    id="first_name"
                    placeholder="First name"
                    {...formik.getFieldProps('first_name')}
                  />
                </div>
                {formik.touched.first_name && formik.errors.first_name ? (
                  <div className="text-red-700 text-xs mt-1 w-48">
                    {formik.errors.first_name}
                  </div>
                ) : (
                  <div className="text-xs mt-1 w-48 text-white">.</div>
                )}
              </div>

              <div className="flex flex-col">
                <div className=" w-48 flex flex-col">
                  <label
                    htmlFor="last_name"
                    className="text-gray-600 mb-2 text-sm font-medium"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                    id="last_name"
                    placeholder="Last name"
                    {...formik.getFieldProps('last_name')}
                  />
                </div>
                {formik.touched.last_name && formik.errors.last_name ? (
                  <div className="text-red-700 text-xs mt-1 w-48">
                    {formik.errors.last_name}
                  </div>
                ) : (
                  <div className="text-xs mt-1 w-48 text-white">.</div>
                )}
              </div>
            </div>

            <div className=" w-full flex flex-col">
              <label
                htmlFor="password"
                className="text-gray-600 my-2 text-sm font-medium"
              >
                Password
              </label>
              <input
                type="password"
                className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                id="password"
                placeholder="•••••••"
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-700 text-xs mt-1">
                  {formik.errors.password}
                </div>
              ) : (
                <div className="text-xs mt-1 w-48 text-white">.</div>
              )}
            </div>

            <button
              className="bg-[#f2c675] p-2 rounded-xl mt-3 font-semibold"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="">Submitting...</span>
              ) : (
                'Submit'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinalizeData;
