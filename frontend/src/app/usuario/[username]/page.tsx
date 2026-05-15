'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { RatingCard } from '@/components/RatingCard';
import { Rating, Listing } from '@/types';
import { useAuthStore } from '@/store/auth.store';

interface PublicProfile {
  username: string;
  profile: {
    displayName:        string | null;
    avatarUrl:          string | null;
    bio:                string | null;
    location:           string | null;
    reputationScore:    number;
    totalSales:         number;
    totalPurchases:     number;
    strikes:            number;
    isBanned:           boolean;
    isBetaTester:       boolean;
  } | null;
  ratingsReceived:      Rating[];
  ratingsAsSeller:      Rating[];
  ratingsAsBuyer:       Rating[];
  activeListings?:      Listing[];
  userLevel:            number;
  completedTransactions:number;
}

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <span className="text-[#e0a800]">
      {'⭐'.repeat(rounded)}
      {'☆'.repeat(5 - rounded)}
    </span>
  );
}

function listingTypeLabel(type: Listing['listingType']) {
  if (type === 'CARD') return 'Carta';
  if (type === 'POKEMON_PRODUCT') return 'Producto Pokémon';
  return 'Lote';
}

function conditionLabel(condition: Listing['condition']) {
  switch (condition) {
    case 'MINT':
      return 'Mint';
    case 'NEAR_MINT':
      return 'Near Mint';
    case 'EXCELLENT':
      return 'Excelente';
    case 'GOOD':
      return 'Buena';
    case 'PLAYED':
      return 'Jugada';
    case 'POOR':
      return 'Dañada';
    default:
      return condition;
  }
}

const USER_LEVELS = [
  {
    level: 1,
    label: 'Nivel 1',
    requirement: '+10 Transacciones',
    image: '/levels/poke-ball.png',
  },
  {
    level: 2,
    label: 'Nivel 2',
    requirement: '+30 Transacciones',
    image: '/levels/great-ball.png',
  },
  {
    level: 3,
    label: 'Nivel 3',
    requirement: '+50 Transacciones',
    image: '/levels/ultra-ball.png',
  },
  {
    level: 4,
    label: 'Nivel 4',
    requirement: '+100 Transacciones',
    image: '/levels/honor-ball.png',
  },
  {
    level: 5,
    label: 'Nivel 5',
    requirement: '+500 Transacciones',
    image: '/levels/master-ball.png',
  },
];

