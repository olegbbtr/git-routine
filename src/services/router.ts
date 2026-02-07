export type Route =
  | { view: 'dashboard' }
  | { view: 'settings' }
  | { view: 'history' }
  | { view: 'editor'; filename: string }
  | { view: 'runner'; filename: string };

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
  if (h.startsWith('run/')) return { view: 'runner', filename: safeDecode(h.slice(4)) };
  if (h === 'settings') return { view: 'settings' };
  if (h === 'history') return { view: 'history' };
  return { view: 'dashboard' };
}
