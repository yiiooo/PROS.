/* PROS Size Guide editor module.
 * Uses shared classic-script globals from app.js: W, pth, esc, formatDetailContent, renderAd.
 */
function sizeMatrix(value){
 var raw=String(value||"").replace(/\r\n?/g,"\n");
 var rows=raw.split("\n").map(function(line){return line.trim().replace(/^\|+|\|+$/g,"").split("|").map(function(c){return c.trim()})}).filter(function(row){return row.some(function(c){return c!==""})});
 if(!rows.length)rows=[["Size","Chest (cm)","Length (cm)","Shoulder (cm)"],["S","","",""],["M","","",""],["L","","",""],["XL","","",""]];
 else if(raw.indexOf("|")<0)rows=[["Size","Chest (cm)","Length (cm)","Shoulder (cm)"],[raw.trim(),"","",""]];
 var cols=Math.max(2,rows.reduce(function(m,r){return Math.max(m,r.length)},0));
 rows=rows.map(function(r){while(r.length<cols)r.push("");return r});
 return rows;
}
function sizeSerialize(rows){return rows.map(function(row){return row.map(function(c){return String(c==null?"":c).trim()}).join(" | ")}).join("\n")}
function sizeEditorHtml(p,b){
 var rows=sizeMatrix(p.size),html='<div class="size-editor" data-size-editor="'+b+'size"><div class="size-editor-head"><b style="font-size:13px">Size chart · table editor</b><div class="size-editor-actions"><button type="button" data-size-addrow="'+b+'size">+ Add size row</button><button type="button" data-size-addcol-right="'+b+'size">+ Add column</button></div></div><div class="size-editor-scroll"><table class="size-editor-table"><thead><tr>';
 rows[0].forEach(function(c,j){html+='<th><div class="size-col-head"><input aria-label="Column name '+(j+1)+'" data-size-cell="0|'+j+'" data-size-path="'+b+'size" value="'+esc(c)+'" placeholder="Column name"><button type="button" aria-label="Delete column '+(j+1)+'" title="Delete column" data-size-delcol="'+b+'size|'+j+'">×</button></div></th>'});
 html+='<th class="row-tools">Delete</th></tr></thead><tbody>';
 rows.slice(1).forEach(function(row,ri){var i=ri+1;html+='<tr>';row.forEach(function(c,j){html+='<td><input aria-label="Row '+(i+1)+', column '+(j+1)+'" data-size-cell="'+i+'|'+j+'" data-size-path="'+b+'size" value="'+esc(c)+'" placeholder="'+(j===0?'Size':'Value')+'"></td>'});html+='<td class="row-tools"><button type="button" aria-label="Delete row" data-size-delrow="'+b+'size|'+i+'">×</button></td></tr>'});
 html+='</tbody></table></div></div><textarea data-f="'+b+'size" style="display:none" aria-hidden="true">'+esc(sizeSerialize(rows))+'</textarea><div class="size-admin-preview" data-size-preview="'+b+'size"><div class="preview-label">Size chart preview · swipe horizontally</div>'+formatDetailContent("Size guide",sizeSerialize(rows))+'</div>';
 return html;
}
function sizeEditAction(path,action,index){
 if(!W||!path)return false;
 var target=pth(W,path);
 if(!target||!target[0]||typeof target[0]!=="object")return false;
 var rows=sizeMatrix(target[0][target[1]]),cols=rows[0].length;
 if(action==="addrow"){
  // Add a new size at the bottom and suggest the next common clothing size.
  var sizeOrder=["XXS","XS","S","M","L","XL","XXL","XXXL","XXXXL","5XL","6XL"];
  var existing=rows.slice(1).map(function(row){return String(row[0]||"").trim().toUpperCase()});
  var next="";
  for(var si=0;si<sizeOrder.length;si++){if(existing.indexOf(sizeOrder[si])<0){next=sizeOrder[si];break}}
  if(!next)next="Size "+rows.length;
  var newRow=Array(cols).fill("");newRow[0]=next;rows.push(newRow);
 }else if(action==="addcol-right")rows.forEach(function(row,i){row.push(i===0?"New column":"")});
 else if(action==="delrow"&&rows.length>2&&index>0&&index<rows.length)rows.splice(index,1);
 else if(action==="delcol"&&cols>2&&index>=0&&index<cols)rows.forEach(function(row){row.splice(index,1)});
 else return false;
 target[0][target[1]]=sizeSerialize(rows);
 renderAd();
 return true;
}
