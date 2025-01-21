import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MSWProvider } from '@/mocks/compoenets/MSWProvider';
import './globals.css';
import Providers from '@/providers/tanstack-query/Providers';

export const metadata: Metadata = {
  title: 'DevOnOff',
  description: '온오프라인 개발 스터디 플랫폼',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<JSX.Element> {
  return (
    <html lang="ko" data-theme="pastel">
      <body className="min-h-screen bg-base-100 text-base-content">
        <Providers>
          {process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && <MSWProvider />}
          <div className="flex flex-col min-h-screen">
            <div className="h-16">
              <Header />
            </div>
            <main className="flex-1 container mx-auto px-4 py-8 pt-16 min-h-[calc(100vh-16rem)]">
              {children}
            </main>
            <div className="h-48">
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
