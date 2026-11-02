(function(){
"use strict";
var zoneSelector=".pros-product-photo-zone",pendingPhoto=false;
function activeZone(node){return node&&node.closest?node.closest(zoneSelector):null}
function photoPath(zone){return zone&&zone.getAttribute("data-product-photo-zone")}
function addFiles(zone,files){
 if(!zone||!files||!files.length||!window.ADMIN||typeof window.doUp!=="function")return;
 var path=photoPath(zone);
 if(!path)return;
 var valid=Array.from(files).filter(function(f){return f&&f.type&&f.type.indexOf("image/")===0});
 if(!valid.length)return;
 if(window.prosUndoCapture)window.prosUndoCapture();
 pendingPhoto=true;
 window.doUp({files:valid,value:"",dataset:{up:path,max:"99"}},{up:path,max:"99"});
}
document.addEventListener("paste",function(e){
 var zone=activeZone(document.activeElement)||activeZone(e.target);
 if(!zone)return;
 var items=e.clipboardData&&e.clipboardData.items;
 if(!items)return;
 var files=[];
 Array.from(items).forEach(function(item){if(item.kind==="file"&&item.type.indexOf("image/")===0){var f=item.getAsFile();if(f)files.push(f)}});
 if(files.length){e.preventDefault();addFiles(zone,files)}
});
document.addEventListener("dragover",function(e){
 var zone=activeZone(e.target);
 if(!zone)return;
 if(e.dataTransfer&&Array.from(e.dataTransfer.types||[]).indexOf("Files")>-1){e.preventDefault();zone.classList.add("pros-photo-dragover")}
});
document.addEventListener("dragleave",function(e){
 var zone=activeZone(e.target);if(zone&&!zone.contains(e.relatedTarget))zone.classList.remove("pros-photo-dragover");
});
document.addEventListener("drop",function(e){
 var zone=activeZone(e.target);if(!zone)return;
 zone.classList.remove("pros-photo-dragover");
 var item=e.target.closest("[data-product-image-item]");
 if(item&&e.dataTransfer&&e.dataTransfer.getData("application/x-pros-photo")){
  e.preventDefault();return;
 }
 if(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length){e.preventDefault();addFiles(zone,e.dataTransfer.files)}
});
var dragged=null;
document.addEventListener("dragstart",function(e){
 var item=e.target.closest&&e.target.closest("[data-product-image-item]");
 if(!item)return;
 dragged=item;
 item.classList.add("pros-photo-dragging");
 if(e.dataTransfer){e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("application/x-pros-photo",item.getAttribute("data-product-image-item"))}
});
document.addEventListener("dragend",function(){
 if(dragged)dragged.classList.remove("pros-photo-dragging");
 document.querySelectorAll(".pros-photo-over").forEach(function(n){n.classList.remove("pros-photo-over")});
 dragged=null;
});
document.addEventListener("dragover",function(e){
 var target=e.target.closest&&e.target.closest("[data-product-image-item]");
 if(!dragged||!target||target===dragged||!dragged.parentNode||target.parentNode!==dragged.parentNode)return;
 e.preventDefault();target.classList.add("pros-photo-over");
});
document.addEventListener("dragleave",function(e){
 var target=e.target.closest&&e.target.closest("[data-product-image-item]");if(target)target.classList.remove("pros-photo-over");
});
document.addEventListener("drop",function(e){
 var target=e.target.closest&&e.target.closest("[data-product-image-item]");
 if(!dragged||!target||target===dragged||target.parentNode!==dragged.parentNode)return;
 e.preventDefault();target.classList.remove("pros-photo-over");
 var zone=activeZone(target),path=photoPath(zone),parts=(path||"").split("."),pi=Number(parts[1]);
 if(!window.W||!window.W.products||!window.W.products[pi])return;
 var arr=window.W.products[pi].imgs;if(!Array.isArray(arr))return;
 var from=Number((dragged.getAttribute("data-product-image-item")||"").split("|").pop());
 var to=Number((target.getAttribute("data-product-image-item")||"").split("|").pop());
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=arr.length||to>=arr.length||from===to)return;
 if(window.prosUndoCapture)window.prosUndoCapture();
 var moved=arr.splice(from,1)[0];arr.splice(to,0,moved);
 if(window.prosUndoCommit)window.prosUndoCommit();
 dragged=null;
 if(typeof window.renderAd==="function")window.renderAd();
});
})();