'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { cl } from '@/lib/cloudinary';
import { timeAgo } from '@/lib/format';
import type { CardCondition } from '@/types';
import type { FeedListing, FeedResponse } from '@/types/feed';
import TrainerCard from '@/components/TrainerCard';

const FEED_URL = '/api/listings/feed';
const POLL_MS = 60_000;

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint',
  NEAR_MINT: 'Near Mint',
  EXCELLENT: 'Excelente',
  GOOD: 'Buena',
  PLAYED: 'Jugada',
  POOR: 'Dañada',
};

function typeLabel(type: FeedListing['listingType']) {
  if (type === 'CARD') return 'Carta';
  if (type === 'POKEMON_PRODUCT') return 'Producto Pokémon';
  return 'Lote';
}

// Une dos listas sin repetir publicaciones (las de "base" van primero)
function mergeUnique(base: FeedListing[], extra: FeedListing[]) {
  const ids = new Set(base.map((i) => i.id));
  return [...base, ...extra.filter((i) => !ids.has(i.id))];
}

export default function HomeFeed() {
  const [items, setItems] = useState<FeedListing[]>([]);
  const [pending, setPending] = useState<FeedListing[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const latestRef = useRef<string | null>(null);
  const readyRef = useRef(false);

  const loadFirst = useCallback(async () => {
    setError('');
    setLoading(true);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data } = await api.get<FeedResponse>(FEED_URL);
        setItems(data.items);
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
        readyRef.current = true;
        setLoading(false);
        return;
      } catch {
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
      }
    }
    setError('No pudimos cargar las publicaciones. Intenta de nuevo.');
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  // Guarda la fecha de la publicación más nueva que conocemos
  useEffect(() => {
    const all = [...pending, ...items];
    latestRef.current = all.length
      ? all.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt
      : null;
  }, [items, pending]);

  // Revisa si hay publicaciones nuevas (cada 60 s, solo con la pestaña visible)
  useEffect(() => {
    async function checkNew() {
      if (document.visibilityState !== 'visible' || !readyRef.current) return;
      setNow(Date.now());
      try {
        const after = latestRef.current ?? new Date(0).toISOString();
        const { data } = await api.get<FeedResponse>(FEED_URL, { params: { after } });
        if (data.items.length === 0) return;
        if (window.scrollY < 200) {
          setItems((prev) => mergeUnique(data.items, prev));
        } else {
          setPending((prev) => mergeUnique(data.items, prev));
        }
      } catch {
        // silencioso: se reintenta en el próximo ciclo
      }
    }

    const id = setInterval(checkNew, POLL_MS);
    document.addEventListener('visibilitychange', checkNew);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', checkNew);
    };
  }, []);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    setError('');
    try {
      const { data } = await api.get<FeedResponse>(FEED_URL, { params: { before: cursor } });
      setItems((prev) => mergeUnique(prev, data.items));
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    } catch {
      setError('No pudimos cargar más publicaciones. Intenta de nuevo.');
    } finally {
      setLoadingMore(false);
    }
  }

  function showPending() {
    setItems((prev) => mergeUnique(pending, prev));
    setPending([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section className="w-full">
        <div className="mb-4 lg:grid lg:grid-cols-[minmax(0,475px)_minmax(0,36rem)] lg:gap-4">
            <div className="lg:col-start-2">
            <h2 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
                Publicaciones recientes
            </h2>
            <p className="text-xs leading-5 text-[var(--muted)] sm:text-sm">
                Lo último que se publicó en PokeMarket, de la más nueva a la más antigua.
            </p>
            </div>
        </div>

      {pending.length > 0 && (
        <div className="sticky top-20 z-30 mb-4 flex justify-center">
          <button
            type="button"
            onClick={showPending}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] shadow-lg hover:bg-[var(--primary-hover)]"
          >
            <ArrowUp size={16} />
            {pending.length === 1 ? '1 publicación nueva' : `${pending.length} publicaciones nuevas`}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:max-w-[1067px]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted-2)]">
          {error || 'Aún no hay publicaciones.'}
          {error && (
            <div className="mt-3">
              <button
                type="button"
                onClick={loadFirst}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((listing) => (
            <FeedPost key={listing.id} listing={listing} now={now} />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && error && (
        <p className="mt-4 text-center text-sm text-[var(--danger-fg)]">{error}</p>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)] disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Cargando...
              </>
            ) : (
              'Mostrar más'
            )}
          </button>
        </div>
      )}

      {!loading && !hasMore && items.length > 0 && (
        <p className="mt-6 text-center text-xs text-[var(--muted-2)]">
          Ya viste todas las publicaciones.
        </p>
      )}
    </section>
  );
}

function FeedPost({ listing, now }: { listing: FeedListing; now: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start gap-2 sm:gap-3 lg:grid-cols-[minmax(0,475px)_minmax(0,36rem)] lg:gap-4">
      <TrainerCard seller={listing.seller} />

      <article className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-2 pt-2 sm:px-3 sm:pt-3">
          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[9px] font-semibold text-[var(--muted)] sm:text-[10px]">
            {typeLabel(listing.listingType)}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--muted)] sm:text-xs">
            <Clock size={11} />
            {timeAgo(listing.createdAt, now)}
          </span>
        </div>

        <Link href={`/listings/${listing.id}`} className="group mt-2 block sm:mt-3">
          <div className="flex justify-center bg-[var(--surface-2)]">
            <img
              src={cl(listing.images[0], 800)}
              alt={listing.title}
              loading="lazy"
              className="max-h-56 w-full object-contain sm:max-h-80 lg:max-h-[420px]"
            />
          </div>

          <div className="p-2 sm:p-3">
            <h3 className="line-clamp-2 break-words text-sm font-semibold text-[var(--foreground)] sm:text-base">
              {listing.cardName}
            </h3>
            <p className="min-h-[16px] truncate text-[11px] text-[var(--muted-2)] sm:text-xs">
              {listing.edition || '\u00A0'}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
              <span className="text-sm font-bold text-[var(--primary)] sm:text-base">
                ${listing.priceCLP.toLocaleString('es-CL')}
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--muted)] sm:text-xs">
                {CONDITION_LABELS[listing.condition]}
              </span>
            </div>
          </div>
        </Link>
      </article>
    </div>
  );
}