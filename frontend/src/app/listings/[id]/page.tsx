'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
  Listing,
  CardCondition,
  CardRarity,
  ListingSalesHistoryItem,
  SalesHistoryRange,
} from '@/types';
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
  const { id }                          = useParams<{ id: string }>();
  const router                          = useRouter();
  const { user, isAuthenticated }       = useAuthStore();
  const [listing, setListing]           = useState<Listing | null>(null);
  const [activeImg, setActiveImg]       = useState(0);
  const [loading, setLoading]           = useState(true);
  const [historyRange, setHistoryRange] = useState<SalesHistoryRange>('1m');
  const [salesHistory, setSalesHistory] = useState<ListingSalesHistoryItem[]>([]);

  useEffect(() => {
    api.get(`/api/listings/${id}`)
      .then(({ data }) => { setListing(data); setLoading(false); })
      .catch(() => { router.push('/marketplace'); });
  }, [id]);

  useEffect(() => {
  if (!id) return;

  api
    .get(`/api/sales/listing/${id}/history?range=${historyRange}`)
    .then(({ data }) => setSalesHistory(data))
    .catch(() => setSalesHistory([]));
}, [id, historyRange]);

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

  const prices = salesHistory.map((item) => item.priceCLP);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const chartMinPrice = minPrice === maxPrice ? Math.max(0, minPrice - 1000) : minPrice;
  const chartMaxPrice = minPrice === maxPrice ? maxPrice + 1000 : maxPrice;

  function getPointX(index: number) {
    if (salesHistory.length <= 1) return 50;
    return 10 + (index / (salesHistory.length - 1)) * 80;
  }

  function getPointY(price: number) {
    const range = chartMaxPrice - chartMinPrice;
    if (!range) return 50;
    return 85 - ((price - chartMinPrice) / range) * 65;
  }

  const chartPoints = salesHistory
    .map((item, index) => `${getPointX(index)},${getPointY(item.priceCLP)}`)
    .join(' ');

  const firstDate = salesHistory[0]?.completedAt;
  const lastDate = salesHistory[salesHistory.length - 1]?.completedAt;

  function formatChartDate(date?: string) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
    });
  }


  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()}
          className="text-[var(--primary)] hover:underline mb-6 flex items-center gap-1"
          >
          ← Volver
        </button>

        <div className="bg-[var(--surface)] rounded-xl shadow border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Imágenes */}
            <div className="p-6">
              <img
                src={listing.images[activeImg]}
                alt={listing.title}
                className="w-full aspect-square object-contain rounded-lg bg-[var(--surface-2)]"
              />
              {listing.images.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {listing.images.map((src, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}>
                      <img src={src} alt={`img-${i}`}
                        className={`w-16 h-16 object-cover rounded border-2 transition-colors
                          ${activeImg === i ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-[var(--muted-2)] uppercase tracking-wide">
                    Edición: {listing.edition}{listing.setNumber && ` · #${listing.setNumber}`}
                  </span>
                  <h1 className="text-2xl font-bold text-[var(--foreground)] mt-1">
                    {listing.title}
                  </h1>
                </div>

                <div className="text-3xl font-bold text-[var(--primary)]">
                  ${listing.priceCLP.toLocaleString('es-CL')}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-20">Condición:</span>
                    <span className="px-3 py-1 bg-[var(--success-bg)] text-[var(--success-fg)] rounded-full text-sm font-medium">
                      {CONDITION_LABELS[listing.condition]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-20">Rareza:</span>
                    <span className="px-3 py-1 bg-[var(--info-bg)] text-[var(--info-fg)] rounded-full text-sm font-medium">
                      {RARITY_LABELS[listing.rarity]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-20">Idioma:</span>
                    <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--foreground)] rounded-full text-sm font-medium border border-[var(--border)]">
                      {listing.language === 'ESP'
                        ? 'Español'
                        : listing.language === 'ENG'
                        ? 'Inglés'
                        : listing.language === 'POR'
                        ? 'Portugués'
                        : listing.language === 'JPN'
                        ? 'Japonés'
                        : listing.language === 'KOR'
                        ? 'Coreano'
                        : listing.language === 'CHN'
                        ? 'Chino'
                        : 'Otro'}
                    </span>
                  </div>
                </div>

                {listing.description && (
                  <p className="text-[var(--muted)] text-sm leading-relaxed">
                    {listing.description}
                  </p>
                )}

                <div className="border-t border-[var(--border)] pt-4">
                  <p className="text-sm text-[var(--muted)]">Vendido por</p>
                  <Link
                    href={`/usuario/${listing.seller.username}`}
                    className="font-medium text-[var(--primary)] hover:underline">
                    {listing.seller.profile?.displayName || listing.seller.username}
                  </Link>
                  <p className="text-sm text-[#e0a800]">
                    ★ {listing.seller.profile?.reputationScore.toFixed(1) || '0.0'}
                  </p>
                </div>

                <p className="text-xs text-[var(--muted-2)]">
                  {listing.views} vista{listing.views !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {isOwner ? (
                  <button onClick={handleDelete}
                    className="w-full border border-[var(--danger-fg)] text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] font-medium py-2 rounded-lg transition-colors">
                    Eliminar publicación
                  </button>
                ) : isAuthenticated ? (
                  <button
                    onClick={() => router.push(`/listings/${id}/chat`)}
                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors">
                    💬 Contactar vendedor
                  </button>
                ) : (
                  <button onClick={() => router.push('/login')}
                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors">
                    Inicia sesión para comprar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-[var(--surface)] rounded-xl shadow border border-[var(--border)] p-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
    <div>
      <h2 className="text-lg font-bold text-[var(--foreground)]">
        Historial de ventas similares
      </h2>
      <p className="text-sm text-[var(--muted)]">
        Basado en ventas completadas con el mismo nombre de publicación.
      </p>
    </div>

    <div className="flex gap-2 flex-wrap">
      {[
        { value: '7d', label: '7 días' },
        { value: '1m', label: '1 mes' },
        { value: '6m', label: '6 meses' },
        { value: '1y', label: '1 año' },
      ].map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setHistoryRange(item.value as SalesHistoryRange)}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
            historyRange === item.value
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
              : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>

  {salesHistory.length === 0 ? (
    <div className="text-center text-[var(--muted-2)] py-10 text-sm">
      Aún no hay ventas similares en este rango.
    </div>
  ) : (
    <div className="space-y-5">
      <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4">
        <div className="flex justify-between text-xs text-[var(--muted)] mb-2">
          <span>${chartMaxPrice.toLocaleString('es-CL')}</span>
          <span>Historial según ventas completadas</span>
        </div>

        <div className="h-52">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <line
              x1="10"
              y1="85"
              x2="90"
              y2="85"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-[var(--border)]"
            />

            <line
              x1="10"
              y1="20"
              x2="10"
              y2="85"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-[var(--border)]"
            />

            {salesHistory.length >= 2 && (
              <polyline
                points={chartPoints}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--primary)]"
              />
            )}

            {salesHistory.map((item, index) => (
              <g key={item.id}>
                <circle
                  cx={getPointX(index)}
                  cy={getPointY(item.priceCLP)}
                  r="2"
                  fill="currentColor"
                  className="text-[var(--primary)]"
                />

                <text
                  x={getPointX(index)}
                  y={getPointY(item.priceCLP) - 4}
                  textAnchor="middle"
                  fontSize="4"
                  fill="currentColor"
                  className="text-[var(--foreground)]"
                >
                  ${(item.priceCLP / 1000).toFixed(0)}k
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between text-xs text-[var(--muted)] mt-2">
          <span>{formatChartDate(firstDate)}</span>
          <span>${chartMinPrice.toLocaleString('es-CL')}</span>
          <span>{formatChartDate(lastDate)}</span>
        </div>

        {salesHistory.length === 1 && (
          <p className="text-xs text-[var(--muted)] mt-3 text-center">
            Solo existe una venta en este rango. Se necesita más de una venta para formar una línea de tendencia.
          </p>
        )}
      </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {salesHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {item.cardName}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(item.completedAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-[var(--primary)]">
                      ${item.priceCLP.toLocaleString('es-CL')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}