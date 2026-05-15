import { useState } from 'react';
import type { Project } from './types';
import { DEFAULT_PROJECTS } from './data/projects';
import { Header } from './components/Header';
import { ProjectTabs } from './components/ProjectTabs';
import { Configurator } from './components/Configurator';
import { ValidationPanel } from './components/ValidationPanel';
import { AuditPanel } from './components/AuditPanel';

type TabView = 'configurator' | 'validation' | 'audit';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeId, setActiveId] = useState<string>(DEFAULT_PROJECTS[0].id);
  const [activeTab, setActiveTab] = useState<TabView>('configurator');

  const activeProject = projects.find(p => p.id === activeId) ?? projects[0];

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleOverride = (key: string, reason: string) => {
    updateProject({
      ...activeProject,
      overrides: { ...activeProject.overrides, [key]: reason },
    });
  };

  const addProject = () => {
    const newP: Project = {
      id: `project-${Date.now()}`,
      name: 'Нов проект',
      category: 'IV',
      type: 'residential_single',
      useClass: 'Ф1',
      height: 8,
      floors: 2,
      area: 200,
      zone: 'Жм',
      location: 'София',
      facade: { system: 'etics', insulation: 'eps', thickness: 100 },
      windows: { family: 'pvc', glass: 'double', uw: 1.4, rw: 32, rc: 'RC1' },
      balcony: { type: 'terrace', count: 1, glazing: 'none', climateZonesDefined: false },
      overrides: {},
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newP]);
    setActiveId(newP.id);
    setActiveTab('configurator');
  };

  const navTabs: { id: TabView; label: string; icon: string }[] = [
    { id: 'configurator', label: 'Конфигуратор',  icon: '⊞' },
    { id: 'validation',   label: 'Валидация',      icon: '✓' },
    { id: 'audit',        label: 'Одит и експорт', icon: '⬇' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <ProjectTabs
        projects={projects}
        activeId={activeId}
        onSelect={id => { setActiveId(id); setActiveTab('configurator'); }}
        onAdd={addProject}
      />

      {/* Secondary nav */}
      <div style={{
        display: 'flex', gap: 0,
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
      }}>
        {navTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--gold)' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--gold-pale)' : 'var(--text-muted)',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: '1.5rem 2rem',
        display: 'grid',
        gridTemplateColumns: activeTab === 'audit' ? '1fr' : '360px 1fr',
        gap: '1.5rem',
        maxWidth: 1400,
        width: '100%',
        margin: '0 auto',
        alignItems: 'start',
      }}>

        {activeTab === 'configurator' && (
          <>
            <div>
              <Configurator project={activeProject} onChange={updateProject} />
            </div>
            <div>
              <ValidationPanel project={activeProject} onOverride={handleOverride} />
            </div>
          </>
        )}

        {activeTab === 'validation' && (
          <>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '1rem 1.25rem',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--gold-dim)', marginBottom: 12,
              }}>
                Активен проект
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                color: 'var(--gold-pale)',
                marginBottom: 4,
              }}>
                {activeProject.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <div>Кат. {activeProject.category} · {activeProject.useClass} · H = {activeProject.height} m</div>
                <div>{activeProject.floors} ет. · {activeProject.area} м² · {activeProject.zone}</div>
                <div>{activeProject.location}</div>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
              <button
                onClick={() => setActiveTab('configurator')}
                style={{
                  fontSize: 11, padding: '5px 12px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                ← Редактирай конфигурацията
              </button>
            </div>
            <div>
              <ValidationPanel project={activeProject} onOverride={handleOverride} />
            </div>
          </>
        )}

        {activeTab === 'audit' && (
          <AuditPanel projects={projects} />
        )}
      </main>
    </div>
  );
}
