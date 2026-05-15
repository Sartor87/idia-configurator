import type { Project, BuildingCategory, UseClass, FacadeSystem, InsulationType, CladdingType, WindowFamily, GlassType, RCClass, BalconyType, GlazingPolicy } from '../types';
import {
  FACADE_SYSTEMS, INSULATION, CLADDING, WINDOW_FAMILIES,
  BUILDING_CATEGORIES, USE_CLASSES,
} from '../data/catalog';
import { Card, CardLabel, SectionTitle, Field, OptionRow, Badge } from './ui';

interface ConfiguratorProps {
  project: Project;
  onChange: (updated: Project) => void;
}

const FIRE_BADGE = (fire: string) => {
  if (fire === 'A1' || fire === 'A2') return <Badge status="pass">{fire}</Badge>;
  if (fire.startsWith('B')) return <Badge status="warn">{fire}</Badge>;
  return <Badge status="fail">{fire}</Badge>;
};

export function Configurator({ project: p, onChange }: ConfiguratorProps) {
  const set = <K extends keyof Project>(key: K, val: Project[K]) =>
    onChange({ ...p, [key]: val });

  const setFacade = (partial: Partial<Project['facade']>) =>
    onChange({ ...p, facade: { ...p.facade, ...partial } });

  const setWin = (partial: Partial<Project['windows']>) =>
    onChange({ ...p, windows: { ...p.windows, ...partial } });

  const setBal = (partial: Partial<Project['balcony']>) =>
    onChange({ ...p, balcony: { ...p.balcony, ...partial } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Project parameters ── */}
      <Card>
        <CardLabel>Параметри на проекта</CardLabel>

        <Field label="Наименование">
          <input value={p.name} onChange={e => set('name', e.target.value)} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Категория строеж">
            <select value={p.category} onChange={e => set('category', e.target.value as BuildingCategory)}>
              {Object.entries(BUILDING_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Клас пожарна опасност">
            <select value={p.useClass} onChange={e => set('useClass', e.target.value as UseClass)}>
              {Object.entries(USE_CLASSES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Field label="Височина (m)">
            <input type="number" min={3} max={120} step={0.5} value={p.height}
              onChange={e => set('height', parseFloat(e.target.value))} />
          </Field>
          <Field label="Етажи">
            <input type="number" min={1} max={40} value={p.floors}
              onChange={e => set('floors', parseInt(e.target.value))} />
          </Field>
          <Field label="РЗП (м²)">
            <input type="number" min={50} max={50000} step={50} value={p.area}
              onChange={e => set('area', parseInt(e.target.value))} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Зона (УП)">
            <input value={p.zone} onChange={e => set('zone', e.target.value)} />
          </Field>
          <Field label="Локация">
            <input value={p.location} onChange={e => set('location', e.target.value)} />
          </Field>
        </div>

        {p.height > 28 && (
          <div style={{
            marginTop: 6, padding: '6px 10px', borderRadius: 6,
            background: 'var(--warn-bg)', color: 'var(--warn-text)', fontSize: 12,
          }}>
            ⚠ Сградата е над 28 m — задължителна негорима изолация (A1/A2)
          </div>
        )}
      </Card>

      {/* ── Facade system ── */}
      <Card>
        <CardLabel>Фасадна система</CardLabel>
        <SectionTitle>Тип система</SectionTitle>
        {Object.entries(FACADE_SYSTEMS).map(([k, v]) => (
          <OptionRow
            key={k}
            selected={p.facade.system === k}
            onClick={() => setFacade({ system: k as FacadeSystem })}
            name={v.label}
            sub={v.sub}
          />
        ))}

        <SectionTitle>Топлоизолация</SectionTitle>
        {Object.entries(INSULATION).map(([k, v]) => (
          <OptionRow
            key={k}
            selected={p.facade.insulation === k}
            onClick={() => setFacade({ insulation: k as InsulationType })}
            name={v.label}
            sub={`λ = ${v.lambda} W/m·K  ·  Клас: ${v.fire}`}
            right={FIRE_BADGE(v.fire)}
          />
        ))}

        {p.facade.system === 'ventilated' && (
          <>
            <SectionTitle>Облицовка</SectionTitle>
            {Object.entries(CLADDING).map(([k, v]) => (
              <OptionRow
                key={k}
                selected={p.facade.cladding === k}
                onClick={() => setFacade({ cladding: k as CladdingType })}
                name={v.label}
                sub={`Реакция на огън: ${v.fire}`}
                right={FIRE_BADGE(v.fire)}
              />
            ))}
          </>
        )}

        <SectionTitle>Дебелина изолация</SectionTitle>
        <Field label={`${p.facade.thickness} mm`}
          hint="Влияе на топлинните мостове и анкерирането на дюбелите">
          <input type="range" min={60} max={200} step={10} value={p.facade.thickness}
            onChange={e => setFacade({ thickness: parseInt(e.target.value) })} />
        </Field>
      </Card>

      {/* ── Windows ── */}
      <Card>
        <CardLabel>Прозорци и врати</CardLabel>
        <SectionTitle>Семейство дограма</SectionTitle>
        {Object.entries(WINDOW_FAMILIES).map(([k, v]) => (
          <OptionRow
            key={k}
            selected={p.windows.family === k}
            onClick={() => setWin({ family: k as WindowFamily })}
            name={v.label}
            sub={`Макс. Uw ≤ ${v.uwMax} W/m²·K  ·  Типично: ${v.typicalUw}`}
          />
        ))}

        <SectionTitle>Параметри</SectionTitle>
        <Field label="Стъклопакет">
          <select value={p.windows.glass}
            onChange={e => setWin({ glass: e.target.value as GlassType })}>
            <option value="double">Двоен стъклопакет</option>
            <option value="triple">Троен стъклопакет</option>
          </select>
        </Field>

        <Field
          label={`Декларирано Uw: ${p.windows.uw} W/m²·K`}
          hint={`Праг: ≤ ${WINDOW_FAMILIES[p.windows.family]?.uwMax} W/m²·K за ${WINDOW_FAMILIES[p.windows.family]?.label}`}
        >
          <input type="range" min={0.7} max={3.0} step={0.05} value={p.windows.uw}
            onChange={e => setWin({ uw: parseFloat(parseFloat(e.target.value).toFixed(2)) })} />
        </Field>

        <Field
          label={`Звукоизолация Rw: ${p.windows.rw} dB`}
          hint="Препоръчително ≥ 35 dB за градска локация"
        >
          <input type="range" min={25} max={55} step={1} value={p.windows.rw}
            onChange={e => setWin({ rw: parseInt(e.target.value) })} />
        </Field>

        <Field label="RC клас (EN 1627)" hint="Препоръчително RC2 за приземни в многофамилни">
          <select value={p.windows.rc}
            onChange={e => setWin({ rc: e.target.value as RCClass })}>
            {['RC1', 'RC2', 'RC3'].map(rc => (
              <option key={rc} value={rc}>{rc}</option>
            ))}
          </select>
        </Field>
      </Card>

      {/* ── Balconies ── */}
      <Card>
        <CardLabel>Балкони / лоджии / тераси</CardLabel>
        <Field label="Тип">
          <select value={p.balcony.type}
            onChange={e => setBal({ type: e.target.value as BalconyType })}>
            <option value="balcony">Отворен балкон</option>
            <option value="loggia">Лоджия</option>
            <option value="terrace">Тераса (покривна / приземна)</option>
          </select>
        </Field>

        <Field label="Политика за остъкляване">
          <select value={p.balcony.glazing}
            onChange={e => setBal({ glazing: e.target.value as GlazingPolicy })}>
            <option value="none">Не се предвижда</option>
            <option value="proposed">Предвидено в проекта</option>
          </select>
        </Field>

        {p.balcony.type === 'balcony' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Ширина балкон (m)">
              <input type="number" min={1} max={8} step={0.1}
                value={p.balcony.balconyWidth ?? 2.4}
                onChange={e => setBal({ balconyWidth: parseFloat(e.target.value) })} />
            </Field>
            <Field label="Дълбочина (m)">
              <input type="number" min={0.8} max={3} step={0.1}
                value={p.balcony.balconyDepth ?? 1.2}
                onChange={e => setBal({ balconyDepth: parseFloat(e.target.value) })} />
            </Field>
          </div>
        )}

        <Field label="Зони за климатици дефинирани">
          <select
            value={p.balcony.climateZonesDefined ? 'yes' : 'no'}
            onChange={e => setBal({ climateZonesDefined: e.target.value === 'yes' })}>
            <option value="no">Не — предстои нанасяне</option>
            <option value="yes">Да — координирани в проекта</option>
          </select>
        </Field>
      </Card>

    </div>
  );
}
