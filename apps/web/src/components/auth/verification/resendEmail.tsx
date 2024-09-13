'use client';

import { useAppSelector } from '@/app/hooks';
import { axiosInstance } from '@/libs/axios';
import { TUser } from '@/models/user.model';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResendEmail() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useAppSelector((state) => state.auth) as TUser;

  let userEmail: string | undefined = email || undefined;
  if (!userEmail) {
    const emailParam: string | null = searchParams.get('email');
    if (emailParam) {
      userEmail = emailParam;
    }
  }

  const resendVerif = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance().post(
        '/users/resendVerificationEmail',
        { email: userEmail },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const { message } = response.data;
      console.log(response.data);

      if (message === 'You have previously verified your email') {
        toast.error(message);
      } else {
        toast.success(
          message ||
            'Verification e-mail has been sent. Please check your inbox!',
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center tracking-tighter overflow-hidden py-6 sm:py-12 bg-amber-50">
      <div className="max-w-xl text-center flex flex-col items-center bg-white p-10 rounded-xl border border-gray-200 shadow-md">
        <a className="py-4">
          <div className="flex justify-center gap-2 items-center">
            <Image
              src={'/invozy-fill2.png'}
              width={35}
              height={35}
              alt="invozy"
            />
            <div className="font-semibold text-2xl ">Invozy</div>
          </div>
        </a>
        <h2 className="pb-4 lg:text-3xl font-bold text-zinc-800">
          Thank you for signing up!
        </h2>
        <h1 className="lg:text-xl text-base font-semibold text-zinc-800">
          Please check your e-mail and verify your account{' '}
        </h1>

        <p className="text-base font-medium text-zinc-500 py-4">
          Didn´t get e-mail?
        </p>
        <button
          onClick={resendVerif}
          className="bg-amber-300 px-4 py-2 rounded-xl font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex flex-col items-center justify-center  w-full h-full">
              <div className="animate-spin w-5 h-5 border-2 border-t-transparent border-black rounded-full"></div>
            </span>
          ) : (
            'Resend e-mail'
          )}
        </button>
      </div>
    </div>
  );
}
