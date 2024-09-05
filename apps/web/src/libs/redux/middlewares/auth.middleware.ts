import { Dispatch } from '@reduxjs/toolkit';
import axios from 'axios';
import { login } from '../slices/user.slice';
import { UserLoginPayload, TUser } from '@/models/user.model';
import { deleteCookie, getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { axiosInstance } from '@/libs/axios';

export const userLogin = ({ email, password }: UserLoginPayload) => {
  return async (dispatch: Dispatch) => {
    try {
      await axiosInstance().post(
        '/users/v3',
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      const access_token = getCookie('access_token') || '';
      if (access_token) {
        const user: TUser = jwtDecode(access_token);
        dispatch(login(user));
      }
      return { success: true };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorMessage =
            err.response.data.message || 'An unexpected error occurred.';
          toast.error(errorMessage);
          console.log('Axios error response:', err.response);
        } else {
          toast.error('An unexpected error occurred.');
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
      return { success: false };
    }
  };
};

export const keepLogin = () => {
  return async (dispatch: Dispatch) => {
    try {
      const token = getCookie('access_token');
      if (token) {
        dispatch(login(jwtDecode(token)));
      }
    } catch (err: any) {
      deleteCookie('access_token');
    }
  };
};
