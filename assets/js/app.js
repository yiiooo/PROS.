
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
 $("sr").style.display=(v=="home"||v=="category"||v=="results")?"flex":"none";

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

function renderHeroBanner(){
 var hb=$("hb"), u=DB.heroBanner&&DB.heroBanner.src;
 hb.className=u?"hero im":"hero";
 hb.style.background=u?"url('"+u+"') center/cover no-repeat":"";
 var HI=DB.heroIcons||{};
 function hic(k,bg,svg){var u=HI[k];return u?'<i style="background:url(\''+u+'\') center/cover no-repeat"></i>':'<i style="background:'+bg+'">'+svg+'</i>'}
 hb.innerHTML='<div class="hero-default-content"><button class="exp" data-gocol>Explore<br>The Collection</button><div class="pan"><button data-go="about">'+hic("sm","#B8AD9C",'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-4 4-6 8-6s7 2 8 6"></path></svg>')+'Social Media</button><button data-go="about">'+hic("pic","#8E8478",'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="10" r="1.5"></circle><path d="M4 18l5-5 4 4 3-3 4 4"></path></svg>')+'Picture</button><button data-go="about">'+hic("vid","#E2D6C2",'<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"></path></svg>')+'Watch Video</button></div></div>';
}

function renderBanner(){var b=$("bn"),u=DB.banner.src;b.style.display="";b.className=u?"banner im":"banner";b.innerHTML=u?(u.match(/\.mp4($|\?)/i)?'<video src="'+u+'" autoplay muted loop playsinline></video>':'<img src="'+u+'" alt="">'):SKYS}

var MS_ICON={"facebook": "<svg viewBox=\"0 0 24 24\"><path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/></svg>", "instagram": "<svg viewBox=\"0 0 24 24\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" ry=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"/><line x1=\"17.5\" y1=\"6.5\" x2=\"17.51\" y2=\"6.5\"/></svg>", "pinterest": "<svg viewBox=\"0 0 24 24\"><path d=\"M12 2a10 10 0 0 0-3.62 19.33c-.1-.83-.19-2.1.04-3 .22-.94 1.42-6 1.42-6s-.36-.72-.36-1.78c0-1.67.97-2.92 2.18-2.92 1.03 0 1.53.77 1.53 1.7 0 1.03-.66 2.58-1 4.02-.29 1.22.61 2.21 1.81 2.21 2.18 0 3.86-2.3 3.86-5.61 0-2.93-2.11-4.98-5.12-4.98-3.48 0-5.52 2.61-5.52 5.31 0 1.05.4 2.18.9 2.79.1.12.11.23.08.35l-.34 1.38c-.05.21-.18.26-.41.15-1.54-.72-2.5-2.98-2.5-4.8 0-3.91 2.84-7.5 8.19-7.5 4.3 0 7.64 3.07 7.64 7.18 0 4.29-2.7 7.76-6.44 7.76-1.26 0-2.44-.65-2.84-1.42l-.77 2.94c-.28 1.08-1.04 2.43-1.55 3.25A10 10 0 1 0 12 2z\"/></svg>", "tiktok": "<svg viewBox=\"0 0 24 24\"><path d=\"M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65a6.33 6.33 0 0 0 10.86 4.47V10.22a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.65z\"/></svg>", "x": "<svg viewBox=\"0 0 24 24\"><path d=\"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z\"/></svg>"},MS_LABEL={"facebook": "Facebook", "instagram": "Instagram", "pinterest": "Pinterest", "tiktok": "TikTok", "x": "X"},MS_KEYS=["facebook","instagram","pinterest","tiktok","x"],MS_URL={"facebook": "https://facebook.com", "instagram": "https://instagram.com", "pinterest": "https://pinterest.com", "tiktok": "https://tiktok.com", "x": "https://twitter.com"};
function msDefault(){var o={};MS_KEYS.forEach(function(k){o[k]={url:MS_URL[k],show:true}});return o}
function renderMenuSoc(){
 var cfg=(DB&&DB.menuSoc)||msDefault(),h="";
 MS_KEYS.forEach(function(k){var c=cfg[k]||{};if(c.show!==false&&c.url){h+='<a class="menu-soc-btn" href="'+esc(c.url)+'" target="_blank" rel="noopener">'+MS_ICON[k]+'<span>'+MS_LABEL[k]+'</span></a>'}});
 var el=document.getElementById("menuSocs");if(el)el.innerHTML=h;
}
function menuSocAdmin(){
 var cfg=(W&&W.menuSoc)||msDefault();
 return '<h2>Burger menu: social media</h2><p class="mu" style="margin-bottom:10px">Turn each platform on or off and set its link. Off means it will not show in the burger menu.</p>'+
  MS_KEYS.map(function(k){var c=cfg[k]||{};return '<div class="arow" style="flex-direction:column;align-items:stretch;gap:6px"><label class="cb" style="margin:0"><input type="checkbox" data-c="menuSoc.'+k+'.show"'+(c.show!==false?' checked':'')+'> Show '+MS_LABEL[k]+'</label><input class="in2" data-f="menuSoc.'+k+'.url" value="'+esc(c.url||"")+'" placeholder="https://..."></div>'}).join("")
}
var PL={ig:"Instagram",fb:"Facebook",tt:"TikTok",x:"X"};
function gplat(u){u=String(u||"").toLowerCase();if(/tiktok\.com/.test(u))return "tiktok";if(/pinterest\./.test(u))return "pinterest";if(/facebook\.com|fb\.com|fb\.watch/.test(u))return "facebook";if(/(^|\/\/|\.)(x|twitter)\.com/.test(u))return "x";return "instagram"}
function gfoot(p,i){var m=(DB.gmeta&&DB.gmeta[p]&&DB.gmeta[p][i])||{};if(!m.id&&!m.post)return "";var ic=gplat(m.post);var inner='<span class="gico">'+(MS_ICON[ic]||"")+'</span><span class="gid">'+esc(m.id||"View post")+'</span>';return m.post?'<a class="gh" href="'+esc(m.post)+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="gh">'+inner+'</div>'}
function renderGal(){var h="",v=DB.gv.map(function(u,i){return '<div class="g">'+gfoot("gv",i)+'<div class="m vm"><video src="'+u+'" controls playsinline preload="metadata"></video><em>Video</em></div></div>'}),f=DB.gp.map(function(u,i){return '<div class="g">'+gfoot("gp",i)+'<div class="m" data-colzoom="'+esc(u)+'" style="background:url(\''+u+'\') center/cover"><em>Photo</em></div></div>'});
 if(v.length+f.length)h+='<h2>Gallery</h2><div class="gal">'+v.concat(f).join("")+'</div>';
 if(DB.ev.length)h+='<h2>Events and Promos</h2><div class="evs">'+DB.ev.map(function(e){return '<div class="evi"><img src="'+e.src+'" alt="">'+(e.cap?'<div>'+esc(e.cap)+'</div>':'')+'</div>'}).join("")+'</div>';
 var L=DB.social.links.filter(function(l){return l.url});
 if(L.length)h+='<h2>Follow us</h2><div class="sls">'+L.map(function(l){return '<a class="sl" href="'+esc(l.url)+'" target="_blank" rel="noopener"><b>'+(PL[l.p]||"Link")+'</b>'+(l.n?'<span>'+esc(l.n)+'</span>':'')+'</a>'}).join("")+'</div>';
 $("gal").innerHTML=h}
var W=null,A={},CATN=Object.keys(CATS);
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
