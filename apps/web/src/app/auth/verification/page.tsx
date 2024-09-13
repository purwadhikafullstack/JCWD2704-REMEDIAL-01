import ResendEmail from '@/components/auth/verification/resendEmail';
import React, { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';

function VerifyPage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <ResendEmail />;
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default VerifyPage;
