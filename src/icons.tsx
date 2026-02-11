// Lucide icons — https://lucide.dev
// All icons use 24x24 viewBox, stroke-based (except media controls which are filled)

interface P { size?: number }

const s = (sz: number) => ({
  width: sz, height: sz, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor',
  'stroke-width': 2, 'stroke-linecap': 'round' as const, 'stroke-linejoin': 'round' as const,
});

export const ArrowLeft = ({ size = 18 }: P) => (
  <svg {...s(size)}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);

export const X = ({ size = 18 }: P) => (
  <svg {...s(size)}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

export const Pencil = ({ size = 18 }: P) => (
  <svg {...s(size)}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);

export const Play = ({ size = 18 }: P) => (
  <svg {...s(size)} fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);

export const Pause = ({ size = 18 }: P) => (
  <svg {...s(size)} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
);

export const SkipBack = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="19 20 9 12 19 4 19 20" /><rect x="5" y="4" width="3" height="16" /></svg>
);

export const SkipForward = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 4 15 12 5 20 5 4" /><rect x="16" y="4" width="3" height="16" /></svg>
);

export const Delete = ({ size = 18 }: P) => (
  <svg {...s(size)}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

export const Settings = ({ size = 18 }: P) => (
  <svg {...s(size)}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

export const ExternalLink = ({ size = 18 }: P) => (
  <svg {...s(size)}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
);

export const Info = ({ size = 18 }: P) => (
  <svg {...s(size)}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
);

export const RefreshCw = ({ size = 18 }: P) => (
  <svg {...s(size)}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
  </svg>
);
