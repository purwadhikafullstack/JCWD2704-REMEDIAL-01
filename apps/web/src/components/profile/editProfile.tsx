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
import { jwtDecode } from 'jwt-decode';
import { login } from '@/libs/redux/slices/user.slice';
import { updateProfile, keepLogin } from '@/libs/redux/slices/user.slice';
import { profileSrc } from '@/helpers/format';
import { TiBusinessCard } from 'react-icons/ti';

function UserProfile() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);
  const searchParams = useSearchParams();

  const imageRef = useRef<HTMLInputElement>(null);
  const defaultImageUrl =
    'https://i.pinimg.com/736x/25/ee/de/25eedef494e9b4ce02b14990c9b5db2d.jpg';
  const [imageSrc, setImageSrc] = useState(defaultImageUrl);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
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

        if (values.image) {
          formData.append('image', values.image);
        }

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
      } catch (error) {
        if (error instanceof AxiosError) {
          alert(error.response?.data.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubmit = (values: any) => {
    dispatch(updateProfile(values));
  };

  useEffect(() => {
    if (user && user.user && user.user.id) {
      const imgSrc = `${profileSrc}${user.user.id}`;

      formik.setValues({
        image: imgSrc,
        first_name: user.user.first_name,
        last_name: user.user.last_name,
        email: user.user.email,
      });

      setImageSrc(imgSrc);
    }
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };

      reader.readAsDataURL(file);

      if (file.size > 1048576) {
        toast.error('File size exceeds 1MB. Please select a smaller file.', {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      formik.setFieldValue('image', null);
    }
  };

  return (
    <div className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md">
      <div className="text-3xl font-semibold mb-8 flex items-center gap-2">
        <TiBusinessCard /> My Account
      </div>
      <div className="flex items-center ">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-5 w-full justify-center px-10"
        >
          <div className="flex justify-between items-center ">
            <div className="form-group flex flex-col items-center justify-center">
              <div>
                <input
                  type="file"
                  ref={imageRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <img
                  src={imageSrc}
                  onClick={() => imageRef.current?.click()}
                  onError={() => setImageSrc(defaultImageUrl)}
                  alt="Profile Picture"
                  className="w-40 h-40 object-cover rounded-full border-gray-300 border bg-zinc-300 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex flex-col gap-5 w-[600px]">
              <div className="flex justify-between">
                <div className="form-group w-72">
                  <label
                    htmlFor="first_name"
                    className=" mb-2 text-sm font-medium"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    id="first_name"
                    name="first_name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.first_name}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.first_name && formik.errors.first_name ? (
                    <div className="text-danger text-xs mt-2">
                      {formik.errors.first_name}
                    </div>
                  ) : null}
                </div>
                <div className="form-group w-72">
                  <label
                    htmlFor="last_name"
                    className="mb-2 text-sm font-medium"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    id="last_name"
                    name="last_name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.last_name}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.last_name && formik.errors.last_name ? (
                    <div className="text-danger text-xs mt-2">
                      {formik.errors.last_name}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* EMAIL */}
              <div className="form-group w-full">
                <label htmlFor="email" className="mb-2 text-sm font-medium">
                  Email Address
                </label>

                <input
                  type="text"
                  placeholder="Type here"
                  id="email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className="w-full rounded-xl p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-danger text-xs mt-2">
                    {formik.errors.email}
                  </div>
                ) : null}
                <div>
                  {' '}
                  {user?.user?.reqEmailChange && (
                    <div className="label font-semibold text-sm text-red-500">
                      Please verify your e-mail!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group flex justify-center">
            <button
              type="submit"
              className="bg-[#f2c675] p-2 rounded-xl font-semibold w-60"
            >
              {loading ? <div>Loading</div> : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
