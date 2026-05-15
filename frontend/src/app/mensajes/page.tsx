'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { ConversationPreview } from '@/types';

export default function MensajesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    api.get('/api/chat/my')
      .then(({ data }) => setConversations(data))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  function toggleSelected(id: string) {
  setSelectedIds((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
}

function cancelSelection() {
  setSelectionMode(false);
  setSelectedIds([]);
}

async function confirmDeleteChats() {
  if (selectedIds.length === 0) return;

  setDeleting(true);

  try {
    await api.delete('/api/chat/conversations/bulk', {
      data: { conversationIds: selectedIds },
    });

    setConversations((prev) =>
      prev.filter((conv) => !selectedIds.includes(conv.id))
    );

    setShowDeleteConfirm(false);
    cancelSelection();
  } catch (err: any) {
    alert(err.response?.data?.error || 'Error al eliminar conversaciones');
  } finally {
    setDeleting(false);
  }
}

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[var(--foreground)]">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          💬 Mis mensajes
        </h1>

        {conversations.length > 0 && (
          <div className="flex items-center gap-2">
            {selectionMode ? (
              <>
                <button
                  type="button"
                  onClick={cancelSelection}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  Eliminar ({selectedIds.length})
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setSelectionMode(true)}
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Seleccionar
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--surface)] rounded-xl h-20 animate-pulse border border-[var(--border)]" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-2)]">
          <p className="text-4xl mb-3">💬</p>
          <p>No tienes conversaciones aún</p>
          <Link href="/marketplace" className="inline-block mt-4 text-[var(--primary)] hover:underline text-sm">
            Explorar marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conv={conv}
              currentUserId={user?.id || ''}
              selectionMode={selectionMode}
              selected={selectedIds.includes(conv.id)}
              onToggle={() => toggleSelected(conv.id)}
            />
          ))}
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Eliminar conversaciones
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Esta acción eliminará definitivamente los chats seleccionados y todos sus mensajes de la base de datos. No podrás recuperarlos después.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-[var(--border)] py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteChats}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {deleting ? 'Eliminando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationCard({
  conv,
  currentUserId,
  selectionMode,
  selected,
  onToggle,
}: {
  conv: ConversationPreview;
  currentUserId: string;
  selectionMode: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const isSeller = conv.isSeller;
  const otherPerson = isSeller
    ? conv.lastMessage?.sender.username || 'Comprador'
    : conv.seller.profile?.displayName || conv.seller.username;

  const saleStatus = conv.sale?.status;

  const pendingAction = (() => {
    if (!conv.sale) return null;
    if (saleStatus === 'COMPLETED' || saleStatus === 'CANCELLED') return null;
    if (isSeller && !conv.sale.sellerConfirmed) return 'Confirmar: Recibí el pago';
    if (!isSeller && !conv.sale.buyerConfirmed) return 'Confirmar: Recibí mi carta';
    return null;
  })();

  const listingBadgeClass =
    conv.listingStatus === 'ACTIVE'
      ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
      : conv.listingStatus === 'PAUSED'
      ? 'bg-[var(--warning-bg)] text-[var(--warning-fg)]'
      : conv.listingStatus === 'SOLD'
      ? 'bg-[var(--surface-2)] text-[var(--muted)]'
      : 'bg-[var(--danger-bg)] text-[var(--danger-fg)]';

  return (
    <div className="flex items-center gap-2">
    {selectionMode && (
      <input
        type="checkbox"
        checked={selected}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
        className="h-4 w-4 accent-[var(--primary)]"
      />
    )}

    <Link
      href={`/listings/${conv.listingId}/chat`}
      className={`flex-1 min-w-0 flex items-center gap-4 rounded-xl p-4 border hover:shadow-sm transition-shadow ${
        (conv.unreadCount || 0) > 0
          ? 'bg-[var(--info-bg)]/35 border-[var(--primary)]'
          : 'bg-[var(--surface)] border-[var(--border)]'
    }`}
    >
      <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--surface-2)]">
        {conv.listingImage ? (
          <img src={conv.listingImage} alt={conv.listingTitle} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🎴</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-[var(--foreground)] truncate text-sm">
            {conv.listingTitle}
          </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {(conv.unreadCount || 0) > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                  {conv.unreadCount} nuevo{conv.unreadCount > 1 ? 's' : ''}
                </span>
              )}

              <span className={`text-xs px-2 py-0.5 rounded-full ${listingBadgeClass}`}>
                {conv.listingStatus === 'ACTIVE'
                  ? 'Activa'
                  : conv.listingStatus === 'PAUSED'
                  ? 'En proceso'
                  : conv.listingStatus === 'SOLD'
                  ? 'Vendida'
                  : 'Cancelada'}
              </span>
            </div>
          </div>

        <p className="text-xs text-[var(--muted-2)] mt-0.5">
          {isSeller ? 'Vendes a' : 'Compras a'}: {otherPerson}
          {' · '}
          ${conv.listingPrice.toLocaleString('es-CL')}
        </p>

        {conv.lastMessage && (
          <p className={`text-sm truncate mt-1 ${(conv.unreadCount || 0) > 0 ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted)]'}`}>
            {conv.lastMessage.senderId === currentUserId ? 'Tú: ' : ''}
            {conv.lastMessage.content}
          </p>
        )}

        {pendingAction && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs bg-[var(--warning-bg)] text-[var(--warning-fg)] px-2 py-1 rounded-full">
            ⏳ Pendiente: {pendingAction}
          </div>
        )}

        {saleStatus === 'COMPLETED' && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs bg-[var(--success-bg)] text-[var(--success-fg)] px-2 py-1 rounded-full">
            ✅ Venta completada
          </div>
        )}

        
      </div>
    </Link>
  </div>
  );
}