import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import EmailResetPass from '@/components/forgot-password/emailSend';

function page() {
  return (
    <div>
      <EmailResetPass />
      <ToastContainer />
    </div>
  );
}

export default page;
