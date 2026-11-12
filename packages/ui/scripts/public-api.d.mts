export type PublicApi = Record<string, { values: string[]; types: string[] }>;
export function entryPoints(pkgDir?: string): Record<string, string>;
export function publicApi(pkgDir?: string): PublicApi;
