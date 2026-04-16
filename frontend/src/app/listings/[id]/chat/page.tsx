'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { Message, ConversationData, Listing, Sale } from '@/types';
import SalePanel from '@/components/SalePanel';
import RatingForm from '@/components/RatingForm';
import { RatingCard } from '@/components/RatingCard';
import { RatingSaleData, Rating } from '@/types';
import Link from 'next/link';

export default function ChatPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const socket   = useSocket();

  const [listing,  setListing]  = useState<Listing | null>(null);
  const [chatData, setChatData] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sale,     setSale]     = useState<Sale | null>(null);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [ratingData, setRatingData] = useState<RatingSaleData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }

    Promise.all([
      api.get(`/api/listings/${id}`),
      api.get(`/api/chat/${id}`),
    ]).then(async ([listingRes, chatRes]) => {
      setListing(listingRes.data);
      setChatData(chatRes.data);
      setMessages(chatRes.data.conversation?.messages || []);

      // Cargar venta si existe
      if (listingRes.data.status === 'PAUSED' || listingRes.data.status === 'SOLD') {
        try {
          const saleRes = await api.get(`/api/sales/${id}`);
          setSale(saleRes.data);
          if (saleRes.data.status === 'COMPLETED') {
            try {
              const ratingRes = await api.get(`/api/ratings/sale/${saleRes.data.id}`);
              setRatingData(ratingRes.data);
            } catch {
              // sin ratings aún
            }
          }
        } catch {
          // No hay venta aún
        }
      }
    }).finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_conversation', id);

    // Mensajes nuevos
    socket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (message.senderId !== user?.id) {
        socket.emit('mark_read', message.conversationId);
      }
    });

    // Polling para estado de venta y ratings (cada 5s)
    const interval = setInterval(async () => {
      try {
        const listingRes = await api.get(`/api/listings/${id}`);
        setListing(listingRes.data);

        if (listingRes.data.status === 'PAUSED' || listingRes.data.status === 'SOLD') {
          const saleRes = await api.get(`/api/sales/${id}`);
          setSale(saleRes.data);

          if (saleRes.data.status === 'COMPLETED') {
            const ratingRes = await api.get(`/api/ratings/sale/${saleRes.data.id}`);
            setRatingData(ratingRes.data);
          }
        }
      } catch {
        // silencioso
      }
    }, 5000);

    return () => {
      socket.emit('leave_conversation', id);
      socket.off('new_message');
      clearInterval(interval);
    };
  }, [socket, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { listingId: id, content: input.trim() });
    setInput('');
  }

  function handleSaleUpdate(updatedSale: Sale | null) {
    setSale(updatedSale);
    // Actualizar el status del listing localmente
    if (updatedSale) {
      setListing((prev) => prev
        ? { ...prev, status: updatedSale.status === 'COMPLETED' ? 'SOLD' : 'PAUSED' }
        : prev
      );
    } else {
      setListing((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Cargando chat...</p>
    </div>
  );

  if (!listing || !chatData) return null;

  const isOwner  = user?.id === listing.sellerId;
  const isSeller = isOwner;
  const isBuyer  = isAuthenticated && !isOwner;

  if (isOwner && !sale && listing.status === 'ACTIVE') {
  // El vendedor solo ve el chat si ya hay una venta iniciada o mensajes
  // Si no hay nada, redirigir al detalle
  if (messages.length === 0) {
    router.push(`/listings/${id}`);
    return null;
  }
}

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

  {/* Header del chat */}
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
    <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">←</button>
    <img src={listing.images[0]} alt={listing.title}
      className="w-12 h-12 object-contain rounded-lg bg-gray-50 dark:bg-gray-800" />
    <div className="flex-1 min-w-0">
      <h2 className="font-semibold text-gray-900 dark:text-white truncate">{listing.title}</h2>
      <p className="text-sm text-blue-600 font-medium">
        ${listing.priceCLP.toLocaleString('es-CL')}
      </p>
      {/* Link al perfil del otro usuario */}
      <Link
        href={`/usuario/${isSeller
          ? (chatData?.conversation?.messages?.find(m => m.senderId !== listing.sellerId)?.sender.username || '')
          : listing.seller.username
        }`}
        className="text-xs text-blue-500 hover:underline">
        {isSeller ? 'Ver perfil del comprador' : `Ver perfil de ${listing.seller.profile?.displayName || listing.seller.username}`}
      </Link>
    </div>
    <span className={`text-xs px-2 py-1 rounded-full ${
      listing.status === 'ACTIVE'  ? 'bg-green-100 text-green-700' :
      listing.status === 'PAUSED'  ? 'bg-yellow-100 text-yellow-700' :
      listing.status === 'SOLD'    ? 'bg-gray-100 text-gray-500' :
                                    'bg-gray-100 text-gray-400'
    }`}>
      {listing.status === 'ACTIVE'  ? 'Disponible' :
      listing.status === 'PAUSED'  ? 'En proceso' :
      listing.status === 'SOLD'    ? 'Vendida'    : 'Cancelada'}
    </span>
  </div>

      {/* Panel de venta */}
      <SalePanel
        listingId={id}
        sale={sale}
        isSeller={isSeller}
        isBuyer={isBuyer}
        onSaleUpdate={handleSaleUpdate}
      />

      {/* Panel de calificación */}
      {sale?.status === 'COMPLETED' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            ⭐ Calificaciones
          </h3>

          {ratingData?.canRate && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Califica tu experiencia en esta transacción:
              </p>
              <RatingForm
                saleId={sale.id}
                onRated={(newRating: Rating) => {
                  setRatingData((prev) => prev
                    ? { ...prev, myRating: newRating, canRate: false }
                    : null
                  );
                }}
              />
            </div>
          )}

          {ratingData?.myRating && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Tu calificación
              </p>
              <RatingCard rating={ratingData.myRating} />
            </div>
          )}

          {ratingData?.theirRating && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Calificación recibida
              </p>
              <RatingCard rating={ratingData.theirRating} />
            </div>
          )}

          {!ratingData?.myRating && !ratingData?.canRate && (
            <p className="text-sm text-gray-400 text-center py-2">
              La otra parte aún no ha calificado
            </p>
          )}
        </div>
      )}

      {/* Mensajes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-8">
              <p>Inicia la conversación con el vendedor</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = String(msg.sender?.id) === String(user?.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-xs lg:max-w-md">
                  {!isMe && (
                    <p className="text-xs text-gray-400 mb-1 ml-1">
                      {msg.sender.profile?.displayName || msg.sender.username}
                    </p>
                  )}
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'} mx-1`}>
                    {new Date(msg.createdAt).toLocaleTimeString('es-CL', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          {listing.status === 'SOLD' ? (
            <p className="text-center text-sm text-gray-400">Esta publicación ya fue vendida</p>
          ) : (
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Enviar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}