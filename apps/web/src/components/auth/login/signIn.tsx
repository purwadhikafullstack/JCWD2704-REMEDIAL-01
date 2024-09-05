'use client';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { userLogin } from '@/libs/redux/middlewares/auth.middleware';
import { toast } from 'react-toastify';
import { UserLoginPayload } from '@/models/user.model';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { useAppDispatch } from '@/app/hooks';
import Image from 'next/image';

const SignIn: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: '',
    password: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const result = await dispatch(
          userLogin({
            email: values.email,
            password: values.password,
          } as UserLoginPayload),
        );
        if (result.success) {
          router.push('/');
          window.location.reload();
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(
            error.response?.data.message ||
              'An error occurred while signing in.',
          );
        } else {
          toast.error('An unexpected error occurred.');
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
          <h1 className="font-bold text-3xl">Welcome back to Invozy</h1>
        </div>
        <div className=" mb-3 flex items-center justify-center flex-col px-24">
          <h2 className="text-center text-gray-500">
            Sign in to continue managing your invoices
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
                Email
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
              <div className="text-red-700 text-xs mt-1">
                {formik.errors.email}
              </div>
            ) : null}

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
              {formik.touched.email && formik.errors.password ? (
                <div className="text-red-700 text-xs mt-1">
                  {formik.errors.password}
                </div>
              ) : (
                <div className="text-xs mt-1 text-white"></div>
              )}
            </div>

            <button
              className="bg-[#f2c675] p-2 rounded-xl mt-3 font-semibold w-full h-10"
              type="submit"
              disabled={!formik.isValid || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex flex-col items-center justify-center  w-full h-full">
                  <div className="animate-spin w-5 h-5 border-2 border-t-transparent border-black rounded-full"></div>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="flex mt-3 justify-between items-center">
            <div className="flex items-center text-sm gap-1">
              <div>Don&apos;t have an account?</div>
              <Link
                href={'/auth/signUp'}
                className="text-[#fe9d2f] font-semibold"
              >
                Sign Up
              </Link>
            </div>{' '}
            <Link
              href="/forgot-password/confirm"
              className="text-sm font-semibold text-amber-500 no-underline text-right w-32"
            >
              Forgot password?
            </Link>
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
  );
};

export default SignIn;
