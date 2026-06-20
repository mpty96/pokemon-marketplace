'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { CardCondition, CardRarity, CardLanguage, ListingType } from '@/types';

const CONDITIONS: CardCondition[] = ['MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR'];
const NON_CARD_CONDITIONS: CardCondition[] = ['EXCELLENT', 'GOOD', 'POOR'];
const RARITIES:   CardRarity[]    = ['COMMON','UNCOMMON','RARE','HOLO_RARE','ULTRA_RARE','SECRET_RARE','PROMO'];
const MAX_IMAGES = 5;

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT:      'Mint (perfecta)',
  NEAR_MINT: 'Near Mint',
  EXCELLENT: 'Excelente',
  GOOD:      'Buena',
  PLAYED:    'Jugada',
  POOR:      'Dañada',
};

const RARITY_LABELS: Record<CardRarity, string> = {
  COMMON:      'Común',
  UNCOMMON:    'Poco común',
  RARE:        'Rara',
  HOLO_RARE:   'Holo Rara',
  ULTRA_RARE:  'Ultra Rara',
  SECRET_RARE: 'Secret Rara',
  PROMO:       'Promo',
};

const LANGUAGES: { value: CardLanguage; label: string }[] = [
  { value: 'ESP', label: 'Español' },
  { value: 'ENG', label: 'Inglés' },
  { value: 'POR', label: 'Portugués' },
  { value: 'JPN', label: 'Japonés' },
  { value: 'KOR', label: 'Coreano' },
  { value: 'CHN', label: 'Chino' },
  { value: 'OTHER', label: 'Otro' },
];

const LOT_EXTRA_LANGUAGE: { value: CardLanguage; label: string } = { value: 'VARIOUS', label: 'Varios' };

const TYPE_SUCCESS: Record<ListingType, { title: string; subtitle: string; again: string }> = {
  CARD:            { title: '¡Carta publicada!',    subtitle: 'Tu carta ya está visible en el marketplace.',    again: 'Publicar otra carta' },
  POKEMON_PRODUCT: { title: '¡Producto publicado!', subtitle: 'Tu producto ya está visible en el marketplace.', again: 'Publicar otro producto' },
  BULK_LOT:        { title: '¡Lote publicado!',     subtitle: 'Tu lote ya está visible en el marketplace.',     again: 'Publicar otro lote' },
};

