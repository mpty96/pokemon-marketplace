'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Listing, CardCondition, CardRarity } from '@/types';

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint', NEAR_MINT: 'Near Mint', EXCELLENT: 'Excelente',
  GOOD: 'Buena', PLAYED: 'Jugada', POOR: 'Dañada',
};

const RARITY_LABELS: Record<CardRarity, string> = {
  COMMON: 'Común', UNCOMMON: 'Poco común', RARE: 'Rara',
  HOLO_RARE: 'Holo Rara', ULTRA_RARE: 'Ultra Rara',
  SECRET_RARE: 'Secret Rara', PROMO: 'Promo',
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/api/listings?limit=8')
      .then(({ data }) => setListings(data.listings))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-10 text-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          🎴 El marketplace de cartas Pokémon en Chile
        </h1>
        <p className="text-blue-100 mb-6 text-lg">
          Compra y vende cartas con otros coleccionistas de forma segura
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/marketplace"
            className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
            Ver marketplace
          </Link>
          <Link href="/listings/new"
            className="border border-white text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-500 transition-colors">
            Publicar carta
          </Link>
        </div>
      </div>

      {/* Publicaciones recientes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Publicaciones recientes
          </h2>
          <Link href="/marketplace" className="text-blue-600 hover:underline text-sm">
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>Aún no hay publicaciones. ¡Sé el primero en publicar!</p>
            <Link href="/listings/new"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Publicar carta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-800 group">
      <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 truncate">{listing.edition}</p>
        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm mt-0.5">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-blue-600 font-bold text-sm">
            ${listing.priceCLP.toLocaleString('es-CL')}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {CONDITION_LABELS[listing.condition]}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {listing.seller.profile?.displayName || listing.seller.username}
          {' · '}★ {listing.seller.profile?.reputationScore.toFixed(1) || '0.0'}
        </p>
      </div>
    </Link>
  );
}