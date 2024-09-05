'use client';

import { axiosInstance } from '@/libs/axios';
import { TProduct } from '@/models/product.model';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { BiSearch } from 'react-icons/bi';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { formatPrice } from '@/helpers/format';
import { FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { IoMdAdd } from 'react-icons/io';
import { TInvoice } from '@/models/invoice.model';
import { useAppSelector } from '@/app/hooks';

const Home = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);

  return (
    <>
      <section className="tracking-tighter p-10 rounded-xl h-full flex flex-col justify-between gap-5">
        <div
          className="bg-white w-full h-full rounded-xl py-10 px-20
         shadow-md border border-gray-200 flex items-center justify-between gap-5"
        >
          <div className="text-4xl font-bold">
            <div>Halo {user?.user?.first_name} !</div>
            <div>
              Welcome to <span>Invozy</span>{' '}
            </div>
            <div className="text-amber-500 font-bold text-2xl">
              We´re Happy to be part of your journey
            </div>
            <div className="text-amber-500 font-bold text-2xl">
              Let´s managing your invoices
            </div>
          </div>
          <div className="flex justify-end">
            <Image
              src={'/invozy-fill2.png'}
              alt="logo-invozy"
              width={250}
              height={250}
            ></Image>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
