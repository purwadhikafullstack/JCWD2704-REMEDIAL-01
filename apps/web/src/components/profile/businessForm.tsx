'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdBusiness } from 'react-icons/io';
import { logoSrc } from '@/helpers/format';
import { AiOutlinePicture } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import Loading from '../loading';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/app/hooks';
import Unauthorized from '../unauthorized';
const libraries: ['places'] = ['places'];

function UserBusiness() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const defaultImageUrl =
    'https://careerforum.net/assets/company-default-96f4ffcb9967f09089dae7656368a5ec5489cd028f5236192e21095006cc86e1.png';
  const [imageSrc, setImageSrc] = useState(defaultImageUrl);
  const [logoImg, setLogoImg] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [initialServerValues, setInitialServerValues] = useState({
    image: null as string | File | null,
    address: '',
    name: '',
    bank: '',
    bank_account: '',
    phone: '',
    email: '',
  });
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });
  const user = useAppSelector((state) => state.auth);

  useEffect(() => {}, [user]);

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

        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to update your business?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          if (isUpdateMode && businessId) {
            await axiosInstance().patch(
              `/businesses/e/${businessId}`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
              },
            );
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
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
        }
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
      setFileSelected(true);
      if (file.size > 1048576) {
        toast.error('File size exceeds 1MB. Please select a smaller file.');
        if (imageRef.current) {
          imageRef.current.value = '';
        }
        setFileSelected(false);
        setImageSrc(logoImg || defaultImageUrl);
        formik.setFieldValue('image', null);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
        formik.setFieldValue('image', file);
      }
    } else {
      setImageSrc(logoImg || defaultImageUrl);
      formik.setFieldValue('image', null);
      setFileSelected(false);
    }
  };

  const handleDeleteImage = () => {
    const resetFileInput = () => {
      if (imageRef.current) {
        imageRef.current.value = '';
      }
      setFileSelected(false);
    };
    setImageSrc(logoImg);
    formik.setFieldValue('image', logoImg);
    resetFileInput();
  };

  const handleCancel = async () => {
    if (initialServerValues) {
      if (hasChanges) {
        const result = await Swal.fire({
          title: 'Unsaved changes!',
          text: 'Do you want to cancel without saving?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, cancel!',
          cancelButtonText: 'No',
        });

        if (result.isConfirmed) {
          setLoadingPage(true);
          try {
            await formik.setValues(initialServerValues);
            setImageSrc(logoImg);
            if (imageRef.current) {
              imageRef.current.value = '';
            }
            setFileSelected(false);
          } catch (error) {
            console.error('Error resetting form values:', error);
          } finally {
            setLoadingPage(false);
          }
        }
      } else {
        router.push('/profile');
      }
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
          const values = {
            name: business.name || '',
            address: business.address || '',
            image: imgSrc,
            bank: business.bank || '',
            bank_account: business.bank_account || '',
            phone: business.phone || '',
            email: business.email || '',
          };
          formik.setValues(values);
          setImageSrc(imgSrc);
          setLogoImg(imgSrc);
          setInitialServerValues(values);
          setLoadingPage(false);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error fetching business data:', error);
          toast.error(
            error.response?.data.message || 'Failed to fetch business data',
          );
        }
      } finally {
        setLoadingPage(false);
      }
    };

    fetchBusinessData();
  }, []);

  useEffect(() => {
    const isChanged = Object.keys(formik.values).some(
      (key) =>
        formik.values[key as keyof typeof formik.values] !==
        initialServerValues[key as keyof typeof initialServerValues],
    );
    setHasChanges(isChanged);
  }, [formik.values, initialServerValues]);

  const handlePlaceChanged = () => {
    const place = autocomplete?.getPlace();
    if (place && place.formatted_address) {
      formik.setFieldValue('address', place.formatted_address);
    }
  };

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const handleNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/[^0-9]/g, '');
    const { id } = event.target;
    if (id === 'bank_account') {
      formik.setFieldValue('bank_account', numericValue);
    } else if (id === 'phone') {
      formik.setFieldValue('phone', numericValue);
    }
  };

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <>
      {loadingPage ? (
        <Loading />
      ) : (
        <>
          {!user?.user?.is_verified || !user.business?.id ? (
            <Unauthorized page={`profile`} user={user} />
          ) : (
            <div className="h-full lg:h-screen p-10">
              <div className="tracking-tighter  bg-white p-10 rounded-xl shadow-md h-full">
                <div className=" mb-8 flex flex-col gap-2 border-b border-gray-300 pb-3">
                  <div className="flex items-center gap-2 text-3xl font-semibold">
                    <IoMdBusiness /> My Business
                  </div>
                </div>
                <form
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col justify-center gap-8 w-full"
                >
                  <div className="flex justify-between w-full">
                    <div className="form-group flex flex-col ">
                      <div className="flex flex-col w-60 h-60 gap-5 items-center">
                        <div className="relative w-40 h-40 ">
                          <img
                            src={imageSrc}
                            onClick={() => imageRef.current?.click()}
                            onError={() => {
                              setImageSrc(defaultImageUrl);
                            }}
                            alt="Profile Picture"
                            className="w-40 h-40 object-cover rounded-full border-gray-300 border  cursor-pointer"
                          />
                          <input
                            type="file"
                            ref={imageRef}
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <div className="absolute -bottom-1 -right-1">
                            <button
                              type="button"
                              className="w-12 h-12 text-xl flex justify-center items-center border-2 border-white  bg-amber-300  font-bold rounded-full z-10 "
                              onClick={() => imageRef.current?.click()}
                            >
                              <AiOutlinePicture />
                            </button>
                          </div>
                        </div>
                        <div className="h-10">
                          {fileSelected && (
                            <button
                              type="button"
                              onClick={handleDeleteImage}
                              className="px-4 py-2 bg-gray-300 rounded-xl"
                            >
                              Delete Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col w-80">
                      <div className="h-24">
                        <label
                          htmlFor="name"
                          className="mb-2 text-sm font-medium"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder=""
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

                      <div className="h-24">
                        <label
                          htmlFor="email"
                          className="mb-2 text-sm font-medium"
                        >
                          Business Email
                        </label>
                        <input
                          type="email"
                          placeholder=""
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
                      <div className="h-24">
                        <label
                          htmlFor="phone"
                          className="mb-2 text-sm font-medium"
                        >
                          Business Phone
                        </label>
                        <input
                          type="text"
                          placeholder=""
                          id="phone"
                          name="phone"
                          onChange={handleNumber}
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
                    </div>
                    <div className="flex flex-col w-80">
                      <div className="h-24">
                        <label
                          htmlFor="bank"
                          className="mb-2 text-sm font-medium"
                        >
                          Bank - Account Number
                        </label>
                        <div>
                          <input
                            type="text"
                            placeholder=""
                            id="bank"
                            name="bank"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.bank}
                            className="rounded-bl-xl rounded-tl-xl w-24 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                          />
                          <input
                            type="text"
                            placeholder=""
                            id="bank_account"
                            name="bank_account"
                            onChange={handleNumber}
                            onBlur={formik.handleBlur}
                            value={formik.values.bank_account}
                            className="rounded-br-xl rounded-tr-xl w-48 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="flex w-72">
                          <div className="w-24">
                            {formik.touched.bank && formik.errors.bank ? (
                              <div className="text-danger text-xs mt-2 text-red-600">
                                {formik.errors.bank}
                              </div>
                            ) : null}
                          </div>
                          <div className="w-48">
                            {formik.touched.bank_account &&
                            formik.errors.bank_account ? (
                              <div className="text-danger text-xs mt-2 text-red-600">
                                {formik.errors.bank_account}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="h-24">
                        <label
                          htmlFor="address"
                          className="mb-2 text-sm font-medium"
                        >
                          Address
                        </label>
                        <Autocomplete
                          onLoad={onLoad}
                          onPlaceChanged={handlePlaceChanged}
                        >
                          <input
                            type="text"
                            placeholder=""
                            id="address"
                            name="address"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.address}
                            className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                          />
                        </Autocomplete>
                        {formik.touched.address && formik.errors.address ? (
                          <div className="text-danger text-xs mt-2 text-red-600">
                            {formik.errors.address}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-full gap-10">
                    <button
                      type="submit"
                      className={`bg-amber-300 p-2 rounded-xl font-semibold w-36 ${!hasChanges ? 'opacity-60' : ''}`}
                      disabled={!hasChanges || loading}
                    >
                      {isUpdateMode ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={`bg-amber-100 p-2 rounded-xl font-semibold w-36`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default UserBusiness;
