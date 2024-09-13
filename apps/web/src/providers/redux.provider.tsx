'use client';
import store from '@/libs/redux/store';
import { Provider } from 'react-redux';
import AuthProvider from './auth.provider';

export const StoreProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};
