import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { siteConfig } from '@/config/site';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const geistMono = localFont({
  src: [
    {
      path: './fonts/Satoshi-Light.otf',
      weight: '100',
    },
    {
      path: './fonts/Satoshi-Regular.otf',
      weight: '300',
    },
    {
      path: './fonts/Satoshi-Medium.otf',
      weight: '500',
    },
    {
      path: './fonts/Satoshi-Bold.otf',
      weight: '700',
    },
    {
      path: './fonts/Satoshi-Black.otf',
      weight: '900',
    },
  ],
});

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Next.js',
    'React',
    'Tailwind CSS',
    'Server Components',
    'Radix UI',
  ],
  authors: [
    {
      name: 'bossadizenith',
      url: 'https://bossadizenith.me',
    },
    {
      name: 'romaric250',
      url: 'https://romaric250.me',
    },
  ],
  creator: 'bossadizenith',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: '@bossadizenith',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider>
        <html lang="en">
          <body className={` ${geistMono.className} antialiased`}>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            {children}
          </body>
        </html>
      </ClerkProvider>
    </html>
  );
}
