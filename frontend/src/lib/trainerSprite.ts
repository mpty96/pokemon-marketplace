const TOTAL_SPRITES = 32;

// Mismo usuario = siempre el mismo sprite
export function trainerSpriteFor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const n = (hash % TOTAL_SPRITES) + 1;
  return `/trainers/trainer-${String(n).padStart(2, '0')}.png`;
}