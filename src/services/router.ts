export type Route =
  | { view: 'dashboard' }
  | { view: 'settings' }
  | { view: 'history' }
  | { view: 'editor'; filename: string }
  | { view: 'executor'; filename: string };

export function parseHash(hash: string): Route {
  const safeDecode = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('edit/')) return { view: 'editor', filename: safeDecode(h.slice(5)) };
  if (h.startsWith('execute/')) return { view: 'executor', filename: safeDecode(h.slice(8)) };
  if (h === 'settings') return { view: 'settings' };
  if (h === 'history') return { view: 'history' };
  return { view: 'dashboard' };
}
