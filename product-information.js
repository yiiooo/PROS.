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
  function installStyle(){
    if(document.getElementById("pros-info-style"))return;
    var st=document.createElement("style");st.id="pros-info-style";
    st.textContent=
      ".pros-info-admin{margin:18px 0;padding:14px;border:1px solid var(--ln);border-radius:10px;background:var(--sf)}"+
      ".pros-info-admin h2{margin:0 0 8px}.pros-info-help,.pros-info-hint{font-size:12px;line-height:1.5;color:var(--mu);margin:0 0 8px}"+
      ".pros-info-label{display:block;margin-top:12px;font-weight:700}.pros-info-textarea{display:block;width:100%;min-height:88px;resize:vertical;white-space:pre-wrap}"+
      ".pros-product-info{margin:16px 0 18px;min-width:0}.pros-info-tabs{display:flex;gap:8px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding:4px 1px 10px;-webkit-overflow-scrolling:touch}"+
      ".pros-info-tab{flex:0 0 auto;border:1px solid var(--ln);border-radius:999px;padding:8px 13px;background:var(--sf);color:inherit;font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}"+
      ".pros-info-tab[aria-selected=true]{background:var(--tx);color:var(--bg);border-color:var(--tx)}"+
      ".pros-info-panel{display:none}.pros-info-panel.is-active{display:block}.pros-info-panel h3{font-size:14px;margin:10px 0}"+
      ".pros-info-table-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--ln);border-radius:8px}"+
      ".pros-info-table{width:100%;border-collapse:collapse;min-width:320px;font-size:13px}.pros-info-table th,.pros-info-table td{padding:10px 12px;border-bottom:1px solid var(--ln);text-align:left;vertical-align:top}"+
      ".pros-info-table tr:last-child th,.pros-info-table tr:last-child td{border-bottom:0}.pros-info-table th{width:38%;font-weight:650;background:var(--sf)}"+
      "@media(max-width:640px){.pros-info-admin{padding:11px}.pros-info-table{min-width:300px}.pros-info-table th{width:40%}}";
    document.head.appendChild(st);
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
          '<h3>'+esc(sec.label)+'</h3><div class="pros-info-table-wrap"><table class="pros-info-table"><tbody>'+
          rows.map(function(row){return '<tr><th scope="row">'+esc(row[0])+'</th><td>'+esc(row[1])+'</td></tr>';}).join("")+
          '</tbody></table></div></div>';
      }).join("")+'</section>';
  }
  function init(){
    installStyle();
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
            var videos=Array.from(host.querySelectorAll(".pdl")).find(function(el){return /product videos/i.test(el.textContent||"");});
            if(videos)videos.insertAdjacentHTML("beforebegin",customerMarkup(p));
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