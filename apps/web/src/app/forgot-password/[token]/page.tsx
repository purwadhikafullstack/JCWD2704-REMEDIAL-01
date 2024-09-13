import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import FinalizeData from '@/components/verification/finalizeData';
import ResetPassword from '@/components/forgot-password/resetPassword';

function page() {
  return (
    <div>
      <ResetPassword />
      <ToastContainer />
    </div>
  );
}

export default page;
