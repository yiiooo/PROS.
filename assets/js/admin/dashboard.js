/* PROS admin dashboard rendering and field helpers.
 * Depends on shared classic-script globals initialized by app.js at runtime.
 */
function pth(o,p){var k=p.split(".");for(var i=0;i<k.length-1;i++)o=o[k[i]];return[o,k[k.length-1]]}
function fld(l,p,ta){var r=pth(W,p),v=esc(r[0][r[1]]);return '<label class="fl">'+l+'</label>'+(ta?'<textarea rows="3" data-f="'+p+'">'+v+'</textarea>':'<input class="in2" data-f="'+p+'" value="'+v+'">')}
function chk(l,p){var r=pth(W,p);return '<label class="cb"><input type="checkbox" data-c="'+p+'"'+(r[0][r[1]]?' checked':'')+'> '+l+'</label>'}
function tl(p){var r=pth(W,p),vd=p=="gv"||p.slice(-4)=="vids";return r[0][r[1]].map(function(u,i){var isVid=vd||u.match(/\.mp4($|\?)/i);return '<div class="th2"'+(p.slice(-4)==="imgs"?' draggable="true" data-product-image-item="'+p+'|'+i+'" title="Drag to reorder"':'')+' style="background:url(\''+u+'\') center/cover">'+(isVid?'<video src="'+u+'" muted></video><span>▶</span>':'')+'<button data-ar="'+p+'|'+i+'">✕</button></div>'}).join("")}
function upl(p,acc,max){return '<div><label class="pill up">+ Add<input type="file" class="fi" multiple accept="'+acc+'" data-up="'+p+'" data-max="'+(max||99)+'"></label></div>'+'<div style="display:flex;gap:8px;margin-top:8px;align-items:center"><input class="in2" placeholder="or paste link https://..." style="flex:1;min-width:0"><button class="pill addlink-btn" data-p="'+p+'" data-max="'+(max||99)+'" style="flex:none">Tambah link</button></div>'}
function msg(t){var m=$("adm");if(m)m.textContent=t}
function done(p){return p.imgs.length>0&&p.buyLinks&&p.buyLinks.some(function(l){return l.active&&l.url})}
function row(p, index){
 var i=W.products.indexOf(p);
 var codeNum = String(index + 1).padStart(2, '0');
 var hasLink = p.buyLinks && p.buyLinks.some(function(l){return l.active&&l.url});
 return '<div class="arow"><div class="athumb" style="background:'+pic(p,0)+'"></div><div style="flex:1;min-width:0"><b>['+codeNum+'] '+esc(p.name)+'</b><div class="mu">'+esc(p.sty)+(p.isNew?" · New":"")+(p.best?" · Best seller":"")+'</div><div>'+[[p.imgs.length>0,"Photo"],[hasLink,"Buy Links"]].map(function(x){return '<span class="tg'+(x[0]?'':' no')+'">'+x[1]+'</span>'}).join("")+'</div></div><button class="chip" data-ae="'+i+'">Edit</button><button class="rm" data-ad="'+i+'">'+(A.del==i?"Delete?":"✕")+'</button></div>'}
function renderList(){
 var q=A.q.toLowerCase();
 var list=W.products.filter(function(p, index){
  var codeNum = String(index + 1).padStart(2, '0');
  var codeNumSimple = String(p.id);
  var targetText = (codeNum + " " + codeNumSimple + " " + p.name + " " + p.cat + " " + p.sty).toLowerCase();
  return (A.pc=="All"||p.cat==A.pc)&&(!A.nf||!done(p))&&(!q||targetText.indexOf(q)>-1);
 });
 var l=$("adl");
 if(l)l.innerHTML='<button class="pill" data-aa="'+A.pc+'" style="width:100%;margin-bottom:12px">'+(A.pc=="All"?"+ Add new product (langsung edit)":"+ Add product in "+A.pc+" (langsung edit)")+'</button>'+(list.length?list.map(function(p){return row(p, W.products.indexOf(p))}).join(""):'<div class="empty">No products found.</div>')
}

