import type { ComponentField } from '../fields/FieldRow';

export interface Module {
  id: string;
  name: string;
  fields: ComponentField[];
}

export const GENERAL_MODULE_ID = 'general';

export function parseModules(serverFields: ComponentField[]): Module[] {
  const modules: Module[] = [];
  let current: Module | null = null;

  for (const f of serverFields) {
    if (f.key_type === 'separator') {
      current = { id: f.id, name: f.key_name || 'Módulo', fields: [] };
      modules.push(current);
    } else {
      if (!current) {
        current = { id: GENERAL_MODULE_ID, name: 'General', fields: [] };
        modules.push(current);
      }
      current.fields.push(f);
    }
  }

  return modules;
}

export function flattenModules(modules: Module[]): ComponentField[] {
  const out: ComponentField[] = [];
  const general = modules.find((m) => m.id === GENERAL_MODULE_ID);
  if (general) {
    out.push(...general.fields);
  }
  for (const m of modules) {
    if (m.id === GENERAL_MODULE_ID) continue;
    out.push({ id: m.id, key_name: m.name, key_value: '', key_type: 'separator' });
    out.push(...m.fields);
  }
  return out;
}

export function serializeModulesForCompare(modules: Module[]): string {
  return JSON.stringify(
    modules.flatMap((m) =>
      m.id === GENERAL_MODULE_ID
        ? m.fields
        : [{ id: m.id, key_name: m.name, key_value: '', key_type: 'separator' }, ...m.fields]
    ).map((f) => ({ n: f.key_name, v: f.key_value, t: f.key_type }))
  );
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'modulo';
}

export function buildPublishJson(modules: Module[], website: string) {
  const data: { key: string; value: string; type: string }[] = [];
  const mods: Record<string, { label: string; fields: { key: string; value: string; type: string }[] }> = {};

  const extract = (m: Module) =>
    m.fields
      .filter((f) => f.key_name.trim())
      .map((f) => ({ key: f.key_name.trim(), value: f.key_value, type: f.key_type }));

  const general = modules.find((m) => m.id === GENERAL_MODULE_ID);
  if (general) {
    const fields = extract(general);
    data.push(...fields);
    if (fields.length > 0) {
      mods['general'] = { label: 'General', fields };
    }
  }

  for (const m of modules) {
    if (m.id === GENERAL_MODULE_ID) continue;
    const fields = extract(m);
    data.push(...fields);
    const base = slugify(m.name || 'Módulo');
    let slug = base;
    let i = 2;
    while (mods[slug]) {
      slug = `${base}-${i}`;
      i += 1;
    }
    mods[slug] = { label: m.name || 'Módulo', fields };
  }

  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const published_at = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  return {
    website,
    published_at,
    total_fields: data.length,
    data,
    modules: mods,
  };
}
