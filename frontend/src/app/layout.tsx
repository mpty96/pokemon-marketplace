import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/components/ThemeInitializer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CardPriceAssistant from '@/components/CardPriceAssistant';

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
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-x-hidden">
        <ThemeInitializer />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CardPriceAssistant />
      </body>
    </html>
  );
}