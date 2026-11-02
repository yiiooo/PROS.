(function(){
"use strict";
var DEFAULT_CATEGORIES=["T-Shirts","Hoodies & Sweatshirts","Jackets","Pants","Shorts","Sneakers & Shoes","Headwear","Bags","Jewelry","Eyewear","Shirts & Polos","Long Sleeves","Knitwear","Vests","Tracksuits & Sets","Skirts","Dresses","Socks","Belts & Wallets","Other Accessories"];
var DEFAULT_STYLES=["Oversized Streetwear","Minimalist","Japanese Streetwear","Korean Streetwear","Y2K","Vintage / Retro","Grunge","Punk","Techwear","Gorpcore","Skatewear","Hip-Hop","Athleisure","Luxury Streetwear","Darkwear","Avant-Garde","Military","Workwear","Preppy","Blokecore","Indie Sleaze","Boho Streetwear","Skate Punk","Cyberpunk","Racing / Moto","Americana","90s Streetwear","Urban Outdoor","Artsy Streetwear","Casual Streetwear"];
var DEFAULT_FITS=["Oversized","Relaxed","Regular","Slim Fit","Baggy","Wide Leg"];
var DEFAULT_OCCASIONS=["Daily Wear","Outdoor","Party","Sports","Travel","Casual"];
var state={categories:DEFAULT_CATEGORIES.slice(),styles:DEFAULT_STYLES.slice(),fits:DEFAULT_FITS.slice(),occasions:DEFAULT_OCCASIONS.slice(),products:{}};
function uniq(a){return Array.from(new Set((Array.isArray(a)?a:[]).map(function(x){return String(x||"").trim()}).filter(Boolean)))}
function canonicalCategory(v){var map={"T-Shirt":"T-Shirts","T shirt":"T-Shirts","Hoodie":"Hoodies & Sweatshirts","Sweatshirt":"Hoodies & Sweatshirts","Accessories":"Other Accessories"};return map[v]||v||""}
function legacy(p){return {categories:uniq([canonicalCategory(p.cat)]),styles:uniq([p.sty]),fit:"",gender:"Unisex",size:[],color:[],brand:"",material:"",occasions:[],attributes:[]}}
function productTax(p){var t=p.taxonomy&&typeof p.taxonomy==="object"?p.taxonomy:state.products[String(p.id)]||legacy(p);return {categories:uniq((t.categories&&t.categories.length?t.categories:[p.cat]).map(canonicalCategory)),styles:uniq(t.styles&&t.styles.length?t.styles:[p.sty]),fit:t.fit||"",gender:t.gender||"Unisex",size:uniq(t.size),color:uniq(t.color),brand:t.brand||"",material:t.material||"",occasions:uniq(t.occasions),attributes:uniq(t.attributes)}}
function attach(data,products){
 if(data&&typeof data==="object"){
  state.categories=uniq(data.categories).length?uniq(data.categories):DEFAULT_CATEGORIES.slice();
  state.styles=uniq(data.styles).length?uniq(data.styles):DEFAULT_STYLES.slice();
  state.fits=uniq(data.fits).length?uniq(data.fits):DEFAULT_FITS.slice();
  state.occasions=uniq(data.occasions).length?uniq(data.occasions):DEFAULT_OCCASIONS.slice();
  state.products=data.products&&typeof data.products==="object"?data.products:{};
 }
 (products||[]).forEach(function(p){p.taxonomy=productTax(p);state.products[String(p.id)]=p.taxonomy});
}
function build(products,prior){
 var base=prior&&typeof prior==="object"?prior:{};
 var out={version:1,categories:uniq(state.categories),styles:uniq(state.styles),fits:uniq(state.fits),occasions:uniq(state.occasions),products:{}};
 (products||[]).forEach(function(p){out.products[String(p.id)]=productTax(p)});
 return out;
}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function tags(p){var t=productTax(p);return t.styles}
function hasAny(a,v){return !v||a.indexOf(v)>-1}
function stylesPage(){
 var counts={};(window.P||[]).forEach(function(p){productTax(p).styles.forEach(function(s){counts[s]=(counts[s]||0)+1})});
 var arr=state.styles.filter(function(s){return counts[s]}).sort(function(a,b){return (counts[b]||0)-(counts[a]||0)});
 var top=arr.slice(0,8),rest=arr.slice(8);
 return '<section class="pros-style-discovery"><div class="pros-tax-head"><div><small>FIND YOUR LOOK</small><h2>Discover Your Style</h2><p>Explore streetwear by the look that feels like you.</p></div><button class="chip" data-pros-viewall-styles>View all styles</button></div><div class="pros-style-grid">'+top.map(function(s){return '<button class="pros-style-tile" data-pros-style="'+esc(s)+'"><span>'+esc(s)+'</span><small>'+(counts[s]||0)+' products</small></button>'}).join("")+'</div>'+(rest.length?'<div class="pros-all-styles" id="prosAllStyles" hidden>'+rest.map(function(s){return '<button class="chip" data-pros-style="'+esc(s)+'">'+esc(s)+'</button>'}).join("")+'</div>':'')+'</section>';
}
function styleView(){
 var el=document.getElementById("prosStylesView");if(!el)return;
 var counts={};(window.P||[]).forEach(function(p){productTax(p).styles.forEach(function(s){counts[s]=(counts[s]||0)+1})});
 el.innerHTML='<h2>Explore All Styles</h2><p class="mu">Choose a style to discover matching products.</p><div class="pros-style-grid">'+state.styles.map(function(s){return '<button class="pros-style-tile" data-pros-style="'+esc(s)+'"><span>'+esc(s)+'</span><small>'+(counts[s]||0)+' products</small></button>'}).join("")+'</div><div class="grid" id="prosStyleProducts"></div>';
}
function goStyle(s){
 var view=document.getElementById("prosStylesView"),home=document.getElementById("home");
 if(view){view.classList.add("on");if(home)home.classList.remove("on");document.querySelectorAll(".view").forEach(function(x){if(x!==view)x.classList.remove("on")});}
 var list=(window.P||[]).filter(function(p){return productTax(p).styles.indexOf(s)>-1});
 var out=document.getElementById("prosStyleProducts");if(out)out.innerHTML='<h3>'+esc(s)+'</h3>'+(list.length?list.map(function(p){return window.card(p,window.P.indexOf(p))}).join(""):'<div class="empty">No products in this style yet.</div>');
 window.scrollTo(0,0);
}
function addStylesUI(){
 var main=document.querySelector("main");if(!main||document.getElementById("prosStylesView"))return;
 var section=document.createElement("section");section.className="view";section.id="prosStylesView";main.appendChild(section);
 var header=document.querySelector(".tl");if(header&&!header.querySelector('[data-go="styles"]')){var b=document.createElement("button");b.dataset.go="styles";b.textContent="Styles";header.insertBefore(b,header.querySelector('[data-go="collection"]'))}
 var drawer=document.querySelector(".menu-links");if(drawer&&!drawer.querySelector('[data-go="styles"]')){var b2=document.createElement("button");b2.dataset.go="styles";b2.textContent="Explore Styles";drawer.appendChild(b2)}
 var h=document.getElementById("home");if(h&&!h.querySelector(".pros-style-discovery")){var anchor=h.querySelector("#best");if(anchor)anchor.insertAdjacentHTML("afterend",stylesPage())}
}
function installAdmin(){
 if(typeof window.renderAd!=="function"||window.renderAd.__prosTax)return;
 var old=window.renderAd;
 var wrapped=function(){
  old.apply(this,arguments);
  var ad=document.getElementById("adc");if(!ad)return;
  var A=window.A,W=window.W;if(!A||!W)return;
  var tabs=ad.querySelector(".tabs");
  if(tabs&&!tabs.querySelector('[data-at="taxonomy"]')){var b=document.createElement("button");b.className="chip";b.dataset.at="taxonomy";b.textContent="Categories & Styles";tabs.appendChild(b)}
  if(A.t==="taxonomy"){
   ad.insertAdjacentHTML("beforeend",'<h2>Category & Style Library</h2><p class="mu">One item per line. Keep names consistent so product filters stay clean.</p><label class="fl">Categories</label><textarea class="in2" rows="6" data-pros-tax-list="categories">'+esc(state.categories.join("\n"))+'</textarea><label class="fl">Styles</label><textarea class="in2" rows="7" data-pros-tax-list="styles">'+esc(state.styles.join("\n"))+'</textarea><label class="fl">Fit options</label><textarea class="in2" rows="4" data-pros-tax-list="fits">'+esc(state.fits.join("\n"))+'</textarea><label class="fl">Occasions</label><textarea class="in2" rows="4" data-pros-tax-list="occasions">'+esc(state.occasions.join("\n"))+'</textarea><p class="mu">Product tags are edited individually inside each product.</p>');
  } else if(Number.isInteger(A.pi)&&A.pi>=0&&W.products[A.pi]){
   var p=W.products[A.pi],t=productTax(p),anchor=Array.from(ad.querySelectorAll("select")).find(function(x){return x.dataset.f&&x.dataset.f.endsWith(".sty")});
   var html='<div class="pros-tax-editor"><h3>Product discovery tags</h3><p class="mu">A product can appear in more than one category and style without duplicating the product.</p><label class="fl">Categories</label><div class="pros-tax-checks">'+state.categories.map(function(x){return '<label><input type="checkbox" data-pros-tax="categories" value="'+esc(x)+'" '+(t.categories.indexOf(x)>-1?'checked':'')+'> '+esc(x)+'</label>'}).join("")+'</div><label class="fl">Styles</label><div class="pros-tax-checks">'+state.styles.map(function(x){return '<label><input type="checkbox" data-pros-tax="styles" value="'+esc(x)+'" '+(t.styles.indexOf(x)>-1?'checked':'')+'> '+esc(x)+'</label>'}).join("")+'</div><label class="fl">Fit</label><select class="in2" data-pros-tax-single="fit"><option value="">Not specified</option>'+state.fits.map(function(x){return '<option '+(t.fit===x?'selected':'')+'>'+esc(x)+'</option>'}).join("")+'</select><label class="fl">Gender</label><select class="in2" data-pros-tax-single="gender">'+["Unisex","Men","Women"].map(function(x){return '<option '+(t.gender===x?'selected':'')+'>'+x+'</option>'}).join("")+'</select><label class="fl">Occasions</label><div class="pros-tax-checks">'+state.occasions.map(function(x){return '<label><input type="checkbox" data-pros-tax="occasions" value="'+esc(x)+'" '+(t.occasions.indexOf(x)>-1?'checked':'')+'> '+esc(x)+'</label>'}).join("")+'</div><label class="fl">Size options (comma separated)</label><input class="in2" data-pros-tax-listfield="size" value="'+esc(t.size.join(", "))+'" placeholder="S, M, L, XL, XXL"><label class="fl">Colors (comma separated)</label><input class="in2" data-pros-tax-listfield="color" value="'+esc(t.color.join(", "))+'" placeholder="Black, White, Grey"><label class="fl">Brand</label><input class="in2" data-pros-tax-single="brand" value="'+esc(t.brand)+'" placeholder="Brand name"><label class="fl">Material</label><input class="in2" data-pros-tax-single="material" value="'+esc(t.material)+'" placeholder="Cotton, denim, nylon..."><label class="fl">Attributes (comma separated)</label><input class="in2" data-pros-tax-attributes value="'+esc(t.attributes.join(", "))+'" placeholder="e.g. Graphic, Washed, Embroidered"></div>';
   if(anchor&&anchor.parentNode)anchor.parentNode.insertAdjacentHTML("afterend",html);else ad.insertAdjacentHTML("beforeend",html);
  }
 };
 wrapped.__prosTax=true;window.renderAd=wrapped;
}
function currentProduct(){var A=window.A,W=window.W;return A&&W&&Number.isInteger(A.pi)&&A.pi>=0?W.products[A.pi]:null}
document.addEventListener("change",function(e){
 var t=e.target,p=currentProduct();if(!p)return;
 if(t.matches("[data-pros-tax]")){var key=t.dataset.prosTax,obj=productTax(p);obj[key]=Array.from(document.querySelectorAll('[data-pros-tax="'+key+'"]:checked')).map(function(x){return x.value});p.taxonomy=obj;state.products[String(p.id)]=obj}
 if(t.matches("[data-pros-tax-single]")){var obj2=productTax(p);obj2[t.dataset.prosTaxSingle]=t.value;p.taxonomy=obj2;state.products[String(p.id)]=obj2}
 if(t.matches("[data-pros-tax-listfield]")){var obj4=productTax(p);obj4[t.dataset.prosTaxListfield]=uniq(t.value.split(","));p.taxonomy=obj4;state.products[String(p.id)]=obj4}
 if(t.matches("[data-pros-tax-attributes]")){var obj3=productTax(p);obj3.attributes=uniq(t.value.split(","));p.taxonomy=obj3;state.products[String(p.id)]=obj3}
 if(t.matches("[data-pros-tax-list]")){state[t.dataset.prosTaxList]=uniq(t.value.split(/\r?\n/));if(typeof window.renderAd==="function")window.renderAd()}
});
document.addEventListener("click",function(e){
 var s=e.target.closest("[data-pros-style]");if(s){goStyle(s.dataset.prosStyle);return}
 if(e.target.closest("[data-pros-viewall-styles]")){styleView();var sv=document.getElementById("prosStylesView");if(sv){document.querySelectorAll(".view").forEach(function(v){v.classList.toggle("on",v===sv)});window.scrollTo(0,0)}return}
 var nav=e.target.closest('[data-go="styles"]');if(nav){styleView();var sv=document.getElementById("prosStylesView");if(sv){document.querySelectorAll(".view").forEach(function(x){x.classList.toggle("on",x===sv)});window.scrollTo(0,0)}}
});

var shopState={category:"All",style:"",fit:"",occasion:"",gender:"",size:"",color:"",brand:"",material:"",min:"",max:"",query:""};
function shopMatch(p){var t=productTax(p),q=shopState.query.toLowerCase();return (shopState.category==="All"||t.categories.indexOf(shopState.category)>-1||p.cat===shopState.category)&&(!shopState.style||t.styles.indexOf(shopState.style)>-1)&&(!shopState.fit||t.fit===shopState.fit)&&(!shopState.occasion||t.occasions.indexOf(shopState.occasion)>-1)&&(!shopState.gender||t.gender===shopState.gender||t.gender==="Unisex")&&(!shopState.size||t.size.indexOf(shopState.size)>-1)&&(!shopState.color||t.color.some(function(x){return x.toLowerCase()===shopState.color.toLowerCase()}))&&(!shopState.brand||t.brand.toLowerCase().indexOf(shopState.brand.toLowerCase())>-1)&&(!shopState.material||t.material.toLowerCase().indexOf(shopState.material.toLowerCase())>-1)&&(!shopState.min||Number(p.price||0)>=Number(shopState.min))&&(!shopState.max||Number(p.price||0)<=Number(shopState.max))&&(!q||(p.name+" "+p.cat+" "+p.sty+" "+t.styles.join(" ")).toLowerCase().indexOf(q)>-1)}
function shopView(){var el=document.getElementById("prosShopView");if(!el)return;var products=(window.P||[]).filter(shopMatch);el.innerHTML='<div class="pros-shop-intro"><small>SHOP PROS</small><h1>All Categories</h1><p>Choose the type of product you are looking for. Use Filter & Sort when you want to narrow your choices.</p></div><div class="pros-shop-categories"><button class="chip '+(shopState.category==="All"?"on":"")+'" data-pros-shop-cat="All">All</button>'+state.categories.map(function(c){return '<button class="chip '+(shopState.category===c?"on":"")+'" data-pros-shop-cat="'+esc(c)+'">'+esc(c)+'</button>'}).join("")+'</div><div class="pros-shop-toolbar"><b>'+products.length+' products</b><button class="chip" data-pros-filter-toggle>☷ Filter & Sort</button></div><div id="prosShopFilters" class="pros-shop-filters" hidden><div class="pros-filter-grid">'+[['style','Style',state.styles],['fit','Fit',state.fits],['occasion','Occasion',state.occasions],['gender','Gender',['Men','Women','Unisex']]].map(function(x){return '<label>'+x[1]+'<select data-pros-shop-field="'+x[0]+'"><option value="">Any</option>'+x[2].map(function(v){return '<option '+(shopState[x[0]]===v?"selected":"")+'>'+esc(v)+'</option>'}).join("")+'</select></label>'}).join("")+[['size','Size'],['color','Color'],['brand','Brand'],['material','Material'],['min','Min price'],['max','Max price']].map(function(x){return '<label>'+x[1]+'<input data-pros-shop-field="'+x[0]+'" value="'+esc(shopState[x[0]])+'" placeholder="'+x[1]+'"></label>'}).join("")+'</div><div class="pros-filter-actions"><button class="chip" data-pros-filter-clear>Clear all</button></div></div><label class="pros-shop-search">⌕ <input data-pros-shop-search value="'+esc(shopState.query)+'" placeholder="Search products, styles or keywords"></label><div class="grid">'+(products.length?products.map(function(p){return window.card(p,(window.P||[]).indexOf(p))}).join(""):'<div class="empty" style="grid-column:1/-1">No products match. Try clearing a filter.</div>')+'</div>'}
function installShop(){var main=document.querySelector("main");if(!main)return;if(!document.getElementById("prosShopView")){var v=document.createElement("section");v.className="view";v.id="prosShopView";main.appendChild(v)}if(!document.getElementById("prosStylesView")){var z=document.createElement("section");z.className="view";z.id="prosStylesView";main.appendChild(z)}var h=document.querySelector(".tl");if(h){var catNav=h.querySelector('[data-go="category"]');if(catNav){catNav.dataset.go="shop";catNav.textContent="All Categories"}else if(!h.querySelector('[data-go="shop"]')){var b=document.createElement("button");b.dataset.go="shop";b.textContent="All Categories";h.insertBefore(b,h.querySelector('[data-go="collection"]')||null)}}if(h&&!h.querySelector('[data-go="styles"]')){var b2=document.createElement("button");b2.dataset.go="styles";b2.textContent="Explore Styles";h.appendChild(b2)}var m=document.querySelector(".menu-links");if(m){var mc=m.querySelector('[data-go="category"]');if(mc){mc.dataset.go="shop";mc.textContent="All Categories"}else if(!m.querySelector('[data-go="shop"]')){var x=document.createElement("button");x.dataset.go="shop";x.textContent="All Categories";m.appendChild(x)}}if(m&&!m.querySelector('[data-go="styles"]')){var y=document.createElement("button");y.dataset.go="styles";y.textContent="Explore Styles";m.appendChild(y)}if(!document.getElementById("prosTaxCss")){var css=document.createElement("style");css.id="prosTaxCss";css.textContent='.pros-shop-intro{padding:24px 0}.pros-shop-intro small{letter-spacing:.18em;color:var(--mu)}.pros-shop-intro h1{font:clamp(28px,5vw,46px) Anton,sans-serif;text-transform:uppercase;margin:8px 0}.pros-shop-intro p{color:var(--mu)}.pros-shop-categories{display:flex;gap:8px;overflow:auto;padding:8px 0 16px}.pros-shop-categories .chip{white-space:nowrap}.pros-shop-toolbar{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--ln);padding:14px 0}.pros-shop-filters{padding:14px;border:1px solid var(--ln);border-radius:12px;margin-bottom:14px;background:var(--sf)}.pros-filter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.pros-filter-grid label{display:grid;gap:6px;font-size:12px;color:var(--mu)}.pros-filter-grid input,.pros-filter-grid select{width:100%;min-width:0;padding:10px;border:1px solid var(--ln);border-radius:8px;background:var(--bg);color:var(--tx)}.pros-filter-actions{display:flex;justify-content:flex-end;margin-top:12px}.pros-shop-search{display:flex;gap:8px;align-items:center;padding:0 12px;border:1px solid var(--ln);border-radius:10px;margin:10px 0 18px}.pros-shop-search input{flex:1;min-width:0;border:0;padding:12px;background:transparent;color:var(--tx)}.pros-style-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.pros-style-tile{min-height:108px;border:1px solid var(--ln);border-radius:12px;padding:14px;text-align:left;display:flex;flex-direction:column;justify-content:flex-end;gap:5px;background:linear-gradient(145deg,var(--sf),var(--bg));color:var(--tx);cursor:pointer;font-weight:700}.pros-style-tile:nth-child(4n+2){background:linear-gradient(145deg,#34302d,#777064);color:#fff}.pros-style-tile:nth-child(4n+3){background:linear-gradient(145deg,#24312f,#6e8278);color:#fff}.pros-style-tile:nth-child(4n+4){background:linear-gradient(145deg,#35313d,#81758e);color:#fff}@media(max-width:650px){.pros-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pros-style-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}';document.head.appendChild(css)}shopView();styleView()}
document.addEventListener("click",function(e){var legacyCat=e.target.closest("[data-cat]");if(!legacyCat)return;var raw=legacyCat.dataset.cat;if(!raw)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();shopState.category=raw==="All"?"All":canonicalCategory(raw);shopView();var shop=document.getElementById("prosShopView");if(shop){document.querySelectorAll(".view").forEach(function(v){v.classList.toggle("on",v===shop)});window.scrollTo(0,0)}},true);
document.addEventListener("click",function(e){var c=e.target.closest("[data-pros-shop-cat]");if(c){shopState.category=c.dataset.prosShopCat;shopView();return}if(e.target.closest("[data-pros-filter-toggle]")){var f=document.getElementById("prosShopFilters");if(f)f.hidden=!f.hidden;return}if(e.target.closest("[data-pros-filter-clear]")){Object.keys(shopState).forEach(function(k){shopState[k]=k==="category"?"All":""});shopView();var f=document.getElementById("prosShopFilters");if(f)f.hidden=false;return}var n=e.target.closest('[data-go="shop"]');if(n){shopView();var v=document.getElementById("prosShopView");v.classList.add("on");document.querySelectorAll(".view").forEach(function(x){if(x!==v)x.classList.remove("on")});window.scrollTo(0,0)}});
document.addEventListener("change",function(e){if(e.target.matches("[data-pros-shop-field]")){shopState[e.target.dataset.prosShopField]=e.target.value;shopView();var f=document.getElementById("prosShopFilters");if(f)f.hidden=false}});
document.addEventListener("input",function(e){if(e.target.matches("[data-pros-shop-search]")){shopState.query=e.target.value;shopView();var x=document.querySelector("[data-pros-shop-search]");if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length)}}});

function boot(){
 addStylesUI();installAdmin();installShop();styleView();
 if(typeof window.renderAd==="function"){var old=window.renderAd; if(!old.__prosTax)installAdmin()}
}
window.prosTaxonomyAttach=attach;
window.prosTaxonomyBuild=build;
window.prosTaxonomyState=state;
window.prosTaxonomyRefresh=function(){shopView();styleView();var home=document.getElementById("home"),section=home&&home.querySelector(".pros-style-discovery");if(section)section.outerHTML=stylesPage()};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
