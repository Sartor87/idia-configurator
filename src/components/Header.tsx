export function Header() {
  return (
    <header style={{
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.05em',
        }}>
          IDIA
        </span>
        <span style={{
          fontSize: 11,
          fontWeight: 400,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          Конфигуратор за фасадни елементи
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          Версия правила: май 2026
        </span>
        <div style={{
          width: 28, height: 28,
          borderRadius: '50%',
          background: 'rgba(200,169,110,0.15)',
          border: '1px solid var(--border-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 500, color: 'var(--gold)',
        }}>
          ИТ
        </div>
      </div>
    </header>
  );
}