// Capture size-chart controls before other admin handlers, including on mobile.
document.addEventListener("click",function(e){
 var t=e.target&&e.target.closest?e.target.closest("[data-size-addrow],[data-size-addcol-right],[data-size-delrow],[data-size-delcol]"):null;
 if(!t)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 var d=t.dataset;
 if(d.sizeAddrow!==undefined)sizeEditAction(d.sizeAddrow,"addrow");
 else if(d.sizeAddcolRight!==undefined)sizeEditAction(d.sizeAddcolRight,"addcol-right");
 else if(d.sizeDelrow!==undefined){var z=d.sizeDelrow.split("|");sizeEditAction(z[0],"delrow",+z[1]);}
 else if(d.sizeDelcol!==undefined){var zc=d.sizeDelcol.split("|");sizeEditAction(zc[0],"delcol",+zc[1]);}
},true);
function renderAd(){
 var h='<div class="tabs">'+[["p","Products"],["c","Collections"],["b","Banner & Hero"],["ap","About Photos"],["s","Social"]].map(function(t){return '<button class="chip'+(A.t==t[0]?' on':'')+'" data-at="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</div>';
 if(A.t=="cats"){
  if(!W.catImages)W.catImages={"Accessories":"","T-Shirt":"","Hoodie":"","Pants":"","All":""};
  h+='<h2>Homepage Category Photo Settings</h2>'+
     '<p class="mu" style="margin-bottom:14px">Upload or change photos for the category boxes on the homepage.</p>';
  var catKeys = ["Accessories", "T-Shirt", "Hoodie", "Pants", "All"];
  catKeys.forEach(function(ck){
   var imgUrl = W.catImages[ck] || "";
   h+='<div class="arow" style="flex-direction:column;align-items:stretch;gap:8px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center"><b>'+ck+' Category</b>'+(imgUrl?'<button class="chip" data-rbcat="'+ck+'">Remove Photo</button>':'')+'</div>'+
      (imgUrl?'<img src="'+imgUrl+'" style="width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-bottom:4px">':'<div class="mu" style="font-size:12px">No custom photo yet (using the default gradient).</div>')+
      '<div><label class="pill up">Choose Photo '+ck+'<input type="file" class="fi" accept="image/*" data-upcat="'+ck+'"></label></div>'+
      '</div>';
  });
 }
 else if(A.t=="ap"){
  if(!W.aboutPhotos)W.aboutPhotos={};
  h+='<h2>About Page Photos</h2><p class="mu" style="margin-bottom:14px">Replace the photos in the About page frames. Select a photo, adjust its position, then save. Photos are compressed automatically. Click Save Changes when finished.</p>';
  APSLOTS.forEach(function(sl){
   var u=W.aboutPhotos[sl.k]||"";
   h+='<div class="arow" style="flex-direction:column;align-items:stretch;gap:8px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>'+sl.l+'</b>'+(u?'<button class="chip" data-rbap="'+sl.k+'">Remove Photo</button>':'')+'</div>'+
      (u?'<img src="'+u+'" style="width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-bottom:4px"><div class="mu" style="font-size:11px">Saved size: '+Math.round(u.length*0.75/1024)+' KB</div>':'<div class="mu" style="font-size:12px">No photo yet (the empty frame will remain visible).</div>')+
      '<div><label class="pill up">'+(u?'Replace':'Choose')+' Photo<input type="file" class="fi" accept="image/*" data-upap="'+sl.k+'"></label></div>'+
      '</div>';
  });
 }
 else if(A.t=="c"){
  if(!W.collections)W.collections=[];
  h+='<h2>Outfit Collections <button class="chip" data-acc>+ Add Set</button></h2>';
  W.collections.forEach(function(col, ci){
   h+='<div class="arow" style="flex-direction:column;align-items:stretch;gap:8px">'+
      '<div style="display:flex;gap:8px;align-items:center"><b style="flex:1">Set #'+(ci+1)+'</b><button class="rm" data-rmcol="'+ci+'">✕ Remove</button></div>'+
      '<input class="in2" data-f="collections.'+ci+'.name" value="'+esc(col.name)+'" placeholder="Set name (e.g. Urban Olive Set)">'+
      '<textarea class="in2" rows="2" data-f="collections.'+ci+'.desc" placeholder="Short set description">'+esc(col.desc)+'</textarea>'+
      '<label class="fl">Outfit Set Photo (1024x1024)</label>'+
      (col.src?'<img src="'+col.src+'" style="width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-bottom:4px">':'')+
      '<div><label class="pill up">Choose Set Photo<input type="file" class="fi" accept="image/*" data-upcol="'+ci+'"></label></div>'+
      '<label class="fl" style="margin-top:8px">Products in this set (enter product IDs, separated by commas):</label>'+
      '<input class="in2" data-f="collections.'+ci+'.productIdsStr" value="'+(col.productIds?col.productIds.join(","):'')+'" placeholder="e.g. 1, 15, 20">'+
      '<div class="mu" style="font-size:11px">Product IDs: '+W.products.map(function(p){return p.id+'='+p.name}).join(", ")+'</div>'+
      '</div>';
  });
 }
 else if(A.t=="b"){
  if(!W.heroBanner)W.heroBanner={src:""};
  h+='<h2 style="margin-top:8px">Hero Frame Banner (Top of Home Page)</h2>'+
  (W.heroBanner.src?'<img src="'+W.heroBanner.src+'" style="width:100%;border-radius:6px;margin-bottom:8px"><div><button class="chip" data-rbhb>Remove Hero Banner</button></div>':'<p class="mu">No custom hero banner yet.</p>')+
  '<div><label class="pill up">'+(W.heroBanner.src?"Replace":"Choose")+" Hero Image (PNG, JPG, GIF)"+'<input type="file" class="fi" accept="image/png,image/jpeg,image/gif" data-uphhb></label></div>'+
  '<h2 style="margin-top:20px">Hero Icons (Social Media / Picture / Watch Video)</h2><p class="mu" style="margin-bottom:14px">Replace the icons in the three hero boxes. Select a photo, adjust its position, then save. Click Save Changes when finished.</p>'+
  [["sm","Social Media"],["pic","Picture"],["vid","Watch Video"]].map(function(sl){var u=(W.heroIcons&&W.heroIcons[sl[0]])||"";return '<div class="arow" style="flex-direction:column;align-items:stretch;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>'+sl[1]+'</b>'+(u?'<button class="chip" data-rbho="'+sl[0]+'">Remove Photo</button>':'')+'</div>'+(u?'<img src="'+u+'" style="width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-bottom:4px"><div class="mu" style="font-size:11px">Saved size: '+Math.round(u.length*0.75/1024)+' KB</div>':'<div class="mu" style="font-size:12px">Belum ada foto (ikon bawaan tetap tampil).</div>')+'<div><label class="pill up">'+(u?'Replace':'Choose')+' Photo<input type="file" class="fi" accept="image/*" data-upho="'+sl[0]+'"></label></div></div>'}).join("")+
  '<h2 style="margin-top:20px">Bottom Home Banner</h2>'+
  (W.banner.src?(W.banner.src.match(/\.mp4($|\?)/i)?'<video src="'+W.banner.src+'" style="width:100%;border-radius:6px;margin-bottom:8px" autoplay muted loop playsinline></video>':'<img src="'+W.banner.src+'" style="width:100%;border-radius:6px;margin-bottom:8px">')+'<div><button class="chip" data-rb>Remove Banner</button></div>':'<p class="mu">No banner yet.</p>')+
  '<div><label class="pill up">'+(W.banner.src?"Replace":"Choose")+' Banner Photo/Video<input type="file" class="fi" accept="image/*,video/*" data-upb></label></div>';
 }
 else if(A.t=="s"){var med=function(arr,p,acc,max,l){return '<h2>'+l+' <span class="mu">'+arr.length+'/'+max+'</span></h2>'+tl(p)+(arr.length<max?upl(p,acc,max):'')+metaRows(p,arr)};
  h+=med(W.gv,"gv","video/*",2,"Videos")+med(W.gp,"gp","image/*",5,"Photos")+'<p class="cn">Videos and photos play right on the page and have no social link.</p><h2>Events and Promos <span class="mu">'+W.ev.length+'</span></h2>'+W.ev.map(function(e,i){return '<div class="arow"><div class="athumb" style="background:url(\''+e.src+'\') center/cover"></div><input class="in2" data-f="ev.'+i+'.cap" value="'+esc(e.cap)+'" placeholder="Event name (optional)"><button class="rm" data-ae2="'+i+'">✕</button></div>'}).join("")+'<div><label class="pill up">+ Add event photos<input type="file" class="fi" multiple accept="image/*" data-upe></label></div>'+menuSocAdmin()+'<h2>Social links</h2>'+W.social.links.map(function(l,i){return '<div class="arow" style="flex-wrap:wrap"><select style="flex:1;width:auto" data-f="social.links.'+i+'.p"><option value="">Choose platform</option>'+Object.keys(PL).map(function(k){return '<option value="'+k+'"'+(l.p==k?' selected':'')+'>'+PL[k]+'</option>'}).join("")+'</select><button class="rm" data-al="'+i+'">✕</button><input class="in2" style="flex:1 1 100%" data-f="social.links.'+i+'.url" value="'+esc(l.url)+'" placeholder="https://..."><input class="in2" style="flex:1 1 100%" data-f="social.links.'+i+'.n" value="'+esc(l.n)+'" placeholder="Name, e.g. @pros.id (optional)"></div>'}).join("")+'<button class="pill" data-ala>+ Add link</button>'}
 else if(A.pi<0)h+='<div class="arow" style="flex-direction:column;align-items:stretch;gap:8px"><b>Price Settings (All Products)</b><div class="mu" style="font-size:12px">Prices are shown for '+W.products.filter(priceOn).length+' of '+W.products.length+' produk.</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="chip" data-pall="on">Turn All Prices ON</button><button class="chip" data-pall="off">Turn All Prices OFF</button></div></div><input class="in2" id="adq" type="search" placeholder="Search products (name or product code/no., e.g. 01)" value="'+esc(A.q)+'"><div class="tabs sc">'+["All"].concat(CATN).map(function(c){return '<button class="chip'+(A.pc==c?' on':'')+'" data-pc="'+c+'">'+c+'</button>'}).join("")+'<button class="chip'+(A.nf?' on':'')+'" data-nf>Needs update</button></div><div id="adl"></div>';
 else{
  var p=W.products[A.pi],b="products."+A.pi+".";
  if(!p.buyLinks) p.buyLinks = [];
  
  var buyLinksHtml = '<h2>Buy / Affiliate Links <button class="chip" data-addbuylink="'+A.pi+'">+ Add Platform</button></h2>';
  p.buyLinks.forEach(function(bl, bli){
   buyLinksHtml += '<div class="arow" style="flex-direction:column;align-items:stretch;gap:6px">'+
      '<div style="display:flex;gap:8px;align-items:center">'+
        '<input class="in2" style="flex:1" data-f="products.'+A.pi+'.buyLinks.'+bli+'.name" value="'+esc(bl.name)+' '+'" placeholder="Button Name (e.g. Buy on Shopee)">'+
        '<button class="rm" data-rmbuylink="'+A.pi+'|'+bli+'">✕</button>'+
      '</div>'+
      '<input class="in2" data-f="products.'+A.pi+'.buyLinks.'+bli+'.url" value="'+esc(bl.url)+'" placeholder="Affiliate URL (https://...)">'+
      '<label class="cb"><input type="checkbox" data-c="products.'+A.pi+'.buyLinks.'+bli+'.active"'+(bl.active?' checked':'')+'> Enable This Button</label>'+
      '<div class="color-hex-row"><label class="fl" style="margin:0">Button color</label><input type="color" data-color-picker="products.'+A.pi+'.buyLinks.'+bli+'.bg" data-f="products.'+A.pi+'.buyLinks.'+bli+'.bg" value="'+(bl.bg||"#2E2B28")+'" style="width:46px;height:36px;padding:2px;border:1px solid var(--ln);border-radius:6px;background:var(--sf)"><input class="in2" aria-label="Kode HEX warna tombol" data-color-hex="products.'+A.pi+'.buyLinks.'+bli+'.bg" value="'+esc(bl.bg||"#2E2B28")+'" placeholder="#2E2B28" spellcheck="false"></div>'+      '<div class="color-hex-row"><label class="fl" style="margin:0">Text color</label><input type="color" data-color-picker="products.'+A.pi+'.buyLinks.'+bli+'.fg" data-f="products.'+A.pi+'.buyLinks.'+bli+'.fg" value="'+(bl.fg||"#FFFFFF")+'" style="width:46px;height:36px;padding:2px;border:1px solid var(--ln);border-radius:6px;background:var(--sf)"><input class="in2" aria-label="Kode HEX warna teks" data-color-hex="products.'+A.pi+'.buyLinks.'+bli+'.fg" value="'+esc(bl.fg||"#FFFFFF")+'" placeholder="#FFFFFF" spellcheck="false"></div>'+
      '</div>';
  });

  h+='<button class="chip" data-ae="-1">‹ Back</button>'+
     fld("Name",b+"name")+
     fld("Price ($)",b+"price")+
     '<label class="cb"><input type="checkbox" data-c="'+b+'showPrice"'+(p.showPrice!==false?' checked':'')+'> Show this product’s price</label>'+
     colorVariantAdminHtml(p,A.pi)+
     buyLinksHtml+
     chk("New release",b+"isNew")+
     chk("Best seller",b+"best")+
     '<label class="fl">Top highlight</label><p class="mu" style="font-size:12px;margin:-6px 0 8px">Format important words with bold, italic, underline, or lists.</p>'+richDescriptionEditor(b+"hl",p.hl||"")+
     '<label class="fl">Size guide</label><p class="mu" style="font-size:12px;margin:-6px 0 8px">Edit the table like a spreadsheet. Press + Add size row to add a size at the bottom (XS, S, M, L, XL, XXL, XXXL, and so on are suggested automatically). The first row contains column names (Size, Chest, Length, etc.); the following rows contain sizes and values. Swipe horizontally to view all columns.</p>'+sizeEditorHtml(p,b)+
     '<label class="fl">Description</label><p class="mu" style="font-size:12px;margin:-6px 0 8px">Format selected text as bold, italic, underline, or lists.</p>'+richDescriptionEditor(b+"desc",p.desc||"")+
     '<h2>Photos / GIFs</h2><div class="pros-product-photo-zone" data-product-photo-zone="'+b+'imgs"><p class="mu" style="font-size:12px;margin:0 0 8px">Tambah foto dengan memilih file, paste gambar dari clipboard, atau drag & drop ke area ini. Seret thumbnail untuk mengubah urutan; foto pertama menjadi foto utama.</p>'+tl(b+"imgs")+upl(b+"imgs","image/*")+'</div>'+
     '<h2>Videos</h2>'+tl(b+"vids")+upl(b+"vids","video/*");
 }
 $("adc").innerHTML=h;if($("adl"))renderList()}

var APSLOTS=[
 {k:"hero",l:"Hero (large top image)",px:1400,kb:220},
 {k:"c1",l:"About Section - Photo 1 (wide)",px:1000,kb:140},
 {k:"c2",l:"About Section - Photo 2",px:1000,kb:140},
 {k:"c3",l:"About Section - Photo 3",px:1000,kb:140},
 {k:"cu1",l:"Culture Section - Photo 1 (wide)",px:1000,kb:140},
 {k:"cu2",l:"Culture Section - Photo 2",px:1000,kb:140},
 {k:"cu3",l:"Culture Section - Photo 3",px:1000,kb:140}
];
function renderAboutPhotos(){
 var ap=(DB&&DB.aboutPhotos)||{};
 document.querySelectorAll("#about .photo-ph[data-slot]").forEach(function(f){
  if(f.dataset.ph===undefined)f.dataset.ph=f.textContent;
  var u=ap[f.dataset.slot];
  if(u){
   f.classList.add("has-img");
   f.innerHTML='<img alt="" loading="lazy" decoding="async">';
   f.firstChild.src=u;
  }else{
   f.classList.remove("has-img");
   f.innerHTML="<span></span>";
   f.firstChild.textContent=f.dataset.ph;
  }
 });
}
