// Inserta transformaciones de Cloudinary en la URL.
// f_auto = formato óptimo (WebP/AVIF), q_auto = calidad óptima, w_ = ancho máximo.
export function cl(url: string | undefined | null, width = 600): string {
  if (!url) return '';
  // Solo transforma URLs de Cloudinary; otras las deja igual
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  // Evita duplicar si ya tiene transformaciones
  if (url.includes('/upload/f_auto')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}