/* PROS Supabase persistence adapter.
 * Loaded after the Supabase client and app scripts; uses shared app state and render functions.
 */
async function prosUploadVideoDataUrls(value,sb){
 var uploaded=0;
 var cache=new Map();
 async function visit(v){
  if(typeof v==="string" && /^data:(video\/|image\/gif;)/i.test(v)){
   if(cache.has(v))return cache.get(v);
   var comma=v.indexOf(",");
   if(comma<0)throw new Error("Format data video/GIF tidak valid.");
   var mimeMatch=v.slice(0,comma).match(/^data:([^;,]+)/i);
   var mime=(mimeMatch&&mimeMatch[1]?mimeMatch[1]:"video/mp4").toLowerCase();
   var extMap={"video/mp4":"mp4","video/webm":"webm","video/quicktime":"mov","video/x-m4v":"m4v","video/ogg":"ogv","video/3gpp":"3gp","image/gif":"gif"};
   var ext=extMap[mime]||"mp4";
   var blob=await (await fetch(v)).blob();
   var token=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():(Date.now().toString(36)+"-"+Math.random().toString(36).slice(2));
   var path="videos/"+Date.now()+"-"+token+"."+ext;
   var up=await sb.storage.from("media").upload(path,blob,{contentType:mime,cacheControl:"3600",upsert:false});
   if(up.error)throw new Error("Upload video ke Supabase Storage gagal: "+up.error.message);
   var pub=sb.storage.from("media").getPublicUrl(up.data.path);
   if(!pub||!pub.data||!pub.data.publicUrl)throw new Error("URL publik video tidak tersedia.");
   var url=pub.data.publicUrl;
   cache.set(v,url);uploaded++;
   return url;
  }
  if(Array.isArray(v)){for(var i=0;i<v.length;i++)v[i]=await visit(v[i]);return v;}
  if(v&&typeof v==="object"){for(var k of Object.keys(v))v[k]=await visit(v[k]);}
  return v;
 }
 await visit(value);
 return uploaded;
}

async function saveChangesToStorage(){
 if(!ADMIN || !window.prosSupabase){msg("Supabase Admin is not connected. Please sign in again.");return;}
 var sb=window.prosSupabase;
 try{
  msg("Mengunggah video ke Supabase Storage...");
  var uploadedVideos=await prosUploadVideoDataUrls(W,sb);
  if(uploadedVideos)msg(uploadedVideos+" video/GIF selesai diunggah. Menyimpan data...");
  if(W.collections){W.collections.forEach(function(col){if(col.productIdsStr!==undefined){col.productIds=col.productIdsStr.split(",").map(function(x){return parseInt(x.trim(),10)}).filter(function(n){return !isNaN(n)});delete col.productIdsStr;}});}
  if(!W.heroBanner)W.heroBanner={src:""}; if(!W.heroIcons)W.heroIcons={sm:"",pic:"",vid:""}; if(!W.catImages)W.catImages={}; if(!W.aboutPhotos)W.aboutPhotos={};
  var products=(W.products||[]).map(function(p){return {id:p.id,name:p.name||"",cat:p.cat||"T-Shirt",sty:p.sty||"",tone:p.tone||"",price:Number(p.price||0),imgs:p.imgs||[],vids:p.vids||[],buy_links:p.buyLinks||[],is_new:!!p.isNew,added:Number(p.added||0),best:!!p.best,highlight:p.hl||"",size_guide:p.size||"",specs:p.spec||"",description:p.desc||""};});
  var collections=(W.collections||[]).map(function(c){return {id:c.id,name:c.name||"",description:c.desc||"",src:c.src||"",product_ids:c.productIds||[]};});
  var pr=await sb.from("products").upsert(products,{onConflict:"id"}); if(pr.error)throw pr.error;
  var cr=await sb.from("collections").upsert(collections,{onConflict:"id"}); if(cr.error)throw cr.error;
  W.productInformation=window.prosProductInformationBuild?window.prosProductInformationBuild(W.products):{};
  W.productTaxonomy=window.prosTaxonomyBuild?window.prosTaxonomyBuild(W.products,W.productTaxonomy):W.productTaxonomy||{};
   var settingKeys=["banner","heroBanner","catImages","social","gv","gp","ev","aboutPhotos","meta","productColorVariants","productInformation","productTaxonomy"];
  var settings=settingKeys.filter(function(k){return Object.prototype.hasOwnProperty.call(W,k);}).map(function(k){return {key:k,value:W[k]};});
  if(settings.length){var sr=await sb.from("site_settings").upsert(settings,{onConflict:"key"});if(sr.error)throw sr.error;}
  // Remove rows deleted in the admin panel, but only after successful upserts.
  var keepP=products.map(function(p){return p.id;}); var keepC=collections.map(function(c){return c.id;});
  var oldP=await sb.from("products").select("id");if(oldP.error)throw oldP.error;
  var delP=(oldP.data||[]).filter(function(r){return keepP.indexOf(r.id)===-1;}).map(function(r){return r.id;});
  if(delP.length){var dp=await sb.from("products").delete().in("id",delP);if(dp.error)throw dp.error;}
  var oldC=await sb.from("collections").select("id");if(oldC.error)throw oldC.error;
  var delC=(oldC.data||[]).filter(function(r){return keepC.indexOf(r.id)===-1;}).map(function(r){return r.id;});
  if(delC.length){var dc=await sb.from("collections").delete().in("id",delC);if(dc.error)throw dc.error;}
  DB=JSON.parse(JSON.stringify(W));P=DB.products;
  renderHeroBanner();renderBanner();renderGal();renderHome();renderCat();renderCart();renderCollections();renderMenuSoc();renderAboutPhotos();
  msg("Successfully saved to Supabase."+(uploadedVideos?" "+uploadedVideos+" video/GIF diunggah ke Storage.":""));
 }catch(e){console.error("PROS Supabase save failed",e);msg("Failed to save to Supabase: "+(e.message||"check your login and admin permissions"));}
}
