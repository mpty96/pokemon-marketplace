export type CardCondition = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'PLAYED' | 'POOR';
export type CardRarity    = 'COMMON' | 'UNCOMMON' | 'RARE' | 'HOLO_RARE' | 'ULTRA_RARE' | 'SECRET_RARE' | 'PROMO';
export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'SOLD' | 'CANCELLED';

export interface Seller {
  id:       string;
  username: string;
  profile:  {
    displayName:     string | null;
    avatarUrl:       string | null;
    reputationScore: number;
  } | null;
}

export interface Listing {
  id:          string;
  sellerId:    string;
  title:       string;
  cardName:    string;
  edition:     string;
  setNumber:   string | null;
  condition:   CardCondition;
  rarity:      CardRarity;
  priceCLP:    number;
  description: string | null;
  images:      string[];
  status:      ListingStatus;
  views:       number;
  createdAt:   string;
  seller:      Seller;
}

export interface PaginatedListings {
  listings:   Listing[];
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

export interface MessageSender {
  id:       string;
  username: string;
  profile:  { displayName: string | null; avatarUrl: string | null } | null;
}

export interface Message {
  id:             string;
  conversationId: string;
  senderId:       string;
  content:        string;
  read:           boolean;
  createdAt:      string;
  sender:         MessageSender;
}

export interface ConversationData {
  conversation:  { id: string; messages: Message[] } | null;
  listingStatus: ListingStatus;
  isSeller:      boolean;
}

export type SaleStatus =
  | 'PENDING'
  | 'BUYER_CONFIRMED'
  | 'SELLER_CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Sale {
  id:               string;
  listingId:        string;
  buyerId:          string;
  sellerId:         string;
  finalPriceCLP:    number;
  status:           SaleStatus;
  buyerConfirmed:   boolean;
  sellerConfirmed:  boolean;
  buyerConfirmedAt: string | null;
  sellerConfirmedAt:string | null;
  completedAt:      string | null;
  createdAt:        string;
  listing:          { id: string; title: string; images: string[]; priceCLP: number };
  buyer:            { id: string; username: string };
  seller:           { id: string; username: string };
}

export interface ConversationPreview {
  id:            string;
  listingId:     string;
  listingTitle:  string;
  listingImage:  string | null;
  listingStatus: ListingStatus;
  listingPrice:  number;
  isSeller:      boolean;
  seller:        Seller;
  sale:          Sale | null;
  lastMessage:   {
    id:        string;
    content:   string;
    senderId:  string;
    createdAt: string;
    sender:    { id: string; username: string };
  } | null;
  updatedAt: string;
}

export interface Rating {
  id:                 string;
  saleId:             string;
  raterId:            string;
  ratedId:            string;
  priceScore:         number;
  communicationScore: number;
  processScore:       number;
  averageScore:       number;
  comment:            string | null;
  createdAt:          string;
  rater:              { id: string; username: string };
}

export interface RatingSaleData {
  ratings:      Rating[];
  myRating:     Rating | null;
  theirRating:  Rating | null;
  canRate:      boolean;
}