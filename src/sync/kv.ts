export interface KV {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
}

export class MemoryKV implements KV {
  private data = new Map<string, string>();

  get<T>(key: string): T | null {
    const raw = this.data.get(key);
    return raw === undefined ? null : JSON.parse(raw);
  }

  set<T>(key: string, value: T): void {
    this.data.set(key, JSON.stringify(value));
  }

  delete(key: string): void {
    this.data.delete(key);
  }
}

// Storage may be unavailable (private mode, cleared data): fall back to memory
export class LocalStorageKV implements KV {
  private prefix: string;
  private fallback = new MemoryKV();

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      this.fallback.set(key, value);
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {
      this.fallback.delete(key);
    }
  }
}
