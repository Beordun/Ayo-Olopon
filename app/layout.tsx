import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ayò Ọlọ́pọ́n Digital — Traditional Yoruba Board Game',
  description:
    'High-fidelity, culturally authentic web implementation of the traditional Yoruba count-and-capture board game Ayò Ọlọ́pọ́n. Built with Next.js, Material 3, and Gemini AI Grandmaster.',
  keywords: ['Ayo Olopon', 'Yoruba board game', 'Mancala', 'African games', 'Oware', 'Next.js game'],
  authors: [{ name: 'Ayò Ọlọ́pọ́n Digital Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#100805',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="yo" className="dark">
      <body className="bg-ayo-surface text-stone-200 antialiased selection:bg-amber-900/50 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
