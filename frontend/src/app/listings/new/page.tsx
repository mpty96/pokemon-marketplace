'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { CardCondition, CardRarity } from '@/types';

const CONDITIONS: CardCondition[] = ['MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR'];
const RARITIES:   CardRarity[]    = ['COMMON','UNCOMMON','RARE','HOLO_RARE','ULTRA_RARE','SECRET_RARE','PROMO'];

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

export default function NewListingPage() {
  const router    = useRouter();
  const isAuth    = useAuthStore((s) => s.isAuthenticated);
  const [form, setForm] = useState({
    title: '', cardName: '', edition: '', setNumber: '',
    condition: '' as CardCondition, rarity: '' as CardRarity,
    priceCLP: '', description: '',
  });
  const [images,   setImages]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [newId,    setNewId]    = useState('');

  if (!isAuth) {
  router.push('/login');
  return null;
}

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Carta publicada!
          </h2>
          <p className="text-gray-500 mb-6">
            Tu carta ya está visible en el marketplace.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/listings/${newId}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
              Ver mi publicación
            </button>
            <button
              onClick={() => router.push('/marketplace')}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Ir al marketplace
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setNewId('');
                setForm({
                  title: '', cardName: '', edition: '', setNumber: '',
                  condition: '' as CardCondition, rarity: '' as CardRarity,
                  priceCLP: '', description: ''
                });
                setImages([]);
                setPreviews([]);
              }}
              className="text-sm text-blue-600 hover:underline">
              Publicar otra carta
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) { setError('Máximo 5 imágenes'); return; }
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
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

  const inputClass = "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🎴 Nueva publicación
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
              <input required className={inputClass} placeholder="Charizard Holo Base Set"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la carta *</label>
              <input required className={inputClass} placeholder="Charizard"
                value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edición *</label>
              <input required className={inputClass} placeholder="Base Set"
                value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número en el set</label>
              <input className={inputClass} placeholder="4/102"
                value={form.setNumber} onChange={(e) => setForm({ ...form, setNumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condición *</label>
              <select required className={inputClass}
                value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as CardCondition })}>
                <option value="">Seleccionar...</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rareza *</label>
              <select required className={inputClass}
                value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value as CardRarity })}>
                <option value="">Seleccionar...</option>
                {RARITIES.map((r) => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (CLP) *</label>
              <input required type="number" min="1" className={inputClass} placeholder="50000"
                value={form.priceCLP} onChange={(e) => setForm({ ...form, priceCLP: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea rows={3} className={inputClass} placeholder="Estado detallado, detalles importantes..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imágenes * (máximo 5)
            </label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors">
            {loading ? 'Publicando...' : 'Publicar carta'}
          </button>
        </form>
      </div>
    </div>
  );
}