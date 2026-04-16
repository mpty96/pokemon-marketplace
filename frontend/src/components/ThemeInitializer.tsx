'use client';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

export default function ThemeInitializer() {
  const dark = useThemeStore((s) => s.dark);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return null;
}