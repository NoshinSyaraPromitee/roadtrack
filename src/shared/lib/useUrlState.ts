import { useSearchParams } from 'react-router-dom';

/**
 * A screen choice (like the open tab) kept in the page address, so the phone's back button
 * and our own back button both step back through the screens the person opened.
 */
export function useUrlState<T extends string>(key: string, initial: T, allowed: readonly T[]) {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key) as T | null;
  const value = raw && allowed.includes(raw) ? raw : initial;
  const set = (next: T) => {
    if (next === value) return;
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next === initial) p.delete(key);
      else p.set(key, next);
      return p;
    });
  };
  return [value, set] as const;
}
