import SignIn from '@/components/auth/login/signIn';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function page() {
  return (
    <>
      <SignIn />
      <ToastContainer />
    </>
  );
}
export default page;
