import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'MineVoice',
  description: 'Speak up. Route it right. Track what happens. A multilingual public accountability and grievance intelligence platform for mining-affected communities.',
  openGraph: {
    title: 'MineVoice',
    description: 'Speak up. Route it right. Track what happens. A multilingual public accountability and grievance intelligence platform for mining-affected communities.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MineVoice',
    description: 'Speak up. Route it right. Track what happens. A multilingual public accountability and grievance intelligence platform for mining-affected communities.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased" suppressHydrationWarning>
        <Navigation />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
