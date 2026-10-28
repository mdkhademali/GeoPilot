import { useEffect } from 'react';
import type { Settings } from '@/types';
export function useApplyTheme(theme: Settings['theme']): void {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.setAttribute('data-theme', theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}
