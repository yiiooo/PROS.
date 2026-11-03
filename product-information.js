/* PROS Product Information — additive feature; leaves existing Size Guide editor untouched. */
(function(){
  "use strict";
  var sections=[
    {id:"style",label:"Style",hint:"Silhouette, fit, aesthetic, occasion, and styling notes."},
    {id:"itemDetails",label:"Item Details",hint:"Product type, closure, neckline, sleeve, pocket, pattern, and other item attributes."},
    {id:"featuresSpecs",label:"Features & Specs",hint:"Construction, design features, dimensions, and technical details."},
    {id:"materialsCare",label:"Materials & Care",hint:"Fabric composition, lining, washing, drying, and care instructions."},
    {id:"measurements",label:"Measurements",hint:"Garment measurements and fit notes. Keep size-by-size charts in the existing Size Guide."}
  ];
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function parseRows(value){
    return String(value||"").split(/\r?\n/).map(function(line){
      line=line.trim(); if(!line)return null;
      var at=line.indexOf("|");
      if(at<0)at=line.indexOf("\t");
      if(at<0)at=line.indexOf(":");
      if(at<0)return [line,""];
      return [line.slice(0,at).trim(),line.slice(at+1).trim()];
    }).filter(function(row){return row&&row[0]&&row[1];});
  }
  function ensureInfo(p){if(!p.info||typeof p.info!=="object")p.info={};return p.info;}
  function panelPlainText(panel){
    if(!panel)return "";
    var title=panel.querySelector("h3"),rows=Array.from(panel.querySelectorAll("table tr"));
    var lines=rows.map(function(row){
      var cells=Array.from(row.querySelectorAll("th,td")).map(function(cell){return (cell.textContent||"").trim();}).filter(Boolean);
      return cells.length>1?cells[0]+": "+cells.slice(1).join(" "):cells.join(" ");
    }).filter(Boolean);
    return [title&&(title.textContent||"").trim()].concat(lines).filter(Boolean).join("\n");
  }
  function legacyCopy(text){
    return new Promise(function(resolve,reject){
      var input=document.createElement("textarea");
      input.className="pros-info-copy-buffer";
      input.value=text;
      input.setAttribute("readonly","");
      document.body.appendChild(input);
      input.select();
      var ok=false;
      try{ok=document.execCommand("copy");}catch(err){}
      input.remove();
      ok?resolve():reject(new Error("Clipboard copy failed"));
    });
  }
  function copyPlainText(text){
    if(navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){
      return navigator.clipboard.writeText(text).catch(function(){return legacyCopy(text);});
    }
    return legacyCopy(text);
  }
  function adminMarkup(pi,p){
    var info=ensureInfo(p);
    return '<section class="pros-info-admin"><h2>Product Information</h2>'+
      '<p class="pros-info-help">Add details as one item per line using <b>Label | Value</b>. Example: Fit | Oversized. Empty sections will not appear on the product page. This is separate from the existing Size Guide.</p>'+
      sections.map(function(sec){
        return '<label class="fl pros-info-label" for="pros-info-'+sec.id+'">'+esc(sec.label)+'</label>'+
          '<p class="mu pros-info-hint">'+esc(sec.hint)+'</p>'+
          '<textarea class="in2 pros-info-textarea" id="pros-info-'+sec.id+'" data-pros-info="'+sec.id+'" data-pros-info-product="'+pi+'" rows="4" placeholder="Fit | Oversized&#10;Style | Streetwear">'+esc(info[sec.id]||"")+'</textarea>';
      }).join("")+'</section>';
  }
  function customerMarkup(p){
    var info=ensureInfo(p),available=sections.filter(function(sec){return parseRows(info[sec.id]).length;});
    if(!available.length)return "";
    var first=available[0].id;
    return '<section class="pros-product-info" aria-label="Product information">'+
      '<div class="pros-info-tabs" role="tablist" aria-label="Product information sections">'+
      available.map(function(sec){return '<button type="button" class="pros-info-tab" role="tab" data-pros-info-tab="'+sec.id+'" aria-selected="'+(sec.id===first?'true':'false')+'">'+esc(sec.label)+'</button>';}).join("")+
      '</div>'+
      available.map(function(sec){
        var rows=parseRows(info[sec.id]);
        return '<div class="pros-info-panel'+(sec.id===first?' is-active':'')+'" role="tabpanel" data-pros-info-panel="'+sec.id+'">'+
          '<div class="pros-info-panel-head"><h3>'+esc(sec.label)+'</h3><button type="button" class="pros-info-copy" data-pros-info-copy="'+sec.id+'">Copy text</button></div><div class="pros-info-table-wrap"><table class="pros-info-table"><tbody>'+
          rows.map(function(row){return '<tr><th scope="row">'+esc(row[0])+'</th><td>'+esc(row[1])+'</td></tr>';}).join("")+
          '</tbody></table></div></div>';
      }).join("")+'</section>';
  }
  function init(){
    if(typeof window.renderAd==="function"&&!window.renderAd.__prosInfoWrapped){
      var oldRenderAd=window.renderAd;
      var wrappedRenderAd=function(){
        oldRenderAd.apply(this,arguments);
        try{
          if(typeof A==="undefined"||A.t!=="p"||A.pi<0)return;
          var p=W&&W.products&&W.products[A.pi],host=document.getElementById("adc");
          if(!p||!host)return;
          var marker=host.innerHTML.indexOf('<h2>Photos / GIFs</h2>');
          if(marker<0||host.querySelector(".pros-info-admin"))return;
          var html=adminMarkup(A.pi,p);
          host.innerHTML=host.innerHTML.slice(0,marker)+html+host.innerHTML.slice(marker);
        }catch(err){console.warn("PROS product information admin UI:",err);}
      };
      wrappedRenderAd.__prosInfoWrapped=true;
      window.renderAd=wrappedRenderAd;
    }
    if(typeof window.open_==="function"&&!window.open_.__prosInfoWrapped){
      var oldOpen=window.open_;
      var wrappedOpen=function(){
        var result=oldOpen.apply(this,arguments);
        try{
          var p=typeof gp==="function"?gp(arguments[0]):null;
          var host=document.querySelector("#detail .info");
          if(p&&host){
            var sizeSummary=Array.from(host.querySelectorAll("details summary")).find(function(el){return /^size guide$/i.test((el.textContent||"").trim());});
            var videos=Array.from(host.querySelectorAll(".pdl")).find(function(el){return /product videos/i.test(el.textContent||"");});
            var markup=customerMarkup(p);
            if(sizeSummary&&sizeSummary.parentNode)sizeSummary.parentNode.insertAdjacentHTML("beforebegin",markup);
            else if(videos)videos.insertAdjacentHTML("beforebegin",markup);
          }
        }catch(err){console.warn("PROS product information display:",err);}
        return result;
      };
      wrappedOpen.__prosInfoWrapped=true;
      window.open_=wrappedOpen;
    }
    var admin=document.getElementById("ad");
    if(admin&&!admin.dataset.prosInfoBound){
      admin.dataset.prosInfoBound="1";
      admin.addEventListener("input",function(e){
        var t=e.target;if(!t||!t.dataset||!t.dataset.prosInfo)return;
        var pi=Number(t.dataset.prosInfoProduct),p=W&&W.products&&W.products[pi];
        if(!p)return;
        ensureInfo(p)[t.dataset.prosInfo]=t.value;
      });
    }
    var detail=document.getElementById("detail");
    if(detail&&!detail.dataset.prosInfoTabsBound){
      detail.dataset.prosInfoTabsBound="1";
      detail.addEventListener("click",function(e){
        var copy=e.target.closest("[data-pros-info-copy]");
        if(copy){
          e.preventDefault();
          var panel=copy.closest("[data-pros-info-panel]"),plain=panelPlainText(panel),original=copy.textContent;
          if(!plain)return;
          copy.disabled=true;
          copyPlainText(plain).then(function(){
            copy.textContent="Copied";
            if(typeof window.toast==="function")window.toast("Product information copied as plain text.");
          }).catch(function(){
            copy.textContent="Copy failed";
            if(typeof window.toast==="function")window.toast("Could not copy product information.");
          }).finally(function(){setTimeout(function(){copy.textContent=original;copy.disabled=false;},1600);});
          return;
        }
        var tab=e.target.closest("[data-pros-info-tab]");if(!tab)return;
        var section=tab.dataset.prosInfoTab,root=tab.closest(".pros-product-info");if(!root)return;
        root.querySelectorAll("[data-pros-info-tab]").forEach(function(b){b.setAttribute("aria-selected",b===tab?"true":"false");});
        root.querySelectorAll("[data-pros-info-panel]").forEach(function(panel){panel.classList.toggle("is-active",panel.dataset.prosInfoPanel===section);});
      });
    }
  }
  /* Persist the extra attributes in the existing site_settings JSON setting. */
  function attachLoaded(map,products){
    (products||[]).forEach(function(p){p.info=(map&&map[String(p.id)])||p.info||{};});
  }
  window.prosProductInformationAttach=attachLoaded;
  window.prosProductInformationBuild=function(products){
    var map={};(products||[]).forEach(function(p){if(p&&p.id!=null&&p.info)map[String(p.id)]=p.info;});return map;
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();