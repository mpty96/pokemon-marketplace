'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Coincidencia: solo marca error si el usuario ya escribió algo en el segundo campo
  const passwordsMismatch = confirmPassword.length > 0 && form.password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/register', { ...form, acceptedTerms });
      setSuccess('¡Cuenta creada! Revisa tu email para verificar tu cuenta.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] sm:min-h-screen flex items-center justify-center bg-[var(--background)] px-3 sm:px-4 py-3 sm:py-5">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-xl shadow p-4 sm:p-8 border border-[var(--border)]">
        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
          Crear cuenta
        </h1>

        {success ? (
          <div className="bg-[var(--success-bg)] border border-[var(--border)] text-[var(--success-fg)] rounded-lg p-4 text-center">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[var(--danger-bg)] border border-[var(--border)] text-[var(--danger-fg)] rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="pikachu_master"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                Este nombre de usuario será permanente y no podrá cambiarse después.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 pr-10 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 ${
                    passwordsMismatch
                      ? 'border-[var(--danger-fg)] focus:ring-[var(--danger-fg)]'
                      : 'border-[var(--border)] focus:ring-[var(--primary)]'
                  }`}
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-[var(--danger-fg)] mt-1">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <div className="flex items-start gap-2 mt-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />

              <p className="text-sm text-[var(--muted)]">
                Acepto los{' '}
                <Link
                  href="/terminos"
                  className="text-[var(--primary)] underline"
                >
                  Términos y condiciones
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={!acceptedTerms || loading || passwordsMismatch}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-[var(--muted)]">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[var(--primary)] hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
