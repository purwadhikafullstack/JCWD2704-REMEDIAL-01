'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/app/hooks';
import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setCookie, getCookie } from 'cookies-next';
import { login } from '@/libs/redux/slices/user.slice';
import { updateProfile, keepLogin } from '@/libs/redux/slices/user.slice';
import { logoSrc, profileSrc } from '@/helpers/format';
import { TiBusinessCard } from 'react-icons/ti';
import Swal from 'sweetalert2';
import Loading from '../loading';
import DetailProfile from './profileForm';

function UserProfile() {
  const user = useAppSelector((state) => state.auth);
  const searchParams = useSearchParams();
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [initialServerValues, setInitialServerValues] = useState({
    image: null as string | File | null,
    first_name: '',
    last_name: '',
    email: '',
    deleteImg: false,
  });
  const defaultImageUrl =
    'https://i.pinimg.com/736x/25/ee/de/25eedef494e9b4ce02b14990c9b5db2d.jpg';
  const [imageSrc, setImageSrc] = useState(defaultImageUrl);
  const [userImg, setUserImg] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const refreshed = searchParams.get('refreshed');
    if (refreshed === 'true') {
      const url = new URL(window.location.href);
      url.searchParams.delete('refreshed');
      window.history.replaceState({}, '', url.toString());

      window.location.reload();
    }
  }, [searchParams]);

  const initialValues = {
    image: null as string | File | null,
    first_name: '',
    last_name: '',
    email: '',
    deleteImg: false,
  };

  const validationSchema = Yup.object().shape({
    image: Yup.mixed().nullable(),
    first_name: Yup.string()
      .required('First name is required')
      .min(3, 'First name must have at least 3 characters'),
    last_name: Yup.string()
      .required('Last name is required')
      .min(3, 'Last name must have at least 3 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('first_name', values.first_name);
        formData.append('last_name', values.last_name);
        formData.append('email', values.email);

        if (!formik.values.deleteImg) {
          if (values.image) {
            formData.append('image', values.image);
          }
        }

        if (formik.values.deleteImg) {
          formData.append('deleteImg', 'true');
        }

        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to update your profile?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          const response = await axiosInstance().patch(
            '/users/editProfile',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              withCredentials: true,
            },
          );

          const { token, user: fetchedUser } = response.data;
          setCookie('access_token', token, {
            secure: false,
            domain: 'localhost',
            sameSite: 'strict',
          });

          dispatch(login(fetchedUser));
          window.location.reload();

          toast.success('Profile updated successfully', {
            autoClose: 2000,
          });
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (user && user.user && user.user.id) {
      const imgSrc = `${profileSrc}${user.user.id}`;

      const values = {
        image: imgSrc,
        first_name: user.user.first_name,
        last_name: user.user.last_name,
        email: user.user.email,
        deleteImg: false,
      };

      formik.setValues(values);
      setImageSrc(imgSrc);
      setUserImg(imgSrc);
      setInitialServerValues(values);
      setLoadingPage(false);
    }
  }, [user]);

  useEffect(() => {
    const isChanged = Object.keys(formik.values).some(
      (key) =>
        formik.values[key as keyof typeof formik.values] !==
        initialServerValues[key as keyof typeof initialServerValues],
    );
    setHasChanges(isChanged);
  }, [formik.values, initialServerValues]);

  return (
    <>
      {loadingPage ? (
        <Loading />
      ) : (
        <div className="h-full lg:h-screen p-10">
          <div className="tracking-tighter  bg-white p-10 rounded-xl shadow-md h-full">
            <div className="text-3xl font-semibold mb-8 flex items-center gap-2 border-b border-gray-300 pb-3">
              <TiBusinessCard /> My Account
            </div>
            <div className="flex justify-between gap-10">
              <DetailProfile
                formik={formik}
                imageSrc={imageSrc}
                setImageSrc={setImageSrc}
                userImg={userImg}
                initialServerValues={initialServerValues}
                user={user}
                setLoadingPage={setLoadingPage}
                loading={loading}
                defaultImageUrl={defaultImageUrl}
                hasChanges={hasChanges}
              />

              {/* <BusinessData /> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserProfile;
