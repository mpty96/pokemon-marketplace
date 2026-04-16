'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Listing, CardCondition, CardRarity } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint', NEAR_MINT: 'Near Mint', EXCELLENT: 'Excelente',
  GOOD: 'Buena', PLAYED: 'Jugada', POOR: 'Dañada',
};

const RARITY_LABELS: Record<CardRarity, string> = {
  COMMON: 'Común', UNCOMMON: 'Poco común', RARE: 'Rara',
  HOLO_RARE: 'Holo Rara', ULTRA_RARE: 'Ultra Rara',
  SECRET_RARE: 'Secret Rara', PROMO: 'Promo',
};

export default function ListingDetailPage() {
  const { id }          = useParams<{ id: string }>();
  const router          = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [listing, setListing]     = useState<Listing | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get(`/api/listings/${id}`)
      .then(({ data }) => { setListing(data); setLoading(false); })
      .catch(() => { router.push('/marketplace'); });
  }, [id]);

  async function handleDelete() {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await api.delete(`/api/listings/${id}`);
    router.push('/marketplace');
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  );

  if (!listing) return null;

  const isOwner = user?.id === listing.sellerId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-6 flex items-center gap-1">
          ← Volver
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Imágenes */}
            <div className="p-6">
              <img src={listing.images[activeImg]} alt={listing.title}
                className="w-full aspect-square object-contain rounded-lg bg-gray-50" />
              {listing.images.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {listing.images.map((src, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}>
                      <img src={src} alt={`img-${i}`}
                        className={`w-16 h-16 object-cover rounded border-2 transition-colors
                          ${activeImg === i ? 'border-blue-500' : 'border-gray-200'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    Edición: {listing.edition}{listing.setNumber && ` · #${listing.setNumber}`}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {listing.title}
                  </h1>
                </div>

                <div className="text-3xl font-bold text-blue-600">
                  ${listing.priceCLP.toLocaleString('es-CL')}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-20">Condición:</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-sm font-medium">
                      {CONDITION_LABELS[listing.condition]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-20">Rareza:</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm font-medium">
                      {RARITY_LABELS[listing.rarity]}
                    </span>
                  </div>
                </div>

                {listing.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {listing.description}
                  </p>
                )}

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <p className="text-sm text-gray-500">Vendido por</p>
                  <Link
                    href={`/usuario/${listing.seller.username}`}
                    className="font-medium text-blue-600 hover:underline">
                    {listing.seller.profile?.displayName || listing.seller.username}
                  </Link>
                  <p className="text-sm text-yellow-500">
                    ★ {listing.seller.profile?.reputationScore.toFixed(1) || '0.0'}
                  </p>
                </div>

                <p className="text-xs text-gray-400">
                  {listing.views} vista{listing.views !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {isOwner ? (
                  <button onClick={handleDelete}
                    className="w-full border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2 rounded-lg transition-colors">
                    Eliminar publicación
                  </button>
                ) : isAuthenticated ? (
                  <button
                    onClick={() => router.push(`/listings/${id}/chat`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                    💬 Contactar vendedor
                  </button>
                ) : (
                  <button onClick={() => router.push('/login')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                    Inicia sesión para comprar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}