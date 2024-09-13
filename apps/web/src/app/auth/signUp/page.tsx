import SignUp from '@/components/auth/signUp/signUp';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function page() {
  return (
    <>
      <SignUp />
      <ToastContainer />
    </>
  );
}
export default page;
