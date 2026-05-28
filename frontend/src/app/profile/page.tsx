'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Listing, WantedCard } from '@/types';

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
  const [tab, setTab] = useState<'active' | 'sold' | 'bought' | 'wanted'>('active');
  const [active,   setActive]   = useState<Listing[]>([]);
  const [asSeller,  setAsSeller]  = useState<Listing[]>([]);
  const [asBuyer,   setAsBuyer]   = useState<Listing[]>([]);
  const [history,  setHistory]  = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [wantedCards, setWantedCards] = useState<WantedCard[]>([]);
  const [wantedLoading, setWantedLoading] = useState(false);
  const [wantedName, setWantedName] = useState('');
  const [wantedEdition, setWantedEdition] = useState('');
  const [wantedSetNumber, setWantedSetNumber] = useState('');
  const [wantedImage, setWantedImage] = useState<File | null>(null);

useEffect(() => {
  if (!isAuthenticated) return;

  Promise.all([
    api.get('/api/listings/my'),
    api.get('/api/listings/history'),
    api.get('/api/wanted-cards/me'),
  ]).then(([activeRes, historyRes, wantedRes]) => {
    setActive(activeRes.data);
    setAsSeller(historyRes.data.asseller || []);
    setAsBuyer(historyRes.data.asbuyer || []);
    setWantedCards(wantedRes.data || []);
  }).finally(() => setLoading(false));
}, [isAuthenticated]);

  if (!isAuthenticated) return null;

const displayed =
  tab === 'active'
    ? active
    : tab === 'sold'
      ? asSeller
      : asBuyer;

async function handleCreateWantedCard(e: React.FormEvent) {
  e.preventDefault();

  if (!wantedName.trim()) return;

  setWantedLoading(true);

  try {
    const formData = new FormData();
    formData.append('name', wantedName.trim());

    if (wantedEdition.trim()) {
      formData.append('edition', wantedEdition.trim());
    }

    if (wantedSetNumber.trim()) {
      formData.append('setNumber', wantedSetNumber.trim());
    }

    if (wantedImage) {
      formData.append('image', wantedImage);
    }

    const { data } = await api.post('/api/wanted-cards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setWantedCards((prev) => [data, ...prev]);
    setWantedName('');
    setWantedEdition('');
    setWantedSetNumber('');
    setWantedImage(null);
  } finally {
    setWantedLoading(false);
  }
}

async function handleDeleteWantedCard(id: string) {
  const confirmed = window.confirm('¿Eliminar esta carta de tu lista de interés?');
  if (!confirmed) return;

  await api.delete(`/api/wanted-cards/${id}`);
  setWantedCards((prev) => prev.filter((card) => card.id !== id));
}


  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8 text-[var(--foreground)]">

      {/* Header perfil */}
      <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-4 sm:p-6 mb-5 sm:mb-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--info-bg)] overflow-hidden flex items-center justify-center text-2xl font-bold text-[var(--info-fg)]">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-[var(--foreground)] truncate">
              {user?.username}
            </h1>
          <p className="text-[var(--muted)] text-xs sm:text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[#e0a800] text-sm">★</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {user?.reputationScore?.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs text-[var(--muted-2)]">reputación</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <Link
              href={`/usuario/${user?.username}`}
              className="text-sm sm:text-sm text-[var(--primary)] hover:underline whitespace-nowrap"
            >
              Ver perfil público →
            </Link>

            <Link
              href="/profile/editar"
              className="text-[11px] text-[var(--primary)] hover:underline whitespace-nowrap"
            >
              Editar mi perfil
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[var(--surface-2)] p-1 rounded-lg w-full sm:w-fit border border-[var(--border)] overflow-x-auto mobile-scrollbar">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            tab === 'active'
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Activas ({active.length})
        </button>

        <button
          onClick={() => setTab('sold')}
          className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            tab === 'sold'
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Vendidas ({asSeller.length})
        </button>

        <button
          onClick={() => setTab('bought')}
          className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            tab === 'bought'
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Compradas ({asBuyer.length})
        </button>

        <button
          onClick={() => setTab('wanted')}
          className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            tab === 'wanted'
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Cartas de mi Interés ({wantedCards.length})
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
      ) : tab === 'wanted' ? (
        <div className="space-y-5">
          <form
            onSubmit={handleCreateWantedCard}
            className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-5 space-y-4"
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                Agregar carta de interés
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-2)] mt-1">
                Estas cartas serán visibles en tu perfil público. Más adelante podrás activar avisos por correo cuando alguien publique una carta similar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Nombre de carta *
                </label>
                <input
                  value={wantedName}
                  onChange={(e) => setWantedName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  placeholder="Charizard"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Edición
                </label>
                <input
                  value={wantedEdition}
                  onChange={(e) => setWantedEdition(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  placeholder="Base Set"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Nº en el set
                </label>
                <input
                  value={wantedSetNumber}
                  onChange={(e) => setWantedSetNumber(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  placeholder="4/102"
                  maxLength={30}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Imagen opcional
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setWantedImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--primary-foreground)]"
              />
            </div>

            <button
              type="submit"
              disabled={wantedLoading || !wantedName.trim()}
              className="w-full sm:w-auto bg-[var(--primary)] disabled:opacity-60 text-[var(--primary-foreground)] px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
            >
              {wantedLoading ? 'Agregando...' : 'Agregar carta'}
            </button>
          </form>

          {wantedCards.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted-2)] bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <p className="text-4xl mb-3">⭐</p>
              <p>No has agregado cartas de interés</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wantedCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 flex gap-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl">🃏</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] truncate">
                      {card.name}
                    </h3>

                    {card.edition && (
                      <p className="text-sm text-[var(--muted-2)] truncate">
                        {card.edition}
                      </p>
                    )}

                    {card.setNumber && (
                      <p className="text-xs text-[var(--muted-2)]">
                        Nº {card.setNumber}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteWantedCard(card.id)}
                      className="mt-2 text-xs text-red-500 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                        ? `Compraste a ${(listing.sale as any).seller?.username || listing.seller?.username || ''}`
                        : `Vendida a ${(listing.sale as any).buyer?.username || listing.buyer?.username || ''}`
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