/* PROS storefront catalog and cart rendering.
 * Loaded before app.js; functions use shared classic-script globals at call time.
 */
function renderCollections(){
 var h="";
 var list = DB.collections || [];
 if(!list.length){
  h='<div class="empty">No outfit sets yet.</div>';
 } else {
  list.forEach(function(col){
   var bgStyle = col.src ? "background:url('"+col.src+"') center/cover no-repeat;" : "background:linear-gradient(135deg, var(--deep), var(--olive));";
   h+='<div class="col-card">'+
      '<div class="col-img-wrap" style="'+bgStyle+'" data-colzoom="'+esc(col.src||"")+'" title="Click to zoom photo">'+(!col.src?'<span class="pr notranslate" translate="no">PROS.</span> LOOK':'')+'</div>'+
      '<div class="col-content">'+
        '<div class="col-title">'+esc(col.name)+'</div>'+
        '<div class="col-desc">'+esc(col.desc)+'</div>'+
        '<div class="col-items-title">Products in this set:</div>'+
        '<div class="col-items-grid">';
   
   var pIds = col.productIds || [];
   if(!pIds.length){
    h+='<div class="mu" style="font-size:13px">No products added to this set yet.</div>';
   } else {
    pIds.forEach(function(pid){
     var p = gp(pid);
     if(p){
      h+='<div class="col-item-row">'+
         '<div class="col-item-thumb" data-open="'+p.id+'" style="background:'+pic(p,0)+'">'+ltr(p)+'</div>'+
         '<div class="col-item-info"><div class="col-item-name notranslate product-name-anton" translate="no" data-open="'+p.id+'">'+esc(p.name)+'</div><div class="col-item-cat">'+esc(p.cat)+' · '+esc(p.sty)+'</div></div>'+
         '<button class="vw" style="flex:none;width:54px;height:30px;font-size:11px" data-open="'+p.id+'">View</button>'+
         '</div>';
     }
    });
   }
   h+='</div></div></div>';
  });
 }
 $("collist").innerHTML=h;
}


function renderHome(){
 var homeCats=$("homecats");if(homeCats)homeCats.innerHTML="";
 var allBtn=$("allCatBtn");if(allBtn){allBtn.style.background="";allBtn.innerHTML="<span>Explore All Categories</span><span>↗</span>";}
 $("best").innerHTML=P.filter(function(p){return p.best}).map(function(p){return card(p, P.indexOf(p))}).join("")||'<div class="empty" style="grid-column:1/-1">No best sellers yet.</div>'}
