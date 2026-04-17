'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Transaction {
  id:          string;
  listingId:   string;
  title:       string;
  image:       string | null;
  priceCLP:    number;
  completedAt: string | null;
  buyer:       { id: string; username: string };
  seller:      { id: string; username: string };
}

export default function TransaccionesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
      api.get(`/api/sales/recent?ts=${Date.now()}`)
        .then(({ data }) => setTransactions(data))
        .finally(() => setLoading(false));

    // Actualización cada 30s
    const interval = setInterval(() => {
      api.get(`/api/sales/recent?ts=${Date.now()}`)
        .then(({ data }) => setTransactions(data));
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        📦 Transacciones
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>No hay transacciones completadas aún</p>
          <Link href="/marketplace"
            className="inline-block mt-4 text-blue-600 hover:underline text-sm">
            Ir al marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id}
              className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">

              {/* Imagen */}
              <Link href={`/listings/${tx.listingId}`} className="flex-shrink-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                  {tx.image ? (
                    <img src={tx.image} alt={tx.title}
                      className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎴</div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/listings/${tx.listingId}`}
                  className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 truncate block">
                  {tx.title}
                </Link>
                <p className="text-sm text-blue-600 font-medium">
                  ${tx.priceCLP.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  🏪 Vendida por: 
                  <Link href={`/usuario/${tx.seller.username}`}
                    className="text-blue-500 hover:underline font-medium">
                    {tx.seller.username}
                  </Link>
                  {' → '}
                  🛒 Comprada por:
                  <Link href={`/usuario/${tx.buyer.username}`}
                    className="text-blue-500 hover:underline font-medium">
                    {tx.buyer.username}
                  </Link>
                </p>
              </div>

              {/* Fecha */}
              <div className="flex-shrink-0 text-right">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  ✅ Completada
                </span>
                {tx.completedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(tx.completedAt).toLocaleDateString('es-CL', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                    {' '}
                    {new Date(tx.completedAt).toLocaleTimeString('es-CL', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}