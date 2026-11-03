/* PROS Product Color Variant Admin module.
 * Uses shared globals: W, esc, toast, renderAd.
 */
function openProductImageEyedropper(pi,vi){
 var p=W&&W.products[pi];if(!p)return;var key=String(p.id),set=W.productColorVariants&&W.productColorVariants[key],v=set&&set.items&&set.items[vi];if(!v)return;
 var index=Number(v.imageIndex)||0,url=(p.imgs||[])[index];if(!url){toast("Add a product image and select it for this color first.");return;}
 var overlay=document.createElement("div");overlay.className="color-pick-overlay";overlay.innerHTML='<div class="pick-help">Tap the exact color on the product image to sample it.</div><img alt="Product image color picker"><div class="pick-help" id="colorPickStatus">Selected color: '+esc(v.hex||"#000000")+'</div><button type="button" id="cancelColorPick">Cancel</button>';
 document.body.appendChild(overlay);var img=overlay.querySelector("img");img.crossOrigin="anonymous";img.src=url;
 overlay.querySelector("#cancelColorPick").onclick=function(){overlay.remove()};
 img.addEventListener("click",function(ev){try{var r=img.getBoundingClientRect(),x=Math.max(0,Math.min(img.naturalWidth-1,Math.floor((ev.clientX-r.left)/r.width*img.naturalWidth))),y=Math.max(0,Math.min(img.naturalHeight-1,Math.floor((ev.clientY-r.top)/r.height*img.naturalHeight)));var canvas=document.createElement("canvas");canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;var ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0);var px=ctx.getImageData(x,y,1,1).data;var hex="#"+[px[0],px[1],px[2]].map(function(n){return n.toString(16).padStart(2,"0")}).join("").toUpperCase();v.hex=hex;overlay.remove();renderAd();toast("Color sampled: "+hex)}catch(err){console.warn("PROS eyedropper failed",err);var status=overlay.querySelector("#colorPickStatus");if(status)status.textContent="Could not sample this image. Check image CORS/access or use the color input.";}});
 img.addEventListener("error",function(){var status=overlay.querySelector("#colorPickStatus");if(status)status.textContent="Image could not be loaded for sampling."});
}
function colorVariantAdminHtml(p,pi){
 if(!W.productColorVariants)W.productColorVariants={};
 var key=String(p.id),set=W.productColorVariants[key]||{enabled:false,items:[]};
 if(!Array.isArray(set.items))set.items=[];W.productColorVariants[key]=set;
 var b="productColorVariants."+key+".";
 var options=(p.imgs||[]).map(function(src,i){return '<option value="'+i+'">Image '+(i+1)+'</option>'}).join("");
 return '<h2>Product Color Variants</h2><p class="mu" style="font-size:12px">Add one row for every color. Link Color 1 to Image 1, Color 2 to Image 2, Color 3 to Image 3, and choose a different swatch color for each.</p>'+
 '<label class="cb"><input type="checkbox" data-c="'+b+'enabled"'+(set.enabled?' checked':'')+'> Enable color variants</label>'+
 (set.items||[]).map(function(v,i){var path=b+'items.'+i+'.';return '<div class="color-variant-admin"><div class="variant-fields">'+
 '<div><label class="fl">Color name</label><input class="in2" data-f="'+path+'name" value="'+esc(v.name||'')+'" placeholder="e.g. Black"></div>'+
 '<div><label class="fl">Product image</label><select class="in2" data-f="'+path+'imageIndex">'+(options||'<option value="">Upload product images first</option>').replace('value="'+(v.imageIndex===undefined?0:v.imageIndex)+'"','value="'+(v.imageIndex===undefined?0:v.imageIndex)+'" selected')+'</select></div>'+
 '<div><label class="fl">Swatch color</label><div class="color-hex-row"><span class="variant-preview" style="background:'+esc(v.hex||'#000000')+'"></span><input type="color" data-color-picker="'+path+'hex" data-f="'+path+'hex" value="'+esc(v.hex||'#000000')+'" style="width:46px;height:36px;padding:2px;border:1px solid var(--ln);border-radius:6px;background:var(--sf)"><input class="in2" data-color-hex="'+path+'hex" value="'+esc(v.hex||'#000000')+'" placeholder="#000000"></div></div>'+
 '<div class="variant-tools"><button type="button" class="chip" data-pick-color="'+pi+'|'+i+'">Eyedropper from image</button><button type="button" class="chip" data-remove-color-variant="'+pi+'|'+i+'">Remove color</button></div></div></div>'}).join('')+
 '<button type="button" class="pill" data-add-color-variant="'+pi+'" style="margin-top:6px">+ Add color</button>';
}