function renderCategoryOverview(){
 var root=$("categoryOverview");if(!root)return;
 var names=[],seen={};
 P.forEach(function(p){var name=String(p.cat||"").trim();if(name&&!seen[name]){seen[name]=1;names.push(name)}});
 var labels={"T-Shirt":"T-Shirts","Hoodie":"Hoodies & Sweaters","Accessories":"Accessories","Pants":"Pants"};
 var all='<button class="category-tile category-tile-all" data-category-choice="All"><span class="category-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg></span><strong>All Products</strong><small>'+P.length+' products</small></button>';
 root.innerHTML=all+names.map(function(name){
  var count=P.filter(function(p){return p.cat===name}).length,icon=ART[name]||'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></svg>';
  return '<button class="category-tile" data-category-choice="'+esc(name)+'"><span class="category-icon">'+icon+'</span><strong>'+esc(labels[name]||name)+'</strong><small>'+count+' products</small></button>';
 }).join("");
}
var AZL="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var PRICE_RANGES=[{label:"All Price",min:0,max:9999},{label:"$20 - $40",min:20,max:40},{label:"$41 - $70",min:41,max:70},{label:"$71 - $100+",min:71,max:9999}];
function chip(t){return '<button class="chip'+(t==st.cat?' on':'')+'" data-cat="'+t+'">'+t+'</button>'}
function priceChip(pr){var lbl=pr.label,on=(st.priceRange===lbl||(!st.priceRange&&lbl=="All Price"));return '<button class="chip'+(on?' on':'')+'" data-pr="'+lbl+'">'+lbl+'</button>'}
function baseList(){var c=st.cat, list=P;if(c=="New Release")list=P.filter(function(p){return p.isNew}).sort(function(a,b){return (b.added||0)-(a.added||0)});else if(c!="All")list=P.filter(function(p){return p.cat==c&&(!st.sty||p.sty==st.sty)});
if(st.priceRange && st.priceRange!="All Price"){
 var prObj=PRICE_RANGES.find(function(x){return x.label==st.priceRange});
 if(prObj){list=list.filter(function(p){var pr=p.price!==undefined?p.price:30;return pr>=prObj.min&&pr<=prObj.max});}
}
if(st.priceRange && st.priceRange!="All Price"){list=list.slice().sort(function(a,b){var pa=a.price!==undefined?a.price:30,pb=b.price!==undefined?b.price:30;if(pa!==pb)return pa-pb;return P.indexOf(a)-P.indexOf(b)});}
return list;}
function renderCat(){var c=st.cat,base=baseList(),have={},L=st.letters;
 $("catchips").innerHTML=["All","New Release"].concat(CN).map(chip).join("");
 $("pricechips").innerHTML=PRICE_RANGES.map(priceChip).join("");
 base.forEach(function(p){have[p.name[0].toUpperCase()]=1});
 var sum=L.length?L.join(", "):(st.az?"sorted":"");
 $("azbar").innerHTML='<button class="azh" data-azt>A-Z<span>'+(sum?sum+" ":"")+(st.azOpen?"▴":"▾")+'</span></button>'+(st.azOpen?'<div class="azb">'+AZL.map(function(x){return '<button data-lt="'+x+'"'+(have[x]?'':' disabled')+(L.indexOf(x)>-1?' class="on"':'')+'>'+x+'</button>'}).join("")+'</div><div class="chips"><button class="chip'+(st.az?' on':'')+'" data-azs>Sort A-Z</button>'+(L.length?'<button class="chip" data-lt="">Clear letters</button>':'')+'</div>':'');
 $("stychips").innerHTML=CATS[c]?['<button class="chip'+(st.sty?'':' on')+'" data-sty="">All</button>'].concat(CATS[c].map(function(x){return '<button class="chip'+(x==st.sty?' on':'')+'" data-sty="'+x+'">'+x+'</button>'})).join(""):"";
 var list=base;if(L.length)list=list.filter(function(p){return L.indexOf(p.name[0].toUpperCase())>-1});
 if(L.length||st.az){list=list.slice().sort(function(p,q){return p.name.localeCompare(q.name)});var h="",f="";list.forEach(function(p){var k=p.name[0].toUpperCase();if(k!=f){f=k;h+='<div class="az">'+k+'</div>'}h+=card(p, P.indexOf(p))});$("catgrid").innerHTML=h;return}
 $("catgrid").innerHTML=list.map(function(p){return card(p, P.indexOf(p))}).join("")}
var bought=[];try{bought=JSON.parse(localStorage.getItem("pros_bought")||"[]")}catch(e){}
function citem(i){var p=gp(i),b=bought.indexOf(i)>-1,pPrice=p.price!==undefined?p.price:30;return '<div class="item'+(b?' done':'')+'"><button class="ck'+(b?' on':'')+'" data-mark="'+i+'" role="checkbox" aria-checked="'+b+'" aria-label="'+(b?'Mark as not purchased':'Mark as purchased')+'">'+(b?'✓':'')+'</button><div class="th" data-open="'+i+'" style="background:'+pic(p,0)+'">'+ltr(p)+'</div><div data-open="'+i+'"><b class="notranslate product-name-anton" translate="no">'+esc(p.name)+'</b>'+priceHtml(p,"font-size:13px")+'<div style="color:var(--mu);font-size:13px">'+p.cat+'</div></div><button class="rm" data-rm="'+i+'" aria-label="Remove">✕</button></div>'}
function renderCart(){cart=cart.filter(function(i){return gp(i)});bought=bought.filter(function(i){return gp(i)});try{localStorage.setItem("pros_cart",JSON.stringify(cart));localStorage.setItem("pros_bought",JSON.stringify(bought))}catch(e){}
 var todo=cart.filter(function(i){return bought.indexOf(i)<0}),done=cart.filter(function(i){return bought.indexOf(i)>-1}),d=$("dot"),h="";
 d.style.display=todo.length?"grid":"none";d.textContent=todo.length;
 if(!cart.length){h='<div class="empty">Your cart is empty.<br>Tap the cart icon on products you like.</div>'}
 else{h='<div class="ct">To buy <span>'+todo.length+'</span></div>'+(todo.length?todo.map(citem).join(""):'<div class="empty" style="padding:16px">Nothing left to buy.</div>')+'<div class="ct">Purchased <span>'+done.length+'</span></div>'+(done.length?done.map(citem).join(""):'<div class="empty" style="padding:16px">Tap the circle on an item after you buy it.</div>')+'<p class="cn">Mark items yourself after buying on Amazon or eBay. This list is only for you.</p>'}
 $("cartlist").innerHTML=h}

