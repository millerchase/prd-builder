import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PRD Builder',
  description: 'AI-Powered Product Requirements Document Builder',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
