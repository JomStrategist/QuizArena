import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastNotification';

export const metadata: Metadata = {
  title: 'QuizArena | KVJ Analytics Training Platform',
  description: 'Modern internal training and learning assessment platform for conducting interactive quizzes.',
  icons: {
    icon: '/QuizArena Icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
