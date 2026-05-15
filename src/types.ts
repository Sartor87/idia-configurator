export type ProjectType = 'residential_single' | 'residential_multi' | 'hotel' | 'mixed';
export type BuildingCategory = 'II' | 'III' | 'IV' | 'V';
export type UseClass = 'Ф1' | 'Ф2' | 'Ф3' | 'Ф4' | 'Ф5';
export type FacadeSystem = 'etics' | 'ventilated' | 'hybrid';
export type InsulationType = 'eps' | 'graphite_eps' | 'mw' | 'xps';
export type CladdingType = 'hpl' | 'fibrecement' | 'ceramic' | 'acm_mineral' | 'acm_pe';
export type WindowFamily = 'pvc' | 'aluminium' | 'wood';
export type GlassType = 'double' | 'triple';
export type RCClass = 'RC1' | 'RC2' | 'RC3';
export type BalconyType = 'balcony' | 'loggia' | 'terrace';
export type GlazingPolicy = 'none' | 'proposed';
export type RuleLayer = 'R' | 'T' | 'P' | 'X';
export type RuleStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface FacadeConfig {
  system: FacadeSystem;
  insulation: InsulationType;
  cladding?: CladdingType;
  thickness: number;
  finish?: string;
}

export interface WindowConfig {
  family: WindowFamily;
  glass: GlassType;
  uw: number;
  rw: number;
  rc: RCClass;
}

export interface BalconyConfig {
  type: BalconyType;
  count: number;
  glazing: GlazingPolicy;
  balconyWidth?: number;
  balconyDepth?: number;
  climateZonesDefined?: boolean;
}

export interface Project {
  id: string;
  name: string;
  category: BuildingCategory;
  type: ProjectType;
  useClass: UseClass;
  height: number;
  floors: number;
  area: number;
  zone: string;
  location: string;
  facade: FacadeConfig;
  windows: WindowConfig;
  balcony: BalconyConfig;
  overrides: Record<string, string>;
  createdAt: string;
}

export interface ValidationRule {
  id: string;
  layer: RuleLayer;
  status: RuleStatus;
  title: string;
  msg: string;
  law: string;
  override?: boolean;
  overrideKey?: string;
}

export interface ValidationScore {
  pass: number;
  warn: number;
  fail: number;
  info: number;
  total: number;
}

export interface AuditEntry {
  timestamp: string;
  projectId: string;
  projectName: string;
  ruleId: string;
  status: RuleStatus;
  title: string;
  overrideText?: string;
  user: string;
}

export interface SpecRow {
  code: string;
  type: string;
  system: string;
  glass: string;
  uw: number;
  rw: number;
  rc: string;
  count: number;
  projectName: string;
  fireClass?: string;
}
