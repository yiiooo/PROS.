# PROS Architecture Notes

## Entry point

- `index.html` is the static entry point.
- `data.json` mirrors the embedded seed data and is used as the optional static fallback when no browser-local copy exists.
- `_headers` defines baseline security response headers for Cloudflare Pages.
- Product seed data remains in `<script type="application/json" id="pdata">`; it is data, not executable inline JavaScript.
- Stylesheets live under `assets/css/`.
- JavaScript is loaded as ordered classic scripts to preserve the existing global-function integration while the app is being modularized.

## CSS ownership

- `site.css`: global tokens, layout, shared components and responsive foundations.
- `product-photo-tools.css`: photo drop zone, reorder and crop-related UI.
- `product-information.css`: customer-facing product information and admin editor.
- `product-undo.css`: Undo/Redo toolbar.
- `product-taxonomy.css`: category, shop and taxonomy UI.
- `home-category-strip.css`: homepage category strip.
- `desktop-ui-polish.css`: desktop-only interaction and presentation polish.

## JavaScript ownership

### Storefront

- `assets/js/storefront/catalog.js`: collection, home, category-filter and cart rendering.
- `assets/js/storefront/product-detail.js`: product detail view and video thumbnail preparation.
- `assets/js/storefront/site-content.js`: hero, banner, social links and gallery rendering.

### Admin

- `assets/js/admin/size-guide.js`: size chart parsing, serialization and table editing.
- `assets/js/admin/dashboard.js`: admin dashboard rendering, field helpers and About photo rendering.
- `assets/js/admin/media-manager.js`: image compression, media upload handling and cropper workflow.
- `assets/js/admin/product-color-variants.js`: product color variant editor and eyedropper support.

### Integrations and remaining application core

- `assets/js/integrations/supabase-save.js`: saving product/catalog/settings data and uploading video/GIF data URLs to Supabase Storage.
- `assets/js/supabase.js`: Supabase client initialization and remote data loading.
- `assets/js/app.js`: shared state initialization, core helpers, navigation, event orchestration, admin entry/auth flow and application bootstrap.
- `product-information.js`, `product-undo.js`, `product-photo-tools.js`, and `product-taxonomy.js`: isolated feature add-ons retained as separate modules.
- Product Information copy controls serialize table rows to plain text (`Label: Value`); HTML table markup is never copied.

## Script order contract

1. Storefront modules that define render functions are loaded before `app.js`.
2. Size Guide loads before the admin dashboard because the dashboard registers the Size Guide action handler.
3. Admin dashboard loads before `app.js`; it defines functions that are invoked only after app state is initialized.
4. Media manager and color-variant admin modules load after `app.js`, because they attach to shared app globals and are used after initial page bootstrap.
5. Product Information, Undo/Redo, Photo Tools and Taxonomy feature scripts load after the core app.
6. Supabase client and persistence adapter load after the core app and Supabase client library.

Do not reorder these tags without updating `tests/structure-check.mjs` and running the browser smoke workflow.

## Quality checks

- `.github/workflows/quality.yml` runs JavaScript syntax checks and static asset/script-order assertions.
- `tests/browser-smoke.cjs` exercises home/category navigation, product detail, cart, admin photo drag-and-drop, crop, Undo and Redo in desktop and mobile Chromium viewports.
- Browser smoke tests use a local static server in CI. The Cloudflare Pages preview is Access-protected and requires an authorized session, so automated CI does not attempt to bypass that access policy.

## Security and release notes

- Admin writes are protected by Supabase RLS policies; public read access is retained for public catalog content.
- Upload validation is performed client-side for accepted MIME types and file size. Server-side/storage policy remains the authoritative boundary.
- Supabase advisor findings still require owner review: leaked-password protection is not enabled, and performance advisors report missing foreign-key indexes plus redundant/optimizable policies.
- Database/schema changes and production deployment are intentionally not performed by this refactor branch.
