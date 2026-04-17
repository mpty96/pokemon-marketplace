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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[var(--foreground)]">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        💬 Mis mensajes
      </h1>

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
            <ConversationCard key={conv.id} conv={conv} currentUserId={user?.id || ''} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationCard({
  conv,
  currentUserId,
}: {
  conv: ConversationPreview;
  currentUserId: string;
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
    <Link
      href={`/listings/${conv.listingId}/chat`}
      className={`flex items-center gap-4 rounded-xl p-4 border hover:shadow-sm transition-shadow ${
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
            {(conv.unreadCount || 0) > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex-shrink-0">
                {conv.unreadCount} nuevo{conv.unreadCount > 1 ? 's' : ''}
              </span>
            )}
            {conv.listingTitle}
          </h3>
          

          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${listingBadgeClass}`}>
            {conv.listingStatus === 'ACTIVE'
              ? 'Activa'
              : conv.listingStatus === 'PAUSED'
              ? 'En proceso'
              : conv.listingStatus === 'SOLD'
              ? 'Vendida'
              : 'Cancelada'}
          </span>
        </div>

        <p className="text-xs text-[var(--muted-2)] mt-0.5">
          {isSeller ? '🏪 Vendes a' : '🛒 Compras de'}: {otherPerson}
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
  );
}