
(function(){
 var pal=[["#F3EEE6","#141312"],["#141312","#F3EEE6"],["#C75B39","#F3EEE6"],["#B8AD9C","#141312"],["#E2D6C2","#141312"]];
 var rot=[-6,4,-3,7,-4,2,-7,5,-2,6,-5,3];
 document.querySelectorAll(".rs[data-t]").forEach(function(el){
  var t=el.getAttribute("data-t"),i=0;
  Array.from(t).forEach(function(ch){
   var s=document.createElement("span");
   if(ch===" "){s.style.background="transparent";s.style.boxShadow="none";s.style.width="0.35em";s.textContent="\u00a0";el.appendChild(s);return}
   var c=pal[i%pal.length];
   s.textContent=ch;
   s.style.background=c[0];s.style.color=c[1];
   s.style.transform="rotate("+rot[i%rot.length]+"deg) translateY("+((i%3)-1)*2+"px)";
   el.appendChild(s);i++;
  });
 });
 var g=document.querySelector(".ab-ghost");
 var lg=document.querySelector("header .mark");
 if(g&&lg)g.src=lg.src;
})();
