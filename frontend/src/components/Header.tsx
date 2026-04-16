'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { useThemeStore } from '@/store/theme.store';

export default function Header() {
  const router      = useRouter();
  const pathname    = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const unreadCount = useUnreadCount();
  const { dark, toggle } = useThemeStore();

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
          <Link href="/"            className={linkClass('/')}>Inicio</Link>
          <Link href="/marketplace" className={linkClass('/marketplace')}>Marketplace</Link>
          {isAuthenticated && (
            <Link href="/mensajes" className={`${linkClass('/mensajes')} relative`}>
              Mensajes
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated && (
            <Link href="/transacciones"
              className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Transacciones
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button onClick={toggle}
                className="text-sm border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title={dark ? 'Modo claro' : 'Modo oscuro'}>
                {dark ? '🌞' : '🌙'}
              </button>
              <Link href="/profile"
                className="text-sm border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                Mi Perfil
              </Link>
              <button onClick={handleLogout}
                className="text-sm border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                Cerrar sesión
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
          <Link href="/mensajes" className="relative text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
            Mensajes
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}