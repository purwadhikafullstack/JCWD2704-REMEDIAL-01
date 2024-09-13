import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from '@reduxjs/toolkit';
import { TUser, UserLoginPayload } from '@/models/user.model';
import { deleteCookie, getCookie } from 'cookies-next';
import { user } from '../initial';
import { jwtDecode } from 'jwt-decode';

export const userSlice = createSlice({
  name: 'auth',
  initialState: user as TUser | null,
  reducers: {
    login: (state, action: PayloadAction<TUser>) => {
      return { ...state, ...action.payload };
    },
    updateProfile: (state, action: PayloadAction<Partial<TUser>>) => {
      if (state) {
        return { ...state, ...action.payload };
      }
      return state;
    },
    logout: (state) => {
      deleteCookie('access_token', {
        domain: 'localhost',
        sameSite: 'strict',
        secure: false,
      });
      deleteCookie('refresh_token', {
        domain: 'localhost',
        sameSite: 'strict',
        secure: false,
      });
      return user;
    },
  },
});

export const keepLogin = () => {
  return async (dispatch: Dispatch) => {
    try {
      const token = getCookie('access_token');
      if (token) {
        const decodedToken = jwtDecode<UserLoginPayload>(token);
        dispatch(login(decodedToken.user));
      }
    } catch (err: any) {
      deleteCookie('access_token', {
        domain: 'localhost',
        sameSite: 'strict',
        secure: false,
      });
      console.error('Error in keepLogin:', err.message);
    }
  };
};

export const { login, updateProfile, logout } = userSlice.actions;
export default userSlice.reducer;
