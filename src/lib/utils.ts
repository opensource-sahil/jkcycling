export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateEventId(title: string, date: string) {
  const s = slugify(title);
  const d = date.replace(/[^0-9]/g, '');
  return `${d}-${s}`;
}
