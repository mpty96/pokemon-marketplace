import Link from 'next/link';
import { Star } from 'lucide-react';
import type { FeedSeller } from '@/types/feed';
import { formatAdventureDate, formatMoney } from '@/lib/format';
import { cl } from '@/lib/cloudinary';

const LEVEL_BALLS = [
  '/levels/poke-ball.png',
  '/levels/great-ball.png',
  '/levels/ultra-ball.png',
  '/levels/honor-ball.png',
  '/levels/master-ball.png',
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-white/15 px-3 py-1.5 text-xs leading-5 sm:text-sm">
      <span className="shrink-0">{label}</span>
      <span className="min-w-0 truncate text-right">{children}</span>
    </div>
  );
}

export default function TrainerCard({ seller }: { seller: FeedSeller }) {
  const stars = Math.round(seller.sellerRating);

  return (
    <Link
      href={`/usuario/${seller.username}`}
      className="block rounded-xl bg-[#d9d5c3] p-[3px] shadow-md transition hover:brightness-105"
    >
      <div className="rounded-[10px] border-2 border-[#8f8c7e] bg-[#575757] p-3 font-mono uppercase tracking-wide text-[#f6e65a] sm:p-4">
        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <img src="/levels/poke-ball.png" alt="" className="h-5 w-5 shrink-0" />
            <span className="truncate text-xs font-bold sm:text-sm">Ficha de entrenador</span>
            <img src="/levels/poke-ball.png" alt="" className="h-5 w-5 shrink-0" />
          </div>

          <div className="flex shrink-0 items-center" aria-label={`Calificación como vendedor: ${stars} de 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={16}
                className={n <= stars ? 'fill-[#f6e65a] text-[#f6e65a]' : 'text-[#9a9a8a]'}
              />
            ))}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Row label="ID Usuario">{seller.id.slice(0, 6).toUpperCase()}</Row>
            <Row label="Nombre">{seller.displayName || seller.username}</Row>
            <Row label="Dinero">{formatMoney(seller.totalValueCLP)} ₱</Row>
            <Row label="Publicaciones">{seller.listingsCount}</Row>
            <Row label="Nivel">
              {seller.level > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <img src={LEVEL_BALLS[seller.level - 1]} alt="" className="h-5 w-5 object-contain" />
                  {seller.level}
                </span>
              ) : (
                'Sin nivel'
              )}
            </Row>
          </div>

          <div className="flex w-28 items-center justify-center self-stretch overflow-hidden rounded-lg border border-[#7a7a7a] bg-[#6b6b6b] sm:w-36">
            {seller.avatarUrl ? (
              <img
                src={cl(seller.avatarUrl, 200)}
                alt={seller.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold">{seller.username[0].toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="mt-2">
          <Row label="Comienzo aventura">{formatAdventureDate(seller.memberSince)}</Row>
        </div>
      </div>
    </Link>
  );
}