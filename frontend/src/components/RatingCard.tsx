import { Rating } from '@/types';

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <span className="text-yellow-500">
      {'⭐'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  );
}

export function RatingCard({ rating }: { rating: Rating }) {
  if (!rating) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900 dark:text-white text-sm">
          {rating.rater?.username || 'Usuario'}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-sm">⭐</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {rating.averageScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
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
        <p className="text-sm text-gray-600 dark:text-gray-300 italic border-l-2 border-gray-200 dark:border-gray-700 pl-3">
          "{rating.comment}"
        </p>
      )}

      <p className="text-xs text-gray-400">
        {new Date(rating.createdAt).toLocaleDateString('es-CL', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </p>
    </div>
  );
}