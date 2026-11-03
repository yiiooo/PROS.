
(function(){
  if(!window.matchMedia||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  var glow=document.createElement('div');glow.className='pros-cursor-glow';glow.setAttribute('aria-hidden','true');document.body.appendChild(glow);
  var raf=0,x=0,y=0;
  document.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch')return;
    x=e.clientX;y=e.clientY;
    if(!raf)raf=requestAnimationFrame(function(){document.documentElement.style.setProperty('--pros-mx',x+'px');document.documentElement.style.setProperty('--pros-my',y+'px');document.body.classList.add('pros-pointer-active');raf=0;});
  },{passive:true});
  document.addEventListener('pointerleave',function(){document.body.classList.remove('pros-pointer-active');});
})();
