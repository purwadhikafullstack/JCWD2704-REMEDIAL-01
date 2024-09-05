'use client';

import { HiOutlineHome } from 'react-icons/hi2';
import { IoBagRemoveOutline } from 'react-icons/io5';
import { BsPeople } from 'react-icons/bs';
import { FiLogOut } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { TiBusinessCard } from 'react-icons/ti';
import { IoMdBusiness } from 'react-icons/io';
import { IoExitOutline } from 'react-icons/io5';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import Link from 'next/link';
import { useAppDispatch } from '@/app/hooks';
import { useRouter } from 'next/navigation';
import { logout } from '@/libs/redux/slices/user.slice';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const Sidebar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
    window.location.reload();
  };

  const [pathname, setPathName] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathName(window.location.pathname);
    }
  }, []);

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const linkClasses = (path: string) =>
    isActivePath(path)
      ? 'flex items-center gap-3 w-full rounded-lg p-2 bg-amber-100 font-semibold'
      : 'flex items-center gap-3 w-full rounded-lg p-2 hover:bg-amber-50';

  const iconClasses = (path: string) =>
    isActivePath(path) ? 'text-xl' : 'text-xl';

  const menuClass = (path: string) =>
    isActivePath(path)
      ? 'flex flex-col gap-1 px-3'
      : 'flex flex-col gap-1 px-3';

  return (
    <div className="w-56 h-screen py-5 z-30 sticky left-0 top-0 bg-white shadow-md">
      <Link
        href={'/'}
        className="text-2xl font-semibold pb-5 border-b border-gray-300 mx-5 flex items-center gap-2 "
      >
        <Image src={'/invozy-fill2.png'} width={30} height={30} alt="invozy" />
        Invozy
      </Link>
      <div className="flex flex-col ">
        <div className="flex flex-col gap-1 py-5 ">
          <div className={menuClass('/')}>
            <Link href={'/'} className={linkClasses('/')}>
              <HiOutlineHome className={iconClasses('/')} />
              <div>Home</div>
            </Link>
          </div>
          <div className={menuClass('/item')}>
            <Link href={'/item'} className={linkClasses('/item')}>
              <IoBagRemoveOutline className={iconClasses('/item')} />
              <div>Items</div>
            </Link>
          </div>
          <div className={menuClass('/client')}>
            <Link href={'/client'} className={linkClasses('/client')}>
              <BsPeople className={iconClasses('/client')} />
              <div>Clients</div>
            </Link>
          </div>
          <div className={menuClass('/invoice')}>
            <Link href={'/invoice'} className={linkClasses('/invoice')}>
              <LiaFileInvoiceSolid className={iconClasses('/invoice')} />
              <div>Invoices</div>
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-300 mx-5"></div>
        <div className="flex flex-col gap-1 py-5 ">
          <div className={menuClass('/profile')}>
            <Link href={'/profile'} className={linkClasses('/profile')}>
              <TiBusinessCard className={iconClasses('/profile')} />
              <div>Profile</div>
            </Link>
          </div>
          {/* <div className={menuClass('/business')}>
            <Link href={'/business'} className={linkClasses('/business')}>
              <IoMdBusiness className={iconClasses('/business')} />
              <div>Business</div>
            </Link>
          </div> */}
        </div>
        <div className="border-t border-gray-300 mx-5"></div>

        <div className="py-5 px-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg p-2 hover:text-amber-500"
          >
            <IoExitOutline className="text-xl" />
            <div>Logout</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
