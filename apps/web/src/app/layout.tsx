import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/providers/redux.provider';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invozy',
  description:
    'Invozy is a web-based invoice management application designed to streamline billing and payment processes.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
