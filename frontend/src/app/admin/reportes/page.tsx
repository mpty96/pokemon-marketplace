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

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

useEffect(() => {
  if (!user) return;

  if (user.role !== 'ADMIN') {
    router.push('/');
    return;
  }

  fetchReports();
}, [user, statusFilter]);

  async function fetchReports() {
    setLoading(true);

    try {
      const url =
        statusFilter === 'ALL'
          ? '/api/reports/admin'
          : `/api/reports/admin?status=${statusFilter}`;

      const { data } = await api.get(url);
      setReports(data);
    } finally {
      setLoading(false);
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

if (!user || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-[var(--muted)]">Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-[var(--foreground)]">
      <h1 className="text-2xl font-bold mb-6">Bandeja de reportes</h1>

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
                  onClick={() => resolveReport('ACTION_TAKEN', { applyStrike: true })}
                  className="bg-yellow-500 text-black rounded-lg py-2"
                >
                  Aplicar strike
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => resolveReport('ACTION_TAKEN', { banUser: true })}
                  className="bg-red-600 text-white rounded-lg py-2"
                >
                  Banear usuario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}