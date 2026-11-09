import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Gateway Chat',
  description: 'A small chatbot powered by the AI SDK and Vercel AI Gateway',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
