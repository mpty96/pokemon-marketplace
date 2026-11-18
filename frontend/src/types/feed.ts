import type { CardCondition } from './index';

export interface FeedSeller {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  sellerRating: number;
  memberSince: string;
  totalValueCLP: number;
  listingsCount: number;
  transactions: number;
  level: number;
}

export interface FeedListing {
  id: string;
  listingType: 'CARD' | 'POKEMON_PRODUCT' | 'BULK_LOT';
  title: string;
  cardName: string;
  edition: string;
  condition: CardCondition;
  priceCLP: number;
  images: string[];
  createdAt: string;
  seller: FeedSeller;
}

export interface FeedResponse {
  items: FeedListing[];
  hasMore: boolean;
  nextCursor: string | null;
}