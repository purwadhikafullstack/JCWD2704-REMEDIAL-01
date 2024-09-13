'use client';
import React, { useState } from 'react';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useAppDispatch } from '@/app/hooks';
import { axiosInstance } from '@/libs/axios';
import Image from 'next/image';
import Link from 'next/link';

const SignupUserForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  YupPassword(Yup);

  const initialValues = {
    email: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    }),
    onSubmit: async (values, formikHelpers) => {
      setIsSubmitting(true);
      try {
        await axiosInstance().post('/users/v1', values);
        router.push(`/auth/verification?email=${values.email}`);
        // toast.success('Email has been sent. Please check your inbox.');
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(
            error.response?.data.message ||
              'An error occurred while signing up.',
          );
        } else {
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const isSubmitDisabled = !formik.values.email || !!formik.errors.email;

  const dispatch = useAppDispatch();

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
          <h1 className="font-bold text-3xl">Start with Invozy</h1>
        </div>
        <div className=" mb-3 flex items-center justify-center flex-col px-24">
          <h2 className="text-center text-gray-500">
            Lets create your account & experience our services.
          </h2>
        </div>

        <div className="">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col w-[450px] border border-gray-300 p-5 rounded-xl "
          >
            <div className=" w-full flex flex-col">
              <label
                htmlFor="email"
                className="text-gray-600 mb-2 text-sm font-medium"
              >
                Your Email
              </label>
              <input
                type="email"
                className="rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                id="email"
                placeholder="name@example.com"
                {...formik.getFieldProps('email')}
              />
            </div>

            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-700 text-xs">{formik.errors.email}</div>
            ) : null}

            <button
              className="bg-[#f2c675] p-2 rounded-xl mt-3 font-semibold w-full h-10"
              type="submit"
              disabled={isSubmitDisabled || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex flex-col items-center justify-center  w-full h-full">
                  <div className="animate-spin w-5 h-5 border-2 border-t-transparent border-black rounded-full"></div>
                </span>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
          <div className="flex items-center justify-center gap-1 mt-3 text-sm">
            <div>Already have an account?</div>
            <Link href={'/auth/login'} className="text-[#fe9d2f] font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupUserForm;
