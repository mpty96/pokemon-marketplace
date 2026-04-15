import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'PokéMarket Chile',
  description: 'Compra y vende cartas Pokémon en Chile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}