'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function EditProfilePage() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [form, setForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    location: '',
    rut: '',
    contactPhone: '',
    socialLinks: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [usernameChangedAt, setUsernameChangedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/profile/me')
      .then(({ data }) => {
        if (!data) return;

        setForm({
          username: data.user?.username || '',
          displayName: data.displayName || '',
          bio: data.bio || '',
          location: data.location || '',
          rut: data.rut || '',
          contactPhone: data.contactPhone || '',
          socialLinks: data.socialLinks || '',
        });

        setAvatarPreview(data.avatarUrl || '');
        setUsernameChangedAt(data.user?.usernameChangedAt || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const usernameDaysLeft = useMemo(() => {
    if (!usernameChangedAt) return 0;
    const nextAllowed = new Date(usernameChangedAt);
    nextAllowed.setDate(nextAllowed.getDate() + 30);

    const now = new Date();
    if (now >= nextAllowed) return 0;

    const diffMs = nextAllowed.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [usernameChangedAt]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data = new FormData();
      data.append('username', form.username);
      data.append('displayName', form.displayName);
      data.append('bio', form.bio);
      data.append('location', form.location);
      data.append('rut', form.rut);
      data.append('contactPhone', form.contactPhone);
      data.append('socialLinks', form.socialLinks);

      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await api.put('/api/profile/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser({
        username: res.data.user?.username,
        displayName: res.data.displayName,
        avatarUrl: res.data.avatarUrl,
      });

      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  const input = 'w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)]';

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
        <div className="mb-4 p-3 text-sm rounded-lg bg-[var(--warning-bg)] text-[var(--warning-fg)]">
          ⚠️ Locación, RUT y número de contacto no se pueden modificar después.
        </div>

        {error && (
          <div className="mb-4 text-sm text-[var(--danger-fg)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[var(--info-fg)]">
                  {(form.username || form.displayName || '?')[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Foto de perfil
                </label>
                <p className="text-xs text-[var(--muted)] mb-2">
                Selecciona una imagen desde tu dispositivo.
                </p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarChange}
                className="w-full text-sm text-[var(--muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:text-[var(--primary)] hover:file:bg-[var(--info-bg)]"
              />
            </div>
          </div>

            <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1">
                Nombre de usuario
            </label>
            <input
                className={input}
                placeholder="Tu nombre de usuario"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <p className="text-xs text-[var(--muted)] mt-1">
                {usernameDaysLeft > 0
                ? `Tu usuario podrá volver a cambiarse en ${usernameDaysLeft} día(s).`
                : 'Puedes cambiar tu usuario, pero luego quedará bloqueado por 30 días.'}
            </p>
            </div>

            <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1">
                Nombre visible
            </label>
            <input
                className={input}
                placeholder="Cómo quieres que te vean"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1">
                Locación
            </label>
            <input
                className={input}
                placeholder="Ciudad o comuna"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1">
                RUT
            </label>
            <input
                className={input}
                placeholder="12.345.678-9"
                value={form.rut || ''}
                onChange={(e) => setForm({ ...form, rut: e.target.value })}
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1">
                Número de contacto
            </label>
            <input
                className={input}
                placeholder="+56 9 ..."
                value={form.contactPhone || ''}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1">
                Descripción personal
            </label>
            <textarea
                className={input}
                placeholder="Cuéntale a otros usuarios un poco sobre ti"
                value={form.bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1">
                Redes sociales
            </label>
            <input
                className={input}
                placeholder="@instagram / enlace / usuario"
                value={form.socialLinks || ''}
                onChange={(e) => setForm({ ...form, socialLinks: e.target.value })}
            />
            </div>

          <button
            disabled={saving}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2 rounded-lg"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}