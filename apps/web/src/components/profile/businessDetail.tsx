'use client';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import 'react-toastify/dist/ReactToastify.css';
import { logoSrc } from '@/helpers/format';
import { AxiosError } from 'axios';
import { axiosInstance } from '@/libs/axios';
import { TBusiness } from '@/models/business.model';
import { FiEdit } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { Router } from 'next/router';
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io';

interface Props {
  hasChanges: boolean;
}

const BusinessData: React.FC<Props> = ({ hasChanges }) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);
  const [business, setBusiness] = useState<TBusiness>();

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await axiosInstance().get('/businesses/s');
        const business = response.data.data;
        setBusiness(business);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error fetching business data:', error);
        }
      }
    };

    fetchBusinessData();
  }, []);

  const handleUpdate = async () => {
    try {
      let title = '';
      let text = '';
      if (hasChanges) {
        text = 'Do you want to redirect without saving?';
        if (user?.business?.id) {
          title = 'Unsaved changes!';
        } else {
          title = 'Create your business';
        }

        const result = await Swal.fire({
          title: title,
          text: text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes!',
          cancelButtonText: 'No',
        });

        if (result.isConfirmed) {
          router.push('/profile/business');
        }
      } else {
        router.push('/profile/business');
      }
    } catch (error) {
      console.error('Error during update handling:', error);
    }
  };

  return (
    <div className="w-72">
      <div className="border border-gray-300 bg-gray-100 rounded-xl p-5 flex flex-col h-64 gap-5">
        <div className="flex items-center justify-between border-b border-gray-300 pb-4">
          {business ? (
            <>
              <div className="flex items-center gap-2">
                <img
                  src={`${logoSrc}${business?.id}`}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="font-medium text-lg">{business?.name}</div>
              </div>
              <button type="button" onClick={handleUpdate}>
                <FiEdit className="text-center text-xl text-amber-500" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <img
                  src="https://careerforum.net/assets/company-default-96f4ffcb9967f09089dae7656368a5ec5489cd028f5236192e21095006cc86e1.png"
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="font-medium text-lg text-gray-400">
                  Business Name
                </div>
              </div>
              <button type="button" disabled>
                <FiEdit className="text-center text-xl text-gray-400" />
              </button>
            </>
          )}
        </div>
        {business ? (
          <div className="flex flex-col">
            <div className="text-sm">{business?.email}</div>
            <div className="text-sm pb-2">{business?.phone}</div>
            <div className="text-sm">{business?.address}</div>
          </div>
        ) : (
          <div className="w-full flex flex-col justify-between h-full items-center">
            <div className="text-center ">
              let´s create your business and access all our features
            </div>
            <button
              onClick={handleUpdate}
              type="button"
              className="flex items-center justify-center p-2 rounded-xl bg-amber-300 font-semibold"
            >
              <IoMdAdd className="text-lg" />
              Create Business
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessData;
