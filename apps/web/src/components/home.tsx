'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/app/hooks';
import Loading from './loading';

const Home = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user) {
      setLoading(false);
    } else {
      router.push('/auth/login');
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }

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
