import type { Project } from '../types';
import { runValidation, scoreRules, overallStatus } from '../engine/rules';
import { Badge } from './ui';

interface ProjectTabsProps {
  projects: Project[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const STATUS_LABEL = { pass: 'OK', warn: '!', fail: '✗' };

export function ProjectTabs({ projects, activeId, onSelect, onAdd }: ProjectTabsProps) {
  return (
    <div style={{
      display: 'flex', gap: 6, padding: '0 2rem',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-panel)',
      overflowX: 'auto',
    }}>
      {projects.map((p) => {
        const score = scoreRules(runValidation(p));
        const status = overallStatus(score);
        const active = p.id === activeId;

        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
              color: active ? 'var(--gold-pale)' : 'var(--text-secondary)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
              marginBottom: -1,
            }}
          >
            <span style={{ fontSize: 12 }}>
              {p.type === 'residential_single' ? '⌂' : '▦'}
            </span>
            <span>{p.name}</span>
            <Badge status={status}>
              {STATUS_LABEL[status]} {score.fail || score.warn || score.pass}
            </Badge>
          </button>
        );
      })}

      <button
        onClick={onAdd}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '10px 14px',
          background: 'transparent',
          border: 'none',
          borderBottom: '2px solid transparent',
          color: 'var(--text-muted)',
          fontSize: 12,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          marginBottom: -1,
        }}
      >
        + Нов проект
      </button>
    </div>
  );
}
