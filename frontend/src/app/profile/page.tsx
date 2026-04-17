'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Listing } from '@/types';

type Tab = 'active' | 'history';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: 'Activa',      color: 'bg-green-100 text-green-700' },
  PAUSED:    { label: 'En proceso',  color: 'bg-yellow-100 text-yellow-700' },
  SOLD:      { label: 'Vendida',     color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Eliminada',   color: 'bg-red-100 text-red-600' },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [tab,       setTab]       = useState<'active' | 'sold' | 'bought'>('active');
  const [active,   setActive]   = useState<Listing[]>([]);
  const [asSeller,  setAsSeller]  = useState<Listing[]>([]);
  const [asBuyer,   setAsBuyer]   = useState<Listing[]>([]);
  const [history,  setHistory]  = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    Promise.all([
      api.get('/api/listings/my'),
      api.get('/api/listings/history'),
    ]).then(([activeRes, historyRes]) => {
      setActive(activeRes.data);
      setAsSeller(historyRes.data.aseller || []);
      setAsBuyer(historyRes.data.asbuyer  || []);
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

const displayed =
  tab === 'active'  ? active :
  tab === 'sold'    ? asSeller.filter((l: any) => l.status === 'SOLD') :
  asBuyer;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header perfil */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
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
          <Link href={`/usuario/${user?.username}`}
            className="text-sm text-blue-600 hover:underline">
            Ver perfil público →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'active'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'}`}>
          Activas ({active.length})
        </button>
        <button onClick={() => setTab('sold')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'sold'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'}`}>
          Vendidas ({asSeller.filter((l: any) => l.status === 'SOLD').length})
        </button>
        <button onClick={() => setTab('bought')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'bought'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'}`}>
          Compradas ({asBuyer.length})
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>
            {tab === 'active'
              ? 'No tienes publicaciones activas'
              : 'No tienes historial de publicaciones'}
          </p>
          {tab === 'active' && (
            <Link href="/publicar"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Publicar primera carta
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((listing: any) => {
            const statusInfo = STATUS_LABEL[listing.status] || STATUS_LABEL.ACTIVE;
            const isDeleted  = !!listing.deletedAt;

            return (
              <div key={listing.id}
                className={`flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border transition-shadow ${
                  isDeleted
                    ? 'border-gray-100 dark:border-gray-800 opacity-60'
                    : 'border-gray-100 dark:border-gray-800 hover:shadow-sm'
                }`}>
                <img
                  src={listing.images?.[0] || '/placeholder.png'}
                  alt={listing.title}
                  className="w-14 h-14 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-400">{listing.edition}</p>
                    {listing.sale?.status === 'COMPLETED' && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {tab === 'bought'
                        ? `🛒 Comprada por ${(listing.sale as any).seller?.username || listing.seller?.username || ''}`
                        : `✅ Vendida a ${(listing.sale as any).buyer?.username || ''}`
                      }
                      {listing.sale.completedAt &&
                        ` · ${new Date(listing.sale.completedAt).toLocaleDateString('es-CL')}`
                      }
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="font-bold text-blue-600">
                    ${listing.priceCLP.toLocaleString('es-CL')}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  {!isDeleted && listing.status === 'ACTIVE' && (
                    <div className="mt-1">
                      <Link href={`/listings/${listing.id}`}
                        className="text-xs text-blue-600 hover:underline">
                        Ver →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}