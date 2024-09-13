'use client';

import React, { useEffect, useState } from 'react';
import { IoIosMore, IoMdHome } from 'react-icons/io';
import { IoStorefront, IoLogOutSharp, IoMenu } from 'react-icons/io5';
import { PiUsersThreeFill } from 'react-icons/pi';
import { FaUserAlt, FaStore } from 'react-icons/fa';
import { BiSolidCategory } from 'react-icons/bi';
import { RiShoppingBasket2Fill } from 'react-icons/ri';
import Link from 'next/link';
import { MdClose } from 'react-icons/md';
import Image from 'next/image';
import { CiCircleMore } from 'react-icons/ci';

const Navbar = () => {
  const [pathname, setPathName] = useState('');
  const [showPopup, setShowPopup] = useState(false);

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
      ? 'flex items-center gap-3 w-full rounded-lg p-2 bg-amber-100 font-semibold text-black'
      : 'flex items-center gap-3 w-full rounded-lg p-2 hover:bg-amber-50';

  const iconClasses = (path: string) =>
    isActivePath(path) ? 'text-xl' : 'text-xl';

  const togglePopup = () => setShowPopup(!showPopup);

  return (
    <>
      <div className="w-full bg-white shadow-md p-4 flex justify-between items-center z-50 sticky top-0 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePopup}
            // className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            <IoMenu className="text-xl" />
          </button>
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <Image
              src="/invozy-fill2.png"
              width={30}
              height={30}
              alt="Invozy"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap">
              Invozy
            </span>
          </Link>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col w-60 ">
          <div className="w-60 flex justify-between items-center p-4 border-b-2">
            <h1 className=" font-bold font-poppins text-2xl">Menu</h1>
            <button onClick={togglePopup} className="text-2xl">
              <MdClose />
            </button>
          </div>
          <div className="flex flex-col gap-5 py-10 px-5 overflow-y-auto text-gray-500">
            <Link href={'/'} className={linkClasses('/')}>
              <IoMdHome className={iconClasses('/')} /> Home
            </Link>
            <hr />
            <Link href={'/item'} className={linkClasses('/item')}>
              <IoStorefront className={iconClasses('/item')} /> Items
            </Link>
            <hr />
            <Link href={'/client'} className={linkClasses('/client')}>
              <PiUsersThreeFill className={iconClasses('/client')} /> Clients
            </Link>
            <hr />
            <Link href={'/invoice'} className={linkClasses('/invoice')}>
              <RiShoppingBasket2Fill className={iconClasses('/invoice')} />{' '}
              Invoices
            </Link>
            <hr />
            <Link href={'/profile'} className={linkClasses('/profile')}>
              <FaUserAlt className={iconClasses('/profile')} /> Profile
            </Link>
            <hr />
            <button
              onClick={() => {}}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50"
            >
              <IoLogOutSharp className={iconClasses('/logout')} /> Logout
            </button>
            <hr />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
