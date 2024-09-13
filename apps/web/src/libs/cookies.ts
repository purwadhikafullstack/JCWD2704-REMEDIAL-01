import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { TUser } from '@/models/user.model';

const getAuthCookie = (name: string) => {
  const cookie = getCookie(name);
  if (!cookie) return undefined;
  return Buffer.from(cookie, 'base64').toString('ascii');
};

export const getValidAuthTokens = () => {
  try {
    const token = getAuthCookie('auth');
    const data: TUser = JSON.parse(String(token));

    return {
      data,
    };
  } catch (error) {
    deleteCookie('auth');
    return {
      data: undefined,
    };
  }
};

export const setAuthCookie = (token: string, name: string) => {
  const toBase64 = Buffer.from(token).toString('base64');

  setCookie(name, toBase64, {
    maxAge: 24 * 60 * 60,
    path: '/',
    secure: false,
    domain: 'localhost',
    sameSite: 'strict',
  });
};

export const setRouteCookie = (pathname: string) => {
  const paths = ['/', '/register', '/login'];

  const checkPath = paths.find((p) => p == pathname);

  if (!checkPath)
    setCookie('path', pathname, {
      maxAge: 60 * 60,
      secure: false,
      domain: 'localhost',
      sameSite: 'strict',
    });
};
