'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { Sale } from '@/types';

interface SalePanelProps {
  listingId:  string;
  sale:       Sale | null;
  isSeller:   boolean;
  isBuyer:    boolean;
  quantity?:  number;
  listingType?: 'CARD' | 'POKEMON_PRODUCT' | 'BULK_LOT';
  onSaleUpdate: (sale: Sale | null) => void;
}

export default function SalePanel({
  listingId, sale, isSeller, isBuyer, quantity = 1,
  listingType = 'CARD',
  onSaleUpdate,
}: SalePanelProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleInitiate() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/api/sales/${listingId}/initiate`, {
        quantity,
      });
      onSaleUpdate(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar la venta');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      const role = isBuyer ? 'buyer' : 'seller';
      const { data } = await api.post(`/api/sales/${listingId}/confirm`, { role });
      onSaleUpdate(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al confirmar');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm('¿Cancelar la venta? La publicación volverá a estar activa.')) return;
    setLoading(true);
    setError('');
    try {
      await api.post(`/api/sales/${listingId}/cancel`);
      onSaleUpdate(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cancelar');
    } finally {
      setLoading(false);
    }
  }

  // Sin venta activa — solo el comprador puede iniciarla
  if (!sale || sale.status === 'CANCELLED') {
    if (!isSeller) return null;
    return (
      <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] space-y-3">
        <h3 className="font-semibold text-[var(--foreground)]">
          ¿Llegaron a un acuerdo?
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Inicia el proceso de venta para coordinar la entrega.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleInitiate}
          disabled={loading}
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors">
          {loading ? 'Iniciando...' : 'Finalizar venta'}
        </button>
      </div>
    );
  }

  // Venta completada
  if (sale.status === 'COMPLETED') {
    return (
      <div className="border border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50 dark:bg-green-950">
        <div className="text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-semibold text-green-800 dark:text-green-300">
            ¡Venta completada!
          </h3>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Ambas partes confirmaron la transacción.
          </p>
        </div>
      </div>
    );
  }

  // Venta en proceso (PENDING, BUYER_CONFIRMED, SELLER_CONFIRMED)
  const myConfirmed = isBuyer ? sale.buyerConfirmed : sale.sellerConfirmed;

  return (
    <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] space-y-4">
      <h3 className="font-semibold text-[var(--foreground)]">
        Venta en proceso
      </h3>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
        <p className="text-[var(--muted)]">
          Cantidad: <span className="font-semibold text-[var(--foreground)]">{sale.quantity || 1}</span>
        </p>
        <p className="text-[var(--muted)]">
          Total: <span className="font-semibold text-[var(--primary)]">${sale.finalPriceCLP.toLocaleString('es-CL')}</span>
        </p>
      </div>

      {/* Estado de confirmaciones */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
            sale.buyerConfirmed
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          }`}>
            {sale.buyerConfirmed ? '✓' : '○'}
          </span>
          <span className="text-[var(--muted)]">
            Comprador ({sale.buyer.username}) —{' '}
            {sale.buyerConfirmed ? '"Recibí mi carta"' : 'Pendiente'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
            sale.sellerConfirmed
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          }`}>
            {sale.sellerConfirmed ? '✓' : '○'}
          </span>
          <span className="text-[var(--muted)]">
            Vendedor ({sale.seller.username}) —{' '}
            {sale.sellerConfirmed ? '"Recibí mi dinero"' : 'Pendiente'}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-2">
          {error}
        </p>
      )}

      {/* Botón de confirmación */}
      {!myConfirmed && (
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 rounded-lg transition-colors">
          {loading
            ? 'Confirmando...'
            : isBuyer
            ? listingType === 'POKEMON_PRODUCT'
              ? 'Confirmar: Recibí mi producto'
              : listingType === 'BULK_LOT'
                ? 'Confirmar: Recibí mi lote'
                : 'Confirmar: Recibí mi carta'
            : 'Confirmar: Recibí el pago'}
        </button>
      )}

      {myConfirmed && (
        <p className="text-center text-sm text-green-700 dark:text-green-400 font-medium">
          ✓ Ya confirmaste — esperando a la otra parte
        </p>
      )}

      {/* Cancelar */}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-sm py-1.5 rounded-lg transition-colors">
        Cancelar venta
      </button>
    </div>
  );
}