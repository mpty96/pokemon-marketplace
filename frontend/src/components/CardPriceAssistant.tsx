'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { CardCondition, CardLanguage } from '@/types';

const LANGUAGES: { value: CardLanguage; label: string }[] = [
  { value: 'ESP', label: 'Español' },
  { value: 'ENG', label: 'Inglés' },
  { value: 'POR', label: 'Portugués' },
  { value: 'JPN', label: 'Japonés' },
  { value: 'KOR', label: 'Coreano' },
  { value: 'CHN', label: 'Chino' },
  { value: 'OTHER', label: 'Otro' },
];

const CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: 'MINT', label: 'Mint' },
  { value: 'NEAR_MINT', label: 'Near Mint' },
  { value: 'EXCELLENT', label: 'Excelente' },
  { value: 'GOOD', label: 'Buena' },
  { value: 'PLAYED', label: 'Jugada' },
  { value: 'POOR', label: 'Dañada' },
];

export default function CardPriceAssistant() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    cardName: '',
    edition: '',
    setNumber: '',
    language: 'ESP' as CardLanguage,
    condition: 'NEAR_MINT' as CardCondition,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const { data } = await api.post('/api/card-pricing/analyze', form);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al analizar precio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-3 shadow-lg hover:bg-[var(--primary-hover)] transition-colors text-sm font-semibold"
      >
        Valor carta
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center px-4 py-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-5 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Herramienta de valoración
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xl text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              {!isAuthenticated ? (
                <div className="text-sm text-[var(--muted)] space-y-3">
                  <p>
                    Debes iniciar sesión para utilizar la herramienta de valoración.
                  </p>
                  <a
                    href="/login"
                    className="inline-block text-[var(--primary)] hover:underline font-medium"
                  >
                    Iniciar sesión
                  </a>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--muted)] mb-4 leading-6">
                    Completa los datos de la carta para obtener una referencia aproximada
                    basada en información interna de PokeMarket y enlaces de comparación externos.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Field label="Nombre de la carta">
                      <input
                        required
                        value={form.cardName}
                        onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                        className={inputClass}
                        placeholder="Charizard"
                      />
                    </Field>

                    <Field label="Edición / colección">
                      <input
                        required
                        value={form.edition}
                        onChange={(e) => setForm({ ...form, edition: e.target.value })}
                        className={inputClass}
                        placeholder="Base Set, 151, Obsidian Flames..."
                      />
                    </Field>

                    <Field label="Número en el set">
                      <input
                        value={form.setNumber}
                        onChange={(e) => setForm({ ...form, setNumber: e.target.value })}
                        className={inputClass}
                        placeholder="4/102, 006/165..."
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Idioma">
                        <select
                          value={form.language}
                          onChange={(e) =>
                            setForm({ ...form, language: e.target.value as CardLanguage })
                          }
                          className={inputClass}
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Condición">
                        <select
                          value={form.condition}
                          onChange={(e) =>
                            setForm({ ...form, condition: e.target.value as CardCondition })
                          }
                          className={inputClass}
                        >
                          {CONDITIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {error && (
                      <p className="text-sm text-[var(--danger-fg)] bg-[var(--danger-bg)] border border-[var(--border)] rounded-lg p-2">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] rounded-lg py-2 font-medium transition-colors"
                    >
                      {loading ? 'Analizando...' : 'Estimar valor'}
                    </button>
                  </form>

                  {result && (
                    <div className="mt-5 border-t border-[var(--border)] pt-4 space-y-3 text-sm">
											<div className="flex items-center justify-between gap-3">
												<h3 className="font-semibold text-[var(--foreground)]">
													Resultado aproximado
												</h3>

												<button
													type="button"
													onClick={() => {
														setResult(null);
														setError('');
													}}
													className="text-xs text-[var(--primary)] hover:underline"
												>
													Limpiar resultado
												</button>
											</div>

                      <p className="text-[var(--muted)]">
                        Carta: <span className="text-[var(--foreground)]">{result.detectedCard}</span>
                      </p>

                      <p className="text-[var(--muted)]">
                        Edición: <span className="text-[var(--foreground)]">{result.edition}</span>
                      </p>

											<p className="text-[var(--muted)]">
												Número en el set:{' '}
												<span className="text-[var(--foreground)]">
													{result.setNumber || 'No especificado'}
												</span>
											</p>

											<p className="text-[var(--muted)]">
												Idioma:{' '}
												<span className="text-[var(--foreground)]">
													{result.language}
												</span>
											</p>

											<p className="text-[var(--muted)]">
												Condición:{' '}
												<span className="text-[var(--foreground)]">
													{result.condition}
												</span>
											</p>

											<p className="text-[var(--muted)]">
                        Referencias internas: {result.internalReferences.completedSalesCount} ventas completadas, {result.internalReferences.activeListingsCount} publicaciones activas.
                      </p>

											{result.internalReferences.activeListingsCount > 0 && (
												<a
													href={result.pokeMarketSearchUrl}
													className="inline-block text-[var(--primary)] hover:underline font-medium"
												>
													Ver publicaciones activas similares en PokeMarket
												</a>
											)}

                      <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--border)] p-3">
                        {result.estimatedPriceCLP.min && result.estimatedPriceCLP.max ? (
                          <p className="font-bold text-[var(--primary)]">
                            ${result.estimatedPriceCLP.min.toLocaleString('es-CL')} - ${result.estimatedPriceCLP.max.toLocaleString('es-CL')} CLP
                          </p>
                        ) : (
                          <p className="text-[var(--muted)]">
                            No hay suficientes referencias internas para estimar un rango confiable.
                          </p>
                        )}

                        <p className="text-xs text-[var(--muted-2)] mt-1">
                          Confianza: {result.confidence}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-[var(--foreground)] mb-1">
                          Comparar también en:
                        </p>

                        <div className="flex flex-col gap-1">
                          {result.externalComparisonLinks.map((link: any) => (
                            <a
                              key={link.name}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--primary)] hover:underline"
                            >
                              {link.name}
                            </a>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs leading-5 text-[var(--muted)] border-t border-[var(--border)] pt-3">
                        {result.disclaimer}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputClass =
  'w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--foreground)] mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}