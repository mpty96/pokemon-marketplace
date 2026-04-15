import express from 'express';
import cors from 'cors';
import { json } from 'express';
import prisma from './lib/prisma';
import authRoutes    from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import chatRoutes    from './routes/chat.routes';
import saleRoutes    from './routes/sale.routes';
import ratingRoutes  from './routes/rating.routes';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://pokemon-marketplace-theta.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS BLOCKED:", origin);
    return callback(null, false); // 👈 NO error
  },
  credentials: true,
}));


app.use((req, res, next) => {
  console.log("ORIGIN:", req.headers.origin);
  next();
});

app.use(json());

app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/sales',    saleRoutes);
app.use('/api/ratings',  ratingRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

export default app;