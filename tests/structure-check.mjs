import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const html = fs.readFileSync("index.html", "utf8");
assert.equal((html.match(/<style\b/gi) || []).length, 0, "index.html should not contain style blocks");
const inlineExecutableScripts = [...html.matchAll(/<script\b([^>]*)>/gi)]
  .filter(match => !/\bsrc\s*=/.test(match[1]) && !/type\s*=\s*["']application\/json["']/i.test(match[1]));
assert.equal(inlineExecutableScripts.length, 0, "index.html should not contain executable inline scripts");
const localScriptPaths = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
  .map(match => match[1])
  .filter(src => !/^https?:\/\//i.test(src) && !src.startsWith("//"));
const localStyles = [...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.css)["']/gi)]
  .map(match => match[1])
  .filter(src => !/^https?:\/\//i.test(src) && !src.startsWith("//"));

for (const asset of [...localScriptPaths, ...localStyles]) {
  assert.ok(fs.existsSync(path.resolve(asset)), `Missing local asset: ${asset}`);
}

const requiredOrder = [
  "assets/js/storefront/catalog.js",
  "assets/js/storefront/product-detail.js",
  "assets/js/storefront/site-content.js",
  "assets/js/admin/size-guide.js",
  "assets/js/admin/dashboard.js",
  "assets/js/app.js",
  "assets/js/admin/media-manager.js",
  "assets/js/admin/product-color-variants.js",
  "assets/js/supabase.js",
  "assets/js/integrations/supabase-save.js"
];
let previous = -1;
for (const src of requiredOrder) {
  const index = html.indexOf(`src="${src}"`);
  assert.ok(index >= 0, `Missing required script: ${src}`);
  assert.ok(index > previous, `Unexpected script load order at: ${src}`);
  previous = index;
}

for (const stylesheet of [
  "product-information.css",
  "product-undo.css",
  "product-taxonomy.css",
  "home-category-strip.css"
]) {
  assert.ok(html.includes(`href="assets/css/${stylesheet}"`), `Missing stylesheet: ${stylesheet}`);
}

const app = fs.readFileSync("assets/js/app.js", "utf8");
const photoTools = fs.readFileSync("product-photo-tools.js", "utf8");
const productInformation = fs.readFileSync("product-information.js", "utf8");
const sizeModule = fs.readFileSync("assets/js/admin/size-guide.js", "utf8");
const mediaModule = fs.readFileSync("assets/js/admin/media-manager.js", "utf8");
const saveModule = fs.readFileSync("assets/js/integrations/supabase-save.js", "utf8");
const colorModule = fs.readFileSync("assets/js/admin/product-color-variants.js", "utf8");
const catalogModule = fs.readFileSync("assets/js/storefront/catalog.js", "utf8");
const detailModule = fs.readFileSync("assets/js/storefront/product-detail.js", "utf8");
const siteContentModule = fs.readFileSync("assets/js/storefront/site-content.js", "utf8");
const dashboardModule = fs.readFileSync("assets/js/admin/dashboard.js", "utf8");

assert.ok(!app.includes("function sizeMatrix("), "Size Guide should not be defined in app.js");
assert.ok(sizeModule.includes("function sizeMatrix("), "Size Guide module missing its entry function");
assert.ok(!app.includes("function compressAndConvertImage("), "Image compression should not be defined in app.js");
assert.ok(mediaModule.includes("function compressAndConvertImage("), "Media module missing image compression");
assert.ok(mediaModule.includes("image/webp") && mediaModule.includes("video/mp4"), "Media module missing upload MIME validation");
assert.ok(mediaModule.includes("20*1024*1024") && mediaModule.includes("100*1024*1024"), "Media module missing upload size limits");
assert.ok(mediaModule.includes("reader.onerror") && mediaModule.includes("img.onerror"), "Media module missing read/decode error handling");
assert.ok(photoTools.includes("image/webp") && photoTools.includes("20*1024*1024"), "Photo tools must validate files before opening undo state");
assert.ok(app.includes("if(searchRow)"), "Optional search row must be null-safe");
assert.ok(productInformation.includes("function panelPlainText(") && productInformation.includes("function copyPlainText("), "Product Information copy must generate plain text");
assert.ok(productInformation.includes("data-pros-info-copy"), "Product Information panels must expose the copy control");
assert.ok(!app.includes("async function saveChangesToStorage("), "Supabase persistence should not be defined in app.js");
assert.ok(saveModule.includes("async function saveChangesToStorage("), "Supabase persistence module missing save function");
assert.ok(!app.includes("function colorVariantAdminHtml("), "Color variant renderer should not be defined in app.js");
assert.ok(!app.includes("function renderCat(") && catalogModule.includes("function renderCat("), "Catalog renderer extraction failed");
assert.ok(!catalogModule.includes("var LEFT=") && catalogModule.includes("concat(CN).map(chip)"), "Category constants must resolve after app initialization");
assert.ok(!app.includes("function open_(") && detailModule.includes("function open_("), "Product detail extraction failed");
assert.ok(!app.includes("function renderHeroBanner(") && siteContentModule.includes("function renderHeroBanner("), "Site content extraction failed");
assert.ok(!app.includes("function renderAd(") && dashboardModule.includes("function renderAd("), "Admin dashboard extraction failed");
assert.ok(!app.includes("function renderAboutPhotos(") && dashboardModule.includes("function renderAboutPhotos("), "About photo renderer extraction failed");
assert.ok(colorModule.includes("function colorVariantAdminHtml("), "Color variant module missing its renderer");

console.log(`Structure checks passed: ${localScriptPaths.length} local scripts and ${localStyles.length} local stylesheets.`);
