import { useState } from 'react';
import type { Project, ValidationRule, RuleLayer } from '../types';
import { runValidation, scoreRules, overallStatus } from '../engine/rules';
import { LAYER_LABELS, LAYER_COLORS } from '../data/catalog';
import { Card, CardLabel, Badge, StatBox, Divider } from './ui';

interface ValidationPanelProps {
  project: Project;
  onOverride: (key: string, reason: string) => void;
}

const STATUS_ICON: Record<string, string> = {
  pass: '✓', warn: '!', fail: '✗', info: 'i',
};



function RuleRow({ rule, project, onOverride }: {
  rule: ValidationRule;
  project: Project;
  onOverride: (key: string, reason: string) => void;
}) {
  const [showOverride, setShowOverride] = useState(false);
  const [reason, setReason] = useState(
    rule.overrideKey ? project.overrides[rule.overrideKey] ?? '' : '',
  );

  const colorMap = {
    pass: 'var(--pass-text)',
    warn: 'var(--warn-text)',
    fail: 'var(--fail-text)',
    info: 'var(--info-text)',
  };
  const bgMap = {
    pass: 'var(--pass-bg)',
    warn: 'var(--warn-bg)',
    fail: 'var(--fail-bg)',
    info: 'var(--info-bg)',
  };

  const hasActiveOverride = rule.overrideKey && project.overrides[rule.overrideKey];

  return (
    <div style={{
      background: bgMap[rule.status],
      border: `1px solid ${colorMap[rule.status]}22`,
      borderRadius: 8,
      padding: '10px 12px',
      marginBottom: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: colorMap[rule.status] + '22',
          color: colorMap[rule.status],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1,
        }}>
          {STATUS_ICON[rule.status]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)',
              padding: '1px 6px', borderRadius: 4,
            }}>
              {rule.id}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {rule.title}
            </span>
            {hasActiveOverride && (
              <span style={{ fontSize: 10, color: 'var(--warn-text)', fontStyle: 'italic' }}>
                override активен
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>
            {rule.msg}
          </p>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            ⚖ {rule.law}
          </div>

          {rule.override && rule.status === 'fail' && !hasActiveOverride && (
            <button
              onClick={() => setShowOverride(!showOverride)}
              style={{
                marginTop: 8, fontSize: 11, padding: '3px 10px',
                background: 'rgba(200,169,110,0.12)',
                border: '1px solid var(--border-mid)',
                borderRadius: 6, color: 'var(--gold)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {showOverride ? 'Затвори' : 'Въведи обосновка (override)'}
            </button>
          )}

          {(showOverride || hasActiveOverride) && rule.overrideKey && (
            <div style={{
              marginTop: 8, padding: '8px 10px',
              background: 'rgba(200,169,110,0.06)',
              border: '1px solid var(--border)',
              borderRadius: 6,
            }}>
              <div style={{ fontSize: 10, color: 'var(--gold-dim)', marginBottom: 4, fontWeight: 500 }}>
                OVERRIDE — слой P · обосновка задължителна · предава за ревю от арх. Тамбукова
              </div>
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Въведете архитектурна обосновка за отклонение..."
                style={{ marginBottom: 6 }}
              />
              <button
                onClick={() => {
                  if (reason.trim()) {
                    onOverride(rule.overrideKey!, reason.trim());
                    setShowOverride(false);
                  }
                }}
                style={{
                  padding: '4px 14px', fontSize: 11,
                  background: 'var(--gold)', color: '#0e0e14',
                  border: 'none', borderRadius: 5, fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                }}
              >
                Запиши override
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ValidationPanel({ project, onOverride }: ValidationPanelProps) {
  const rules = runValidation(project);
  const score = scoreRules(rules);
  const status = overallStatus(score);
  const layers: RuleLayer[] = ['R', 'T', 'P', 'X'];

  const overallLabel = {
    pass: 'Всички проверки преминати',
    warn: 'Предупреждения — изисква внимание',
    fail: 'Грешки — изисква корекция',
  }[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Summary card */}
      <Card accent={status !== 'pass'}>
        <CardLabel>Резюме на валидацията</CardLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Badge status={status}>{overallLabel}</Badge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          <StatBox label="Преминати"     value={score.pass} color="var(--pass-text)" />
          <StatBox label="Предупрежд."  value={score.warn} color="var(--warn-text)" />
          <StatBox label="Грешки"       value={score.fail} color="var(--fail-text)" />
          <StatBox label="Информ."      value={score.info} color="var(--info-text)" />
        </div>

        {/* Layer breakdown bar */}
        <Divider />
        <div style={{ display: 'flex', gap: 3, height: 4, borderRadius: 2, overflow: 'hidden' }}>
          {layers.map(layer => {
            const lr = rules.filter(r => r.layer === layer);
            if (!lr.length) return null;
            const pct = Math.round((lr.length / rules.length) * 100);
            return (
              <div key={layer} style={{
                flex: pct, background: LAYER_COLORS[layer], borderRadius: 2,
              }} title={`${LAYER_LABELS[layer]}: ${lr.length}`} />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
          {layers.map(layer => {
            const count = rules.filter(r => r.layer === layer).length;
            if (!count) return null;
            return (
              <span key={layer} style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                <span style={{ color: LAYER_COLORS[layer], fontWeight: 500 }}>■ {layer}</span>
                {' '}{LAYER_LABELS[layer].split('—')[1].trim()} ({count})
              </span>
            );
          })}
        </div>
      </Card>

      {/* Rules by layer */}
      {layers.map(layer => {
        const layerRules = rules.filter(r => r.layer === layer);
        if (!layerRules.length) return null;
        return (
          <Card key={layer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 500, padding: '2px 8px',
                borderRadius: 4,
                background: LAYER_COLORS[layer] + '22',
                color: LAYER_COLORS[layer],
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.05em',
              }}>
                {layer}
              </span>
              <CardLabel>{LAYER_LABELS[layer]}</CardLabel>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {layerRules.length} правило{layerRules.length > 1 ? 'а' : ''}
              </span>
            </div>
            {layerRules.map(rule => (
              <RuleRow key={rule.id} rule={rule} project={project} onOverride={onOverride} />
            ))}
          </Card>
        );
      })}
    </div>
  );
}
