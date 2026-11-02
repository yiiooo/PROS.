(function(){
"use strict";
var MAX=12, undoStack=[], redoStack=[], beforeAction=null, typingBefore=null, typingTimer=null, busy=false, pendingAsync=false;
function data(){try{return window.W?JSON.stringify(window.W):null}catch(e){return null}}
function setData(json){
 if(!json)return;
 try{
  window.W=JSON.parse(json);
  if(typeof window.renderAd==="function")window.renderAd();
  update();
 }catch(e){console.error("PROS Undo: restore failed",e)}
}
function push(before,after){
 if(!before||!after||before===after)return;
 undoStack.push(before);if(undoStack.length>MAX)undoStack.shift();
 redoStack=[];update();
}
function capture(){if(!busy&&!beforeAction)beforeAction=data()}
function commit(){
 if(busy)return;
 if(typingBefore&&beforeAction&&typingBefore===beforeAction){
  if(typingTimer)clearTimeout(typingTimer);
  typingTimer=null;typingBefore=null;
 }
 var after=data();
 if(beforeAction){push(beforeAction,after);beforeAction=null;}
 update();
}
function update(){
 var bar=document.getElementById("prosUndoToolbar");
 var ad=document.getElementById("ad");
 if(bar)bar.classList.toggle("visible",!!(ad&&ad.classList.contains("on")));
 var u=document.getElementById("prosUndo"),r=document.getElementById("prosRedo");
 if(u)u.disabled=!undoStack.length||busy;
 if(r)r.disabled=!redoStack.length||busy;
 var status=document.getElementById("prosUndoStatus");
 if(status)status.textContent=undoStack.length?("Undo tersedia · "+undoStack.length):"Tidak ada perubahan";
}
function undo(){
 if(!undoStack.length||busy)return;
 var current=data(),previous=undoStack.pop();redoStack.push(current);busy=true;setData(previous);busy=false;update();
}
function redo(){
 if(!redoStack.length||busy)return;
 var current=data(),next=redoStack.pop();undoStack.push(current);busy=true;setData(next);busy=false;update();
}
function install(){
 if(!document.getElementById("prosUndoToolbar")){
  var bar=document.createElement("div");bar.id="prosUndoToolbar";bar.setAttribute("role","group");bar.setAttribute("aria-label","Undo and redo");
  bar.innerHTML='<button type="button" id="prosUndo" aria-label="Undo" title="Undo (Ctrl+Z)" disabled>↶</button><button type="button" id="prosRedo" aria-label="Redo" title="Redo (Ctrl+Y)" disabled>↷</button><span id="prosUndoStatus" aria-live="polite">Tidak ada perubahan</span>';
  document.body.appendChild(bar);
  var style=document.createElement("style");style.id="prosUndoStyle";
  style.textContent='#prosUndoToolbar{position:fixed;z-index:34;left:12px;bottom:calc(66px + env(safe-area-inset-bottom,0px));display:none;align-items:center;gap:4px;padding:4px;background:color-mix(in srgb,var(--bg,#fff) 94%,transparent);border:1px solid var(--ln,#ddd);border-radius:10px;box-shadow:0 3px 12px #0002;color:var(--tx,#171717);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}#prosUndoToolbar.visible{display:flex}#prosUndoToolbar button{width:32px;height:30px;display:grid;place-items:center;border:1px solid var(--ln,#ddd);border-radius:7px;background:var(--sf,#f5f5f5);color:inherit;padding:0;font:600 17px/1 Arial,sans-serif;cursor:pointer}#prosUndoToolbar button:disabled{opacity:.3;cursor:not-allowed}#prosUndoStatus{display:none}@media(max-width:640px){#prosUndoToolbar{left:8px;bottom:calc(62px + env(safe-area-inset-bottom,0px));padding:3px;gap:3px}#prosUndoToolbar button{width:30px;height:29px;font-size:16px}}';
  document.head.appendChild(style);
  document.getElementById("prosUndo").addEventListener("click",undo);
  document.getElementById("prosRedo").addEventListener("click",redo);
 }
 var ad=document.getElementById("ad");
 if(ad&&!ad.dataset.prosUndoBound){
  ad.dataset.prosUndoBound="1";
  ad.addEventListener("focusin",function(e){
   if(e.target&&e.target.matches("input,textarea,select,[contenteditable=true]"))capture();
  },true);
  ad.addEventListener("click",function(e){
   if(e.target&&e.target.closest("#prosUndoToolbar"))return;
   capture();
   if(e.target&&e.target.closest("button,[data-ar],[data-rmcol],[data-rmbuylink],[data-remove-color-variant]"))setTimeout(commit,0);
  },true);
  ad.addEventListener("change",function(e){
   if(e.target&&e.target.type==="file"){capture();pendingAsync=true;return;}
   var t=e.target;
   if(t&&((t.matches("input:not([type=checkbox]):not([type=radio]):not([type=color]),textarea,[contenteditable=true]"))))return;
   if(!beforeAction)capture();
   setTimeout(commit,0);
  },true);
  ad.addEventListener("input",function(){
   if(!typingBefore)typingBefore=beforeAction||data();
   if(typingTimer)clearTimeout(typingTimer);
   typingTimer=setTimeout(function(){
    push(typingBefore,data());typingBefore=null;typingTimer=null;
    if(beforeAction)beforeAction=null;
   },650);
  },true);
  if(typeof window.renderAd==="function"&&!window.renderAd.__prosUndoWrapped){
   var originalRenderAd=window.renderAd;
   var wrappedRenderAd=function(){
    var result=originalRenderAd.apply(this,arguments);
    if(pendingAsync){pendingAsync=false;setTimeout(commit,0);}
    return result;
   };
   wrappedRenderAd.__prosUndoWrapped=true;
   window.renderAd=wrappedRenderAd;
  }
 }
 update();
}
window.prosUndoCapture=capture;
window.prosUndoCommit=function(){
 if(typingTimer){clearTimeout(typingTimer);typingTimer=null;}
 if(typingBefore){push(typingBefore,data());typingBefore=null;}
 commit();
};
window.prosUndoReset=function(){undoStack=[];redoStack=[];beforeAction=null;typingBefore=null;pendingAsync=false;if(typingTimer)clearTimeout(typingTimer);typingTimer=null;update();};
document.addEventListener("keydown",function(e){
 if(!(e.ctrlKey||e.metaKey)||e.altKey)return;
 var ad=document.getElementById("ad");if(!ad||!ad.classList.contains("on"))return;
 var key=e.key.toLowerCase();
 if(key==="z"){e.preventDefault();if(e.shiftKey)redo();else undo();}
 else if(key==="y"){e.preventDefault();redo();}
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
var observer=new MutationObserver(update);
if(document.body)observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"]});
})();