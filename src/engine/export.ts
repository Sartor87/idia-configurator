import Papa from 'papaparse';
import type { Project, SpecRow } from '../types';
import { WINDOW_FAMILIES, INSULATION, CLADDING, FACADE_SYSTEMS } from '../data/catalog';
import { runValidation, scoreRules } from '../engine/rules';

// ─── Spec rows ────────────────────────────────────────────────────────────────

export function buildSpecRows(projects: Project[]): SpecRow[] {
  const rows: SpecRow[] = [];
  let counter = 1;

  for (const p of projects) {
    const wf = WINDOW_FAMILIES[p.windows.family];
    const glassLabel = p.windows.glass === 'triple' ? 'Троен стъклопакет' : 'Двоен стъклопакет';

    rows.push({
      code: `ПР-${String(counter).padStart(2, '0')}`,
      type: 'Прозорец',
      system: wf?.label ?? p.windows.family,
      glass: glassLabel,
      uw: p.windows.uw,
      rw: p.windows.rw,
      rc: p.windows.rc,
      count: p.type === 'residential_multi' ? Math.round(p.area / 15) : 12,
      projectName: p.name,
    });

    rows.push({
      code: `ВР-${String(counter).padStart(2, '0')}`,
      type: 'Входна врата',
      system: wf?.label ?? p.windows.family,
      glass: 'Плътно / остъклено',
      uw: p.windows.uw,
      rw: p.windows.rw + 2,
      rc: p.floors >= 3 ? 'RC2' : p.windows.rc,
      count: p.type === 'residential_multi' ? p.floors * 2 : 1,
      projectName: p.name,
    });

    if (p.facade.system === 'ventilated' && p.facade.cladding) {
      const cl = CLADDING[p.facade.cladding];
      rows.push({
        code: `ФП-${String(counter).padStart(2, '0')}`,
        type: 'Фасаден панел',
        system: cl?.label ?? p.facade.cladding,
        glass: '—',
        uw: 0,
        rw: 0,
        rc: '—',
        count: Math.round(p.area * 0.35),
        projectName: p.name,
        fireClass: cl?.fire,
      });
    }
    counter++;
  }
  return rows;
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export function exportCSV(projects: Project[]): void {
  const rows = buildSpecRows(projects);
  const data = rows.map((r) => ({
    'Код': r.code,
    'Вид': r.type,
    'Система / Продукт': r.system,
    'Стъклопакет': r.glass,
    'Uw (W/m²·K)': r.uw || '—',
    'Rw (dB)': r.rw || '—',
    'RC клас': r.rc,
    'Пожарен клас': r.fireClass ?? '—',
    'Брой': r.count,
    'Проект': r.projectName,
  }));

  const csv = Papa.unparse(data, { delimiter: ';' });
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IDIA_Спецификация_Отвори_${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF export (plain text layout, no external fonts needed) ────────────────

export async function exportPDF(projects: Project[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 15;
  const col = pageW - margin * 2;
  let y = 20;

  const addText = (
    text: string,
    x: number,
    yPos: number,
    size = 10,
    style: 'normal' | 'bold' = 'normal',
  ) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.text(text, x, yPos);
  };

  const line = (yPos: number) => {
    doc.setDrawColor(200, 169, 110);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageW - margin, yPos);
  };

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageW, 18, 'F');
  addText('IDIA', margin, 11, 14, 'bold');
  doc.setTextColor(200, 169, 110);
  addText('Архитектурно студио', margin + 22, 11, 10);
  doc.setTextColor(180, 180, 180);
  addText(`Валидационен отчет · ${today()}`, pageW - margin, 11, 9);
  doc.setTextColor(0, 0, 0);
  y = 28;

  addText('ВАЛИДАЦИОНЕН ОТЧЕТ — ФАСАДНИ ЕЛЕМЕНТИ', margin, y, 13, 'bold');
  y += 4;
  addText(`Версия правила: май 2026 · ЗУТ (ДВ бр. 47/2025) · Наредба Із-1971 (ДВ бр. 91/2024)`, margin, y, 8);
  y += 8;
  line(y);
  y += 6;

  for (const p of projects) {
    checkPage(60);
    const rules = runValidation(p);
    const score = scoreRules(rules);

    // Project header
    doc.setFillColor(240, 240, 235);
    doc.rect(margin, y - 4, col, 10, 'F');
    addText(p.name, margin + 2, y + 2, 11, 'bold');
    const statusText = score.fail > 0 ? 'ГРЕШКИ' : score.warn > 0 ? 'ПРЕДУПРЕЖДЕНИЯ' : 'OK';
    addText(statusText, pageW - margin - 25, y + 2, 10, 'bold');
    y += 10;

    // Project params
    const params = [
      `Кат. ${p.category} · ${p.useClass} · H=${p.height} m · ${p.floors} ет. · ${p.area} м²`,
      `Зона: ${p.zone} · ${p.location}`,
      `Фасада: ${FACADE_SYSTEMS[p.facade.system]?.label} · Изолация: ${INSULATION[p.facade.insulation]?.label} (${INSULATION[p.facade.insulation]?.fire})`,
      `Дограма: ${WINDOW_FAMILIES[p.windows.family]?.label} · Uw=${p.windows.uw} W/m²·K · Rw=${p.windows.rw} dB · ${p.windows.rc}`,
    ];
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    for (const param of params) {
      checkPage(5);
      doc.text(param, margin + 2, y);
      y += 4;
    }
    y += 3;

    // Score summary
    addText(
      `Резюме: ${score.pass} преминати · ${score.warn} предупреждения · ${score.fail} грешки · ${score.info} информационни`,
      margin, y, 9, 'bold',
    );
    y += 6;

    // Rules
    for (const r of rules) {
      checkPage(14);
      const icon = r.status === 'pass' ? '✓' : r.status === 'warn' ? '!' : r.status === 'fail' ? '✗' : 'i';

      if (r.status === 'fail') doc.setTextColor(180, 40, 40);
      else if (r.status === 'warn') doc.setTextColor(150, 100, 10);
      else if (r.status === 'pass') doc.setTextColor(40, 130, 60);
      else doc.setTextColor(30, 80, 160);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${r.layer}] ${icon} ${r.id} — ${r.title}`, margin + 2, y);
      doc.setTextColor(0, 0, 0);
      y += 4;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const msgLines = doc.splitTextToSize(r.msg, col - 6);
      for (const line_ of msgLines) {
        checkPage(4);
        doc.text(line_, margin + 6, y);
        y += 3.8;
      }

      doc.setTextColor(120, 120, 120);
      doc.setFontSize(7);
      doc.text(`Нормативна основа: ${r.law}`, margin + 6, y);
      doc.setTextColor(0, 0, 0);
      y += 5;
    }

    // Override log
    const overrideKeys = Object.keys(p.overrides);
    if (overrideKeys.length > 0) {
      checkPage(16);
      doc.setFillColor(255, 248, 230);
      doc.rect(margin, y, col, 8 + overrideKeys.length * 5, 'F');
      addText('Одиторска следа — Override-и:', margin + 2, y + 4, 8, 'bold');
      y += 8;
      for (const k of overrideKeys) {
        checkPage(5);
        doc.setFontSize(8);
        doc.text(`• ${k}: ${p.overrides[k]}`, margin + 4, y);
        y += 4.5;
      }
    }

    y += 6;
    line(y);
    y += 8;
  }

  // Footer
  const specRows = buildSpecRows(projects);
  checkPage(20);
  addText('СПЕЦИФИКАЦИЯ НА ОТВОРИТЕ', margin, y, 11, 'bold');
  y += 5;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Код', margin, y);
  doc.text('Вид', margin + 18, y);
  doc.text('Система', margin + 40, y);
  doc.text('Uw', margin + 110, y);
  doc.text('Rw', margin + 125, y);
  doc.text('RC', margin + 138, y);
  doc.text('Брой', margin + 150, y);
  y += 4;
  line(y);
  y += 3;
  doc.setFont('helvetica', 'normal');
  for (const row of specRows) {
    checkPage(5);
    doc.text(row.code, margin, y);
    doc.text(row.type, margin + 18, y);
    doc.text(row.system.substring(0, 35), margin + 40, y);
    doc.text(row.uw ? String(row.uw) : '—', margin + 110, y);
    doc.text(row.rw ? String(row.rw) : '—', margin + 125, y);
    doc.text(row.rc, margin + 138, y);
    doc.text(String(row.count), margin + 150, y);
    y += 4;
  }

  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(
    'Този отчет е консултативен. Финалната проектна отговорност се носи от подписващия архитект с ППП по ЗКАИИП.',
    margin, y,
  );

  doc.save(`IDIA_Валидация_${today()}.pdf`);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
