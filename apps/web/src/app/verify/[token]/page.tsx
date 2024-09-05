import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import FinalizeData from '@/components/verification/finalizeData';

function page() {
  return (
    <div>
      <FinalizeData />
      <ToastContainer />
    </div>
  );
}

export default page;
