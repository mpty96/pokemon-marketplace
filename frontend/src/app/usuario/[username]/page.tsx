'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { RatingCard } from '@/components/RatingCard';
import { Rating } from '@/types';

interface PublicProfile {
  username: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    reputationScore: number;
    totalSales: number;
    totalPurchases: number;
  } | null;
  ratingsReceived: Rating[];
  ratingsAsSeller: Rating[];
  ratingsAsBuyer: Rating[];
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

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ratingTab, setRatingTab] = useState<'all' | 'seller' | 'buyer'>('all');

  useEffect(() => {
    api.get(`/api/ratings/user/${username}`)
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-[var(--foreground)]">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--info-bg)] overflow-hidden flex items-center justify-center text-2xl font-bold text-[var(--info-fg)]">
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
            {profile?.location && (
              <p className="text-[var(--muted-2)] text-sm">📍 {profile.location}</p>
            )}
          </div>
        </div>

        {profile?.bio && (
          <p className="mt-4 text-[var(--muted)] text-sm">{profile.bio}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[var(--border)]">
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
        <div className="mt-6">
          <div className="flex gap-4 border-b border-[var(--border)] mb-4">
            <button
              onClick={() => setRatingTab('all')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                ratingTab === 'all'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)]'
              }`}
            >
              Todas ({data.ratingsReceived.length})
            </button>

            <button
              onClick={() => setRatingTab('seller')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                ratingTab === 'seller'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)]'
              }`}
            >
              Como vendedor ({data.ratingsAsSeller?.length || 0})
            </button>

            <button
              onClick={() => setRatingTab('buyer')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                ratingTab === 'buyer'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)]'
              }`}
            >
              Como comprador ({data.ratingsAsBuyer?.length || 0})
            </button>
          </div>

          <div className="space-y-3">
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
    </div>
  );
}