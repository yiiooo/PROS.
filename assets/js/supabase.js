
(function () {
  "use strict";
  var SUPABASE_URL = "https://omhacqihlssvgleupyxq.supabase.co";
  var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5B0jCUOUeK_MeeJonGa_8w_1GKBXr4F";
  if (!window.supabase || !window.supabase.createClient) {
    console.warn("PROS: Supabase client could not load; using local fallback.");
    return;
  }
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  window.prosSupabase = sb;
  function mapProduct(row) {
    return {
      id: row.id, name: row.name || "", cat: row.cat || "T-Shirt",
      sty: row.sty || "", tone: row.tone || "", price: Number(row.price || 0),
      imgs: Array.isArray(row.imgs) ? row.imgs : [],
      vids: Array.isArray(row.vids) ? row.vids : [],
      buyLinks: Array.isArray(row.buy_links) ? row.buy_links : [],
      isNew: !!row.is_new, added: Number(row.added || 0), best: !!row.best,
      hl: row.highlight || "", size: row.size_guide || "", spec: row.specs || "",
      desc: row.description || ""
    };
  }
  async function loadProsFromSupabase() {
    try {
      var results = await Promise.all([
        sb.from("products").select("*").order("id", {ascending:true}),
        sb.from("collections").select("*").order("id", {ascending:true}),
        sb.from("site_settings").select("key,value")
      ]);
      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      if (results[2].error) throw results[2].error;
      var products = results[0].data || [];
      if (!products.length) throw new Error("Supabase returned no products");
      var settings = {};
      (results[2].data || []).forEach(function (row) { settings[row.key] = row.value; });
      var next = {
        products: products.map(mapProduct),
        collections: (results[1].data || []).map(function (c) {
          return {id:c.id, name:c.name || "", desc:c.description || "", src:c.src || "",
            productIds:Array.isArray(c.product_ids) ? c.product_ids : []};
        }),
        banner: settings.banner || (DB && DB.banner) || {src:""},
        heroBanner: settings.heroBanner || (DB && DB.heroBanner) || {src:""},
        catImages: settings.catImages || (DB && DB.catImages) || {},
        social: settings.social || (DB && DB.social) || {links:[]},
        gv: settings.gv || (DB && DB.gv) || [],
        gp: settings.gp || (DB && DB.gp) || [],
        ev: settings.ev || (DB && DB.ev) || [],
        aboutPhotos: settings.aboutPhotos || (DB && DB.aboutPhotos) || {},
        meta: settings.meta || (DB && DB.meta) || {},
        productColorVariants: settings.productColorVariants || (DB && DB.productColorVariants) || {},
        productInformation: settings.productInformation || (DB && DB.productInformation) || {},
         productTaxonomy: settings.productTaxonomy || (DB && DB.productTaxonomy) || {}
      };
      if(window.prosProductInformationAttach)window.prosProductInformationAttach(next.productInformation,next.products);
       if(window.prosTaxonomyAttach)window.prosTaxonomyAttach(next.productTaxonomy,next.products);
      if (settings.meta && typeof settings.meta === "object") {
        Object.keys(settings.meta).forEach(function (key) {
          if (!Object.prototype.hasOwnProperty.call(next, key)) next[key] = settings.meta[key];
        });
      }
      DB = next;
      P = DB.products;
      try { if (typeof W !== "undefined" && W) W = JSON.parse(JSON.stringify(DB)); } catch (_) {}
      if (typeof renderHeroBanner === "function") renderHeroBanner();
      if (typeof renderBanner === "function") renderBanner();
      if (typeof renderGal === "function") renderGal();
      if (typeof renderHome === "function") renderHome();
      if (typeof renderCat === "function") renderCat();
      if (typeof renderCart === "function") renderCart();
      if (typeof renderCollections === "function") renderCollections();
      if (typeof renderMenuSoc === "function") renderMenuSoc();
      if (typeof renderAboutPhotos === "function") renderAboutPhotos();
      if (window.prosTaxonomyRefresh) window.prosTaxonomyRefresh();
      console.info("PROS: catalogue loaded from Supabase.");
    } catch (err) {
      console.warn("PROS: Could not load Supabase catalogue; local fallback remains active.", err);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadProsFromSupabase);
  } else {
    loadProsFromSupabase();
  }
})();
