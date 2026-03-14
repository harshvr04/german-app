// Report webhook URL — read from VITE_REPORT_WEBHOOK_URL env var at build time.
// Set it in a .env file or pass via CLI: VITE_REPORT_WEBHOOK_URL=https://... pnpm build
export const REPORT_WEBHOOK_URL = import.meta.env.VITE_REPORT_WEBHOOK_URL ?? "";
