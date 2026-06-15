// Public links used across the landing site.
//
// MINTLIFY_DOCS_URL must point at the deployed Mintlify docs. It is read from
// the VITE_MINTLIFY_DOCS_URL environment variable at build time (set it in the
// Vercel project settings). Until the real docs URL is known, it falls back to
// the placeholder below — REPLACE THIS BEFORE PRODUCTION.
export const MINTLIFY_DOCS_URL: string =
  import.meta.env.VITE_MINTLIFY_DOCS_URL || "https://traceguard.mintlify.app";

export const GITHUB_REPO = "https://github.com/TaxCollector23/TraceGuard";
export const RAW_BASE =
  "https://raw.githubusercontent.com/TaxCollector23/TraceGuard/main";
