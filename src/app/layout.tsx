import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { MapProvider } from '@/components/MapProvider';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kwenu Kuna Stima?',
  description: 'Angalia kama majirani wako na stima, ama report blackout kwa mtaa wako.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <MapProvider>{children}</MapProvider>
      </body>
    </html>
  );
}
