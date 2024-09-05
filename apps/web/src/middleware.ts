import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { TUser } from '@/models/user.model';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refresh_token = request.cookies.get('refresh_token')?.value || '';

  const response = NextResponse.next();
  const isLogin = await fetch('http://localhost:8000/api/users/v4', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${refresh_token}`,
    },
  })
    .then(async (res) => {
      const data = await res.json();
      if (!data.access_token) throw new Error('Token not found ---');
      response.cookies.set('access_token', data.access_token);
      return true;
    })
    .catch((err) => {
      if (err instanceof Error) console.log(err.message);
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return false;
    });

  const token = response.cookies.get('access_token')?.value;
  const decode = token ? (jwtDecode(token) as { user: TUser }) : undefined;

  if (
    !isLogin &&
    (pathname == '/' ||
      pathname == '/profile' ||
      pathname.startsWith('/item') ||
      pathname.startsWith('/client') ||
      pathname.startsWith('/invoice'))
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  } else if (
    isLogin &&
    (pathname.startsWith('/auth') || pathname.startsWith('/verify'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return response;
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/verify/:path*',
    '/profile',
    '/item/:path*',
    '/client/:path*',
    '/invoice/:path*',
  ],
};
