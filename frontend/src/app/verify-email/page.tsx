'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token no encontrado');
      return;
    }

    api.get(`/api/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('¡Email verificado! Ya puedes iniciar sesión.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Error al verificar el email');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow p-8 text-center">
        {status === 'loading' && (
          <p className="text-gray-500">Verificando tu email...</p>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {message}
            </h1>
            <Link
              href="/login"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Ir al login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {message}
            </h1>
            <Link
              href="/register"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Volver al registro
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}