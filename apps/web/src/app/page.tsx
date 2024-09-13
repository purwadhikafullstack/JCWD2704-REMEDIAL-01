import Home from '@/components/home';
import Navbar from '@/components/navbar';
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
          <Home />
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
export default page;
