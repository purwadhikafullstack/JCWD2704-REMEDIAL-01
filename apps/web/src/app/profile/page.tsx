import Navbar from '@/components/navbar';
import UserProfile from '@/components/profile/profileDetail';
import Sidebar from '@/components/sidebar';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function page() {
  return (
    <>
      <main className="flex h-full w-full bg-[#f4f4f2]">
        <div className="w-56">
          <Sidebar />
        </div>
        <div className="w-full h-full max-w-screen-xl">
          <UserProfile />
          {/* <UserBusiness /> */}
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
export default page;
