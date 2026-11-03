/* PROS storefront product detail rendering.
 * Loaded before app.js; functions use shared classic-script globals at call time.
 */
function productColorSet(p){var all=DB.productColorVariants||{},set=all[String(p.id)]||all[p.id];return set&&set.enabled&&Array.isArray(set.items)?set.items.filter(function(v){return v&&v.name&&v.hex&&Number.isFinite(+v.imageIndex)&&p.imgs&&p.imgs[+v.imageIndex]}):[]}
function productColorHtml(p){var items=productColorSet(p);if(!items.length)return "";return '<div class="product-colors"><div class="product-colors-label">Select Color</div><div class="product-color-options">'+items.map(function(v,i){return '<button type="button" class="product-color-swatch" data-color-variant="'+i+'" aria-label="'+esc(v.name)+'" title="'+esc(v.name)+'" aria-pressed="'+(i===0?"true":"false")+'" style="background:'+esc(v.hex)+'"></button>'}).join("")+'<span class="product-color-name" id="selectedProductColor">'+esc(items[0].name)+'</span></div></div>'}

function open_(i){st.pid=i;st.img=0;if(cur!="detail")st.prev=cur;var p=gp(i);if(!p)return;
 // Tampilkan semua produk lain of kategori yang sama; halaman detail dapat di-scroll sampai CTA kategori.
 var rel=P.filter(function(x){return x.cat==p.cat&&x.id!=i}),vs=Array.isArray(p.vids)?p.vids:[],N=cnt(p),pPrice=p.price!==undefined?p.price:30;
 $("detail").innerHTML='<div class="dh"><button class="back" data-back aria-label="Back">‹</button></div>'+
 '<div class="pd"><div><div class="gal2"><div class="mi" id="mi" data-zoom style="cursor:zoom-in;background:'+pic(p,0)+'"><span>'+ltr(p)+'</span><div class="dots">'+Array.from({length:N},function(_,k){return '<i'+(k?'':' class="on"')+'></i>'}).join("")+'</div><button class="zm" data-zoom aria-label="Zoom"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/></svg></button></div>'+
 '<div class="tb"><div class="tbi">'+Array.from({length:N},function(_,n){return '<button data-th="'+n+'" class="'+(n?'':'on')+'" style="background:'+pic(p,n)+'">'+ltr(p)+'</button>'}).join("")+'</div></div></div></div>'+
 '<div class="info"><div class="pt notranslate product-name-anton" translate="no">'+esc(p.name)+(p.tone?', '+esc(p.tone):'')+'</div>'+(priceOn(p)?priceHtml(p,"font-size:18px;margin-bottom:2px")+'<div class="price-note">(the price shown is $'+pPrice+' and is only an estimate; each marketplace may change its price at any time)</div>':'')+''+productColorHtml(p)+'<div class="pdl">Product Detail</div>'+
 det("Top highlight",p.hl||"Thick and comfortable fabric, with a cut that suits the "+p.sty+" style, perfect for everyday urban outfits.")+
 det("Product description",p.desc||"Product description has not been added yet.")+
 det("Size guide",p.size||"Sizes S to XL. Check the size chart on the seller page before buying.")+
  '<div class="pdl" style="margin-top:14px">Product Videos</div>'+ (vs.length?'<div class="vids">'+vs.map(function(v,n){return '<button class="vid" data-vid="'+n+'" aria-label="Play product video '+(n+1)+'"><video class="vid-preview" data-video-preview src="'+esc(v)+'" muted playsinline preload="metadata"></video><span class="vid-play"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span></button>'}).join('')+'</div>':'<div class="mu" style="font-size:12px;margin:8px 0">No product video uploaded yet.</div>')+
 '<div class="bar"><button class="bn" data-buy="'+i+'">Buy Now</button><button class="bc" data-add="'+i+'" aria-label="Add to Cart"><svg viewBox="0 0 24 24"><rect x="5" y="9" width="14" height="11" rx="3"/><path d="M9 9V7a3 3 0 016 0v2"/></svg></button></div></div></div>'+
 '<section class="detail-explore"><h2>Explore '+esc(p.cat)+'</h2>'+(rel.length?'<div class="grid">'+rel.map(function(x){return card(x, P.indexOf(x))}).join("")+'</div>':'<div class="empty">No other products in this category yet.</div>')+
 '<button class="explore-all" data-cat="'+esc(p.cat)+'"><span>All '+esc(p.cat)+'</span><span aria-hidden="true">↗</span></button></section>';
 var initialColors=productColorSet(p);if(initialColors.length)setImg(+initialColors[0].imageIndex);prepareVideoFrameThumbnails($("detail"));show("detail")}
function prepareVideoFrameThumbnails(root){
 (root||document).querySelectorAll("video[data-video-preview]").forEach(function(video){
  if(video.dataset.frameReady||video.dataset.frameLoading)return;
  video.dataset.frameLoading="1";
  video.muted=true;video.playsInline=true;video.preload="auto";
  var finished=false;
  function captureFrame(){
   if(finished)return;
   try{
    if(!video.videoWidth||!video.videoHeight)return;
    var canvas=document.createElement("canvas");
    canvas.width=Math.min(video.videoWidth,960);
    canvas.height=Math.round(canvas.width*video.videoHeight/video.videoWidth);
    var ctx=canvas.getContext("2d");
    ctx.drawImage(video,0,0,canvas.width,canvas.height);
    var data=canvas.toDataURL("image/jpeg",0.88);
    if(data&&data.length>1000){video.setAttribute("poster",data);video.dataset.frameReady="1";finished=true;}
   }catch(err){video.dataset.frameError="1";video.dataset.frameLoading="";}
  }
  function seekToUsefulFrame(){
   if(!video.duration||!isFinite(video.duration)){captureFrame();return;}
   /* Avoid a black opening frame: use a frame just after the video begins. */
   var target=Math.min(0.18,Math.max(0.04,video.duration*0.03));
   try{video.currentTime=target;}catch(err){captureFrame();}
  }
  video.addEventListener("loadedmetadata",seekToUsefulFrame,{once:true});
  video.addEventListener("seeked",captureFrame,{once:true});
  video.addEventListener("loadeddata",function(){if(!video.dataset.seekStarted)captureFrame();},{once:true});
  video.addEventListener("error",function(){video.dataset.frameLoading="";video.dataset.frameError="1";},{once:true});
  if(video.readyState>=1)seekToUsefulFrame();
 });
}

