'use client';

import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Link from 'next/link';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { axiosInstance } from '@/libs/axios';
import Image from 'next/image';

const EmailResetPass = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await axiosInstance().post(
          '/users/forgotPassword',
          {
            email: values.email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        formik.resetForm();
        toast.success('Email has been sent. Please check your inbox.');
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="w-screen h-screen flex items-center justify-between">
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className=" mb-1 flex items-center justify-center flex-col">
            <h1 className="font-bold text-3xl">Forgot password?</h1>
          </div>
          <div className=" mb-3 flex items-center justify-center flex-col px-24">
            <h2 className="text-center text-gray-500">
              No worries, we&apos;ll send you reset instructions!
            </h2>
          </div>

          <div className="">
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col w-[450px] border border-gray-300 p-5 rounded-xl"
            >
              <div className=" w-full flex flex-col">
                <label
                  htmlFor="email"
                  className="text-gray-600 mb-2 text-sm font-medium"
                >
                  Email address
                </label>
                <input
                  type="email"
                  className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  id="email"
                  placeholder="name@example.com"
                  {...formik.getFieldProps('email')}
                />
              </div>
              <div className="flex justify-between items-start mt-1">
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-700 text-xs mt-1">
                    {formik.errors.email}
                  </div>
                ) : (
                  <div></div>
                )}
              </div>

              <button
                className="bg-[#f2c675] p-2 rounded-xl mt-3 font-semibold w-full h-10"
                type="submit"
                disabled={
                  !formik.values.email || !formik.isValid || isSubmitting
                }
              >
                {isSubmitting ? (
                  <span className="flex flex-col items-center justify-center  w-full h-full">
                    <div className="animate-spin w-5 h-5 border-2 border-t-transparent border-black rounded-full"></div>
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </form>

            <div className="flex mt-3 justify-center items-center">
              <div className="flex items-center text-sm gap-1">
                <div>Back to</div>
                <Link
                  href={'/auth/login'}
                  className="text-[#fe9d2f] font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
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
    </>
  );
};

export default EmailResetPass;