function UserLevelBadge({
  level,
  completedTransactions,
}: {
  level: number;
  completedTransactions: number;
}) {
  return (
    <div className="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto text-right">
      <p className="text-sm font-semibold text-[var(--foreground)] mb-2">
        {level > 0 ? `Nivel ${level}` : 'Sin nivel'}
      </p>

      <div className="flex justify-end gap-1.5 sm:gap-2 flex-wrap">
        {USER_LEVELS.map((item) => {
          const unlocked = level >= item.level;

          return (
            <div
              key={item.level}
              title={`${item.label} -> ${item.requirement}`}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center ${
                unlocked
                  ? 'border-[var(--primary)] bg-[var(--surface)]'
                  : 'border-[var(--border)] bg-[var(--surface-2)]'
              }`}
            >
              {unlocked ? (
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              ) : (
                <span className="w-3 h-3 rounded-full border border-[var(--muted-2)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ratingTab, setRatingTab] = useState<'all' | 'seller' | 'buyer'>('all');
  const currentUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Conducta inapropiada');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    api.get(`/api/profile/public/${username}`)
      .then(({ data }) => setData(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted-2)]">Cargando perfil...</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted-2)]">Usuario no encontrado</p>
      </div>
    );
  }

  const profile = data.profile;

  async function handleSubmitReport() {
  setReportLoading(true);
  setReportMessage('');

  try {
    await api.post('/api/reports', {
      reportedUsername: data?.username,
      reason: reportReason,
      description: reportDescription,
    });

    setReportMessage('Reporte enviado correctamente.');
    setReportDescription('');
    setShowReportModal(false);
  } catch (err: any) {
    setReportMessage(err.response?.data?.error || 'Error al enviar reporte');
  } finally {
    setReportLoading(false);
  }
}

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-6 text-[var(--foreground)]">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--info-bg)] overflow-hidden flex items-center justify-center text-2xl font-bold text-[var(--info-fg)]">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={data.username} className="w-full h-full object-cover" />
            ) : (
              data.username[0].toUpperCase()
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {profile?.displayName || data.username}
            </h1>
            <p className="text-[var(--muted)] text-sm">@{data.username}</p>
            {profile?.isBetaTester && (
              <span className="inline-flex mt-1 rounded-full border border-sky-300/40 bg-sky-100/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-700 dark:border-sky-700/40 dark:bg-sky-900/30 dark:text-sky-300">
                beta_tester
              </span>
            )}
            {profile?.location && (
              <p className="text-[var(--muted-2)] text-sm">📍 {profile.location}</p>
            )}
            {isAuthenticated && currentUser?.username !== data.username && (
              <div className="mt-3 flex flex-col items-start gap-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Reportar usuario
                </button>

                <div className="flex items-center rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  {(profile?.strikes || 0)}/3 Strikes
                </div>
              </div>
            )}

          {reportMessage && (
            <p className="mt-3 text-sm text-[var(--muted)]">{reportMessage}</p>
          )}
          </div>
            <UserLevelBadge
              level={data.userLevel || 0}
              completedTransactions={data.completedTransactions || 0}
            />
        </div>

        {profile?.bio && (
          <p className="mt-4 text-[var(--muted)] text-sm">{profile.bio}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-[var(--border)]">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[#e0a800]">⭐</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {profile?.reputationScore?.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-2)]">Global</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[#e0a800]">⭐</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {(profile as any)?.reputationAsSeller?.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-2)]">Como vendedor</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[#e0a800]">⭐</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {(profile as any)?.reputationAsBuyer?.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-2)]">Como comprador</p>
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-[var(--foreground)]">
              {(profile?.totalSales || 0) + (profile?.totalPurchases || 0)}
            </p>
            <p className="text-xs text-[var(--muted-2)]">Transacciones</p>
          </div>
        </div>
      </div>
      
      {data.ratingsReceived.length > 0 && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Calificaciones recibidas
              </h2>
            </div>
          </div>

          <div className="flex gap-4 border-b border-[var(--border)] mb-4 overflow-x-auto">
            <button
              onClick={() => setRatingTab('all')}
              className={`pb-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                ratingTab === 'all'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)]'
              }`}
            >
              Todas ({data.ratingsReceived.length})
            </button>

            <button
              onClick={() => setRatingTab('seller')}
              className={`pb-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                ratingTab === 'seller'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)]'
              }`}
            >
              Como vendedor ({data.ratingsAsSeller?.length || 0})
            </button>

            <button
              onClick={() => setRatingTab('buyer')}
              className={`pb-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                ratingTab === 'buyer'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)]'
              }`}
            >
              Como comprador ({data.ratingsAsBuyer?.length || 0})
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1 space-y-3">
            {(ratingTab === 'all'
              ? data.ratingsReceived
              : ratingTab === 'seller'
              ? data.ratingsAsSeller
              : data.ratingsAsBuyer
            )?.map((rating: Rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </div>
        </div>
      )}

      {(data.activeListings?.length || 0) > 0 && (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Publicaciones activas
            </h2>
          </div>

          <span className="text-sm text-[var(--muted)]">
            {data.activeListings?.length || 0} activas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
          {data.activeListings?.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden hover:border-[var(--primary)] transition-colors"
            >
              <div className="aspect-square bg-[var(--surface)] overflow-hidden">
                <img
                  src={listing.images[0]}
                  alt={listing.cardName}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="p-2.5 sm:p-3">
                <span className="inline-flex rounded-full bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] mb-2">
                  {listingTypeLabel(listing.listingType)}
                </span>

                <h3 className="font-semibold text-[var(--foreground)] truncate text-xs sm:text-sm">
                  {listing.cardName}
                </h3>

                <p className="text-xs text-[var(--muted-2)] truncate mt-0.5">
                  {listing.edition}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[var(--primary)] font-bold text-sm">
                    ${listing.priceCLP.toLocaleString('es-CL')}
                  </span>

                  <span className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-full px-2 py-0.5 text-[var(--muted)]">
                    {conditionLabel(listing.condition)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--muted-2)]">
                  <span>
                    Vistas: {listing.views}
                  </span>

                  <span>
                    {new Date(listing.createdAt).toLocaleDateString('es-CL')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--border)] p-5">
            <h2 className="text-lg font-bold mb-3 text-[var(--foreground)]">
              Reportar usuario
            </h2>

            <label className="block text-sm font-medium text-[var(--muted)] mb-1">
              Motivo
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full mb-3 border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)]"
            >
              <option>Conducta inapropiada</option>
              <option>Estafa o intento de estafa</option>
              <option>Producto falso o engañoso</option>
              <option>Acoso o amenazas</option>
              <option>Spam</option>
              <option>Otro</option>
            </select>

            <label className="block text-sm font-medium text-[var(--muted)] mb-1">
              Descripción
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full min-h-28 border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)]"
              placeholder="Describe qué ocurrió..."
            />

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 border border-[var(--border)] rounded-lg py-2 text-[var(--foreground)]"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={reportLoading || reportDescription.trim().length < 10}
                onClick={handleSubmitReport}
                className="flex-1 bg-red-600 disabled:opacity-60 text-white rounded-lg py-2"
              >
                {reportLoading ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}