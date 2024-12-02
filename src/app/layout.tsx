import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MSWProvider } from '@/mocks/compoenets/MSWProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevOnOff',
  description: '개발자 온오프라인 스터디 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="business">
      <body className="antialiased">
        {process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && <MSWProvider />}
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
