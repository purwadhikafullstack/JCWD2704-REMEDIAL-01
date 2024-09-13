import InvoiceForm from '@/components/invoice/create/invoiceForm';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function page() {
  return (
    <>
      <main className="flex flex-col lg:flex-row h-full w-full bg-[#f6f6f0]">
        <div className="lg:w-56">
          <Sidebar />
        </div>
        <Navbar />
        <div className="w-full h-full ">
          <InvoiceForm />
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
export default page;
