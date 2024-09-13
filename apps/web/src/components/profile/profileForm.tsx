'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlinePicture } from 'react-icons/ai';
import { MdVerified } from 'react-icons/md';
import { PiSealWarningFill } from 'react-icons/pi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import BusinessData from './businessDetail';
import { ProfileProps } from './props/profile';
import { axiosInstance } from '@/libs/axios';

const DetailProfile: React.FC<ProfileProps> = ({
  formik,
  imageSrc,
  setImageSrc,
  userImg,
  initialServerValues,
  user,
  setLoadingPage,
  loading,
  defaultImageUrl,
  hasChanges,
}) => {
  const [hasImg, setHasImg] = useState(true);
  const [fileSelected, setFileSelected] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
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
        setImageSrc(userImg || defaultImageUrl);
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
      setImageSrc(userImg || defaultImageUrl);
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
    const setDefaultImage = (deleteImage: boolean, imgSrc: string) => {
      formik.setFieldValue('deleteImg', deleteImage);
      setImageSrc(imgSrc);
      formik.setFieldValue('image', userImg);
      resetFileInput();
    };
    if (hasImg) {
      setDefaultImage(true, defaultImageUrl);
    } else {
      setDefaultImage(false, userImg);
    }
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
            setImageSrc(userImg);
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
      }
    }
  };

  const resendReverify = async () => {
    try {
      const response = await axiosInstance().post('/users/resendReverify');

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
    }
  };

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col justify-center gap-8 w-full"
      >
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <div className="form-group flex flex-col ">
              <div className="flex flex-col w-60 h-60 gap-5 items-center">
                <div className="relative w-40 h-40 ">
                  <img
                    src={imageSrc}
                    onClick={() => imageRef.current?.click()}
                    onError={() => {
                      setImageSrc(defaultImageUrl);
                      setHasImg(false);
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
                  {(imageSrc !== defaultImageUrl || fileSelected) && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="px-4 py-2 bg-gray-300 rounded-xl font-semibold"
                    >
                      Delete Image
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-10">
              <div className="flex flex-col w-80">
                <div className="h-24">
                  <label
                    htmlFor="first_name"
                    className=" mb-2 text-sm font-medium"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    id="first_name"
                    name="first_name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.first_name}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:bg-amber-50 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.first_name && formik.errors.first_name ? (
                    <div className="text-red-700 text-xs mt-1">
                      {formik.errors.first_name}
                    </div>
                  ) : null}
                </div>
                <div className="h-24">
                  <label
                    htmlFor="last_name"
                    className="mb-2 text-sm font-medium"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    id="last_name"
                    name="last_name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.last_name}
                    className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:bg-amber-50 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  {formik.touched.last_name && formik.errors.last_name ? (
                    <div className="text-red-700 text-xs mt-1">
                      {formik.errors.last_name}
                    </div>
                  ) : null}
                </div>
                <div className="h-24">
                  <label htmlFor="email" className="mb-2 text-sm font-medium">
                    Email Address
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder=""
                      id="email"
                      name="email"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      className="rounded-xl w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:bg-amber-50 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                    />
                    {user?.user?.is_verified &&
                    initialServerValues.email === formik.values.email ? (
                      <div>
                        <MdVerified className="text-blue-600 text-lg" />
                      </div>
                    ) : !user?.user?.is_verified ? (
                      <div>
                        <PiSealWarningFill className="text-red-600 text-lg" />
                      </div>
                    ) : null}
                  </div>
                  {initialServerValues.email !== formik.values.email && (
                    <div className="text-red-700 text-xs mt-1">
                      This changes will require you to verify your e-mail
                      address.
                    </div>
                  )}
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-700 text-xs mt-1">
                      {formik.errors.email}
                    </div>
                  ) : null}
                  {user?.user?.reqEmailChange && (
                    <div className="flex items-center gap-1">
                      <div className="text-red-700 text-xs mt-1">
                        Please verify your e-mail!
                      </div>
                      <button
                        type="button"
                        onClick={resendReverify}
                        className="text-red-700 text-xs mt-1 underline"
                      >
                        Click to resend verification
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <BusinessData hasChanges={hasChanges} />
        </div>

        <div className="flex justify-center gap-10">
          <button
            type="submit"
            className={`bg-amber-300 p-2 rounded-xl font-semibold w-36 ${!hasChanges ? 'opacity-60' : 'hover:bg-amber-400'}`}
            disabled={!hasChanges || loading}
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasChanges}
            className={`bg-amber-100 p-2 rounded-xl font-semibold w-36 ${hasChanges ? ' ' : 'opacity-60'}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default DetailProfile;
