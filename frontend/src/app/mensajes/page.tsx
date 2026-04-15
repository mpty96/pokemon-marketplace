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
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/api/chat/my')
      .then(({ data }) => setConversations(data))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // Separar leídos y no leídos
  const unread = conversations.filter((c) => hasUnread(c, user?.id || ''));
  const read   = conversations.filter((c) => !hasUnread(c, user?.id || ''));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        💬 Mis mensajes
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p>No tienes conversaciones aún</p>
          <Link href="/marketplace"
            className="inline-block mt-4 text-blue-600 hover:underline text-sm">
            Explorar marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* No leídos */}
          {unread.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                No leídos ({unread.length})
              </h2>
              <div className="space-y-2">
                {unread.map((conv) => (
                  <ConversationCard
                    key={conv.id}
                    conv={conv}
                    currentUserId={user?.id || ''}
                    isUnread
                  />
                ))}
              </div>
            </div>
          )}

          {/* Leídos */}
          {read.length > 0 && (
            <div>
              {unread.length > 0 && (
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Anteriores
                </h2>
              )}
              <div className="space-y-2">
                {read.map((conv) => (
                  <ConversationCard
                    key={conv.id}
                    conv={conv}
                    currentUserId={user?.id || ''}
                    isUnread={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function hasUnread(conv: ConversationPreview, userId: string): boolean {
  if (!conv.lastMessage) return false;
  // Si el último mensaje no es mío → potencialmente no leído
  // El backend debería traer este dato — por ahora usamos heurística
  return conv.lastMessage.senderId !== userId;
}

function ConversationCard({
  conv,
  currentUserId,
  isUnread,
}: {
  conv: ConversationPreview;
  currentUserId: string;
  isUnread: boolean;
}) {
  const otherPerson = conv.isSeller
    ? conv.lastMessage?.sender.username || 'Comprador'
    : conv.seller.profile?.displayName || conv.seller.username;

  const saleStatus = conv.sale?.status;

  const pendingAction = (() => {
    if (!conv.sale) return null;
    if (saleStatus === 'COMPLETED' || saleStatus === 'CANCELLED') return null;
    if (conv.isSeller  && !conv.sale.sellerConfirmed) return 'Confirmar: Recibí el pago';
    if (!conv.isSeller && !conv.sale.buyerConfirmed)  return 'Confirmar: Recibí mi carta';
    return null;
  })();

  return (
    <Link href={`/listings/${conv.listingId}/chat`}
      className={`flex items-center gap-4 rounded-xl p-4 border transition-all ${
        isUnread
          ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:shadow-md'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-sm'
      }`}>

      {/* Indicador no leído */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
          {conv.listingImage ? (
            <img src={conv.listingImage} alt={conv.listingTitle}
              className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🎴</div>
          )}
        </div>
        {isUnread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`truncate text-sm ${
            isUnread
              ? 'font-bold text-gray-900 dark:text-white'
              : 'font-semibold text-gray-900 dark:text-white'
          }`}>
            {conv.listingTitle}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
            conv.listingStatus === 'ACTIVE'   ? 'bg-green-100 text-green-700' :
            conv.listingStatus === 'PAUSED'   ? 'bg-yellow-100 text-yellow-700' :
            conv.listingStatus === 'SOLD'     ? 'bg-gray-100 text-gray-500' :
                                                'bg-red-100 text-red-500'
          }`}>
            {conv.listingStatus === 'ACTIVE'  ? 'Activa' :
             conv.listingStatus === 'PAUSED'  ? 'En proceso' :
             conv.listingStatus === 'SOLD'    ? 'Vendida' : 'Cancelada'}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-0.5">
          {conv.isSeller ? '🏪 Vendes a' : '🛒 Compras de'}: {otherPerson}
          {' · '}${conv.listingPrice.toLocaleString('es-CL')}
        </p>

        {conv.lastMessage && (
          <p className={`text-sm truncate mt-1 ${
            isUnread
              ? 'text-gray-800 dark:text-gray-200 font-medium'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {conv.lastMessage.senderId === currentUserId ? 'Tú: ' : ''}
            {conv.lastMessage.content}
          </p>
        )}

        {pendingAction && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
            ⏳ {pendingAction}
          </div>
        )}

        {saleStatus === 'COMPLETED' && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
            ✅ Venta completada
          </div>
        )}
      </div>

      {/* Hora del último mensaje */}
      {conv.lastMessage && (
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-400">
            {new Date(conv.lastMessage.createdAt).toLocaleTimeString('es-CL', {
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      )}
    </Link>
  );
}