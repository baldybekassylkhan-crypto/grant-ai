/**
 * Static (frontend-only) build, e.g. for GitHub Pages: `npm run build:static`.
 * No server → no accounts and no plan e-mails; everything else works and progress stays in the browser.
 */
export const STATIC = process.env.NEXT_PUBLIC_STATIC === "1";
