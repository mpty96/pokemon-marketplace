'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/register', {...form, acceptedTerms,});
      setSuccess('¡Cuenta creada! Revisa tu email para verificar tu cuenta.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-3 sm:px-4 py-5">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-xl shadow p-4 sm:p-8 border border-[var(--border)]">
        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
          🎴 Crear cuenta
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
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Mínimo 8 caracteres"
              />
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
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-[var(--primary)] underline"
                >
                  Términos y condiciones
                </button>
              </p>
            </div>

            <button type="submit" 
              disabled={!acceptedTerms}
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

        {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-6 overflow-y-auto max-h-[85vh]">

            <h2 className="text-xl font-bold mb-4">
              Términos y Condiciones – PokeMarket
            </h2>

            <div className="text-sm space-y-4 text-[var(--muted)]">

              <p>
                Al registrarte en PokeMarket, aceptas utilizar la plataforma de forma responsable,
                respetando a otros usuarios y cumpliendo con las normas establecidas.
              </p>

              <h3 className="font-semibold text-[var(--foreground)]">Uso de la plataforma</h3>
              <p>
                PokeMarket es un marketplace entre usuarios. Cada usuario es responsable de
                la veracidad de sus publicaciones y comportamiento.
              </p>

              <h3 className="font-semibold text-[var(--foreground)]">Sistema de reportes</h3>
              <p>
                Los usuarios pueden reportar conductas indebidas. Cada reporte será evaluado
                por el equipo de administración.
              </p>

              <h3 className="font-semibold text-[var(--foreground)]">Sistema de strikes</h3>
              <p>
                Un usuario puede recibir "strikes" por comportamientos indebidos. Al acumular
                3 strikes, su cuenta puede ser suspendida o baneada permanentemente.
              </p>

              <h3 className="font-semibold text-[var(--foreground)]">Identidad y veracidad</h3>
              <p>
                El usuario se compromete a proporcionar información real, incluyendo RUT y
                número de contacto, los cuales son únicos dentro de la plataforma.
              </p>

              <h3 className="font-semibold text-[var(--foreground)]">Sanciones</h3>
              <p>
                PokeMarket se reserva el derecho de suspender o eliminar cuentas que incumplan
                estos términos.
              </p>

            </div>

            <button
              onClick={() => setShowTerms(false)}
              className="mt-6 w-full bg-[var(--primary)] text-white py-2 rounded-lg"
            >
              Cerrar
            </button>

          </div>
        </div>
      )}
      </div>
    </div>
  );
}

