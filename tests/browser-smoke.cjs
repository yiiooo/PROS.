const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const baseUrl = process.env.PROS_PREVIEW_URL || "http://127.0.0.1:4173/";
const artifactDir = process.env.PROS_ARTIFACT_DIR || "artifacts";

function startStaticServer() {
  const root = process.cwd();
  const securityHeaders = {};
  for (const line of fs.readFileSync(path.join(root, "_headers"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s+([^:]+):\s*(.+)$/);
    if (match) securityHeaders[match[1]] = match[2];
  }
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2"
  };
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname); }
    catch { res.writeHead(400); res.end("Bad request"); return; }
    let file = path.resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403); res.end("Forbidden"); return;
    }
    try {
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    } catch {}
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, { ...securityHeaders, "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(4173, "127.0.0.1", () => resolve(server));
  });
}

async function openPreview(page) {
  let lastError;
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      const response = await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (response && response.ok()) return;
      lastError = new Error("Preview returned HTTP " + (response && response.status()));
    } catch (error) {
      lastError = error;
    }
    await page.waitForTimeout(5000);
  }
  throw lastError || new Error("Preview did not become available");
}

async function testViewport(browser, label, viewport, mobile) {
  const context = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const pageErrors = [];
  const consoleErrors = [];
  const badResponses = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("response", response => { if (response.status() >= 400) badResponses.push({ status: response.status(), url: response.url() }); });
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });

  try {
    await openPreview(page);
    await page.waitForTimeout(2000);
    const diagnostics = await page.evaluate(() => ({
      title: document.title,
      homeCount: document.querySelectorAll("#home").length,
      homeClass: document.querySelector("#home") && document.querySelector("#home").className,
      visibleViews: Array.from(document.querySelectorAll(".view.on")).map(element => element.id),
      navCount: document.querySelectorAll("#nav [data-go]").length,
      bodyText: (document.body && document.body.innerText || "").slice(0, 350)
    }));
    console.log("Browser diagnostics", label, JSON.stringify(diagnostics));
    console.log("Page errors", label, JSON.stringify(pageErrors));
    console.log("Console errors", label, JSON.stringify(consoleErrors));
    console.log("HTTP error responses", label, JSON.stringify(badResponses));
    fs.mkdirSync(artifactDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactDir, "pros-" + label + "-diagnostic.png"), fullPage: true });
    await page.waitForSelector("#home.on", { state: "visible", timeout: 30000 });
    await page.waitForSelector('#nav [data-go="category"]', { state: "visible" });

    await page.locator('#nav [data-go="category"]').click();
    await page.waitForSelector("#category.on", { state: "visible" });

    await page.locator('#nav [data-go="home"]').click();
    await page.waitForSelector("#home.on", { state: "visible" });

    const productLink = page.locator("#best [data-open]").first();
    assert.ok(await productLink.count(), "Expected a product card in Best Sellers");
    const productId = await productLink.getAttribute("data-open");
    await page.evaluate(id => {
      const product = window.DB.products.find(item => String(item.id) === String(id));
      product.info = { style: "Fit | Oversized\nStyle | Streetwear" };
      product.desc = '<custom-wrapper><img src="x" onerror="window.__prosXss = 1"></custom-wrapper><script>window.__prosXss = 2</script>';
      window.__prosXss = 0;
    }, productId);
    await productLink.click();
    await page.waitForSelector("#detail.on", { state: "visible" });
    const unsafeMarkup = await page.evaluate(() => ({
      scriptCount: document.querySelectorAll("#detail script").length,
      eventHandlerCount: document.querySelectorAll("#detail [onerror], #detail [onload], #detail [onclick]").length,
      injectedValue: window.__prosXss
    }));
    assert.equal(unsafeMarkup.scriptCount, 0, "Product description must not inject script elements");
    assert.equal(unsafeMarkup.eventHandlerCount, 0, "Product description must strip event-handler attributes, including inside unsupported wrappers");
    assert.equal(unsafeMarkup.injectedValue, 0, "Untrusted product description must not execute script or event handlers");
    await page.evaluate(() => {
      window.__prosCopiedText = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async text => { window.__prosCopiedText = text; } }
      });
    });
    await page.locator('#detail [data-pros-info-copy="style"]').click();
    await page.waitForFunction(() => typeof window.__prosCopiedText === "string" && window.__prosCopiedText.length > 0);
    const copiedProductInfo = await page.evaluate(() => window.__prosCopiedText);
    assert.ok(copiedProductInfo.includes("Fit: Oversized"), "Copy must include plain-text product information");
    assert.ok(copiedProductInfo.includes("Style: Streetwear"), "Copy must include all text rows");
    assert.ok(!/<\/?(table|tbody|tr|th|td)\b/i.test(copiedProductInfo), "Copy must not include HTML table markup");

    const addButton = page.locator("#detail [data-add]").first();
    assert.ok(await addButton.count(), "Product detail must expose Add to Cart");
    await addButton.click();

    await page.locator("#detail [data-back]").click();
    await page.waitForSelector("#home.on", { state: "visible" });
    await page.locator('#nav [data-go="cart"]').click();
    await page.waitForSelector("#cart.on", { state: "visible" });
    assert.ok(await page.locator("#cartlist .item").count(), "Cart should contain the added product");

    // A signed-in non-admin or failed admin lookup must not retain an authenticated session.
    await page.evaluate(() => {
      window.__prosOriginalSupabase = window.prosSupabase;
      window.__prosSignOutCalls = 0;
      window.prosSupabase = {
        auth: {
          signInWithPassword: async () => ({ data: { user: { id: "smoke-user" } }, error: null }),
          signOut: async () => { window.__prosSignOutCalls += 1; return { error: null }; }
        },
        from: () => ({
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error("Simulated admin lookup failure") }) })
          })
        })
      };
      window.openAL();
      document.getElementById("alid").value = "smoke@example.invalid";
      document.getElementById("alpw").value = "not-a-real-password";
    });
    await page.locator("#alok").click();
    await page.waitForFunction(() => window.__prosSignOutCalls === 1 && document.getElementById("aler").textContent.includes("Simulated admin lookup failure"));
    await page.evaluate(() => { window.prosSupabase = window.__prosOriginalSupabase; delete window.__prosOriginalSupabase; });

    // Exercise the admin photo drag/drop + crop + undo/redo path without changing production data.
    await page.evaluate(() => {
      window.ADMIN = true;
      window.openAd();
    });
    await page.waitForSelector("#ad.on", { state: "visible" });
    await page.locator('#adl [data-ae="0"]').click();
    await page.waitForSelector("#adc .pros-product-photo-zone", { state: "visible" });
    const initialPhotoCount = await page.evaluate(() => window.W.products[0].imgs.length);

    await page.locator(".pros-product-photo-zone").evaluate(zone => {
      const raw = atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=");
      const bytes = Uint8Array.from(raw, char => char.charCodeAt(0));
      const file = new File([new Blob([bytes], { type: "image/png" })], "pros-smoke.png", { type: "image/png" });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      zone.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      zone.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
    });
    await page.waitForSelector("#cropModal.on", { state: "visible", timeout: 20000 });
    await page.locator("#cropSave").click();
    await page.waitForTimeout(1500);
    const cropDiagnostics = await page.evaluate(() => ({
      imageCount: window.W && window.W.products && window.W.products[0] && window.W.products[0].imgs ? window.W.products[0].imgs.length : null,
      cropTarget: window.cropTarget,
      cropQueue: window.cropFilesQueue && window.cropFilesQueue.length,
      cropModalClass: document.getElementById("cropModal") && document.getElementById("cropModal").className,
      cropImageSrc: document.getElementById("cropImg") && String(document.getElementById("cropImg").src).slice(0, 35),
      cropImageWidth: document.getElementById("cropImg") && document.getElementById("cropImg").naturalWidth,
      toast: document.getElementById("toast") && document.getElementById("toast").textContent
    }));
    console.log("Crop diagnostics", label, JSON.stringify(cropDiagnostics));
    console.log("Page errors after crop", label, JSON.stringify(pageErrors));
    await page.waitForFunction(count => document.querySelectorAll("#adc .pros-product-photo-zone .th2").length === count + 1, initialPhotoCount, { timeout: 20000 });
    await page.waitForSelector("#prosUndo:not(:disabled)", { state: "visible" });
    await page.locator("#prosUndo").click();
    await page.waitForFunction(count => document.querySelectorAll("#adc .pros-product-photo-zone .th2").length === count, initialPhotoCount, { timeout: 10000 });
    await page.locator("#prosRedo").click();
    await page.waitForFunction(count => document.querySelectorAll("#adc .pros-product-photo-zone .th2").length === count + 1, initialPhotoCount, { timeout: 10000 });

    fs.mkdirSync(artifactDir, { recursive: true });
    await page.screenshot({
      path: path.join(artifactDir, "pros-" + label + ".png"),
      fullPage: true
    });

    const cspErrors = consoleErrors.filter(message => message.includes("Content Security Policy") || message.includes("Refused to"));
    assert.deepEqual(cspErrors, [], "CSP violations: " + cspErrors.join(" | "));
    const localHttpErrors = badResponses.filter(response => response.url.startsWith(baseUrl) && response.status >= 400);
    assert.deepEqual(localHttpErrors, [], "Missing local assets: " + JSON.stringify(localHttpErrors));
    assert.deepEqual(pageErrors, [], "Uncaught browser errors: " + pageErrors.join(" | "));
    console.log("Browser smoke passed:", label);
  } finally {
    await context.close();
  }
}

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    await testViewport(browser, "mobile", { width: 390, height: 844 }, true);
    await testViewport(browser, "desktop", { width: 1365, height: 900 }, false);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
