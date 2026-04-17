import { Rating } from '@/types';

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <span className="text-[#e0a800]">
      {'⭐'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  );
}

export function RatingCard({ rating }: { rating: Rating }) {
  if (!rating) return null;

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[var(--foreground)] text-sm">
          {rating.rater?.username || 'Usuario'}
        </span>

        <div className="flex items-center gap-1">
          <span className="text-[#e0a800] text-sm">⭐</span>
          <span className="font-bold text-[var(--foreground)] text-sm">
            {rating.averageScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-[var(--muted)]">
        <div className="text-center">
          <p className="mb-1">Precio</p>
          <Stars score={rating.priceScore} />
        </div>
        <div className="text-center">
          <p className="mb-1">Comunicación</p>
          <Stars score={rating.communicationScore} />
        </div>
        <div className="text-center">
          <p className="mb-1">Proceso</p>
          <Stars score={rating.processScore} />
        </div>
      </div>

      {rating.comment && (
        <p className="text-sm text-[var(--muted)] italic border-l-2 border-[var(--border)] pl-3">
          "{rating.comment}"
        </p>
      )}

      <p className="text-xs text-[var(--muted-2)]">
        {new Date(rating.createdAt).toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}