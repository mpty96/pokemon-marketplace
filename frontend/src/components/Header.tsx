'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { useThemeStore } from '@/store/theme.store';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();
  const unreadCount = useUnreadCount();
  const { dark, toggle } = useThemeStore();

  function handleLogout() {
    logout();
    router.push('/');
  }

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? 'text-[var(--primary)]'
        : 'text-[var(--muted)] hover:text-[var(--primary)]'
    }`;

  const ghostBtn =
  'text-xs sm:text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors whitespace-nowrap';

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 min-h-16 py-2 flex items-center justify-between gap-3">
        <Link href="/" className="text-lg sm:text-xl font-bold text-[var(--primary)] hover:opacity-90 shrink-0">
          PokeMarket
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={linkClass('/')}>Inicio</Link>
          <Link href="/marketplace" className={linkClass('/marketplace')}>Marketplace</Link>

          {isAuthenticated && (
            <>
              <Link href="/mensajes" className={`${linkClass('/mensajes')} relative`}>
                Mensajes
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link href="/transacciones" className={linkClass('/transacciones')}>
                Transacciones
              </Link>

              <Link href="/consejos" className={linkClass('/consejos')}>
                Consejos
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggle}
            className={ghostBtn}
            title={dark ? 'Modo claro' : 'Modo oscuro'}
          >
            {dark ? '🌞' : '🌙'}
          </button>

          {isAuthenticated ? (
            <>
              <Link href="/profile" className={ghostBtn}>
                Mi perfil
              </Link>

              <button onClick={handleLogout} className={ghostBtn}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] font-medium transition-colors"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="text-sm bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden border-t border-[var(--border)] px-3 py-2 flex gap-4 overflow-x-auto mobile-scrollbar bg-[var(--surface)] text-sm">
        <Link href="/" className="text-sm text-[var(--muted)] whitespace-nowrap hover:text-[var(--primary)]">Inicio</Link>
        <Link href="/marketplace" className="text-sm text-[var(--muted)] whitespace-nowrap hover:text-[var(--primary)]">Marketplace</Link>

        {isAuthenticated && (
          <>
            <Link href="/mensajes" className="relative text-sm text-[var(--muted)] whitespace-nowrap hover:text-[var(--primary)]">
              Mensajes
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link href="/transacciones" className="text-sm text-[var(--muted)] whitespace-nowrap hover:text-[var(--primary)]">
              Transacciones
            </Link>

            <Link href="/consejos" className={linkClass('/consejos')}>
              Consejos
            </Link>
          </>
        )}
      </div>
    </header>
  );
}