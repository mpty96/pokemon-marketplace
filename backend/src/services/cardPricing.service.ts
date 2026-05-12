import prisma from '../lib/prisma';

type CardCondition = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'PLAYED' | 'POOR';
type CardLanguage = 'ESP' | 'ENG' | 'POR' | 'JPN' | 'KOR' | 'CHN' | 'OTHER';

interface AnalyzeCardPricingInput {
  cardName: string;
  edition: string;
  setNumber?: string;
  language: CardLanguage;
  condition: CardCondition;
}

function buildSearchQuery(input: AnalyzeCardPricingInput) {
  return [
    input.cardName,
    input.edition,
    input.setNumber || '',
    input.language,
    input.condition,
    'Pokemon TCG',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildTcgMatchQuery(input: AnalyzeCardPricingInput) {
  return [
    input.cardName,
    input.edition,
    input.setNumber || '',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildPokeMarketQuery(input: AnalyzeCardPricingInput) {
  return [
    input.cardName,
    input.edition,
    input.setNumber || '',
  ]
    .filter(Boolean)
    .join(' ');
}

export async function analyzeCardPricing(input: AnalyzeCardPricingInput) {
  const query = buildSearchQuery(input);

  const completedSales = await prisma.sale.findMany({
    where: {
      status: 'COMPLETED',
      listing: {
        listingType: 'CARD',
        cardName: { equals: input.cardName, mode: 'insensitive' },
        edition: { equals: input.edition, mode: 'insensitive' },
        language: input.language,
        condition: input.condition,
        ...(input.setNumber
          ? { setNumber: { equals: input.setNumber, mode: 'insensitive' } }
          : {}),
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 10,
    include: {
      listing: {
        select: {
          id: true,
          cardName: true,
          edition: true,
          setNumber: true,
          images: true,
        },
      },
    },
  });

  const activeListings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      listingType: 'CARD',
      cardName: { equals: input.cardName, mode: 'insensitive' },
      edition: { equals: input.edition, mode: 'insensitive' },
      language: input.language,
      condition: input.condition,
      ...(input.setNumber
        ? { setNumber: { equals: input.setNumber, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { priceCLP: 'asc' },
    take: 10,
    select: {
      id: true,
      cardName: true,
      edition: true,
      setNumber: true,
      priceCLP: true,
      images: true,
    },
  });

  const completedPrices = completedSales.map((sale) => sale.finalPriceCLP);
  const activePrices = activeListings.map((listing) => listing.priceCLP);

  const sourcePrices = completedPrices.length > 0 ? completedPrices : activePrices;

  const min = sourcePrices.length ? Math.min(...sourcePrices) : null;
  const max = sourcePrices.length ? Math.max(...sourcePrices) : null;

  const confidence =
    completedPrices.length >= 3 ? 'HIGH' :
    completedPrices.length >= 1 ? 'MEDIUM' :
    activePrices.length >= 1 ? 'LOW' :
    'LOW';

  return {
    query,
    detectedCard: input.cardName,
    edition: input.edition,
    setNumber: input.setNumber || null,
    language: input.language,
    condition: input.condition,
    estimatedPriceCLP: {
      min,
      max,
    },
    confidence,
    internalReferences: {
      completedSalesCount: completedPrices.length,
      activeListingsCount: activePrices.length,
    },
    pokeMarketSearchUrl: `/marketplace?search=${encodeURIComponent(buildPokeMarketQuery(input))}`,
			externalComparisonLinks: [
			{
					name: 'TCGPlayer',
					url: `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${encodeURIComponent(query)}`,
			},
			{
					name: 'DexValue',
					url: `https://dexvalue.cl/search?q=${encodeURIComponent(query)}`,
			},
			{
					name: 'TCGMatch',
					url: `https://tcgmatch.cl/search?q=${encodeURIComponent(buildTcgMatchQuery(input))}`,
			},
		],
    disclaimer:
      'Este valor es solamente una referencia aproximada. El precio real puede variar según el estado físico de la carta, idioma, edición, rareza, meta actual, demanda, disponibilidad, autenticidad y confianza entre comprador/vendedor. Compara siempre con publicaciones activas y ventas recientes dentro de PokeMarket antes de tomar una decisión.',
  };
}