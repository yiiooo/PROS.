(function(){
"use strict";
var DEFAULT_CATEGORIES=["T-Shirts","Hoodies & Sweatshirts","Jackets","Pants","Shorts","Sneakers & Shoes","Headwear","Bags","Jewelry","Eyewear","Shirts & Polos","Long Sleeves","Knitwear","Vests","Tracksuits & Sets","Skirts","Dresses","Socks","Belts & Wallets","Other Accessories"];
var DEFAULT_STYLES=["Oversized Streetwear","Minimalist","Japanese Streetwear","Korean Streetwear","Y2K","Vintage / Retro","Grunge","Punk","Techwear","Gorpcore","Skatewear","Hip-Hop","Athleisure","Luxury Streetwear","Darkwear","Avant-Garde","Military","Workwear","Preppy","Blokecore","Indie Sleaze","Boho Streetwear","Skate Punk","Cyberpunk","Racing / Moto","Americana","90s Streetwear","Urban Outdoor","Artsy Streetwear","Casual Streetwear"];
var DEFAULT_FITS=["Oversized","Relaxed","Regular","Slim Fit","Baggy","Wide Leg"];
var DEFAULT_OCCASIONS=["Daily Wear","Outdoor","Party","Sports","Travel","Casual"];
var state={categories:DEFAULT_CATEGORIES.slice(),styles:DEFAULT_STYLES.slice(),fits:DEFAULT_FITS.slice(),occasions:DEFAULT_OCCASIONS.slice(),products:{}};
function uniq(a){return Array.from(new Set((Array.isArray(a)?a:[]).map(function(x){return String(x||"").trim()}).filter(Boolean)))}
function legacy(p){return {categories:uniq([p.cat]),styles:uniq([p.sty]),fit:"",gender:"Unisex",size:[],color:[],brand:"",material:"",occasions:[],attributes:[]}}
function productTax(p){var t=p.taxonomy&&typeof p.taxonomy==="object"?p.taxonomy:state.products[String(p.id)]||legacy(p);return {categories:uniq(t.categories&&t.categories.length?t.categories:[p.cat]),styles:uniq(t.styles&&t.styles.length?t.styles:[p.sty]),fit:t.fit||"",gender:t.gender||"Unisex",size:uniq(t.size),color:uniq(t.color),brand:t.brand||"",material:t.material||"",occasions:uniq(t.occasions),attributes:uniq(t.attributes)}}
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
   var html='<div class="pros-tax-editor"><h3>Product discovery tags</h3><p class="mu">A product can appear in more than one category and style without duplicating the product.</p><label class="fl">Categories</label><div class="pros-tax-checks">'+state.categories.map(function(x){return '<label><input type="checkbox" data-pros-tax="categories" value="'+esc(x)+'" '+(t.categories.indexOf(x)>-1?'checked':'')+'> '+esc(x)+'</label>'}).join("")+'</div><label class="fl">Styles</label><div class="pros-tax-checks">'+state.styles.map(function(x){return '<label><input type="checkbox" data-pros-tax="styles" value="'+esc(x)+'" '+(t.styles.indexOf(x)>-1?'checked':'')+'> '+esc(x)+'</label>'}).join("")+'</div><label class="fl">Fit</label><select class="in2" data-pros-tax-single="fit"><option value="">Not specified</option>'+state.fits.map(function(x){return '<option '+(t.fit===x?'selected':'')+'>'+esc(x)+'</option>'}).join("")+'</select><label class="fl">Gender</label><select class="in2" data-pros-tax-single="gender">'+["Unisex","Men","Women"].map(function(x){return '<option '+(t.gender===x?'selected':'')+'>'+x+'</option>'}).join("")+'</select><label class="fl">Occasions</label><div class="pros-tax-checks">'+state.occasions.map(function(x){return '<label><input type="checkbox" data-pros-tax="occasions" value="'+esc(x)+'" '+(t.occasions.indexOf(x)>-1?'checked':'')+'> '+esc(x)+'</label>'}).join("")+'</div><label class="fl">Attributes (comma separated)</label><input class="in2" data-pros-tax-attributes value="'+esc(t.attributes.join(", "))+'" placeholder="e.g. Graphic, Washed, Embroidered"></div>';
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
 if(t.matches("[data-pros-tax-attributes]")){var obj3=productTax(p);obj3.attributes=uniq(t.value.split(","));p.taxonomy=obj3;state.products[String(p.id)]=obj3}
 if(t.matches("[data-pros-tax-list]")){state[t.dataset.prosTaxList]=uniq(t.value.split(/\r?\n/));if(typeof window.renderAd==="function")window.renderAd()}
});
document.addEventListener("click",function(e){
 var s=e.target.closest("[data-pros-style]");if(s){goStyle(s.dataset.prosStyle);return}
 if(e.target.closest("[data-pros-viewall-styles]")){var x=document.getElementById("prosAllStyles");if(x)x.hidden=!x.hidden;return}
 var nav=e.target.closest('[data-go="styles"]');if(nav){styleView()}
});
function boot(){
 addStylesUI();installAdmin();styleView();
 if(typeof window.renderAd==="function"){var old=window.renderAd; if(!old.__prosTax)installAdmin()}
}
window.prosTaxonomyAttach=attach;
window.prosTaxonomyBuild=build;
window.prosTaxonomyState=state;
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
