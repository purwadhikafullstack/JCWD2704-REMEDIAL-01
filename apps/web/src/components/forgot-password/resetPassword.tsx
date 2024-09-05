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

const ResetPassword = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const params = useParams();
  const { token } = params;

  YupPassword(Yup);

  const initialValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      newPassword: Yup.string()
        .required('Password is required')
        .min(6, 'Password must have at least 6 characters')
        .minNumbers(1, 'Password must contain at least 1 number')
        .minUppercase(
          1,
          'Password must contain at least 1 letter in uppercase',
        ),
      confirmPassword: Yup.string()
        .required('Confirm Password is required')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await axiosInstance().patch(
          '/users/resetPassword',
          {
            token: Array.isArray(token) ? token[0] : token,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const { updatedUser } = response.data;
        toast.success('Password has been reset');

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
      <div className="flex flex-col items-center justify-center w-1/2">
        <div className=" mb-1 flex items-center justify-center flex-col">
          <h1 className="font-bold text-3xl">Set your Password</h1>
        </div>
        <div className=" mb-3 flex items-center justify-center flex-col px-24">
          <h2 className="text-center text-gray-500">
            Please input your new password
          </h2>
        </div>

        <div className="">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col w-[450px] border border-gray-300 p-5 rounded-xl"
          >
            <div className=" w-full flex flex-col">
              <label
                htmlFor="newPassword"
                className="text-gray-600 mb-2 text-sm font-medium"
              >
                New Password
              </label>
              <input
                type="password"
                className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                id="newPassword"
                placeholder="•••••••"
                {...formik.getFieldProps('newPassword')}
              />
              {formik.touched.newPassword && formik.errors.newPassword ? (
                <div className="text-red-700 text-xs mt-1">
                  {formik.errors.newPassword}
                </div>
              ) : (
                ''
              )}
            </div>
            <div className=" w-full flex flex-col">
              <label
                htmlFor="confirmPassword"
                className="text-gray-600 my-2 text-sm font-medium"
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                id="confirmPassword"
                placeholder="•••••••"
                {...formik.getFieldProps('confirmPassword')}
              />
              {formik.touched.confirmPassword &&
              formik.errors.confirmPassword ? (
                <div className="text-red-700 text-xs mt-1">
                  {formik.errors.confirmPassword}
                </div>
              ) : (
                ' '
              )}
            </div>

            <button
              className="bg-[#f2c675] p-2 rounded-xl mt-3 font-semibold"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="visually-hidden">Loading...</span>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="bg-amber-50 h-screen w-1/2 flex flex-col items-center justify-center gap-5">
        <div className="flex justify-center gap-2 items-center">
          <Image
            src={'/invozy-fill2.png'}
            width={35}
            height={35}
            alt="invozy"
          />
          <div className="font-semibold text-2xl ">Invozy</div>
        </div>
        <Image src="/login.png" alt="login" width={400} height={400} />
      </div>
    </div>
  );
};

export default ResetPassword;
