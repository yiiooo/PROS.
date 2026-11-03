/* PROS Admin Media Manager.
 * Loaded after app.js because it uses shared globals: $, W, ADMIN, pth, renderAd, toast.
 */
function compressAndConvertImage(file, maxWidth, maxHeight, quality, callback) {
 var reader = new FileReader();
 reader.onload = function(e) {
  var img = new Image();
  img.onload = function() {
   var canvas = document.createElement("canvas");
   var w = img.width;
   var h = img.height;
   if (w > maxWidth || h > maxHeight) {
    if (w > h) {
     h = Math.round((h * maxWidth) / w);
     w = maxWidth;
    } else {
     w = Math.round((w * maxHeight) / h);
     h = maxHeight;
    }
   }
   canvas.width = w;
   canvas.height = h;
   var ctx = canvas.getContext("2d");
   ctx.drawImage(img, 0, 0, w, h);
   var compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
   callback(compressedDataUrl);
  };
  img.src = e.target.result;
 };
 reader.readAsDataURL(file);
}

var cropTarget=null, cropFilesQueue=[];

function doUp(t,d){
 if(!ADMIN)return;
 var fs=Array.from(t.files); t.value="";
 if(!fs.length)return;
 
 if(d.upho!==undefined){
  if(!W.heroIcons)W.heroIcons={sm:"",pic:"",vid:""};
  cropTarget="heroIcons."+d.upho;
  cropFilesQueue=[fs[0]];
  processNextCropFile();
  return;
 }

 if(d.upap!==undefined){
  cropTarget="aboutPhotos."+d.upap;
  cropFilesQueue=[fs[0]];
  processNextCropFile();
  return;
 }

 if(d.upcat!==undefined){
  var catName = d.upcat;
  compressAndConvertImage(fs[0], 1200, 1200, 0.85, function(compressedUrl){
   if(!W.catImages)W.catImages={};
   W.catImages[catName] = compressedUrl;
   renderAd();
  });
  return;
 }

 if(d.upcol!==undefined){
  var ci = +d.upcol;
  compressAndConvertImage(fs[0], 1200, 1200, 0.85, function(compressedUrl){
   if(!W.collections[ci])W.collections[ci]={name:"",desc:"",src:"",productIds:[]};
   W.collections[ci].src = compressedUrl;
   renderAd();
  });
  return;
 }
 
 if(d.upb!==undefined || d.upe!==undefined || (d.up && !d.up.includes("imgs"))){
  fs.forEach(function(f){
   if(f.type==="image/gif" || f.type.startsWith("video/")){
    var r=new FileReader();
    r.onload=function(e){
     if(d.upb!==undefined) W.banner.src=e.target.result;
     else if(d.upe!==undefined) W.ev.push({src:e.target.result,cap:""});
     else { var tg=pth(W,d.up); tg[0][tg[1]].push(e.target.result); }
     renderAd();
    };
    r.readAsDataURL(f);
   } else {
    compressAndConvertImage(f, 1200, 1200, 0.85, function(compressedUrl){
     if(d.upb!==undefined) W.banner.src=compressedUrl;
     else if(d.upe!==undefined) W.ev.push({src:compressedUrl,cap:""});
     else { var tg=pth(W,d.up); tg[0][tg[1]].push(compressedUrl); }
     renderAd();
    });
   }
  });
  return;
 }

 if(d.uphhb!==undefined){
  var f = fs[0];
  if(f.type==="image/gif"){
   var r=new FileReader();
   r.onload=function(e){
    if(!W.heroBanner)W.heroBanner={};
    W.heroBanner.src=e.target.result;
    renderAd();
   };
   r.readAsDataURL(f);
  } else {
   compressAndConvertImage(f, 1200, 1200, 0.85, function(compressedUrl){
    if(!W.heroBanner)W.heroBanner={};
    W.heroBanner.src=compressedUrl;
    renderAd();
   });
  }
  return;
 }

 cropTarget=d.up;
 cropFilesQueue=fs;
 processNextCropFile();
}

function processNextCropFile(){
 if(!cropFilesQueue.length){ cropTarget=null; return; }
 var f=cropFilesQueue.shift();
 if(f.type==="image/gif" || f.type.startsWith("video/")){
  var r=new FileReader();
  r.onload=function(e){
   var tg=pth(W, cropTarget);
   if(Array.isArray(tg[0][tg[1]]))tg[0][tg[1]].push(e.target.result);else tg[0][tg[1]]=e.target.result;
   renderAd();
   processNextCropFile();
  };
  r.readAsDataURL(f);
 } else {
  compressAndConvertImage(f, 1600, 1600, 0.9, function(compressedUrl){
   openCropperModal(compressedUrl);
  });
 }
}

var cX=0, cY=0, cStartX=0, cStartY=0, cPointerDown=false, cBaseW=0, cBaseH=0;

function openCropperModal(src){
 var img=$("cropImg");
 img.onload = null;
 img.src = src;

 setTimeout(function(){
  var wrapW = $("cropWrap").clientWidth || 300;
  var wrapH = $("cropWrap").clientHeight || 300;
  var w = img.naturalWidth || img.width || 500;
  var h = img.naturalHeight || img.height || 500;
  var r = w / h;
  if (r > 1) {
   cBaseH = wrapH;
   cBaseW = wrapH * r;
  } else {
   cBaseW = wrapW;
   cBaseH = wrapW / r;
  }
  img.style.width = cBaseW + "px";
  img.style.height = cBaseH + "px";
  cX = 0; cY = 0;
  updateCropTransform();
  $("cropModal").classList.add("on");
 }, 50);
}

function updateCropTransform(){
 var img=$("cropImg");
 img.style.transform="translate(-50%, -50%) translate("+cX+"px, "+cY+"px)";
}

var wrap=$("cropWrap");
wrap.onpointerdown=function(e){ cPointerDown=true; cStartX=e.clientX-cX; cStartY=e.clientY-cY; wrap.setPointerCapture(e.pointerId); };
wrap.onpointermove=function(e){ if(!cPointerDown)return; cX=e.clientX-cStartX; cY=e.clientY-cStartY; updateCropTransform(); };
wrap.onpointerup=function(e){ cPointerDown=false; };

$("cropCancel").onclick=function(){
 $("cropModal").classList.remove("on");
 processNextCropFile();
};

$("cropSave").onclick=function(){
 $("cropModal").classList.remove("on");
 var activeImgSrc = $("cropImg").src;
 var renderImg = new Image();

 renderImg.onload = function() {
  var canvas=document.createElement("canvas");
  canvas.width=1024; canvas.height=1024;
  var ctx=canvas.getContext("2d");
  ctx.fillStyle="#1E1C1A"; 
  ctx.fillRect(0,0,1024,1024);

  var wrapW = wrap.clientWidth || 300;
  var scaleRatio = 1024 / wrapW;
  var drawW = cBaseW * scaleRatio;
  var drawH = cBaseH * scaleRatio;
  var drawX = (1024 - drawW) / 2 + (cX * scaleRatio);
  var drawY = (1024 - drawH) / 2 + (cY * scaleRatio);

  ctx.drawImage(renderImg, drawX, drawY, drawW, drawH);

  var resUrl=canvas.toDataURL("image/jpeg", 0.88);
  var tg=pth(W, cropTarget);
  if(Array.isArray(tg[0][tg[1]]))tg[0][tg[1]].push(resUrl);else tg[0][tg[1]]=resUrl;
  renderAd();
  processNextCropFile();
 };

 renderImg.onerror = function() {
  toast("Failed to process image.");
  processNextCropFile();
 };

 renderImg.src = activeImgSrc;
};
