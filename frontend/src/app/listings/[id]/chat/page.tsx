'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { Message, ConversationData, Listing, Sale } from '@/types';
import SalePanel from '@/components/SalePanel';
import RatingForm from '@/components/RatingForm';
import { RatingCard } from '@/components/RatingCard';
import { RatingSaleData, Rating } from '@/types';
import Link from 'next/link';
import { clearUnread } from '@/hooks/useUnreadCount';

export default function ChatPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const socket   = useSocket();

  const [listing,         setListing]         = useState<Listing | null>(null);
  const [chatData,        setChatData]        = useState<ConversationData | null>(null);
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [sale,            setSale]            = useState<Sale | null>(null);
  const [input,           setInput]           = useState('');
  const [imageFiles,      setImageFiles]      = useState<File[]>([]);
  const [sendingImage,    setSendingImage]    = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedImage,   setSelectedImage]   = useState<string | null>(null);
  const [showSafetyTips,  setShowSafetyTips]  = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [ratingData,      setRatingData]      = useState<RatingSaleData | null>(null);
  const [storedQuantity, setStoredQuantity] = useState(1);
  const quantityFromUrl = Number(searchParams.get('quantity') || '0');
  const requestedQuantity = Math.max(1, Math.min(3, quantityFromUrl || storedQuantity || 1));
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }

    Promise.all([
      api.get(`/api/listings/${id}`),
      api.get(`/api/chat/${id}`),
    ]).then(async ([listingRes, chatRes]) => {
      setListing(listingRes.data);
      setChatData(chatRes.data);
      setMessages(chatRes.data.conversation?.messages || []);

      // Sincroniza el contador local después de que el backend marque como leídos
      clearUnread();

      // Cargar venta si existe
      if (listingRes.data.status === 'ACTIVE' || listingRes.data.status === 'SOLD') {
        try {
          const saleRes = await api.get(`/api/sales/${id}`);
          setSale(saleRes.data);

          if (saleRes.data.status === 'COMPLETED') {
            const ratingRes = await api.get(`/api/ratings/sale/${saleRes.data.id}`);
            setRatingData(ratingRes.data);
          }
        } catch {
          setSale(null);
        }
      }
    }).finally(() => setLoading(false));
  }, [id, isAuthenticated]);


  useEffect(() => {
  if (!id) return;

  const saved = Number(sessionStorage.getItem(`listing:${id}:quantity`) || '1');
  setStoredQuantity(Math.max(1, Math.min(3, saved)));
  }, [id]);


  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_conversation', id);

    // Mensajes nuevos
    socket.on('new_message', (message: Message) => {
      setMessages((prev) => {
        
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });
      if (message.senderId !== user?.id) {
      }
    });
    

    // Polling para estado de venta y ratings (cada 5s)
    const interval = setInterval(async () => {
      try {
        const listingRes = await api.get(`/api/listings/${id}`);
        setListing(listingRes.data);

        if (listingRes.data.status === 'ACTIVE' || listingRes.data.status === 'SOLD') {
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
    }, 15000);

    return () => {
      socket.emit('leave_conversation', id);
      socket.off('new_message');
      clearInterval(interval);
    };
  }, [socket, id]);

  useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  container.scrollTop = container.scrollHeight;
  }, [messages]);


  async function sendMessage(e: React.FormEvent) {
  e.preventDefault();

  if ((!input.trim() && imageFiles.length === 0) || sendingMessage) return;

  setSendingMessage(true);

  try {
    let imageUrls: string[] = [];

    if (imageFiles.length > 0) {
      setSendingImage(true);

      const formData = new FormData();

      imageFiles.slice(0, 4).forEach((file) => {
        formData.append('images', file);
      });

      const { data } = await api.post(`/api/chat/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      imageUrls = data.imageUrls || [];
    }

    let contentToSend = input.trim();

    if (
      listing?.listingType === 'POKEMON_PRODUCT' &&
      user?.id !== listing.sellerId
    ) {
      const alreadyHasQuantity = messages.some((message) =>
        message.content?.startsWith('Cantidad requerida:')
      );

      if (!alreadyHasQuantity) {
        const quantityLine = `Cantidad requerida: ${requestedQuantity} unidad${requestedQuantity > 1 ? 'es' : ''}.`;
        contentToSend = contentToSend
          ? `${quantityLine}\n\n${contentToSend}`
          : quantityLine;
      }
    }

    const { data: savedMessage } = await api.post(`/api/chat/${id}/messages`, {
      content: contentToSend,
      imageUrls,
    });

    setMessages((prev) => {
      if (prev.some((message) => message.id === savedMessage.id)) {
        return prev;
      }

      return [...prev, savedMessage];
    });

    socket?.emit('message_created', {
      listingId: id,
      message: savedMessage,
    });

    setInput('');
    setImageFiles([]);
  } catch (err: any) {
    console.error('SEND MESSAGE ERROR:', err);
    alert(err.response?.data?.error || 'Error al enviar mensaje');
  } finally {
    setSendingImage(false);
    setSendingMessage(false);
  }
}


async function handleSaleUpdate(updatedSale: Sale | null) {
  setSale(updatedSale);

  if (updatedSale) {
    setListing((prev) =>
      prev
        ? {
            ...prev,
            status:
              updatedSale.status === 'COMPLETED'
                ? 'SOLD'
                : 'ACTIVE',
          }
        : prev
    );

    // Cargar rating inmediatamente al completarse
    if (updatedSale.status === 'COMPLETED') {
      try {
        const ratingRes = await api.get(
          `/api/ratings/sale/${updatedSale.id}`
        );

        setRatingData(ratingRes.data);
      } catch {
        // silencioso
      }
    }
  } else {
    setListing((prev) =>
      prev ? { ...prev, status: 'ACTIVE' } : prev
    );
  }
}

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--muted-2)]">Cargando chat...</p>
    </div>
  );

  if (!listing || !chatData) return null;

  const isOwner  = user?.id === listing.sellerId;
  const isSeller = isOwner;
  const isBuyer  = isAuthenticated && !isOwner;

  const latestQuantityMessage = [...messages]
    .reverse()
    .find((message) => message.content?.startsWith('Cantidad requerida:'));

  const savedQuantityMatch = latestQuantityMessage?.content?.match(/Cantidad requerida:\s*(\d+)/i);

  const displayedQuantity =
    listing.listingType === 'POKEMON_PRODUCT'
      ? Number(savedQuantityMatch?.[1] || requestedQuantity || 1)
      : 1;


  if (isOwner && !sale && listing.status === 'ACTIVE') {
  // El vendedor solo ve el chat si ya hay una venta iniciada o mensajes
  // Si no hay nada, redirigir al detalle
  if (messages.length === 0) {
    router.push(`/listings/${id}`);
    return null;
  }
}

return (
  <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8 text-[var(--foreground)]">
  <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 min-w-0">


  {/* Header del chat */}
  <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 sm:p-4 flex items-center gap-3 sm:gap-4 min-w-0">
    <button onClick={() => router.back()} className="text-[var(--muted-2)] hover:text-[var(--foreground)]">←</button>
      <img src={listing.images[0]} alt={listing.title}
        className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-[var(--surface-2)] shrink-0" />
  <div className="flex-1 min-w-0">
    <h2 className="font-semibold text-[var(--foreground)] truncate text-sm sm:text-base">{listing.title}</h2>
      <div className="space-y-1">
        <p className="text-sm text-[var(--primary)] font-medium">
          ${listing.priceCLP.toLocaleString('es-CL')}
        </p>

        {listing.listingType === 'POKEMON_PRODUCT' && (
          <p className="text-xs text-[var(--muted)]">
            Cantidad requerida: {displayedQuantity}
          </p>
        )}
      </div>
      {/* Link al perfil del otro usuario */}
      <Link
        href={`/usuario/${isSeller
          ? (chatData?.conversation?.messages?.find(m => m.senderId !== listing.sellerId)?.sender.username || '')
          : listing.seller.username
        }`}
        className="text-xs text-[var(--primary)] hover:underline">
          {isSeller ? 'Ver perfil del comprador' : 'Ver perfil del vendedor'}
      </Link>
    </div>
    <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${
        listing.status === 'ACTIVE'  ? 'bg-[var(--success-bg)] text-[var(--success-fg)]' :
        listing.status === 'PAUSED'  ? 'bg-[var(--warning-bg)] text-[var(--warning-fg)]' :
        listing.status === 'SOLD'    ? 'bg-[var(--surface-2)] text-[var(--muted)]' :
                                      'bg-[var(--danger-bg)] text-[var(--danger-fg)]'
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
        quantity={displayedQuantity}
        listingType={listing.listingType}
        onSaleUpdate={handleSaleUpdate}
      />

      {/* Panel de calificación */}
      {sale?.status === 'COMPLETED' && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 space-y-4">
          <h3 className="font-semibold text-[var(--foreground)]">
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
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden min-w-0 flex flex-col h-[58vh] sm:h-[520px]">
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[var(--surface-2)] min-h-0">

          {messages.length === 0 && (
            <div className="text-center text-[var(--muted-2)] text-sm mt-8">
              <p>Inicia la conversación con el vendedor</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = String(msg.sender?.id) === String(user?.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[82%] sm:max-w-[70%]">
                  {!isMe && (
                    <p className="text-xs text-gray-400 mb-1 ml-1">
                      {msg.sender.profile?.displayName || msg.sender.username}
                    </p>
                  )}
                  <div className="space-y-2">
                    {msg.imageUrls?.length > 0 && (
                      <div
                        className={`grid gap-2 ${
                          msg.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                        }`}
                      >
                        {msg.imageUrls.map((url) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setSelectedImage(url)}
                            className="block overflow-hidden rounded-lg bg-black/10"
                          >
                            <img
                              src={url}
                              alt="Imagen enviada"
                              className={`w-full rounded-lg object-contain ${
                                msg.imageUrls.length === 1 ? 'max-h-80' : 'max-h-52'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.content && (
                      <div
                        className={`inline-block max-w-full px-4 py-2 rounded-2xl text-sm break-words ${
                          isMe
                            ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                            : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]'
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
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
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border)] p-3 bg-[var(--surface)]">
          {listing.status === 'SOLD' ? (
            <p className="text-center text-sm text-gray-400">Esta publicación ya fue vendida</p>
          ) : (
          <form onSubmit={sendMessage} className="space-y-2">

            {imageFiles.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--muted)]">
                    📷 {imageFiles.length} imagen(es) seleccionada(s)
                  </span>

                  <button
                    type="button"
                    onClick={() => setImageFiles([])}
                    className="text-[var(--danger-fg)] hover:underline"
                  >
                    Quitar
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {imageFiles.map((file) => (
                    <span
                      key={file.name}
                      className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 items-stretch">
              <label className="cursor-pointer rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] shrink-0 flex items-center">
                📎

                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 4);
                    setImageFiles(files);
                  }}
                />
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />

              <button
                type="submit"
                disabled={(!input.trim() && imageFiles.length === 0) || sendingImage || sendingMessage}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] px-3 sm:px-4 py-2 rounded-lg text-sm shrink-0"
              >
                {sendingImage || sendingMessage ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
          )}
        </div>
            </div>
    </div>

      <aside className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSafetyTips(true)}
          className="group flex flex-col items-center"
        >
          <img
            src="/chat-safety.png"
            alt="Consejos de seguridad"
            className="w-28 xl:w-32 h-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />

          <div className="mt-2 rounded-full bg-[var(--surface)] px-3 py-1 shadow-sm border border-[var(--border)]">
            <span className="text-sm xl:text-base font-bold text-[var(--primary)] tracking-wide">
              Consejos
            </span>
          </div>
        </button>
      </aside>
      
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>

          <img
            src={selectedImage}
            alt="Imagen ampliada"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {showSafetyTips && (
  <div
    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
    onClick={() => setShowSafetyTips(false)}
  >
    <div
      className="w-full max-w-2xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Consejos de seguridad
        </h2>

        <button
          type="button"
          onClick={() => setShowSafetyTips(false)}
          className="text-2xl text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ✕
        </button>
      </div>
      <div className="space-y-5 text-sm leading-6 text-[var(--foreground)]">
        <div>
          <h3 className="font-semibold text-[var(--primary)] mb-1">
            Solicita fotografías detalladas
          </h3>

          <ul className="list-disc ml-5 mt-2 space-y-1 text-[var(--muted)]">
            <li>Fotos del frente y reverso.</li>
            <li>Puntas y esquinas en ambas caras.</li>
            <li>Rayones y dobleces.</li>
            <li>Fotos con buena iluminación.</li>
            <li>Imágenes sin filtros.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--primary)] mb-1">
            Verifica autenticidad
          </h3>

          <ul className="list-disc ml-5 space-y-1 text-[var(--muted)]">
            <li>Compara colores y tipografía.</li>
            <li>Desconfía de precios muy bajos.</li>
            <li>Solicita videos si tienes dudas.</li>
            <li>Revisa reputación del usuario.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--primary)] mb-1">
            Protege tu información
          </h3>

          <ul className="list-disc ml-5 space-y-1 text-[var(--muted)]">
            <li>No compartas contraseñas.</li>
            <li>No compartas códigos de verificación.</li>
            <li>Evita pagos sospechosos.</li>
            <li>Prefiere lugares públicos y seguros.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-[var(--foreground)]">
          Si detectas actividad sospechosa, utiliza el sistema de reportes.
        </div>
      </div>
    </div>
  </div>
)}
        </div>
  );
}