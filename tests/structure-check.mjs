import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const html = fs.readFileSync("index.html", "utf8");
const localScriptPaths = [...html.matchAll(/<script\\b[^>]*\\bsrc=["']([^"']+)["']/gi)]
  .map(match => match[1])
  .filter(src => !/^https?:\\/\\//i.test(src) && !src.startsWith("//"));
const localStyles = [...html.matchAll(/<link\\b[^>]*\\bhref=["']([^"']+\\.css)["']/gi)]
  .map(match => match[1])
  .filter(src => !/^https?:\\/\\//i.test(src) && !src.startsWith("//"));

for (const asset of [...localScriptPaths, ...localStyles]) {
  assert.ok(fs.existsSync(path.resolve(asset)), `Missing local asset: ${asset}`);
}

const requiredOrder = [
  "assets/js/admin/size-guide.js",
  "assets/js/app.js",
  "assets/js/admin/media-manager.js",
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

assert.ok(html.includes('href="assets/css/product-information.css"'));
assert.ok(html.includes('href="assets/css/product-undo.css"'));
assert.ok(html.includes('href="assets/css/product-taxonomy.css"'));
assert.ok(html.includes('href="assets/css/home-category-strip.css"'));

const app = fs.readFileSync("assets/js/app.js", "utf8");
const sizeModule = fs.readFileSync("assets/js/admin/size-guide.js", "utf8");
const mediaModule = fs.readFileSync("assets/js/admin/media-manager.js", "utf8");
const saveModule = fs.readFileSync("assets/js/integrations/supabase-save.js", "utf8");

assert.ok(!app.includes("function sizeMatrix("), "Size Guide should not be defined in app.js");
assert.ok(sizeModule.includes("function sizeMatrix("), "Size Guide module missing its entry function");
assert.ok(!app.includes("function compressAndConvertImage("), "Image compression should not be defined in app.js");
assert.ok(mediaModule.includes("function compressAndConvertImage("), "Media module missing image compression");
assert.ok(!app.includes("async function saveChangesToStorage("), "Supabase persistence should not be defined in app.js");
assert.ok(saveModule.includes("async function saveChangesToStorage("), "Supabase persistence module missing save function");

console.log(`Structure checks passed: ${localScriptPaths.length} local scripts and ${localStyles.length} local stylesheets.`);
