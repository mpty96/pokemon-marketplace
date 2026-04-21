'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Listing } from '@/types';

type Tab = 'active' | 'history';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: 'Activa',    color: 'bg-[var(--success-bg)] text-[var(--success-fg)]' },
  PAUSED:    { label: 'En proceso', color: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]' },
  SOLD:      { label: 'Vendida',   color: 'bg-[var(--info-bg)] text-[var(--info-fg)]' },
  CANCELLED: { label: 'Eliminada', color: 'bg-[var(--danger-bg)] text-[var(--danger-fg)]' },
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
  if (!isAuthenticated) return;

  Promise.all([
    api.get('/api/listings/my'),
    api.get('/api/listings/history'),
  ]).then(([activeRes, historyRes]) => {

    setActive(activeRes.data);
    setAsSeller(historyRes.data.asseller || []);
    setAsBuyer(historyRes.data.asbuyer || []);

  }).finally(() => setLoading(false));
}, [isAuthenticated]);

  if (!isAuthenticated) return null;

const displayed =
  tab === 'active'
    ? active
    : tab === 'sold'
      ? asSeller
      : asBuyer;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[var(--foreground)]">

      {/* Header perfil */}
      <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--info-bg)] overflow-hidden flex items-center justify-center text-2xl font-bold text-[var(--info-fg)]">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {user?.username}
            </h1>
            <p className="text-[var(--muted)] text-sm">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[#e0a800] text-sm">★</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {user?.reputationScore?.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs text-[var(--muted-2)]">reputación</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-col items-end gap-1">
              <Link
                href={`/usuario/${user?.username}`}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Ver perfil público →
              </Link>

              <Link
                href="/profile/editar"
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Editar mi perfil
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[var(--surface-2)] p-1 rounded-lg w-fit border border-[var(--border)]">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'active'
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Activas ({active.length})
        </button>

        <button
          onClick={() => setTab('sold')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'sold'
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Vendidas ({asSeller.length})
        </button>

        <button
          onClick={() => setTab('bought')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'bought'
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Compradas ({asBuyer.length})
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--surface)] rounded-xl h-20 animate-pulse border border-[var(--border)]"
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-2)]">
          <p className="text-4xl mb-3">📭</p>
          <p>
            {tab === 'active'
              ? 'No tienes publicaciones activas'
              : 'No tienes historial de publicaciones'}
          </p>
          {tab === 'active' && (
            <Link href="/listings/new"
              className="inline-block mt-4 bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2 rounded-lg hover:bg-[var(--primary-hover)] text-sm">
              Publicar primera carta
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((listing: any) => {
            const statusInfo =
              listing.sale?.status === 'COMPLETED'
                ? STATUS_LABEL.SOLD
                : STATUS_LABEL[listing.status] || STATUS_LABEL.ACTIVE;
            const isDeleted  = !!listing.deletedAt;
            console.log("LISTING RENDER:", listing);

            return (
              <div 
                key={listing.id}
                  className={`flex items-center gap-4 bg-[var(--surface)] rounded-xl p-4 border transition-shadow ${
                    isDeleted
                      ? 'border-[var(--border)] opacity-60'
                      : 'border-[var(--border)] hover:shadow-sm'
                  }`}
                >
                <img
                  src={listing.images?.[0] || '/placeholder.png'}
                  alt={listing.title}
                  className="w-14 h-14 object-contain rounded-lg bg-[var(--surface-2)] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--foreground)] truncate">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-2)]">{listing.edition}</p>
                    {listing.sale?.status === 'COMPLETED' && (
                    <p className="text-xs text-[var(--success-fg)] mt-0.5">
                      {tab === 'bought'
                        ? `🛒 Compraste a ${(listing.sale as any).seller?.username || listing.seller?.username || ''}`
                        : `✅ Vendida a ${(listing.sale as any).buyer?.username || listing.buyer?.username || ''}`
                      }
                      {listing.sale.completedAt &&
                        ` · ${new Date(listing.sale.completedAt).toLocaleDateString('es-CL')}`
                      }
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="font-bold text-[var(--primary)]">
                    ${listing.priceCLP.toLocaleString('es-CL')}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  {!isDeleted && listing.status === 'ACTIVE' && (
                    <div className="mt-1">
                      <Link href={`/listings/${listing.id}`}
                        className="text-xs text-[var(--primary)] hover:underline">
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