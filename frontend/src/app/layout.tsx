import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/components/ThemeInitializer';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'PokeMarket Chile',
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
        <ThemeInitializer />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}