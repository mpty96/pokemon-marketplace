'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { RatingCard } from '@/components/RatingCard';
import { Rating } from '@/types';

interface PublicProfile {
  username: string;
  profile: {
    displayName:    string | null;
    avatarUrl:      string | null;
    bio:            string | null;
    location:       string | null;
    reputationScore: number;
    totalSales:     number;
    totalPurchases: number;
  } | null;
  ratingsReceived: Rating[];
}

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <span className="text-yellow-500">
      {'⭐'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  );
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData]     = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/api/ratings/user/${username}`)
      .then(({ data }) => setData(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Cargando perfil...</p>
    </div>
  );

  if (notFound || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Usuario no encontrado</p>
    </div>
  );

  const profile = data.profile;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Header perfil */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600">
            {data.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile?.displayName || data.username}
            </h1>
            <p className="text-gray-500 text-sm">@{data.username}</p>
            {profile?.location && (
              <p className="text-gray-400 text-sm">📍 {profile.location}</p>
            )}
          </div>
        </div>

        {profile?.bio && (
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.reputationScore.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Reputación</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {profile?.totalSales || 0}
            </p>
            <p className="text-xs text-gray-400">Ventas</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {profile?.totalPurchases || 0}
            </p>
            <p className="text-xs text-gray-400">Compras</p>
          </div>
        </div>

        {/* Promedio por categoría */}
        {data.ratingsReceived.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {(['priceScore', 'communicationScore', 'processScore'] as const).map((key) => {
              const avg = data.ratingsReceived.reduce((s, r) => s + r[key], 0) / data.ratingsReceived.length;
              const label = key === 'priceScore' ? 'Precio' : key === 'communicationScore' ? 'Comunicación' : 'Proceso';
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <Stars score={avg} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium w-8 text-right">
                      {avg.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calificaciones recibidas */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Calificaciones recibidas ({data.ratingsReceived.length})
        </h2>

        {data.ratingsReceived.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">⭐</p>
            <p>Aún no tiene calificaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.ratingsReceived.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}