import { useState, type ReactNode } from 'react';
import { Check, Copy, Star } from 'lucide-react';
import { copyText } from '@/utils/misc';

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="GeoPilot">
      <rect width="64" height="64" rx="14" fill="#0b1b33" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#2dd4bf" strokeWidth="3" />
      <ellipse cx="32" cy="32" rx="7" ry="17" fill="none" stroke="#5b9bff" strokeWidth="2" />
      <path d="M15 32h34" stroke="#5b9bff" strokeWidth="2" />
      <path d="M32 8l5 12-5-3-5 3z" fill="#2dd4bf" />
    </svg>
  );
}
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  return (
    <button
      className="gp-btn"
      onClick={async () => {
        setState((await copyText(text)) ? 'ok' : 'fail');
        setTimeout(() => setState('idle'), 1500);
      }}
      aria-live="polite"
    >
      {state === 'ok' ? <Check size={13} /> : <Copy size={13} />}
      {state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy failed' : label}
    </button>
  );
}
export function FavButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button className="gp-btn" aria-pressed={active} aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`} onClick={onClick}>
      <Star size={13} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="gp-card text-center py-6">
      <p className="font-medium">{title}</p>
      {hint && <p className="gp-muted mt-1">{hint}</p>}
    </div>
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="gp-label">{label}</span>
      {children}
    </label>
  );
}
export function Msg({ kind, children }: { kind: 'error' | 'ok' | 'info'; children: ReactNode }) {
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`text-[12px] ${kind === 'error' ? 'gp-err' : kind === 'ok' ? 'gp-ok' : 'gp-muted'}`}>
      {children}
    </p>
  );
}
export function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {sub && <p className="gp-muted mt-0.5">{sub}</p>}
    </div>
  );
}
