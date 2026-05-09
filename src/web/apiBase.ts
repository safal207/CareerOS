interface ViteImportMeta {
  env?: {
    VITE_API_BASE_URL?: string;
  };
}

export function apiUrl(path: string): string {
  const baseUrl = ((import.meta as ViteImportMeta).env?.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return baseUrl.length > 0 ? `${baseUrl}${normalizedPath}` : normalizedPath;
}
