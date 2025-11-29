import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PRD Builder - AI-Powered Product Requirements',
  description:
    'Transform your product ideas into structured, actionable PRDs in minutes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
