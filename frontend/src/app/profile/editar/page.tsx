'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    location: '',
    rut: '',
    contactPhone: '',
    socialLinks: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/profile/me')
      .then(({ data }) => {
        if (data) setForm({ ...form, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put('/api/profile/me', form);
      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  const input = "w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)]";

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">

        {/* aviso */}
        <div className="mb-4 p-3 text-sm rounded-lg bg-[var(--warning-bg)] text-[var(--warning-fg)]">
          ⚠️ Locación, RUT y número de contacto no se pueden modificar después.
        </div>

        {error && (
          <div className="mb-4 text-sm text-[var(--danger-fg)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <input className={input} placeholder="Nombre"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />

          <input className={input} placeholder="Locación"
            value={form.location || ''}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <input className={input} placeholder="RUT"
            value={form.rut || ''}
            onChange={(e) => setForm({ ...form, rut: e.target.value })}
          />

          <input className={input} placeholder="Teléfono"
            value={form.contactPhone || ''}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
          />

          <textarea className={input} placeholder="Descripción"
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />

          <input className={input} placeholder="Redes sociales"
            value={form.socialLinks || ''}
            onChange={(e) => setForm({ ...form, socialLinks: e.target.value })}
          />

          <input className={input} placeholder="URL avatar"
            value={form.avatarUrl || ''}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          />

          <button
            disabled={saving}
            className="w-full bg-[var(--primary)] text-white py-2 rounded-lg"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>

        </form>
      </div>
    </div>
  );
}