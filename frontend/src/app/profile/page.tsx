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
  const [active,   setActive]   = useState<Listing[]>([]);
  const [asSeller,  setAsSeller]  = useState<Listing[]>([]);
  const [asBuyer,   setAsBuyer]   = useState<Listing[]>([]);
  const [history,  setHistory]  = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,          setTab]          = useState<'active' | 'ratings' | 'transactions'>('active');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [myRatings,    setMyRatings]    = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    Promise.all([
      api.get('/api/listings/my'),
      api.get('/api/listings/history'),
      api.get('/api/sales/my'),
      api.get(`/api/ratings/user/${user?.username}`),
    ]).then(([activeRes, historyRes, txRes, ratingsRes]) => {
      setActive(activeRes.data);
      setAsSeller(historyRes.data.aseller || []);
      setAsBuyer(historyRes.data.asbuyer  || []);
      setTransactions(txRes.data);
      // Evitar duplicados usando un Set por id
      const all = ratingsRes.data.ratingsReceived || [];
      const seen = new Set<string>();
      setMyRatings(all.filter((r: any) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      }));
    }).finally(() => setLoading(false));
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
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit overflow-x-auto">
        <button onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'active'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          Publicaciones activas ({active.length})
        </button>
        <button onClick={() => setTab('ratings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'ratings'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          Calificaciones
        </button>
        <button onClick={() => setTab('transactions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'transactions'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          Transacciones ({transactions.length})
        </button>
      </div>

{/* TAB: Publicaciones activas */}
{tab === 'active' && (
  <div className="space-y-3">
    <div className="flex justify-end mb-2">
      <Link href="/publicar"
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
        + Nueva
      </Link>
    </div>
    {active.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p>No tienes publicaciones activas</p>
        <Link href="/publicar"
          className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
          Publicar primera carta
        </Link>
      </div>
    ) : active.map((listing: any) => (
      <ListingRow key={listing.id} listing={listing} tab="active" />
    ))}
  </div>
)}

{/* TAB: Calificaciones */}
{tab === 'ratings' && (
  <div className="space-y-3">
    {myRatings.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">⭐</p>
        <p>Aún no tienes calificaciones</p>
      </div>
    ) : myRatings.map((rating: any) => (
      <div key={rating.id}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {rating.rater?.username || 'Usuario'}
          </span>
          <span className="text-yellow-500 font-bold text-sm">
            ★ {rating.averageScore?.toFixed(1)}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>Precio: {'⭐'.repeat(rating.priceScore)}</span>
          <span>Comunicación: {'⭐'.repeat(rating.communicationScore)}</span>
          <span>Proceso: {'⭐'.repeat(rating.processScore)}</span>
        </div>
        {rating.comment && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
            "{rating.comment}"
          </p>
        )}
      </div>
    ))}
  </div>
)}

{/* TAB: Transacciones */}
{tab === 'transactions' && (
  <div className="space-y-3">
    {transactions.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📦</p>
        <p>No tienes transacciones completadas</p>
      </div>
    ) : transactions.map((tx: any) => (
      <div key={tx.id}
        className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
        <Link href={`/listings/${tx.listingId}`} className="flex-shrink-0">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
            {tx.image
              ? <img src={tx.image} alt={tx.title} className="w-full h-full object-contain" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">🎴</div>
            }
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/listings/${tx.listingId}`}
            className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 truncate block">
            {tx.title}
          </Link>
          <p className="text-sm text-blue-600 font-medium">
            ${tx.priceCLP?.toLocaleString('es-CL')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {tx.role === 'seller' ? '🏪 Vendida a ' : '🛒 Comprada de '}
            <Link href={`/usuario/${tx.otherUser?.username}`}
              className="text-blue-500 hover:underline font-medium">
              {tx.otherUser?.username}
            </Link>
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            ✅ Completada
          </span>
          {tx.completedAt && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(tx.completedAt).toLocaleDateString('es-CL')}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  );
}

function ListingRow({ listing, tab }: { listing: any; tab: string }) {
  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    ACTIVE:    { label: 'Activa',     color: 'bg-green-100 text-green-700' },
    PAUSED:    { label: 'En proceso', color: 'bg-yellow-100 text-yellow-700' },
    SOLD:      { label: 'Vendida',    color: 'bg-blue-100 text-blue-700' },
    CANCELLED: { label: 'Eliminada',  color: 'bg-red-100 text-red-600' },
  };
  const statusInfo = STATUS_LABEL[listing.status] || STATUS_LABEL.ACTIVE;

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
      <img src={listing.images?.[0]} alt={listing.title}
        className="w-14 h-14 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">{listing.title}</h3>
        <p className="text-sm text-gray-400">Edición: {listing.edition}</p>
      </div>
      <div className="text-right flex-shrink-0 space-y-1">
        <p className="font-bold text-blue-600">${listing.priceCLP?.toLocaleString('es-CL')}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        {listing.status === 'ACTIVE' && (
          <div><Link href={`/listings/${listing.id}`} className="text-xs text-blue-600 hover:underline">Ver →</Link></div>
        )}
      </div>
    </div>
  );
}