import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastNotification';

const siteUrl = 'https://quizarena-sable-rho.vercel.app';

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'QuizArena | KVJ Analytics Training Platform',
    template: '%s | QuizArena',
  },
  description: 'Interactive live quiz & training assessment platform by KVJ Analytics. Play, Learn, Assess & Grow together.',
  applicationName: 'QuizArena',
  authors: [{ name: 'KVJ Analytics' }],
  keywords: ['QuizArena', 'KVJ Analytics', 'Live Quiz', 'Training Platform', 'Interactive Assessment'],
  icons: {
    icon: [
      { url: '/QuizArena Icon.png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/QuizArena Icon.png',
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'QuizArena | KVJ Analytics Training Platform',
    description: 'Interactive live quiz & training assessment platform by KVJ Analytics. Play, Learn, Assess & Grow together.',
    url: siteUrl,
    siteName: 'QuizArena',
    images: [
      {
        url: `${siteUrl}/og-square.jpg`,
        width: 600,
        height: 600,
        alt: 'QuizArena Logo',
        type: 'image/jpeg',
      },
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'QuizArena - KVJ Analytics Training Platform',
        type: 'image/jpeg',
      },
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'QuizArena - KVJ Analytics Training Platform',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuizArena | KVJ Analytics Training Platform',
    description: 'Interactive live quiz & training assessment platform by KVJ Analytics. Play, Learn, Assess & Grow together.',
    images: [`${siteUrl}/og-square.jpg`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <meta property="og:image" content={`${siteUrl}/og-square.jpg`} />
        <meta property="og:image:secure_url" content={`${siteUrl}/og-square.jpg`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="600" />
        <meta property="og:image:alt" content="QuizArena Logo" />
        <link rel="image_src" href={`${siteUrl}/og-square.jpg`} />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