export default function NewListingPage() {
  const router    = useRouter();
  const isAuth    = useAuthStore((s) => s.isAuthenticated);
  const [form, setForm] = useState({
    listingType: 'CARD' as ListingType,
    cardName: '', edition: '', setNumber: '',
    condition: '' as CardCondition, rarity: '' as CardRarity, language: '' as CardLanguage,
    priceCLP: '', stock: '', description: '',
  });

  const [images,   setImages]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [newId,    setNewId]    = useState('');
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  
useEffect(() => {
  if (!isAuth) {
  router.replace('/login');
  return;
  }

  let mounted = true;

  api
    .get('/api/profile/completion-status')
    .then(({ data }) => {
      if (!mounted) return;
      setProfileComplete(data.complete);
      setMissingFields(data.missingFields || []);
    })
    .catch(() => {
      if (!mounted) return;
      router.replace('/login');
    });

  return () => {
    mounted = false;
  };
}, [isAuth, router]);

if (!isAuth) {
  return null;
}


if (profileComplete === false) {
  const labels: Record<string, string> = {
    location: 'Locación',
    rut: 'RUT',
    contactPhone: 'Número de contacto',
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="bg-[var(--surface)] rounded-xl shadow p-8 text-center max-w-md w-full border border-[var(--border)]">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Debes completar tu perfil
        </h2>
        <p className="text-[var(--muted)] mb-4">
          Para publicar cartas necesitas completar tu perfil con la información obligatoria.
        </p>

        {missingFields.length > 0 && (
          <div className="mb-6 text-sm text-[var(--muted)]">
            <p className="font-medium mb-2 text-[var(--foreground)]">Te falta completar:</p>
            <ul className="space-y-1">
              {missingFields.map((field) => (
                <li key={field}>• {labels[field] || field}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => router.push('/profile/editar')}
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors"
        >
          Completar perfil
        </button>
      </div>
    </div>
  );
}

if (success) {
    const t = TYPE_SUCCESS[form.listingType];
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="bg-[var(--surface)] rounded-xl shadow p-8 text-center max-w-md w-full border border-[var(--border)]">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {t.title}
          </h2>
          <p className="text-[var(--muted)] mb-6">
            {t.subtitle}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/listings/${newId}`)}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors">
              Ver mi publicación
            </button>
            <button
              onClick={() => router.push('/marketplace')}
              className="w-full border border-[var(--border)] text-[var(--foreground)] font-medium py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
              Ir al marketplace
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setNewId('');
                setForm({
                  listingType: 'CARD' as ListingType,
                  cardName: '', edition: '', setNumber: '',
                  condition: '' as CardCondition, rarity: '' as CardRarity, language: '' as CardLanguage,
                  priceCLP: '', stock: '', description: '',
                });
                setImages([]);
                setPreviews([]);
              }}
              className="text-sm text-[var(--primary)] hover:underline">
              {t.again}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = ''; // permite volver a seleccionar el mismo archivo
    if (selected.length === 0) return;

    setError('');
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Máximo ${MAX_IMAGES} imágenes por publicación.`);
      return;
    }

    const toAdd = selected.slice(0, remaining);
    if (selected.length > remaining) {
      setError(`Máximo ${MAX_IMAGES} imágenes. Se agregaron solo ${toAdd.length}.`);
    }

    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function makeCover(index: number) {
  if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (
      form.listingType === 'POKEMON_PRODUCT' &&
      form.cardName.trim().length < 5
    ) {
      setError('Escribe el nombre completo del producto sin utilizar siglas.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      const cleanPriceCLP = Number(form.priceCLP.replace(/\./g, '').replace(/,/g, ''));
      const payload = {
        ...form,
        title: form.cardName,
        condition: form.condition,
        rarity: form.listingType === 'CARD' ? form.rarity : 'COMMON',
        language: form.language || 'ESP',
        priceCLP: String(cleanPriceCLP),
        stock: form.listingType === 'POKEMON_PRODUCT' ? form.stock : '',
      };
      Object.entries(payload).forEach(([k, v]) => {
        if (v) formData.append(k, String(v));
      });
      images.forEach((img) => formData.append('images', img));

      const { data } = await api.post('/api/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setNewId(data.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

  if (profileComplete === null) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] py-5 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto bg-[var(--surface)] rounded-xl shadow p-4 sm:p-8 border border-[var(--border)]">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-5 sm:mb-6">
          Nueva publicación
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[var(--danger-bg)] border border-[var(--border)] text-[var(--danger-fg)] rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Tipo de publicación *
              </label>
              <select
                required
                className={inputClass}
                value={form.listingType}
                onChange={(e) => {
                  const nextType = e.target.value as ListingType;

                  setForm({
                    ...form,
                    listingType: nextType,
                    cardName: '',
                    edition: '',
                    setNumber: '',
                    condition: '' as CardCondition,
                    rarity: '' as CardRarity,
                    language: '' as CardLanguage,
                    priceCLP: '',
                    stock: '', 
                    description: '',
                  });
                }}
              >
                <option value="CARD">Carta</option>
                <option value="POKEMON_PRODUCT">Productos Pokémon</option>
                <option value="BULK_LOT">Lote de cartas</option>
              </select>
            </div>
            <div>
              {form.listingType === 'CARD'
              ? 'Nombre de la carta *'
              : form.listingType === 'POKEMON_PRODUCT'
              ? 'Nombre del producto *'
              : 'Nombre del lote *'}
              <input required className={inputClass} placeholder={
                form.listingType === 'CARD'
                  ? 'Charizard'
                  : form.listingType === 'POKEMON_PRODUCT'
                  ? 'Elite Trainer Box, Booster Pack...'
                  : 'Lote 100 cartas comunes'
              }
                value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value })} />
            </div>
            <div>
              {form.listingType === 'CARD'
              ? 'Edición'
              : form.listingType === 'POKEMON_PRODUCT'
              ? 'Colección / expansión'
              : 'Origen / colección del lote'}
              <input className={inputClass} placeholder="Base Set"
                value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} />
            </div>
            {form.listingType === 'CARD' && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Número en el set
                </label>
                <input
                  className={inputClass}
                  placeholder="4/102"
                  value={form.setNumber}
                  onChange={(e) => setForm({ ...form, setNumber: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Condición *
              </label>

              <select
                required
                className={inputClass}
                value={form.condition}
                onChange={(e) =>
                  setForm({
                    ...form,
                    condition: e.target.value as CardCondition,
                  })
                }
              >
                <option value="">Seleccionar...</option>

                {(form.listingType === 'CARD' ? CONDITIONS : NON_CARD_CONDITIONS).map((c) => (
                  <option key={c} value={c}>
                    {CONDITION_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            {form.listingType === 'CARD' && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Rareza 
                </label>

                <select
                  className={inputClass}
                  value={form.rarity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rarity: e.target.value as CardRarity,
                    })
                  }
                >
                  <option value="">Seleccionar...</option>

                  {RARITIES.map((r) => (
                    <option key={r} value={r}>
                      {RARITY_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Idioma *</label>
              <select
                required
                className={inputClass}
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value as CardLanguage })}
              >
                <option value="">Seleccionar...</option>
                {(form.listingType === 'BULK_LOT' ? [...LANGUAGES, LOT_EXTRA_LANGUAGE] : LANGUAGES).map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Precio (CLP) *</label>
              <input
                required
                type="text"
                inputMode="numeric"
                className={inputClass}
                placeholder="20.000"
                value={form.priceCLP}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.,]/g, '');
                  setForm({ ...form, priceCLP: value });
                }}
              />
            </div>

{form.listingType === 'POKEMON_PRODUCT' && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Stock disponible *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  className={inputClass}
                  placeholder="1"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Descripción</label>
            <textarea rows={3} className={inputClass} placeholder="Estado detallado, detalles importantes..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Imágenes * (máximo {MAX_IMAGES})
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={images.length >= MAX_IMAGES}
              className="w-full text-sm text-[var(--muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:text-[var(--primary)] hover:file:bg-[var(--info-bg)] disabled:opacity-60"
            />
            <p className="text-xs text-[var(--muted-2)] mt-1">
              {images.length}/{MAX_IMAGES} seleccionadas. La <strong>primera imagen</strong> será la portada que se ve en el marketplace.
            </p>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className={`relative rounded-lg ${i === 0 ? 'ring-2 ring-[var(--primary)]' : ''}`}>
                    <img src={src} alt={`preview-${i}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-[var(--border)]" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[var(--danger-bg)] text-[var(--danger-fg)] border border-[var(--border)] text-xs leading-none flex items-center justify-center"
                      aria-label="Quitar imagen">×</button>
                    {i === 0 ? (
                      <span className="absolute bottom-0 left-0 right-0 bg-[var(--primary)] text-[var(--primary-foreground)] text-[9px] font-semibold text-center rounded-b-lg py-0.5">
                        Portada
                      </span>
                    ) : (
                      <button type="button" onClick={() => makeCover(i)}
                        className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center rounded-b-lg py-0.5 hover:bg-black/75"
                        aria-label="Hacer portada">
                        Hacer portada
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors">
            {loading
            ? 'Publicando...'
            : form.listingType === 'CARD'
            ? 'Publicar carta'
            : form.listingType === 'POKEMON_PRODUCT'
            ? 'Publicar producto'
            : 'Publicar lote'}
          </button>
        </form>
      </div>
    </div>
  );
}