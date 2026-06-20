import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import prisma from './lib/prisma';
import { verifyAccessToken } from './utils/jwt';
import { sendChatMessage } from './services/chat.service';
import { setIO } from './lib/socket';

const PORT = process.env.PORT || 4000;

async function main() {
  await prisma.$connect();
  console.log('✅ Conectado a PostgreSQL');

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
    // Necesario para Render
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  setIO(io);

  // Keep-alive para plan gratuito de Render
  if (process.env.NODE_ENV === 'production') {
    const BACKEND_URL = process.env.RENDER_EXTERNAL_URL;
    if (BACKEND_URL) {
      setInterval(async () => {
        try {
          await fetch(`${BACKEND_URL}/health`);
          console.log('🔄 Keep-alive ping');
        } catch {
          // silencioso
        }
      }, 14 * 60 * 1000); // cada 14 minutos
    }
  }

  // Middleware de autenticación para Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token requerido'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`user:${user.userId}`);
    console.log(`🔌 Conectado: ${user.userId}`);

    socket.on('message_created', async (data: { listingId: string; message: any }) => {
      try {
        const { listingId, message } = data;

        io.to(`listing:${listingId}`).emit('new_message', message);

        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          select: { sellerId: true },
        });

        if (!listing) return;

        const conversation = await prisma.conversation.findUnique({
          where: { listingId },
          select: {
            id: true,
            messages: {
              select: { senderId: true },
            },
          },
        });

        if (!conversation) return;

        const participantIds = new Set<string>();

        participantIds.add(listing.sellerId);

        conversation.messages.forEach((msg) => {
          participantIds.add(msg.senderId);
        });

        participantIds.delete(user.userId);

        for (const participantId of participantIds) {
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conversation.id,
              senderId: { not: participantId },
              read: false,
            },
          });

          io.to(`user:${participantId}`).emit('unread_count_updated', {
            count: unreadCount,
          });
        }
      } catch (error) {
        console.error('MESSAGE CREATED BROADCAST ERROR:', error);
      }
    });

    socket.on('join_conversation', (listingId: string) => {
      socket.join(`listing:${listingId}`);
    });

    socket.on('leave_conversation', (listingId: string) => {
      socket.leave(`listing:${listingId}`);
    });

    socket.on('send_message', async (data: { listingId: string; content?: string; imageUrls?: string[] }) => {
      try {
        const { listingId, content, imageUrls = [] } = data;

        const message = await sendChatMessage(
          listingId,
          user.userId,
          content,
          imageUrls
        );

        io.to(`listing:${listingId}`).emit('new_message', message);
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        socket.emit('error', { message: 'Error al enviar el mensaje' });
      }
    });

    socket.on('mark_read', async (conversationId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: user.userId },
            read: false,
          },
          data: { read: true },
        });
      } catch (error) {
        console.error('Error al marcar como leído:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Desconectado: ${user.userId}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});


