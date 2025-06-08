import { useState } from "react";

const dataCache = new Map<string, unknown>();

export function useDataLoader<T = unknown>(key: string) {
  const [data, setData] = useState<T | null>(
    (dataCache.get(key) as T | undefined) ?? null
  );
  const handler = () => setData(dataCache.get(key) as T);

  window.addEventListener("dataFetched", handler);

  return data;
}

export async function prefetchData<T = unknown>(
  key: string,
  fn: () => Promise<T>
): Promise<void> {
  const data = await fn();
  dataCache.set(key, data);
  window.dispatchEvent(new Event("dataFetched"));
}
