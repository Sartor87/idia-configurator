import type { Project, ValidationRule, ValidationScore } from '../types';
import { WINDOW_FAMILIES, INSULATION, CLADDING, FIRE_CLASS_OK } from '../data/catalog';

export function runValidation(p: Project): ValidationRule[] {
  const rules: ValidationRule[] = [];

  // ─── R — Normative rules ──────────────────────────────────────────────────

  // R-EE-01  Uw threshold per window family
  const uwMax = WINDOW_FAMILIES[p.windows.family]?.uwMax ?? 1.7;
  const uwOk = p.windows.uw <= uwMax;
  rules.push({
    id: 'R-EE-01', layer: 'R',
    status: uwOk ? 'pass' : 'fail',
    title: `Uw прозорци: ${p.windows.uw} W/m²·K`,
    msg: uwOk
      ? `Декларираното Uw ${p.windows.uw} W/m²·K отговаря на изискването ≤ ${uwMax} W/m²·K за ${WINDOW_FAMILIES[p.windows.family]?.label}.`
      : `Декларираното Uw (${p.windows.uw}) надвишава допустимото ≤ ${uwMax} W/m²·K за ${WINDOW_FAMILIES[p.windows.family]?.label}. Необходим по-ефективен профил или стъклопакет.`,
    law: 'Наредба №7/2004 за ЕЕ на сгради · hEN EN 14351-1',
  });

  // R-FS-01  Fire class insulation >28m
  if (p.height > 28) {
    const ins = INSULATION[p.facade.insulation];
    const fireOk = p.facade.insulation === 'mw';
    rules.push({
      id: 'R-FS-01', layer: 'R',
      status: fireOk ? 'pass' : 'fail',
      title: `Пожарен клас изолация при H=${p.height} m`,
      msg: fireOk
        ? `Каменна вата MW (A1) — отговаря на изискването за сгради над 28 m.`
        : `Сградата е ${p.height} m > 28 m. Задължителна негорима изолация A1/A2. Избраната ${ins?.label} е клас ${ins?.fire} — не е допустима.`,
      law: 'Наредба Із-1971/2009, изм. ДВ бр. 91/2024 · EN 13501-1',
    });
  }

  // R-FS-02  EPS in ETICS below 28m — fire strips required
  if (p.height <= 28 && p.facade.system === 'etics' && p.facade.insulation === 'eps') {
    rules.push({
      id: 'R-FS-02', layer: 'R',
      status: 'warn',
      title: 'EPS в ETICS — задължителни противопожарни ивици',
      msg: `При EPS в ETICS за сгради ≤ 28 m се изискват хоризонтални ПП ивици от MW на всеки етаж над приземния и около всички отвори. Задължително да се предвидят в проекта.`,
      law: 'Наредба Із-1971/2009, изм. ДВ бр. 91/2024 · EN 13501-1',
    });
  }

  // R-FS-03  Cladding fire class on ventilated facade
  if (p.facade.system === 'ventilated' && p.facade.cladding) {
    const cl = CLADDING[p.facade.cladding];
    const clOk = FIRE_CLASS_OK.includes(cl?.fire ?? '');
    rules.push({
      id: 'R-FS-03', layer: 'R',
      status: clOk ? 'pass' : 'fail',
      title: `Клас облицовка: ${cl?.label} = ${cl?.fire}`,
      msg: clOk
        ? `${cl?.label} (${cl?.fire}) отговаря на минималното изискване B-s2,d0 за жилищни сгради Ф1.`
        : `${cl?.label} (${cl?.fire}) НЕ отговаря на изискването ≥ B-s2,d0 за жилищни фасади. Изисква се смяна на облицовъчния панел.`,
      law: 'Наредба Із-1971/2009 чл. 35 · EN 13501-1',
    });
  }

  // R-FS-04  Part "Fire Safety" required
  const needsPB = !(p.useClass === 'Ф1' && p.area <= 200 && p.floors <= 2);
  rules.push({
    id: 'R-FS-04', layer: 'R',
    status: needsPB ? 'info' : 'pass',
    title: needsPB ? 'Необходима Ч. „Пожарна безопасност"' : 'Освободен от Ч. ПБ',
    msg: needsPB
      ? `РЗП ${p.area} м² / ${p.floors} ет. → задължителна Ч. „Пожарна безопасност" в ИП, от правоспособен проектант.`
      : `Сграда Ф1 ≤ 200 м² и ≤ 2 ет. — освободена от задължителна Ч. ПБ по чл. 4(4).`,
    law: 'Наредба Із-1971/2009 чл. 4(4)',
  });

  // R-EE-02  RC class ground floor
  if (p.floors >= 3) {
    const rcOk = ['RC2', 'RC3', 'RC4', 'RC5', 'RC6'].includes(p.windows.rc);
    rules.push({
      id: 'R-EE-02', layer: 'R',
      status: rcOk ? 'pass' : 'warn',
      title: `RC клас приземен: ${p.windows.rc}`,
      msg: rcOk
        ? `${p.windows.rc} отговаря на препоръчителния минимум RC2 за приземни зони на многофамилни сгради.`
        : `Приземните прозорци/врати трябва да са поне RC2 (EN 1627). Текущо: ${p.windows.rc}.`,
      law: 'EN 1627 · Добра практика БГФМА',
    });
  }

  // ─── T — Technical compatibility ────────────────────────────────────────

  // T-01  EPS incompatible with ventilated facade
  if (p.facade.system === 'ventilated' && p.facade.insulation === 'eps') {
    rules.push({
      id: 'T-01', layer: 'T',
      status: 'fail',
      title: 'Несъвместимост: EPS в окачена фасада',
      msg: 'EPS не е съвместим с вентилируема фасадна система. Изисква се MW с двойна плътност (напр. Rockwool Frontrock Plus) — A1, правилно анкериране, паропропускливост.',
      law: 'ETAG 004 · Производствени ТД (Rockwool, Knauf Insulation)',
    });
  }

  // T-02  Warm edge for triple glazing Uw < 1.0
  if (p.windows.glass === 'triple' && p.windows.uw < 1.0) {
    rules.push({
      id: 'T-02', layer: 'T',
      status: 'fail',
      title: 'Алуминиев дистанционер при Uw < 1.0 W/m²·K',
      msg: 'При Uw < 1.0 е задължителен „топъл ръб" (термопластичен) дистанционер. Алуминиевият дистанционер влошава Uw с ≈ 0.08–0.12 W/m²·K.',
      law: 'EN ISO 10077-1 · Swisspacer / Thermix каталог',
    });
  }

  // T-03  MW breathability — no vapour barrier finish on top
  if (p.facade.insulation === 'mw' && p.facade.finish === 'acrylic') {
    rules.push({
      id: 'T-03', layer: 'T',
      status: 'warn',
      title: 'Акрилно покритие върху MW — паропропускливост',
      msg: 'Акрилното покритие е паробариера. Върху каменна вата се изисква силикатно или силиконово покритие с Sd < 0.1 m за осигуряване на дифузия.',
      law: 'EN 1062-1 · DIN 4108-3',
    });
  }

  // ─── P — Studio policy ───────────────────────────────────────────────────

  // P-BAL-01  Glazing of balconies in multi-family
  if (p.balcony.glazing === 'proposed' && p.type === 'residential_multi') {
    const hasOverride = p.overrides['P-BAL-01'];
    rules.push({
      id: 'P-BAL-01', layer: 'P',
      status: hasOverride ? 'warn' : 'fail',
      title: 'Студийна политика: остъкляване на балкони',
      override: true,
      overrideKey: 'P-BAL-01',
      msg: hasOverride
        ? `Override активен: „${hasOverride}". Предайте за ревю от арх. Тамбукова.`
        : 'Предвиденото остъкляване на балкони противоречи на студийната политика на ИДИА. Балкони за остъкляване трябва да се проектират като лоджии от самото начало.',
      law: 'Студийна политика ИДИА (Принцип А) · чл. 151 ЗУТ · ЗУЕС чл. 6',
    });
  }

  // P-BAL-02  Balcony proportions — glazing risk
  if (
    p.balcony.type === 'balcony' &&
    p.balcony.balconyWidth != null &&
    p.balcony.balconyDepth != null
  ) {
    const ratio = p.balcony.balconyWidth / p.balcony.balconyDepth;
    if (ratio > 2.5) {
      rules.push({
        id: 'P-BAL-02', layer: 'P',
        status: 'warn',
        title: `Пропорции балкон: ш/д = ${ratio.toFixed(1)}`,
        msg: `Ширина/Дълбочина = ${ratio.toFixed(1)} > 2.5 — висок риск от последващо остъкляване от собствениците. Обмислете лоджия или редуциране на ширината.`,
        law: 'Студийна политика ИДИА (Принцип А)',
      });
    }
  }

  // P-MAT-01  Hybrid system material coherence
  if (p.facade.system === 'hybrid') {
    rules.push({
      id: 'P-MAT-01', layer: 'P',
      status: 'warn',
      title: 'Хибридна система — риск за материална кохерентност',
      msg: 'Преходът ETICS/вентилируема изисква внимателно детайлиране. Ограничете до 1 акцентна зона. Палитрата изисква изрично одобрение от арх. Тамбукова.',
      law: 'Студийна политика ИДИА (Принцип Б)',
    });
  }

  // ─── X — Cross-element combinatorial rules ───────────────────────────────

  // X-01  Cantilevered balcony thermal bridge
  if (p.balcony.type === 'balcony' && p.facade.system !== 'ventilated') {
    rules.push({
      id: 'X-01', layer: 'X',
      status: 'warn',
      title: 'Конзолен балкон + ETICS — термичен мост',
      msg: 'Конзолна балконна плоча, пресичаща топлоизолацията, изисква задължително елемент с прекъснат термомост (тип Isokorb / Halfen). Без него Ψ = 0.5–0.8 W/m·K.',
      law: 'EN ISO 14683 · EN 10211 · Наредба №7/2004',
    });
  }

  // X-02  Acoustics in urban dense zone
  if (p.windows.rw < 35 && p.zone.includes('Жс')) {
    rules.push({
      id: 'X-02', layer: 'X',
      status: 'warn',
      title: `Акустика: Rw = ${p.windows.rw} dB в зона ${p.zone}`,
      msg: `За зона ${p.zone} при градска локация е препоръчително Rw ≥ 35 dB. Асиметрична дебелина на стъклопакета (4/16/6 вм. 4/16/4) дава +2–4 dB без смяна на профила.`,
      law: 'EN ISO 717-1 · Наредба №5 за шум в жилищни сгради',
    });
  }

  // X-03  Climate zones not defined in multi-family
  if (p.type === 'residential_multi' && !p.balcony.climateZonesDefined) {
    rules.push({
      id: 'X-03', layer: 'X',
      status: 'info',
      title: 'Зони за климатици — не са дефинирани',
      msg: 'Многофамилният проект не включва дефинирани зони за монтаж на външни климатични тела. Студийната политика изисква координация преди предаване.',
      law: 'Студийна политика ИДИА (Принцип А) · ЗУЕС чл. 6',
    });
  }

  // X-04  Deep window reveal + acrylic finish thermal bridge risk
  if (p.facade.finish === 'acrylic' && p.windows.uw < 1.2) {
    rules.push({
      id: 'X-04', layer: 'X',
      status: 'warn',
      title: 'Дълбок отлог + акрилно покритие — кондензация',
      msg: 'При Uw < 1.2 и акрилно финишно покритие е повишен рискът от кондензация на вътрешния отлог в зоната на прозореца. Изискват се детайли по EN ISO 10077-2.',
      law: 'EN ISO 10077-2 · Наредба №7/2004',
    });
  }

  return rules;
}

export function scoreRules(rules: ValidationRule[]): ValidationScore {
  return rules.reduce(
    (acc, r) => {
      acc[r.status]++;
      acc.total++;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0, info: 0, total: 0 } as ValidationScore,
  );
}

export function overallStatus(score: ValidationScore): 'pass' | 'warn' | 'fail' {
  if (score.fail > 0) return 'fail';
  if (score.warn > 0) return 'warn';
  return 'pass';
}
