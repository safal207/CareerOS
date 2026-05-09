interface ViteImportMeta {
  env?: {
    VITE_API_BASE_URL?: string;
  };
}

export function apiUrl(path: string): string {
  const baseUrl = getApiBaseUrl().trim().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return baseUrl.length > 0 ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

function getApiBaseUrl(): string {
  const viteValue = (import.meta as ViteImportMeta).env?.VITE_API_BASE_URL;
  if (viteValue) return viteValue;

  return process.env.VITE_API_BASE_URL ?? "";
}
