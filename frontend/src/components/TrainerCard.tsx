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
    <div className="flex flex-col items-start rounded-md bg-white/15 px-2 py-1 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-3 lg:py-1.5">
      <span className="shrink-0 text-[9px] leading-3 opacity-75 sm:text-[10px] lg:text-sm lg:leading-5 lg:opacity-100">
        {label}
      </span>
      <span className="min-w-0 break-words text-[11px] font-bold leading-4 sm:text-xs lg:truncate lg:text-right lg:text-sm lg:font-normal lg:leading-5">
        {children}
      </span>
    </div>
  );
}

export default function TrainerCard({ seller }: { seller: FeedSeller }) {
  const stars = Math.round(seller.sellerRating);

  return (
    <Link
      href={`/usuario/${seller.username}`}
      className="block rounded-xl bg-[#d9d5c3] p-[2px] shadow-md transition hover:brightness-105 lg:p-[3px]"
    >
      <div className="rounded-[10px] border-2 border-[#8f8c7e] bg-[#575757] p-2 font-mono uppercase tracking-wide text-[#f6e65a] sm:p-3 lg:p-4">
        <div className="grid grid-cols-1 gap-y-2 lg:grid-cols-[1fr_auto] lg:gap-x-4">
          <div className="flex min-w-0 items-center justify-center gap-1.5 lg:col-start-1 lg:row-start-1 lg:justify-start lg:gap-2">
            <img src="/levels/poke-ball.png" alt="" className="h-3.5 w-3.5 shrink-0 lg:h-5 lg:w-5" />
            <span className="min-w-0 text-center text-[9px] font-bold leading-3 sm:text-[11px] lg:truncate lg:text-left lg:text-sm lg:leading-5">
              Ficha de entrenador
            </span>
            <img src="/levels/poke-ball.png" alt="" className="h-3.5 w-3.5 shrink-0 lg:h-5 lg:w-5" />
          </div>

          <div
            className="flex shrink-0 items-center justify-center lg:col-start-2 lg:row-start-1 lg:justify-end"
            aria-label={`Calificación como vendedor: ${stars} de 5`}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 ${
                  n <= stars ? 'fill-[#f6e65a] text-[#f6e65a]' : 'text-[#9a9a8a]'
                }`}
              />
            ))}
          </div>

          <div className="order-3 mx-auto flex aspect-square w-20 items-center justify-center overflow-hidden rounded-lg border border-[#7a7a7a] bg-[#6b6b6b] sm:w-24 lg:order-none lg:col-start-2 lg:row-start-2 lg:mx-0 lg:aspect-auto lg:w-36 lg:self-stretch">
            {seller.avatarUrl ? (
              <img
                src={cl(seller.avatarUrl, 200)}
                alt={seller.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold lg:text-4xl">{seller.username[0].toUpperCase()}</span>
            )}
          </div>

          <div className="order-4 min-w-0 space-y-1 lg:order-none lg:col-start-1 lg:row-start-2 lg:space-y-1.5">
            <Row label="ID Usuario">{seller.id.slice(0, 6).toUpperCase()}</Row>
            <Row label="Nombre">{seller.displayName || seller.username}</Row>
            <Row label="Dinero">{formatMoney(seller.totalValueCLP)} ₱</Row>
            <Row label="Publicaciones">{seller.listingsCount}</Row>
            <Row label="Nivel">
              {seller.level > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <img
                    src={LEVEL_BALLS[seller.level - 1]}
                    alt=""
                    className="h-4 w-4 object-contain lg:h-5 lg:w-5"
                  />
                  {seller.level}
                </span>
              ) : (
                'Sin nivel'
              )}
            </Row>
          </div>
        </div>

        <div className="mt-1 lg:mt-2">
          <Row label="Comienzo aventura">{formatAdventureDate(seller.memberSince)}</Row>
        </div>
      </div>
    </Link>
  );
}