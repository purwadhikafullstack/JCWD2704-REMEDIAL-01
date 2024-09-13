import ClientList from '@/components/client/showClient';
import ItemList from '@/components/item/showItem';
import Navbar from '@/components/navbar';
import UserBusiness from '@/components/profile/businessForm';
import UserProfile from '@/components/profile/profileDetail';
import Sidebar from '@/components/sidebar';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function page() {
  return (
    <>
      <main className="flex h-full w-full bg-[#f6f6f0]">
        <div className="w-56">
          <Sidebar />
        </div>
        <div className="w-full h-screen ">
          {/* <Navbar /> */}
          <ClientList />
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
export default page;
