import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/components/ThemeInitializer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CardPriceAssistant from '@/components/CardPriceAssistant';

export const metadata: Metadata = {
  metadataBase: new URL('https://tcgpokemarket.cl'),
  title: 'PokeMarket Chile',
  description: 'Marketplace chileno para comprar y vender cartas Pokémon TCG de forma segura.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'PokeMarket Chile',
    description: 'Marketplace chileno para comprar y vender cartas Pokémon TCG de forma segura.',
    url: 'https://tcgpokemarket.cl',
    siteName: 'PokeMarket Chile',
    images: [
      {
        url: '/logo-footer.png',
        width: 1200,
        height: 630,
        alt: 'PokeMarket Chile',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PokeMarket Chile',
    description: 'Marketplace chileno para comprar y vender cartas Pokémon TCG de forma segura.',
    images: ['/logo-footer.png'],
  },
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