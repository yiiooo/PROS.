const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.PROS_PREVIEW_URL || "https://refactor-extract-feature-css.pros-product-info-preview.pages.dev";
const artifactDir = process.env.PROS_ARTIFACT_DIR || "artifacts";

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
  page.on("pageerror", error => pageErrors.push(error.message));
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
    await productLink.click();
    await page.waitForSelector("#detail.on", { state: "visible" });

    const addButton = page.locator("#detail [data-add]").first();
    assert.ok(await addButton.count(), "Product detail must expose Add to Cart");
    await addButton.click();

    await page.locator('#nav [data-go="cart"]').click();
    await page.waitForSelector("#cart.on", { state: "visible" });
    assert.ok(await page.locator("#cartlist .item").count(), "Cart should contain the added product");

    fs.mkdirSync(artifactDir, { recursive: true });
    await page.screenshot({
      path: path.join(artifactDir, "pros-" + label + ".png"),
      fullPage: true
    });

    assert.deepEqual(pageErrors, [], "Uncaught browser errors: " + pageErrors.join(" | "));
    console.log("Browser smoke passed:", label);
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testViewport(browser, "mobile", { width: 390, height: 844 }, true);
    await testViewport(browser, "desktop", { width: 1365, height: 900 }, false);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
