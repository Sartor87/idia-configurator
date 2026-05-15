import type { ReactNode, CSSProperties } from 'react';
import type { RuleStatus } from '../types';

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { status: RuleStatus | 'neutral'; children: ReactNode }
export function Badge({ status, children }: BadgeProps) {
  const map: Record<string, CSSProperties> = {
    pass:    { background: 'var(--pass-bg)',  color: 'var(--pass-text)' },
    warn:    { background: 'var(--warn-bg)',  color: 'var(--warn-text)' },
    fail:    { background: 'var(--fail-bg)',  color: 'var(--fail-text)' },
    info:    { background: 'var(--info-bg)',  color: 'var(--info-text)' },
    neutral: { background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' },
  };
  return (
    <span style={{
      ...map[status],
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 500,
      padding: '2px 9px',
      borderRadius: 100,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: ReactNode; style?: CSSProperties; accent?: boolean }
export function Card({ children, style, accent }: CardProps) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${accent ? 'var(--border-hi)' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)',
      padding: '1rem 1.25rem',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── CardLabel ────────────────────────────────────────────────────────────────
export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--gold-dim)',
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      margin: '12px 0 8px',
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}
export function Field({ label, hint, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── OptionRow (selectable list item) ────────────────────────────────────────
interface OptionRowProps {
  selected: boolean;
  onClick: () => void;
  name: string;
  sub: string;
  right?: ReactNode;
}
export function OptionRow({ selected, onClick, name, sub, right }: OptionRowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px',
        borderRadius: 'var(--r-md)',
        border: `1px solid ${selected ? 'var(--border-hi)' : 'var(--border)'}`,
        background: selected ? 'rgba(200,169,110,0.07)' : 'transparent',
        cursor: 'pointer',
        marginBottom: 5,
        transition: 'all 0.12s',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, flexShrink: 0 }}>
        {right}
        {selected && <span style={{ color: 'var(--gold)', fontSize: 14 }}>✓</span>}
      </div>
    </div>
  );
}

// ─── StatBox ──────────────────────────────────────────────────────────────────
interface StatBoxProps { label: string; value: string | number; color?: string }
export function StatBox({ label, value, color }: StatBoxProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 'var(--r-md)',
      padding: '8px 10px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 20, fontWeight: 500, color: color ?? 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />;
}
