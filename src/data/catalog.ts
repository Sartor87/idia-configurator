import type {
  InsulationType, CladdingType, WindowFamily,
  FacadeSystem, BuildingCategory, UseClass
} from '../types';

export const FACADE_SYSTEMS: Record<FacadeSystem, { label: string; sub: string }> = {
  etics:      { label: 'ETICS — измазана фасада',        sub: 'Лепена топлоизолация + мазилка (ETAG 004)' },
  ventilated: { label: 'Вентилируема (окачена) фасада',   sub: 'Подконструкция + въздушен слой + облицовка' },
  hybrid:     { label: 'Хибридна система',                sub: 'ETICS по непрозрачни части + вентилируема акцент' },
};

export const INSULATION: Record<InsulationType, {
  label: string; fire: string; lambda: string; uwBoost: number;
}> = {
  eps:          { label: 'EPS (полистирол)',    fire: 'E',       lambda: '0.036', uwBoost: 0 },
  graphite_eps: { label: 'Графитен EPS',         fire: 'E',       lambda: '0.031', uwBoost: 0.05 },
  mw:           { label: 'Каменна вата (MW)',    fire: 'A1',      lambda: '0.040', uwBoost: 0 },
  xps:          { label: 'XPS',                  fire: 'E/F',     lambda: '0.034', uwBoost: 0.03 },
};

export const CLADDING: Record<CladdingType, { label: string; fire: string }> = {
  hpl:          { label: 'HPL панели',                    fire: 'B-s2,d0' },
  fibrecement:  { label: 'Фиброцимент',                   fire: 'A2' },
  ceramic:      { label: 'Широкоформатен порцелан',       fire: 'A1' },
  acm_mineral:  { label: 'ACM — минерално ядро',          fire: 'A2' },
  acm_pe:       { label: 'ACM — PE ядро',                 fire: 'D' },
};

export const WINDOW_FAMILIES: Record<WindowFamily, {
  label: string; uwMax: number; note: string; typicalUw: string;
}> = {
  pvc:       { label: 'PVC дограма',                     uwMax: 1.7, note: 'Нар. №7/2004', typicalUw: '1.2–1.5' },
  aluminium: { label: 'Алуминий с прекъснат термомост',  uwMax: 2.0, note: 'Нар. №7/2004', typicalUw: '1.3–1.7' },
  wood:      { label: 'Дърво / дърво-алуминий',          uwMax: 1.9, note: 'Нар. №7/2004', typicalUw: '1.0–1.4' },
};

export const BUILDING_CATEGORIES: Record<BuildingCategory, { label: string; desc: string }> = {
  II:  { label: 'II категория',  desc: 'Жилищни > 5 000 м² / хотели > 200 посетители' },
  III: { label: 'III категория', desc: 'Жилищни и смесени — средно застрояване' },
  IV:  { label: 'IV категория',  desc: 'Ниско застрояване / интериорни преустройства' },
  V:   { label: 'V категория',   desc: 'Еднофамилни < 100 м² / малки постройки' },
};

export const USE_CLASSES: Record<UseClass, string> = {
  'Ф1': 'Ф1 — Жилищни / за пребиваване',
  'Ф2': 'Ф2 — За събиране на хора',
  'Ф3': 'Ф3 — Обществено обслужване',
  'Ф4': 'Ф4 — Административни / образователни',
  'Ф5': 'Ф5 — Производствени / складови',
};

export const FIRE_CLASS_OK = ['A1', 'A2', 'B-s2,d0'];

export const LAYER_LABELS: Record<string, string> = {
  R: 'R — Нормативен',
  T: 'T — Технически',
  P: 'P — Студийна политика',
  X: 'X — Между елементи',
};

export const LAYER_COLORS: Record<string, string> = {
  R: '#c8a96e',
  T: '#888780',
  P: '#e07b3a',
  X: '#5DCAA5',
};
