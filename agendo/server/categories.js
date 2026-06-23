export const CATEGORY_COLOR_PALETTE = [
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#eab308',
  '#6366f1',
];

export const DEFAULT_CATEGORIES = [
  { value: 'pessoal', label: 'Pessoal', color: '#3b82f6' },
  { value: 'saude', label: 'Saúde', color: '#22c55e' },
  { value: 'academico', label: 'Acadêmico', color: '#a855f7' },
  { value: 'profissional', label: 'Profissional', color: '#f97316' },
];

export function slugifyCategory(name) {
  const base = String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'categoria';
}

export function defaultCategoryValues() {
  return new Set(DEFAULT_CATEGORIES.map((c) => c.value));
}

export function pickCategoryColor(usedColors) {
  const used = new Set(usedColors.filter(Boolean));
  for (const color of CATEGORY_COLOR_PALETTE) {
    if (!used.has(color)) return color;
  }
  return CATEGORY_COLOR_PALETTE[used.size % CATEGORY_COLOR_PALETTE.length];
}
