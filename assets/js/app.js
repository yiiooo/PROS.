
var DB=JSON.parse(localStorage.getItem("pros_db")||document.getElementById("pdata").textContent),P=DB.products;
if(!DB.heroBanner)DB.heroBanner={src:""};
if(!DB.heroIcons)DB.heroIcons={sm:"",pic:"",vid:""};
DB.priceUI="2";
if(!DB.catImages)DB.catImages={"Accessories":"https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=600&q=80","T-Shirt":"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80","Hoodie":"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80","Pants":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80","All":""};
if(!DB.collections)DB.collections=[{id:1,name:"Urban Olive Set",desc:"Earthy-tone look combining a Boxy T-Shirt and Cargo Pants.",src:"",productIds:[1,15,20]}];

// Migrasi otomatis produk lama ke format buyLinks baru jika belum ada
P.forEach(function(p){
 if(!p.buyLinks){
  p.buyLinks = [];
  if(p.amazon) p.buyLinks.push({name:"Buy on Amazon", url:p.amazon, active: p.amazonActive !== false});
  if(p.ebay) p.buyLinks.push({name:"Buy on eBay", url:p.ebay, active: p.ebayActive !== false});
  if(p.buyLinks.length === 0){
   p.buyLinks.push({name:"Buy on Amazon", url:"", active:true});
   p.buyLinks.push({name:"Buy on eBay", url:"", active:true});
  }
  delete p.amazon; delete p.ebay; delete p.amazonActive; delete p.ebayActive;
 }
});

var CATS={"T-Shirt":["Boxy","Oversized","Heavyweight","Longline","Drop-Shoulder","Mock Neck"],"Hoodie":["Pullover","Zip-Up","Half-Zip","Boxy","Oversized","Drop-Shoulder","Sleeveless"],"Pants":["Baggy Jeans","Cargo Wide-Leg","Tactical Cargo","Sweats Open-Bottom","Parachute/Track","Carpenter"],"Accessories":["Dad Hat","Beanie","Bucket Hat","Crossbody Bag","Chest Rig","Chunky Chain","Wallet Chain"]};
var COL={"T-Shirt":["#B9AC98","#8B7C67"],"Hoodie":["#8A8075","#4B453F"],"Pants":["#A89A82","#6F6350"],"Accessories":["#4A4540","#1F1D1B"]};
function bg(c,k){
 if(DB.catImages && DB.catImages[c]) return "url('"+DB.catImages[c]+"') center/cover no-repeat";
 var a=COL[c]||["#6F675D","#1F1D1B"];return "linear-gradient("+(150+(k||0)*40)+"deg,"+a[0]+","+a[1]+")"
}
var CN=["T-Shirts","Hoodies & Sweaters","Jackets","Shirts","Pants","Shorts","Shoes","Headwear","Bags","Accessories","Sets","Skirts & Dresses"];
var cart=[],st={cat:"All",letters:[],az:false,azOpen:false,sty:"",priceRange:"",prev:"home",pid:0};
try{cart=JSON.parse(localStorage.getItem("pros_cart")||"[]")}catch(e){}
var $=function(i){return document.getElementById(i)};
var CI='<svg viewBox="0 0 24 24"><rect x="5" y="9" width="14" height="11" rx="3"/><path d="M9 9V7a3 3 0 016 0v2"/></svg>',CK='<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>';
function gp(i){for(var k=0;k<P.length;k++)if(P[k].id==i)return P[k]}

function metaRows(p,arr){
 if(!W.gmeta)W.gmeta={};
 W.gmeta[p]=W.gmeta[p]||[];
 while(W.gmeta[p].length<arr.length)W.gmeta[p].push({id:"",post:""});
 if(!arr.length)return "";
 return '<p class="cn">ID and post link (optional), enter for each item:</p>'+arr.map(function(u,i){
  var m=W.gmeta[p][i];
  return '<div class="arow" style="flex-direction:column;align-items:stretch;gap:6px;margin-bottom:10px"><b style="font-size:13px">Item '+(i+1)+'</b><input class="in2" data-f="gmeta.'+p+'.'+i+'.id" value="'+esc(m.id)+'" placeholder="ID, e.g. @lyr0072"><input class="in2" data-f="gmeta.'+p+'.'+i+'.post" value="'+esc(m.post)+'" placeholder="Post link, e.g. https://www.instagram.com/reel/..."></div>';
 }).join("");
}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function pic(p,n){var u=p.imgs&&p.imgs[n];return u?"url('"+u+"') center/cover no-repeat":bg(p.cat,n)}
var ART={"T-Shirt": "<svg class=\"art\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><path d=\"M30 18L10 30L18 44L28 38V82H72V38L82 44L90 30L70 18Q50 32 30 18Z\" fill=\"#fff\" fill-opacity=\".92\"/></svg>", "Hoodie": "<svg class=\"art\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><path d=\"M30 22Q50 6 70 22L90 38L82 58L72 50V86H28V50L18 58L10 38Z\" fill=\"#fff\" fill-opacity=\".92\"/><path d=\"M38 24Q50 40 62 24Q50 12 38 24Z\" fill=\"#000\" fill-opacity=\".28\"/><path d=\"M36 62H64L68 78H32Z\" fill=\"#000\" fill-opacity=\".16\"/><path d=\"M45 36V50M55 36V50\" stroke=\"#000\" stroke-opacity=\".3\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>", "Pants": "<svg class=\"art\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><path d=\"M30 10H70L78 90H55L50 44L45 90H22Z\" fill=\"#fff\" fill-opacity=\".92\"/><path d=\"M30 18H70\" stroke=\"#000\" stroke-opacity=\".2\" stroke-width=\"2\"/><rect x=\"31\" y=\"46\" width=\"11\" height=\"14\" rx=\"2\" fill=\"#000\" fill-opacity=\".16\"/><rect x=\"58\" y=\"46\" width=\"11\" height=\"14\" rx=\"2\" fill=\"#000\" fill-opacity=\".16\"/></svg>", "Accessories": "<svg class=\"art\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><path d=\"M20 58Q20 26 52 26Q82 26 82 58Z\" fill=\"#fff\" fill-opacity=\".92\"/><path d=\"M16 60H92Q92 70 66 70H16Z\" fill=\"#fff\" fill-opacity=\".78\"/><circle cx=\"51\" cy=\"25\" r=\"3\" fill=\"#fff\" fill-opacity=\".92\"/></svg>"},SKYS="<svg class=\"sk\" viewBox=\"0 0 400 120\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><g fill=\"#1F1D1B\" fill-opacity=\".26\"><rect x=\"0\" y=\"50\" width=\"34\" height=\"70\"/><rect x=\"40\" y=\"30\" width=\"28\" height=\"90\"/><rect x=\"74\" y=\"60\" width=\"40\" height=\"60\"/><rect x=\"120\" y=\"20\" width=\"26\" height=\"100\"/><rect x=\"152\" y=\"46\" width=\"36\" height=\"74\"/><rect x=\"194\" y=\"34\" width=\"30\" height=\"86\"/><rect x=\"230\" y=\"62\" width=\"40\" height=\"58\"/><rect x=\"276\" y=\"14\" width=\"24\" height=\"106\"/><rect x=\"306\" y=\"44\" width=\"38\" height=\"76\"/><rect x=\"350\" y=\"28\" width=\"50\" height=\"92\"/></g><g fill=\"#1F1D1B\" fill-opacity=\".5\"><rect x=\"12\" y=\"78\" width=\"40\" height=\"42\"/><rect x=\"60\" y=\"66\" width=\"30\" height=\"54\"/><rect x=\"100\" y=\"84\" width=\"44\" height=\"36\"/><rect x=\"152\" y=\"70\" width=\"28\" height=\"50\"/><rect x=\"190\" y=\"88\" width=\"46\" height=\"32\"/><rect x=\"244\" y=\"72\" width=\"32\" height=\"48\"/><rect x=\"286\" y=\"82\" width=\"40\" height=\"38\"/><rect x=\"334\" y=\"64\" width=\"34\" height=\"56\"/></g><g fill=\"#F3EEE6\" fill-opacity=\".55\"><rect x=\"22\" y=\"88\" width=\"4\" height=\"4\"/><rect x=\"34\" y=\"96\" width=\"4\" height=\"4\"/><rect x=\"68\" y=\"76\" width=\"4\" height=\"4\"/><rect x=\"76\" y=\"92\" width=\"4\" height=\"4\"/><rect x=\"112\" y=\"94\" width=\"4\" height=\"4\"/><rect x=\"160\" y=\"82\" width=\"4\" height=\"4\"/><rect x=\"200\" y=\"98\" width=\"4\" height=\"4\"/><rect x=\"254\" y=\"82\" width=\"4\" height=\"4\"/><rect x=\"298\" y=\"92\" width=\"4\" height=\"4\"/><rect x=\"344\" y=\"76\" width=\"4\" height=\"4\"/></g></svg>";
function ltr(p){return p.imgs&&p.imgs.length?"":(ART[p.cat]||"")}
function cnt(p){return p.imgs&&p.imgs.length?p.imgs.length:6}
function sanitizeRichDescription(value){
 var raw=String(value==null?"":value).trim();if(!raw)return "";
 if(!/<\/?(p|br|strong|b|em|i|u|ul|ol|li)\b/i.test(raw))return raw.split(/\r?\n\s*\r?\n/).map(function(x){return "<p>"+esc(x).replace(/\r?\n/g,"<br>")+"</p>"}).join("");
 var doc=new DOMParser().parseFromString(raw,"text/html"),allowed={P:1,BR:1,STRONG:1,B:1,EM:1,I:1,U:1,UL:1,OL:1,LI:1};
 function clean(n){Array.from(n.childNodes).forEach(function(c){if(c.nodeType===1){if(!allowed[c.tagName]){var f=document.createDocumentFragment();while(c.firstChild)f.appendChild(c.firstChild);c.parentNode.replaceChild(f,c)}else{Array.from(c.attributes).forEach(function(a){c.removeAttribute(a.name)});clean(c)}}else if(c.nodeType!==3)c.remove()})}clean(doc.body);return doc.body.innerHTML;
}
function richDescriptionEditor(path,value){var modernFont=/(?:hl|spec|desc)$/.test(path)?" modern-font":"";return '<div class="rich-field"><div class="rich-toolbar" role="toolbar" aria-label="Description formatting"><button type="button" data-rich="bold" title="Bold"><b>B</b></button><button type="button" data-rich="italic" title="Italic"><i>I</i></button><button type="button" data-rich="underline" title="Underline"><u>U</u></button><span></span><button type="button" data-rich="insertUnorderedList" title="Bulleted list">• List</button><button type="button" data-rich="insertOrderedList" title="Numbered list">1. List</button><button type="button" data-rich="removeFormat" title="Clear formatting">Clear</button></div><div class="rich-editor'+modernFont+'" contenteditable="true" data-rich-editor="'+path+'" role="textbox" aria-multiline="true" data-placeholder="Write the product description...">'+sanitizeRichDescription(value)+'</div><div class="mu" style="font-size:11px;margin-top:5px">Select text and use the toolbar to format it. Changes are saved with the product.</div></div>';}
function formatDetailContent(title, value){
 var raw=String(value==null?"":value).replace(/\r\n?/g,"\n").trim();
 if(title==="Size guide" && raw.indexOf("|")>-1){
  var rows=raw.split("\n").map(function(line){return line.trim().replace(/^\|+|\|+$/g,"").split("|").map(function(cell){return cell.trim()})}).filter(function(row){return row.some(function(cell){return cell!==""})});
  if(rows.length>1){
   var head=rows[0], body=rows.slice(1).filter(function(row){return !row.every(function(cell){return /^:?-{3,}:?$/.test(cell)})});
   return '<div class="size-table-wrap"><table class="size-table"><thead><tr>'+head.map(function(cell){return '<th>'+esc(cell)+'</th>'}).join("")+'</tr></thead><tbody>'+body.map(function(row){return '<tr>'+head.map(function(_,i){return '<td>'+esc(row[i]||"")+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>';
  }
 }
 if(!raw)return '<p></p>';
 return sanitizeRichDescription(raw);
}
function det(t,x){var modernFont=(t==="Top highlight"||t==="Product specifications"||t==="Product description")?" modern-font":"";return '<details><summary>'+t+'</summary><div class="detail-copy'+modernFont+'">'+formatDetailContent(t,x)+'</div></details>'}
function card(p, index){
 var codeNum = String((index !== undefined ? index + 1 : p.id)).padStart(2, '0');
 var pPrice = p.price !== undefined ? p.price : 30;
 return '<div class="card"><div class="card-top-info"><span class="card-code">'+codeNum+'</span><div class="card-tags"><span class="card-cat">'+esc(p.cat)+'</span>'+(p.sty?'<span class="card-sty">'+esc(p.sty)+'</span>':'')+'</div></div><div class="th" data-open="'+p.id+'" style="background:'+pic(p,0)+'">'+ltr(p)+'</div><div class="in"><b class="notranslate product-name-anton" translate="no" data-open="'+p.id+'">'+esc(p.name)+'</b>'+priceHtml(p,"")+'<div class="row"><button class="add ic" data-add="'+p.id+'" aria-label="Add to Cart">'+CI+'</button><button class="vw" data-open="'+p.id+'">View</button></div></div></div>';
}
var cur="home";
function prosCurrentNavState(){return {prosNav:true,view:cur,pid:cur==="detail"?st.pid:null,prev:st.prev||"home"};}
function prosPushHistory(view,pid){
 try{
  history.replaceState(prosCurrentNavState(),"",location.href);
  history.pushState({prosNav:true,view:view,pid:pid==null?null:pid,prev:cur},"",location.href);
 }catch(err){console.warn("PROS: browser history state unavailable",err);}
}
try{history.replaceState(prosCurrentNavState(),"",location.href);}catch(err){}
window.addEventListener("popstate",function(event){
 var state=event.state;
 if(!state||!state.prosNav)return;
 if(state.view==="detail"&&state.pid!=null){open_(+state.pid);}
 else {show(state.view||"home",true);}
});

window.addEventListener("scroll", function(){
 if(cur && cur !== "detail") {
  sessionStorage.setItem("pros_scroll_" + cur, window.scrollY);
 }
});

function show(v, restoreScroll){
 if(cur && cur !== "detail") {
  sessionStorage.setItem("pros_scroll_" + cur, window.scrollY);
 }
 var prevView = cur;
 cur=v;
 document.querySelectorAll(".view").forEach(function(x){x.classList.toggle("on",x.id==v)});
 document.querySelectorAll("#nav button").forEach(function(b){b.classList.toggle("on",b.dataset.go==v)});
 document.querySelectorAll(".tl button").forEach(function(b){b.classList.toggle("on",b.dataset.go==v)});
 document.body.classList.toggle("det",v=="detail");
 var searchRow=$("sr");if(searchRow)searchRow.style.display=(v=="home"||v=="category"||v=="results")?"flex":"none";

 if(v=="detail"){
  window.scrollTo(0,0);
 } else if(restoreScroll){
  var savedY = sessionStorage.getItem("pros_scroll_" + v);
  setTimeout(function(){
   window.scrollTo(0, savedY ? parseInt(savedY, 10) : 0);
  }, 20);
 } else {
  var savedY = sessionStorage.getItem("pros_scroll_" + v);
  setTimeout(function(){
   window.scrollTo(0, savedY ? parseInt(savedY, 10) : 0);
  }, 20);
 }
}

var ic={
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
 category:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 collection:'<path d="M4 5h16v14H4z"/><path d="M4 10h16"/>',
 cart:'<rect x="5" y="9" width="14" height="11" rx="3"/><path d="M9 9V7a3 3 0 016 0v2"/>',
 about:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'
};
var lb={home:"Home",category:"Category",collection:"Collections",cart:"Cart",about:"About"};
$("nav").innerHTML=Object.keys(ic).map(function(k){return '<button data-go="'+k+'" aria-label="'+lb[k]+'"><svg viewBox="0 0 24 24">'+ic[k]+'</svg><span>'+lb[k]+'</span>'+(k=="cart"?'<b class="dot" id="dot"></b>':'')+'</button>'}).join("");

document.addEventListener("click",function(e){if(swd){swd=false;return}
 if(e.target.classList&&e.target.classList.contains("sheet")){closeSheet(e.target);return}
 var t=e.target.closest("[data-go],[data-cat],[data-sty],[data-pr],[data-add],[data-buy],[data-rm],[data-open],[data-back],[data-zoom],[data-th],[data-vid],[data-close],[data-lt],[data-azt],[data-azs],[data-mark],[data-gocol],[data-colzoom],[data-color-variant]");if(!t)return;var d=t.dataset;
 if(d.go!==undefined){if($("menuSheet").classList.contains("on"))closeSheet($("menuSheet"));prosPushHistory(d.go,null);if(d.go=="collection")renderCollections();show(d.go, true)}
 else if(d.gocol!==undefined){prosPushHistory("collection",null);renderCollections();show("collection", true)}
 else if(d.colzoom!==undefined){openColZoom(d.colzoom)}
 else if(d.azt!==undefined){st.azOpen=!st.azOpen;renderCat()}
 else if(d.azs!==undefined){st.az=!st.az;renderCat()}
 else if(d.lt!==undefined){if(d.lt==""){st.letters=[]}else{var ix=st.letters.indexOf(d.lt);if(ix>-1)st.letters.splice(ix,1);else st.letters.push(d.lt)}renderCat()}
 else if(d.cat){prosPushHistory("category",null);st.letters=[];st.cat=d.cat;st.sty="";st.priceRange="";renderCat();show("category", true)}
 else if(d.sty!==undefined){st.letters=[];st.sty=d.sty;renderCat()}
 else if(d.pr!==undefined){st.priceRange=d.pr;renderCat()}
 else if(d.add){if(cart.indexOf(+d.add)<0)cart.push(+d.add);renderCart();if(t.classList.contains("ic")){t.innerHTML=CK}else{t.textContent="✓";t.style.fontSize="22px"}}
 else if(d.open){prosPushHistory("detail",+d.open);open_(+d.open)}
 else if(d.back!==undefined){if(history.state&&history.state.prosNav&&history.length>1)history.back();else show(st.prev||"home", true)}
 else if(d.buy){openBuy(+d.buy)}
 else if(d.mark!==undefined){var mi2=bought.indexOf(+d.mark);if(mi2>-1)bought.splice(mi2,1);else bought.push(+d.mark);renderCart()}
 else if(d.rm!==undefined){var ci=cart.indexOf(+d.rm);if(ci>-1)cart.splice(ci,1);var bi=bought.indexOf(+d.rm);if(bi>-1)bought.splice(bi,1);renderCart()}
 else if(d.zoom!==undefined){openZ()}
 else if(d.colorVariant!==undefined){var cp=gp(st.pid),cset=productColorSet(cp),cv=cset[+d.colorVariant];if(cv){setImg(+cv.imageIndex);document.querySelectorAll("[data-color-variant]").forEach(function(btn){btn.setAttribute("aria-pressed",btn.dataset.colorVariant===d.colorVariant?"true":"false")});var cn=$("selectedProductColor");if(cn)cn.textContent=cv.name}}
 else if(d.th!==undefined){setImg(+d.th)}
 else if(d.vid!==undefined){var s=(gp(st.pid).vids||[])[+d.vid];$("vb").innerHTML=(s?'<video src="'+s+'" controls playsinline preload="metadata"></video>':'<div class="ph">No video uploaded yet.<br>The video will appear here in its original aspect ratio.</div>')+'<button class="x" data-close>Close</button>';$("vs").classList.add("on")}
 else if(d.close!==undefined){var s2=t.closest(".sheet");closeSheet(s2)}});



function toggleTheme(){
 var dk=document.documentElement.dataset.theme=="dark";
 document.documentElement.dataset.theme=dk?"light":"dark";
 try{localStorage.setItem("pros_theme", dk?"light":"dark")}catch(e){}
}
$("theme").addEventListener("click",toggleTheme);
$("themeDesktop").addEventListener("click",toggleTheme);

try{
 var savedTheme = localStorage.getItem("pros_theme");
 if(savedTheme) document.documentElement.dataset.theme = savedTheme;
}catch(e){}

function openMenuSheet() {
 $("menuSheet").classList.add("on");
 document.body.style.overflow = "hidden";
}
function closeSheet(sheet) {
 if(!sheet) return;
 sheet.classList.remove("on");
 var vid=sheet.querySelector("video");
 if(vid) vid.pause();
 // Restore page scrolling after closing the drawer/modal.
 if(!document.querySelector(".sheet.on, .zv.on, .ad.on, .cropper-modal.on")) {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
 }
}
$("burgerBtn").addEventListener("click", openMenuSheet);
$("desktopBurgerBtn").addEventListener("click", openMenuSheet);

function setLinks(p){
 var container = $("dynamic-buy-links");
 var links = p.buyLinks || [];
 
 var activeLinks = links.filter(function(l){ return l.active && l.url && l.url.trim() !== ""; });
 
 var h = "";
 if(activeLinks.length === 0){
  h = '<div style="text-align:center; padding:15px; font-weight:700; color:var(--mu); font-size:16px;">(Coming Soon)</div>';
 } else {
  activeLinks.forEach(function(l){
   var cs = (l.bg||l.fg) ? ' style="background:'+esc(l.bg||"#2E2B28")+';color:'+esc(l.fg||"#FFFFFF")+'"' : '';
   h += '<a class="buy-btn-custom" href="'+esc(l.url)+'" target="_blank" rel="noopener sponsored"'+cs+'>'+esc(l.name || "Buy Product")+'</a>';
  });
 }
 container.innerHTML = h;
}

function openBuy(id){
 var bp=gp(id);
 $("sn").textContent=bp.name;
 var pPrice = bp.price !== undefined ? bp.price : 30;
 $("buy-price-note").textContent = priceOn(bp) ? "The price shown is $" + pPrice + " and is only an estimate. Each marketplace may change its price at any time." : "";
 $("buy-price-note").style.display = priceOn(bp) ? "" : "none";
 setLinks(bp);
 $("sheet").classList.add("on");
}
var Z={s:1,x:0,y:0},zp={},zg=null,zsw=null,zpin=false;
function zc(v,a,b){return Math.max(a,Math.min(b,v))}
function zA(){var el=$("zi"),w=el.offsetWidth,h=el.offsetHeight;if(Z.s<=1.001){Z.s=1;Z.x=0;Z.y=0}else{var mx=(Z.s-1)*w/2,my=(Z.s-1)*h/2;Z.x=zc(Z.x,-mx,mx);Z.y=zc(Z.y,-my,my)}el.style.transform="translate("+Z.x+"px,"+Z.y+"px) scale("+Z.s+")"}
function zB(){var r=$("zi").getBoundingClientRect();return{x:r.left+r.width/2-Z.x,y:r.top+r.height/2-Z.y}}
function zAt(ns,cx,cy){ns=zc(ns,1,5);var b=zB(),k=ns/Z.s,px=cx-b.x,py=cy-b.y;Z.x=px-k*(px-Z.x);Z.y=py-k*(py-Z.y);Z.s=ns;zA()}
function zMid(){var a=Object.keys(zp).map(function(k){return zp[k]});return a.length>1?{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}:null}
function zInit(){var m=zMid(),pts=Object.keys(zp);if(m){zpin=true;var b=zB();zg={m:m,s:Z.s,x:Z.x,y:Z.y,bx:b.x,by:b.y}}else zg=null}
function openZ(){$("zi").style.background=$("mi").style.background;$("zi").innerHTML=ltr(gp(st.pid));Z.s=1;Z.x=0;Z.y=0;zA();$("zv").classList.add("on");document.body.style.overflow="hidden"}
function openColZoom(src){var bgStyle = src ? "url('"+src+"') center/cover no-repeat" : "linear-gradient(135deg, var(--deep), var(--olive))";$("zi").style.background=bgStyle;$("zi").innerHTML=src?"":'<span class="pr notranslate" translate="no">PROS.</span> LOOK';Z.s=1;Z.x=0;Z.y=0;zA();$("zv").classList.add("on");document.body.style.overflow="hidden"}
function closeZ(){$("zv").classList.remove("on");document.body.style.overflow="";zp={};zg=null}
(function(){var zs=$("zs"),last={};
zs.addEventListener("pointerdown",function(e){if(!Object.keys(zp).length){zsw={x:e.clientX,y:e.clientY};zpin=false}try{zs.setPointerCapture(e.pointerId)}catch(x){}zp[e.pointerId]={x:e.clientX,y:e.clientY};last={x:e.clientX,y:e.clientY};zInit()});
zs.addEventListener("pointermove",function(e){if(!zp[e.pointerId])return;zp[e.pointerId]={x:e.clientX,y:e.clientY};var m=zMid();
 if(m&&zg){var ns=zc(zg.s*m.d/zg.m.d,1,5),k=ns/zg.s,cx=zg.m.x-zg.bx,cy=zg.m.y-zg.by;Z.s=ns;Z.x=cx-k*(cx-zg.x)+(m.x-zg.m.x);Z.y=cy-k*(cy-zg.y)+(m.y-zg.m.y);zA()}
 else if(Z.s>1){Z.x+=e.clientX-last.x;Z.y+=e.clientY-last.y;zA()}
 last={x:e.clientX,y:e.clientY}});
function up(e){if(zsw&&!zpin&&Z.s<=1.001&&Object.keys(zp).length==1&&e.type=="pointerup"){var dx=e.clientX-zsw.x,dy=e.clientY-zsw.y;if(Math.abs(dx)>50&&Math.abs(dx)&&Math.abs(dx)>Math.abs(dy)*1.3&&cur=="detail")setImg(st.img+(dx<0?1:-1))}if(Object.keys(zp).length<=1)zsw=null;delete zp[e.pointerId];var k=Object.keys(zp);if(k.length==1)last={x:zp[k[0]].x,y:zp[k[0]].y};zInit()}
zs.addEventListener("pointerup",up);zs.addEventListener("pointercancel",up);
zs.addEventListener("wheel",function(e){e.preventDefault();zAt(Z.s*Math.exp(-e.deltaY*(e.ctrlKey?0.01:0.002)),e.clientX,e.clientY)},{passive:false});
zs.addEventListener("dblclick",function(e){if(Z.s>1){Z.s=1;zA()}else zAt(2.5,e.clientX,e.clientY)});
$("zp").onclick=function(){zAt(Z.s*1.5,innerWidth/2,innerHeight/2)};
$("zn").onclick=function(){zAt(Z.s/1.5,innerWidth/2,innerHeight/2)};
$("zr").onclick=function(){Z.s=1;zA()};
$("zx").onclick=closeZ;
document.addEventListener("keydown",function(e){if(e.key=="Escape")closeZ();else if((e.key=="ArrowLeft"||e.key=="ArrowRight")&&(cur=="detail"||$("zv").classList.contains("on"))&&cur=="detail")setImg(st.img+(e.key=="ArrowRight"?1:-1))})})();
var swd=false,sw=null;st.img=0;
function setImg(n){var mi=$("mi"),p=gp(st.pid);if(!mi||!p)return;var N=cnt(p);n=(n+N)%N;st.img=n;mi.style.background=pic(p,n);
 document.querySelectorAll(".tb button").forEach(function(b,i){b.classList.toggle("on",i==n)});
 document.querySelectorAll(".dots i").forEach(function(b,i){b.classList.toggle("on",i==n)});
 var tb=document.querySelector(".tbi"),b=tb&&tb.children[n];if(b)tb.scrollTo({top:b.offsetTop-(tb.clientHeight-b.offsetHeight)/2,behavior:"smooth"});
 if($("zv").classList.contains("on")){$("zi").style.background=mi.style.background;Z.s=1;zA()}}
document.addEventListener("pointerdown",function(e){swd=false;var m=e.target.closest&&e.target.closest("#mi");sw=m&&!e.target.closest(".zm")?{x:e.clientX,y:e.clientY}:null});
document.addEventListener("pointerup",function(e){if(!sw)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;if(Math.abs(dx)>40&&Math.abs(dx)&&Math.abs(dx)>Math.abs(dy)*1.3){setImg(st.img+(dx<0?1:-1));swd=true}});

function priceOn(p){return p.showPrice!==false}
function priceUI(p){return "1"}
function priceHtml(p,sty){if(!priceOn(p))return"";var v=p.price!==undefined?p.price:30;return priceUI(p)=="2"?'<div class="card-price pr2" style="'+(sty||"")+'"><svg viewBox="0 0 24 24"><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"></path><circle cx="7.5" cy="7.5" r="1"></circle></svg><span>$'+v+'</span></div>':'<div class="card-price" style="'+(sty||"")+'">$'+v+'</div>'}

var W=null,A={},CATN=Object.keys(CATS);
function exportData(){
 var src=(typeof W!=="undefined"&&W)?W:DB;
 var txt=JSON.stringify(src,null,2);
 var b64=(txt.match(/data:[a-z]+\/[a-z0-9.+-]+;base64,/gi)||[]).length;
 if(b64>0 && !confirm("There are "+b64+" photo(s)/video(s) stored directly in the shop. Replace them with links to keep data.json small. Export anyway?")) return;
 var blob=new Blob([txt],{type:"application/json"});
 var url=URL.createObjectURL(blob);
 var a=document.createElement("a");
 a.href=url; a.download="data.json";
 document.body.appendChild(a); a.click();
 setTimeout(function(){URL.revokeObjectURL(url); a.remove();},1000);
}
$("adexp").onclick=exportData;


var ADMIN=false,tmo=0,fails=0,lockUntil=0;
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(tmo);tmo=setTimeout(function(){t.classList.remove("on")},6000)}
function openAd(){if(!W)W=JSON.parse(JSON.stringify(DB));W.priceUI="2";W.gmeta=W.gmeta||{};W.gmeta.gv=W.gmeta.gv||[];W.gmeta.gp=W.gmeta.gp||[];if(!W.menuSoc)W.menuSoc=msDefault();if(!W.aboutPhotos)W.aboutPhotos={};if(!W.heroIcons)W.heroIcons={sm:"",pic:"",vid:""};if(!W.heroBanner)W.heroBanner={src:""};if(!W.catImages)W.catImages={"Accessories":"","T-Shirt":"","Hoodie":"","Pants":"","All":""};if(!W.collections)W.collections=[];
 W.collections.forEach(function(col){col.productIdsStr = col.productIds ? col.productIds.join(",") : "";});
 A={t:"p",pi:-1,del:-1,q:"",pc:"All",nf:0};msg("");renderAd();$("ad").classList.add("on");document.body.style.overflow="hidden"}
function openAL(){if(ADMIN){openAd();return}$("alid").value="";$("alpw").value="";$("aler").textContent="";$("al").classList.add("on")}

$("alok").addEventListener("click",async function(){
 var email=$("alid").value.trim(),password=$("alpw").value;
 if(!window.prosSupabase){$("aler").textContent="Supabase is not ready. Reload the page.";return;}
 if(!email||!password){$("aler").textContent="Enter the admin email and password.";return;}
 var btn=$("alok");btn.disabled=true;btn.textContent="Checking...";
 try{
  var auth=await window.prosSupabase.auth.signInWithPassword({email:email,password:password});
  if(auth.error)throw auth.error;
  var user=auth.data.user;
  var check=await window.prosSupabase.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(check.error)throw check.error;
  if(!check.data){await window.prosSupabase.auth.signOut();throw new Error("This account is not registered as an admin in the admins table.");}
  fails=0;ADMIN=true;$("al").classList.remove("on");$("alpw").value="";
  try{W=JSON.parse(JSON.stringify(DB));}catch(e){}
  openAd();
 }catch(e){fails++;$("aler").textContent=(e.message||"Sign-in failed.");if(fails>=5){$("aler").textContent+=" Make sure the email, password, and admin access are correct.";fails=0;}}
 finally{btn.disabled=false;btn.textContent="Enter";}
});

$("adlo").addEventListener("click",async function(){ADMIN=false;W=null;if(window.prosSupabase){await window.prosSupabase.auth.signOut();}$("ad").classList.remove("on");document.body.style.overflow=""});
$("adsave").addEventListener("click",function(){saveChangesToStorage();});

(function(){
 var n=0,t0=0;
 var lg=document.querySelector("header .logo");
 if(lg) {
  lg.addEventListener("click",function(){
   var now=Date.now();if(now-t0>800)n=0;t0=now;
   if(++n>=15){n=0;openAL();}
  });
 }
})();

$("adx").onclick=function(){W=null;$("ad").classList.remove("on");document.body.style.overflow=""};
$("ad").addEventListener("input",function(e){
 var t=e.target;
 if(t.dataset&&t.dataset.richEditor){var richPath=pth(W,t.dataset.richEditor);richPath[0][richPath[1]]=t.innerHTML;return;}
 if(t.dataset.sizeCell!==undefined){
  var path=t.dataset.sizePath,rc=t.dataset.sizeCell.split("|"),r=pth(W,path),rows=sizeMatrix(r[0][r[1]]),ri=+rc[0],ci=+rc[1];
  while(rows.length<=ri)rows.push(Array(rows[0].length).fill(""));
  while(rows[ri].length<=ci)rows[ri].push("");
  rows[ri][ci]=t.value;r[0][r[1]]=sizeSerialize(rows);
  var hidden=document.querySelector('textarea[data-f="'+path+'"]');if(hidden)hidden.value=r[0][r[1]];
  var pre=document.querySelector('[data-size-preview="'+path+'"]');if(pre)pre.innerHTML='<div class="preview-label">Size chart preview · swipe horizontally</div>'+formatDetailContent("Size guide",r[0][r[1]]);
  return;
 }
 if(t.id=="adq"){A.q=t.value;renderList();return;}
 var hexPath=t.dataset.colorHex;
 if(hexPath){
  var hex=t.value.trim();
  if(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)){
   if(hex.length===4)hex="#"+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
   var hr=pth(W,hexPath);hr[0][hr[1]]=hex;
   var hp=document.querySelector('[data-color-picker="'+hexPath+'"]');if(hp)hp.value=hex;
  }
  return;
 }
 var f=t.dataset.f;
 if(f){var r=pth(W,f);r[0][r[1]]=t.value;if(f.slice(-4)==="size"){document.querySelectorAll("[data-size-preview]").forEach(function(pre){if(pre.dataset.sizePreview===f){pre.innerHTML='<div class="preview-label">Size chart preview · swipe horizontally</div>'+formatDetailContent("Size guide",t.value);}});}if(t.dataset.colorPicker){var hf=document.querySelector('[data-color-hex="'+f+'"]');if(hf)hf.value=t.value;}}
});
$("ad").addEventListener("change",function(e){var t=e.target,d=t.dataset;
 if(d.c){var r=pth(W,d.c);r[0][r[1]]=t.checked;if(t.checked&&d.c.slice(-5)=="isNew")r[0].added=Date.now()}
 else if(d.re!==undefined){var r2=pth(W,d.f);r2[0][r2[1]]=t.value;r2[0].sty=CATS[t.value][0];renderAd()}
 else if(d.up||d.upb!==undefined||d.upe!==undefined||d.uphhb!==undefined||d.upcol!==undefined||d.upcat!==undefined||d.upap!==undefined||d.upho!==undefined)doUp(t,d)});
$("ad").addEventListener("click",function(e){var rich=e.target.closest("[data-rich]");if(rich){var editor=rich.closest(".rich-field").querySelector("[data-rich-editor]");if(editor){editor.focus();document.execCommand(rich.dataset.rich,false,null);var rp=pth(W,editor.dataset.richEditor);rp[0][rp[1]]=editor.innerHTML;}return;}var t=e.target.closest("[data-at],[data-ae],[data-ad],[data-aa],[data-ar],[data-pc],[data-nf],[data-rb],[data-rbhb],[data-ae2],[data-al],[data-ala],[data-acc],[data-rmcol],[data-rbcat],[data-rbap],[data-rbho],[data-pall],[data-addbuylink],[data-rmbuylink],[data-size-addrow],[data-size-addcol],[data-size-addcol-right],[data-size-delrow],[data-size-delcol],[data-add-color-variant],[data-remove-color-variant],[data-pick-color]");if(!t)return;var d=t.dataset;
 if(d.at){A.t=d.at;A.pi=-1}
 else if(d.ae!==undefined)A.pi=+d.ae;
 else if(d.aa!==undefined){var c=CATS[d.aa]?d.aa:"T-Shirt",id=W.products.reduce(function(m,p){return Math.max(m,p.id)},0)+1;W.products.push({id:id,name:"New product",cat:c,sty:CATS[c][0],tone:"",price:35,imgs:[],vids:[],buyLinks:[{name:"Buy on Amazon",url:"",active:true},{name:"Buy on eBay",url:"",active:true}],isNew:true,added:Date.now(),best:false,hl:"",size:"",spec:"",desc:""});A.pi=W.products.length-1}
 else if(d.ad!==undefined){if(A.del==+d.ad){W.products.splice(+d.ad,1);A.del=-1}else A.del=+d.ad;renderList();return}
 else if(d.ar){var z=d.ar.split("|"),r=pth(W,z[0]);r[0][r[1]].splice(+z[1],1);if((z[0]==="gv"||z[0]==="gp")&&W.gmeta&&W.gmeta[z[0]])W.gmeta[z[0]].splice(+z[1],1)}
 else if(d.pc)A.pc=d.pc;
 else if(d.nf!==undefined)A.nf=A.nf?0:1;
 else if(d.rb!==undefined)W.banner.src="";
 else if(d.rbhb!==undefined)W.heroBanner.src="";
 else if(d.rbcat!==undefined){if(W.catImages)W.catImages[d.rbcat]="";}
 else if(d.rbap!==undefined){if(W.aboutPhotos)W.aboutPhotos[d.rbap]="";}
 else if(d.rbho!==undefined){if(W.heroIcons)W.heroIcons[d.rbho]="";}
 else if(d.pall!==undefined){W.products.forEach(function(p){p.showPrice=(d.pall=="on")})}
 else if(d.ae2!==undefined)W.ev.splice(+d.ae2,1);
 else if(d.al!==undefined)W.social.links.splice(+d.al,1);
 else if(d.ala!==undefined)W.social.links.push({p:"",url:"",n:""});
 else if(d.acc!==undefined){if(!W.collections)W.collections=[];W.collections.push({name:"New Outfit Set",desc:"",src:"",productIdsStr:"",productIds:[]});renderAd()}
 else if(d.rmcol!==undefined){W.collections.splice(+d.rmcol,1);renderAd()}
 else if(d.addbuylink!==undefined){
  var pIdx = +d.addbuylink;
  if(!W.products[pIdx].buyLinks) W.products[pIdx].buyLinks = [];
  W.products[pIdx].buyLinks.push({name:"Buy on Marketplace", url:"", active:true});
  renderAd();
 }
 else if(d.sizeAddrow!==undefined){sizeEditAction(d.sizeAddrow,"addrow");return}
 else if(d.sizeAddcolRight!==undefined){sizeEditAction(d.sizeAddcolRight,"addcol-right");return}
 else if(d.sizeAddcol!==undefined){sizeEditAction(d.sizeAddcol,"addcol-right");return}
 else if(d.sizeDelrow!==undefined){var sz=d.sizeDelrow.split("|");sizeEditAction(sz[0],"delrow",+sz[1]);return}
 else if(d.sizeDelcol!==undefined){var sc=d.sizeDelcol.split("|");sizeEditAction(sc[0],"delcol",+sc[1]);return}
 else if(d.addColorVariant!==undefined){var pi=+d.addColorVariant,prod=W.products[pi],key=String(prod.id);if(!W.productColorVariants)W.productColorVariants={};if(!W.productColorVariants[key])W.productColorVariants[key]={enabled:true,items:[]};W.productColorVariants[key].enabled=true;var items=W.productColorVariants[key].items;if(!Array.isArray(items))items=[];W.productColorVariants[key].items=items;var imageCount=(prod.imgs||[]).length,nextImage=items.length<imageCount?items.length:0;items.push({name:"New color "+(items.length+1),hex:"#000000",imageIndex:nextImage});}
 else if(d.removeColorVariant!==undefined){var parts=d.removeColorVariant.split("|"),prod=W.products[+parts[0]],key=String(prod.id);if(W.productColorVariants&&W.productColorVariants[key])W.productColorVariants[key].items.splice(+parts[1],1)}
 else if(d.pickColor!==undefined){var parts=d.pickColor.split("|");openProductImageEyedropper(+parts[0],+parts[1]);return}
 else if(d.rmbuylink!==undefined){
  var parts = d.rmbuylink.split("|");
  var pIdx = +parts[0], lIdx = +parts[1];
  if(W.products[pIdx] && W.products[pIdx].buyLinks){
   W.products[pIdx].buyLinks.splice(lIdx, 1);
   renderAd();
  }
 }
 renderAd()});
renderHeroBanner();renderBanner();renderGal();
renderHome();renderCat();renderCart();renderCollections();renderMenuSoc();renderAboutPhotos();show("home");

(function(){
 if(localStorage.getItem("pros_db")||location.protocol==="file:")return;
 fetch("data.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("no data");return r.json()}).then(function(d){
  if(!d||!Array.isArray(d.products))return;
  DB=d; P=DB.products;
  renderHeroBanner();renderBanner();renderGal();renderHome();renderCat();renderCart();renderCollections();renderMenuSoc();renderAboutPhotos();
 }).catch(function(){});
})();

document.addEventListener("click", function(e){
 var b=e.target.closest?e.target.closest(".addlink-btn"):null;
 if(!b)return;
 var inp=b.previousElementSibling;
 var v=(inp&&inp.value||"").trim();
 if(!v)return;
 if(!/^https:\/\//i.test(v)){alert("Link harus diawali https:// (contoh: https://files.catbox.moe/abc.jpg)");return;}
 if(!W)return;
 var r=pth(W,b.dataset.p);
 var arr=r[0][r[1]];
 if(arr.length>=(+b.dataset.max||99)){alert("The item limit for this section has been reached.");return;}
 arr.push(v);
 inp.value="";
 renderAd();
});
