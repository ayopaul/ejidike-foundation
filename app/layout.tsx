import type { Metadata } from "next";
import { Nunito_Sans } from 'next/font/google';
import "./globals.css";
import { Toaster } from 'sonner';

const nunitoSans = Nunito_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Ejidike Foundation",
  description: "Empowering Nigeria's Youth to Learn, Lead & Innovate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors expand={false} />
      </body>
    </html>
  );
}