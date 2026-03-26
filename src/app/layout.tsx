import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Dead Man's Switch | EVE Frontier",
  description: 'Your last will in the stars.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}