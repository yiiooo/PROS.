/* PROS storefront site content: hero, banner, social links and gallery. */
function renderHeroBanner(){
 var hb=$("hb"), u=DB.heroBanner&&DB.heroBanner.src;
 hb.className=u?"hero im":"hero";
 hb.style.background=u?"url('"+u+"') center/cover no-repeat":"";
 var HI=DB.heroIcons||{};
 function hic(k,bg,svg){var u=HI[k];return u?'<i style="background:url(\''+u+'\') center/cover no-repeat"></i>':'<i style="background:'+bg+'">'+svg+'</i>'}
 hb.innerHTML='<div class="hero-default-content"><button class="exp" data-gocol>Explore<br>The Collection</button><div class="pan"><button data-go="about">'+hic("sm","#B8AD9C",'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-4 4-6 8-6s7 2 8 6"></path></svg>')+'Social Media</button><button data-go="about">'+hic("pic","#8E8478",'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="10" r="1.5"></circle><path d="M4 18l5-5 4 4 3-3 4 4"></path></svg>')+'Picture</button><button data-go="about">'+hic("vid","#E2D6C2",'<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"></path></svg>')+'Watch Video</button></div></div>';
}

function renderBanner(){var b=$("bn"),u=DB.banner.src;b.style.display="";b.className=u?"banner im":"banner";b.innerHTML=u?(u.match(/\.mp4($|\?)/i)?'<video src="'+u+'" autoplay muted loop playsinline></video>':'<img src="'+u+'" alt="">'):SKYS}

var MS_ICON={"facebook": "<svg viewBox=\"0 0 24 24\"><path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/></svg>", "instagram": "<svg viewBox=\"0 0 24 24\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" ry=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"/><line x1=\"17.5\" y1=\"6.5\" x2=\"17.51\" y2=\"6.5\"/></svg>", "pinterest": "<svg viewBox=\"0 0 24 24\"><path d=\"M12 2a10 10 0 0 0-3.62 19.33c-.1-.83-.19-2.1.04-3 .22-.94 1.42-6 1.42-6s-.36-.72-.36-1.78c0-1.67.97-2.92 2.18-2.92 1.03 0 1.53.77 1.53 1.7 0 1.03-.66 2.58-1 4.02-.29 1.22.61 2.21 1.81 2.21 2.18 0 3.86-2.3 3.86-5.61 0-2.93-2.11-4.98-5.12-4.98-3.48 0-5.52 2.61-5.52 5.31 0 1.05.4 2.18.9 2.79.1.12.11.23.08.35l-.34 1.38c-.05.21-.18.26-.41.15-1.54-.72-2.5-2.98-2.5-4.8 0-3.91 2.84-7.5 8.19-7.5 4.3 0 7.64 3.07 7.64 7.18 0 4.29-2.7 7.76-6.44 7.76-1.26 0-2.44-.65-2.84-1.42l-.77 2.94c-.28 1.08-1.04 2.43-1.55 3.25A10 10 0 1 0 12 2z\"/></svg>", "tiktok": "<svg viewBox=\"0 0 24 24\"><path d=\"M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65a6.33 6.33 0 0 0 10.86 4.47V10.22a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.65z\"/></svg>", "x": "<svg viewBox=\"0 0 24 24\"><path d=\"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z\"/></svg>"},MS_LABEL={"facebook": "Facebook", "instagram": "Instagram", "pinterest": "Pinterest", "tiktok": "TikTok", "x": "X"},MS_KEYS=["facebook","instagram","pinterest","tiktok","x"],MS_URL={"facebook": "https://facebook.com", "instagram": "https://instagram.com", "pinterest": "https://pinterest.com", "tiktok": "https://tiktok.com", "x": "https://twitter.com"};
function msDefault(){var o={};MS_KEYS.forEach(function(k){o[k]={url:MS_URL[k],show:true}});return o}
function renderMenuSoc(){
 var cfg=(DB&&DB.menuSoc)||msDefault(),h="";
 MS_KEYS.forEach(function(k){var c=cfg[k]||{};if(c.show!==false&&c.url){h+='<a class="menu-soc-btn" href="'+esc(c.url)+'" target="_blank" rel="noopener">'+MS_ICON[k]+'<span>'+MS_LABEL[k]+'</span></a>'}});
 var el=document.getElementById("menuSocs");if(el)el.innerHTML=h;
}
function menuSocAdmin(){
 var cfg=(W&&W.menuSoc)||msDefault();
 return '<h2>Burger menu: social media</h2><p class="mu" style="margin-bottom:10px">Turn each platform on or off and set its link. Off means it will not show in the burger menu.</p>'+
  MS_KEYS.map(function(k){var c=cfg[k]||{};return '<div class="arow" style="flex-direction:column;align-items:stretch;gap:6px"><label class="cb" style="margin:0"><input type="checkbox" data-c="menuSoc.'+k+'.show"'+(c.show!==false?' checked':'')+'> Show '+MS_LABEL[k]+'</label><input class="in2" data-f="menuSoc.'+k+'.url" value="'+esc(c.url||"")+'" placeholder="https://..."></div>'}).join("")
}
var PL={ig:"Instagram",fb:"Facebook",tt:"TikTok",x:"X"};
function gplat(u){u=String(u||"").toLowerCase();if(/tiktok\.com/.test(u))return "tiktok";if(/pinterest\./.test(u))return "pinterest";if(/facebook\.com|fb\.com|fb\.watch/.test(u))return "facebook";if(/(^|\/\/|\.)(x|twitter)\.com/.test(u))return "x";return "instagram"}
function gfoot(p,i){var m=(DB.gmeta&&DB.gmeta[p]&&DB.gmeta[p][i])||{};if(!m.id&&!m.post)return "";var ic=gplat(m.post);var inner='<span class="gico">'+(MS_ICON[ic]||"")+'</span><span class="gid">'+esc(m.id||"View post")+'</span>';return m.post?'<a class="gh" href="'+esc(m.post)+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="gh">'+inner+'</div>'}
function renderGal(){var h="",v=DB.gv.map(function(u,i){return '<div class="g">'+gfoot("gv",i)+'<div class="m vm"><video src="'+u+'" controls playsinline preload="metadata"></video><em>Video</em></div></div>'}),f=DB.gp.map(function(u,i){return '<div class="g">'+gfoot("gp",i)+'<div class="m" data-colzoom="'+esc(u)+'" style="background:url(\''+u+'\') center/cover"><em>Photo</em></div></div>'});
 if(v.length+f.length)h+='<h2>Gallery</h2><div class="gal">'+v.concat(f).join("")+'</div>';
 if(DB.ev.length)h+='<h2>Events and Promos</h2><div class="evs">'+DB.ev.map(function(e){return '<div class="evi"><img src="'+e.src+'" alt="">'+(e.cap?'<div>'+esc(e.cap)+'</div>':'')+'</div>'}).join("")+'</div>';
 var L=DB.social.links.filter(function(l){return l.url});
 if(L.length)h+='<h2>Follow us</h2><div class="sls">'+L.map(function(l){return '<a class="sl" href="'+esc(l.url)+'" target="_blank" rel="noopener"><b>'+(PL[l.p]||"Link")+'</b>'+(l.n?'<span>'+esc(l.n)+'</span>':'')+'</a>'}).join("")+'</div>';
 $("gal").innerHTML=h}
