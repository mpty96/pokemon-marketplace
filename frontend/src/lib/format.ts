export function timeAgo(iso: string, now: number = Date.now()): string {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'hace un momento';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
  if (d < 365) {
    const mo = Math.floor(d / 30);
    return `hace ${mo} ${mo === 1 ? 'mes' : 'meses'}`;
  }
  const y = Math.floor(d / 365);
  return `hace ${y} ${y === 1 ? 'año' : 'años'}`;
}

export function formatMoney(n: number): string {
  if (n >= 1_000_000) {
    const m = Math.floor((n / 1_000_000) * 10) / 10;
    return `${m.toFixed(1).replace('.', ',')} m`;
  }
  return n.toLocaleString('es-CL');
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatAdventureDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${MONTHS[d.getMonth()]}./${d.getFullYear()}`;
}