'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAppSelector } from '@/app/hooks';
import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdBusiness } from 'react-icons/io';
import { logoSrc } from '@/helpers/format';

function UserBusiness() {
  const user = useAppSelector((state) => state.auth);

  const imageRef = useRef<HTMLInputElement>(null);
  const defaultImageUrl =
    'https://careerforum.net/assets/company-default-96f4ffcb9967f09089dae7656368a5ec5489cd028f5236192e21095006cc86e1.png';
  const [imageSrc, setImageSrc] = useState(defaultImageUrl);
  const [loading, setLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const initialValues = {
    name: '',
    address: '',
    image: null as string | File | null,
    bank: '',
    bank_account: '',
    phone: '',
    email: '',
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required'),
    image: Yup.mixed().nullable(),
    bank: Yup.string().required('Bank is required'),
    bank_account: Yup.string().required('Bank account is required'),
    phone: Yup.string().required('Phone is required'),
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
        formData.append('name', values.name);
        formData.append('address', values.address);
        formData.append('bank', values.bank);
        formData.append('bank_account', values.bank_account);
        formData.append('phone', values.phone);
        formData.append('email', values.email);

        if (values.image) {
          formData.append('logo', values.image);
        }

        if (isUpdateMode && businessId) {
          await axiosInstance().patch(`/businesses/e/${businessId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          });
          toast.success('Business updated successfully');
        } else {
          await axiosInstance().post('/businesses/c', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          });
          toast.success('Business created successfully');
        }

        window.location.reload();
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message || 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    },
  });

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

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await axiosInstance().get('/businesses/s');

        const business = response.data.data;

        if (business) {
          setBusinessId(business.id);
          setIsUpdateMode(true);

          const imgSrc = `${logoSrc}${business.id}`;

          formik.setValues({
            name: business.name || '',
            address: business.address || '',
            image: imgSrc,
            bank: business.bank || '',
            bank_account: business.bank_account || '',
            phone: business.phone || '',
            email: business.email || '',
          });
          setImageSrc(imgSrc);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error fetching business data:', error);
          toast.error(
            error.response?.data.message || 'Failed to fetch business data',
          );
        }
      }
    };

    fetchBusinessData();
  }, []);

  return (
    <div className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md">
      <div className=" mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-3xl font-semibold">
          <IoMdBusiness /> My Business
          {/* {isUpdateMode ? 'Update Business' : 'Create Business'} */}
        </div>
        <div className="text-gray-500 text-sm ">
          The information you share will be used to help the client get to know
          your business!
        </div>
      </div>
      <div className="flex items-center">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-5 w-full justify-center px-10"
        >
          <div className="flex justify-between items-center">
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
                  alt="Business Image"
                  className="w-40 h-40 object-cover rounded-full border-gray-300 border bg-zinc-300 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex flex-col gap-5 w-[600px]">
              <div className="flex justify-between">
                <div className="form-group w-72">
                  <label htmlFor="name" className="mb-2 text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    id="name"
                    name="name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="text-danger text-xs mt-2 text-red-600">
                      {formik.errors.name}
                    </div>
                  ) : null}
                </div>
                <div className="form-group w-72">
                  <label htmlFor="address" className="mb-2 text-sm font-medium">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    id="address"
                    name="address"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.address}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.address && formik.errors.address ? (
                    <div className="text-danger text-xs mt-2 text-red-600">
                      {formik.errors.address}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="form-group w-72">
                  <label htmlFor="bank" className="mb-2 text-sm font-medium">
                    Bank
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    id="bank"
                    name="bank"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.bank}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.bank && formik.errors.bank ? (
                    <div className="text-danger text-xs mt-2 text-red-600">
                      {formik.errors.bank}
                    </div>
                  ) : null}
                </div>
                <div className="form-group w-72">
                  <label
                    htmlFor="bank_account"
                    className="mb-2 text-sm font-medium"
                  >
                    Bank Account
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    id="bank_account"
                    name="bank_account"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.bank_account}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.bank_account && formik.errors.bank_account ? (
                    <div className="text-danger text-xs mt-2 text-red-600">
                      {formik.errors.bank_account}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="form-group w-72">
                  <label htmlFor="phone" className="mb-2 text-sm font-medium">
                    Business Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    id="phone"
                    name="phone"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.phone && formik.errors.phone ? (
                    <div className="text-danger text-xs mt-2 text-red-600">
                      {formik.errors.phone}
                    </div>
                  ) : null}
                </div>
                <div className="form-group w-72">
                  <label htmlFor="email" className="mb-2 text-sm font-medium">
                    Business Email
                  </label>
                  <input
                    type="email"
                    placeholder="Type here"
                    id="email"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-danger text-xs mt-2 text-red-600">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center w-full">
            <button
              type="submit"
              className="bg-[#f2c675] p-2 rounded-xl font-semibold w-60"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : isUpdateMode
                  ? 'Update Business'
                  : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserBusiness;
