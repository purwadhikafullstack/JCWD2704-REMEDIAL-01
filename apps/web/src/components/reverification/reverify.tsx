'use client';
import { FC, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/libs/redux/slices/user.slice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosInstance } from '@/libs/axios';

const Reverify: FC = () => {
  const router = useRouter();
  const { token } = useParams();
  const dispatch = useDispatch();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axiosInstance().get(
          `/users/verifyTokenUser/${token}`,
        );

        const { is_verified, message, user } = response.data;

        if (user === null) {
          router.push('/');
        } else if (is_verified === false) {
          setIsVerified(false);
        } else if (is_verified === true) {
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

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axiosInstance().get(
            `/users/reverify/${token}`,
          );
          if (response.status === 200) {
            const { user } = response.data;
            dispatch(login(user));

            router.push('/profile?refreshed=true');
          } else {
            console.error('Email verification failed:', response.statusText);
          }
        } catch (error) {
          console.error('Error verifying email:', error);
        }
      }
    };

    verifyToken();
  }, [token, router, dispatch]);

  if (!token) {
    return <div>Invalid or missing token.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-center h-screen flex-col bg-amber-50">
        <div className="text-center p-10 rounded-xl shadow-md border border-gray-200 bg-white">
          <div className="w-full">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="animate-spin w-16 h-16 border-4 border-t-transparent border-amber-300 rounded-full"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          </div>
          <p className="mt-5 font-semibold">
            Verifying your email and you will be redirected shortly...
          </p>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Reverify;
