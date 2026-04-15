'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Listing } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/api/listings/my')
      .then(({ data }) => setListings(data))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header perfil */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.username}
            </h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.reputationScore?.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs text-gray-400">reputación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mis publicaciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Mis publicaciones ({listings.length})
          </h2>
          <Link href="/listings/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            + Nueva
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No tienes publicaciones activas</p>
            <Link href="/listings/new"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Publicar primera carta
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}
                className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
                <img src={listing.images[0]} alt={listing.title}
                  className="w-14 h-14 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-400">{listing.edition}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-blue-600">
                    ${listing.priceCLP.toLocaleString('es-CL')}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    listing.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : listing.status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {listing.status === 'ACTIVE'   ? 'Activa'
                    : listing.status === 'PAUSED'  ? 'En venta'
                    : listing.status === 'SOLD'    ? 'Vendida'
                    : 'Cancelada'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}