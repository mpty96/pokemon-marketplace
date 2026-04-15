'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function Header() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push('/');
  }

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          🎴 PokéMarket
        </Link>

        {/* Navegación central */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/"           className={linkClass('/')}>Inicio</Link>
          <Link href="/marketplace" className={linkClass('/marketplace')}>Marketplace</Link>
          {isAuthenticated && (
            <>
              <Link href="/mensajes" className={linkClass('/mensajes')}>
                Mensajes
              </Link>
              <Link href="/publicar" className={linkClass('/publicar')}>
                Publicar carta
              </Link>
            </>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/profile"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">
                {user?.username}
              </Link>
              <button onClick={handleLogout}
                className="text-sm border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">
                Iniciar sesión
              </Link>
              <Link href="/register"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-2 flex gap-4 overflow-x-auto">
        <Link href="/"            className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Inicio</Link>
        <Link href="/marketplace" className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Marketplace</Link>
        {isAuthenticated && (
          <>
            <Link href="/mensajes" className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Mensajes</Link>
            <Link href="/publicar" className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Publicar</Link>
          </>
        )}
      </div>
    </header>
  );
}