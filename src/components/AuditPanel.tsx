import type { Project } from '../types';
import { runValidation } from '../engine/rules';
import { buildSpecRows } from '../engine/export';
import { exportCSV, exportPDF } from '../engine/export';
import { Card, CardLabel, SectionTitle, Badge } from './ui';
import { LAYER_COLORS } from '../data/catalog';

interface AuditPanelProps {
  projects: Project[];
}

export function AuditPanel({ projects }: AuditPanelProps) {
  const allEntries = projects.flatMap(p => {
    const rules = runValidation(p);
    return rules
      .filter(r => r.status !== 'pass')
      .map(r => ({
        projectName: p.name.split('—')[0].trim(),
        ruleId: r.id,
        layer: r.layer,
        status: r.status,
        title: r.title,
        override: r.overrideKey ? p.overrides[r.overrideKey] : undefined,
      }));
  });

  const specRows = buildSpecRows(projects);

  const handlePDF = async () => {
    try { await exportPDF(projects); }
    catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Export buttons */}
      <Card accent>
        <CardLabel>Експорт на валидационния отчет</CardLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <button
            onClick={handlePDF}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: 'rgba(200,169,110,0.1)',
              border: '1px solid var(--border-mid)',
              borderRadius: 8, color: 'var(--gold-pale)',
              fontFamily: 'var(--font-body)', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 18 }}>⬇</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Валидационен отчет</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PDF · двата проекта · пълен</div>
            </div>
          </button>

          <button
            onClick={() => exportCSV(projects)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: 'rgba(93,202,165,0.08)',
              border: '1px solid rgba(93,202,165,0.2)',
              borderRadius: 8, color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 18 }}>⬇</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Спецификация отвори</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>CSV · Нар. №4/2001 · UTF-8</div>
            </div>
          </button>
        </div>

        <div style={{
          padding: '8px 10px', borderRadius: 6,
          background: 'rgba(255,255,255,0.03)',
          fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
        }}>
          Отчетът е консултативен. Финалната проектна отговорност се носи от подписващия архитект с ППП по ЗКАИИП.
          Версия на правилата и нормативен статус са записани в отчета.
        </div>
      </Card>

      {/* Audit log */}
      <Card>
        <CardLabel>Одиторска следа — предупреждения и грешки</CardLabel>
        {allEntries.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
            Няма записи с предупреждения или грешки.
          </div>
        ) : (
          allEntries.map((e, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 0',
              borderBottom: i < allEntries.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                background: e.status === 'fail' ? 'var(--fail-text)'
                  : e.status === 'warn' ? 'var(--warn-text)'
                  : 'var(--info-text)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--font-mono)',
                    color: LAYER_COLORS[e.layer],
                    background: LAYER_COLORS[e.layer] + '18',
                    padding: '1px 6px', borderRadius: 4,
                  }}>
                    {e.ruleId}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{e.title}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {e.projectName}
                  {e.override && (
                    <span style={{ color: 'var(--warn-text)', marginLeft: 8 }}>
                      ↳ Override: „{e.override}"
                    </span>
                  )}
                </div>
              </div>
              <Badge status={e.status === 'info' ? 'info' : e.status}>
                {e.status === 'fail' ? 'Грешка' : e.status === 'warn' ? 'Предупр.' : 'Информ.'}
              </Badge>
            </div>
          ))
        )}
      </Card>

      {/* Spec table */}
      <Card>
        <CardLabel>Спецификация на отворите — preview (Нар. №4/2001)</CardLabel>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: 12, tableLayout: 'fixed',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-mid)' }}>
                {['Код','Вид','Система','Uw','Rw','RC','Бр.','Проект'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '4px 8px 6px',
                    fontSize: 10, fontWeight: 500, color: 'var(--text-muted)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--gold)' }}>{r.code}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{r.type}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-primary)' }}>
                    {r.system.length > 28 ? r.system.substring(0, 28) + '…' : r.system}
                    {r.fireClass && <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--text-muted)' }}>{r.fireClass}</span>}
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {r.uw || '—'}
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {r.rw || '—'}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <Badge status="neutral">{r.rc}</Badge>
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 500 }}>{r.count}</td>
                  <td style={{ padding: '6px 8px', fontSize: 11, color: 'var(--text-muted)' }}>
                    {r.projectName.split('—')[0].trim()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pre-submission checklist */}
      <Card>
        <CardLabel>Чек-лист преди предаване</CardLabel>
        {projects.map(p => {
          const rules = runValidation(p);
          const blocking = rules.filter(r => r.status === 'fail');
          const warnings = rules.filter(r => r.status === 'warn');
          const ok = rules.filter(r => r.status === 'pass');

          return (
            <div key={p.id} style={{ marginBottom: 12 }}>
              <SectionTitle>{p.name}</SectionTitle>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <Badge status={blocking.length ? 'fail' : 'pass'}>
                  {blocking.length ? `${blocking.length} блокиращи` : 'Без блокиращи'}
                </Badge>
                {warnings.length > 0 && <Badge status="warn">{warnings.length} предупреждения</Badge>}
                <Badge status="pass">{ok.length} преминати</Badge>
              </div>
              {blocking.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 0', fontSize: 12, color: 'var(--fail-text)',
                }}>
                  <span>✗</span>
                  <span>{r.title}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {r.id}
                  </span>
                </div>
              ))}
              {blocking.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--pass-text)' }}>
                  ✓ Готов за предаване — без блокиращи проблеми
                </div>
              )}
            </div>
          );
        })}
      </Card>

    </div>
  );
}
