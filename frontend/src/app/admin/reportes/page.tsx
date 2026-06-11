'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';

interface AdminReport {
  id: string;
  reason: string;
  description: string;
  status: ReportStatus;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reporter: {
    id: string;
    username: string;
    email: string;
  };
  reported: {
    id: string;
    username: string;
    email: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
      strikes: number;
      isBanned: boolean;
    } | null;
  };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'REPORTS' | 'USERS'>('REPORTS');

  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

useEffect(() => {
  if (!hasHydrated) return;

  if (!isAuthenticated || !user) {
    router.push('/');
    return;
  }

  if (user.role !== 'ADMIN') {
    router.push('/');
    return;
  }

  fetchReports();
  }, [hasHydrated, isAuthenticated, user, statusFilter]);


  useEffect(() => {
    if (tab === 'USERS') {
      fetchUsers();
    }
  }, [tab]);

  async function fetchReports() {
    setLoading(true);
    setError('');

    try {
      const url =
        statusFilter === 'ALL'
          ? '/api/reports/admin'
          : `/api/reports/admin?status=${statusFilter}`;

      const { data } = await api.get(url);
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    setUsersLoading(true);

    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data);
    } finally {
      setUsersLoading(false);
    }
  }

  async function resolveReport(
    status: ReportStatus,
    options?: { applyStrike?: boolean; banUser?: boolean }
  ) {
    if (!selected) return;

    setActionLoading(true);

    try {
      await api.patch(`/api/reports/admin/${selected.id}`, {
        status,
        adminNote,
        applyStrike: options?.applyStrike || false,
        banUser: options?.banUser || false,
      });

      setSelected(null);
      setAdminNote('');
      await fetchReports();
    } finally {
      setActionLoading(false);
    }
  }

if (!hasHydrated || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-[var(--muted)]">Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-[var(--foreground)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Panel de Administración
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('REPORTS')}
            className={`px-4 py-2 rounded-lg border ${
              tab === 'REPORTS'
                ? 'bg-[var(--primary)] text-white'
                : 'border-[var(--border)]'
            }`}
          >
            Reportes
          </button>

          <button
            onClick={() => setTab('USERS')}
            className={`px-4 py-2 rounded-lg border ${
              tab === 'USERS'
                ? 'bg-[var(--primary)] text-white'
                : 'border-[var(--border)]'
            }`}
          >
            Usuarios
          </button>
        </div>
      </div>


      {tab === 'USERS' && (
        <div className="space-y-4">

          <input
            type="text"
            placeholder="Buscar usuario o email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)]"
          />

          {usersLoading ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              Cargando usuarios...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-[var(--border)] rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="p-3 text-left">Usuario</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Rol</th>
                    <th className="p-3 text-left">Verificado</th>
                    <th className="p-3 text-left">Beta</th>
                    <th className="p-3 text-left">Strikes</th>
                    <th className="p-3 text-left">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {users
                    .filter((u) => {
                      const search = userSearch.toLowerCase();

                      return (
                        u.username.toLowerCase().includes(search) ||
                        u.email.toLowerCase().includes(search)
                      );
                    })
                    .map((u) => (
                      <tr
                        key={u.id}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="p-3">{u.username}</td>
                        <td className="p-3">{u.email}</td>

                        <td className="p-3">
                          {u.role}
                        </td>

                        <td className="p-3">
                          {u.emailVerified ? '✅' : '❌'}
                        </td>

                        <td className="p-3">
                          {u.profile?.isBetaTester ? '🧪' : '-'}
                        </td>

                        <td className="p-3">
                          {u.profile?.strikes || 0}
                        </td>

                        <td className="p-3">
                          {u.profile?.isBanned ? '🚫 Baneado' : '✅ Activo'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


{tab === 'REPORTS' && (
  <>
    <div className="mb-4">
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value as ReportStatus | 'ALL');
          setSelected(null);
          setAdminNote('');
        }}
        className="border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)]"
      >
        <option value="PENDING">Pendientes</option>
        <option value="REVIEWED">Revisados</option>
        <option value="DISMISSED">Descartados</option>
        <option value="ACTION_TAKEN">Con acción tomada</option>
        <option value="ALL">Todos</option>
      </select>
    </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--danger-bg)] text-[var(--danger-fg)] p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              No hay reportes.
            </div>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                onClick={() => {
                  setSelected(report);
                  setAdminNote(report.adminNote || '');
                }}
                className="w-full max-w-full overflow-hidden text-left bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]"
              >
                <div className="flex justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold break-words">
                    {report.reason}
                    </p>

                    <p className="text-sm text-[var(--muted)] break-words">
                    @{report.reporter.username} reportó a @{report.reported.username}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-[var(--muted)] whitespace-nowrap">
                    {report.status}
                    </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          {!selected ? (
            <p className="text-[var(--muted)]">Selecciona un reporte para ver detalles.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">{selected.reason}</h2>
                <p className="text-sm text-[var(--muted)]">
                  Reportado: @{selected.reported.username}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Reportante: @{selected.reporter.username}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Descripción</p>
                <p className="text-sm whitespace-pre-wrap break-words overflow-hidden">
                {selected.description}
                </p>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-sm">
                  Strikes actuales:{' '}
                  <b>{selected.reported.profile?.strikes || 0}</b>
                </p>
                <p className="text-sm">
                  Estado usuario:{' '}
                  <b>{selected.reported.profile?.isBanned ? 'Baneado' : 'Activo'}</b>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Nota admin
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full min-h-24 border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)]"
                  placeholder="Notas internas..."
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => resolveReport('DISMISSED')}
                  className="border border-[var(--border)] rounded-lg py-2"
                >
                  Descartar reporte
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => resolveReport('REVIEWED')}
                  className="border border-[var(--border)] rounded-lg py-2"
                >
                  Marcar como revisado
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => {
                    if (!confirm('¿Aplicar un strike a este usuario?')) return;
                    resolveReport('ACTION_TAKEN', { applyStrike: true });
                  }}
                  className="bg-yellow-500 text-black rounded-lg py-2"
                >
                  Aplicar strike
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => {
                    if (!confirm('¿Banear este usuario? Esta acción bloqueará su cuenta.')) return;
                    resolveReport('ACTION_TAKEN', { banUser: true });
                  }}
                  className="bg-red-600 text-white rounded-lg py-2"
                >
                  Banear usuario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )}

    </div>
  );
}