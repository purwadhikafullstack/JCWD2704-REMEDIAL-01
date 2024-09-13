import { useAppSelector } from '@/app/hooks';
import { TUser } from '@/models/user.model';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Props {
  page: string;
  user: TUser | null;
}

const Unauthorized: React.FC<Props> = ({ page, user }) => {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-5">
      <div className="flex flex-col items-center">
        <div> Sorry you can´t access this feature</div>
        <div>
          {!user?.user?.is_verified
            ? ' Your account is not verified'
            : ' Your account doesnt have a business yet'}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <div>
          {!user?.user?.is_verified ? (
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center py-2 px-4 rounded-xl bg-amber-300 font-semibold"
            >
              Verify Account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/profile/business')}
              className="flex items-center justify-center py-2 px-4 rounded-xl bg-amber-300 font-semibold"
            >
              Create Business
            </button>
          )}
        </div>
        <div>or</div>
        <div>
          <button
            type="button"
            onClick={() => router.push(`/${page}`)}
            className="bg-gray-300 p-2 rounded-xl font-semibold w-36"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
export default Unauthorized;
