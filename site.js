/* DALA ENERGY: applies everything saved in the admin dashboard (site-data.js) to the page. */
(function(){
var d=document,R=d.documentElement,S=window.DALA_SITE||{};
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function dg(s){return String(s).replace(/\D/g,'')}
var pg=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'')||'index';
/* design */
var D=S.design||{};
['navy','deep','green','orange','blue'].forEach(function(k){if(D[k])R.style.setProperty('--'+k,D[k])});
if(D.radius!=null&&D.radius!=='')R.style.setProperty('--btn-r',D.radius+'px');
if(D.font){if(D.gf){var l=d.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(D.gf)+':wght@400;600;800&display=swap';d.head.appendChild(l)}d.body.style.fontFamily=D.font}
if(D.noAnim)R.classList.add('dl-noanim');
if(D.slideSeconds)window.DALA_SLIDE_SECONDS=+D.slideSeconds;
/* text */
var T=S.text||{};
d.querySelectorAll('[data-k]').forEach(function(e){var v=T[e.getAttribute('data-k')];if(v==null||v==='')return;e.innerHTML=e.hasAttribute('data-fmt')?esc(v).replace(/\*(.+?)\*/g,'<em>$1</em>'):esc(v)});
/* contact */
var C=S.contact||{},O={p1:'+234 904 558 1684',p2:'+234 803 882 3893',em:'Dalaenergyltd@gmail.com',ad:'No. 35 France Road, by Igbo Road, Kano'},M=[];
if(C.phone1&&C.phone1!==O.p1){M.push([O.p1,C.phone1],[dg(O.p1),dg(C.phone1)])}
if(C.phone2&&C.phone2!==O.p2){M.push([O.p2,C.phone2],[dg(O.p2),dg(C.phone2)])}
if(C.email&&C.email!==O.em)M.push([O.em,C.email]);
if(C.address&&C.address!==O.ad)M.push([O.ad,C.address]);
if(M.length){var w=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT),n,L=[];while(n=w.nextNode())L.push(n);
L.forEach(function(t){var v=t.nodeValue;M.forEach(function(m){v=v.split(m[0]).join(m[1])});if(v!==t.nodeValue)t.nodeValue=v});
d.querySelectorAll('a[href]').forEach(function(a){var h=a.getAttribute('href'),v=h;M.forEach(function(m){v=v.split(m[0]).join(m[1])});if(v!==h)a.setAttribute('href',v)})}
if(C.address)d.querySelectorAll('a[href*="google.com/maps/search"]').forEach(function(a){a.setAttribute('href','https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(C.address))});
/* social links */
var SO=S.social||{},names={facebook:'Facebook',instagram:'Instagram',tiktok:'TikTok',x:'X',youtube:'YouTube',linkedin:'LinkedIn'},sh='';
Object.keys(names).forEach(function(k){if(SO[k])sh+='<a href="'+esc(SO[k])+'" target="_blank" rel="noopener">'+names[k]+'</a>'});
var fc=d.querySelector('.dl-fgrid>div:nth-child(3)');if(sh&&fc){var h3=d.createElement('h3');h3.textContent='Follow us';h3.style.marginTop='14px';var wr=d.createElement('div');wr.innerHTML=sh;fc.appendChild(h3);fc.appendChild(wr)}
/* SEO */
var Q=(S.seo||{})[pg]||{};
if(Q.title){d.title=Q.title;var ot=d.querySelector('meta[property="og:title"]');if(ot)ot.setAttribute('content',Q.title)}
if(Q.description){var md=d.querySelector('meta[name="description"]');if(md)md.setAttribute('content',Q.description);var od=d.querySelector('meta[property="og:description"]');if(od)od.setAttribute('content',Q.description)}
/* sliders */
var SL=(S.slides||{})[pg];
if(SL&&SL.length){var bx=d.querySelector('.dl-slides');
if(pg==='index'){window.DALA_SLIDES=SL.map(function(x){return x.src});window.DALA_CAPTIONS=SL.map(function(x){return x.caption||''})}
else if(bx){bx.setAttribute('data-slides',SL.map(function(x){return x.src}).join(','));bx.setAttribute('data-captions',SL.map(function(x){return x.caption||''}).join('|'))}}
/* products */
var P=S.products;
if(P&&P.items&&pg==='equipment'){
var wa=dg(C.phone1||O.p1),mn=d.getElementById('main'),old=[].slice.call(mn.querySelectorAll('section.dl-sec')).filter(function(s){return s.querySelector('.dl-pc')});
var anchor=old.length?old[0]:null,html='';
(P.categories||[]).forEach(function(cat,ci){var it=P.items.filter(function(x){return x.cat===cat});if(!it.length)return;
html+='<section class="dl-sec"><div class="dl-wrap"><h2>'+esc(cat)+'</h2><p class="dl-lead2">Prices and availability are confirmed on request.</p><div class="dl-grid">'+it.map(function(x){
var pr=x.price?(/^[\d.,\s]+$/.test(x.price)?'₦'+esc(x.price):esc(x.price)):'Contact for Price',out=x.stock==='out',tag=x.stock==='in'?' · In stock':(out?' · Out of stock':'');
var img=x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.name)+'" loading="lazy" onerror="this.remove()">':'';
var msg=function(t){return 'https://wa.me/'+wa+'?text='+encodeURIComponent('Hello DALA ENERGY, '+t)};
return '<div class="dl-card dl-pc"><div class="dl-pimg"><span aria-hidden="true">Product image</span>'+img+'</div><h3>'+esc(x.name)+'</h3><p>'+esc(x.desc||'')+'</p><p class="dl-price">'+pr+esc(tag)+'</p><div class="dl-row"><a class="dl-btn dl-btn-vd" href="'+msg('I would like details about '+x.name+'.')+'">View Details</a>'+(out?'<span class="dl-btn dl-btn-w" style="opacity:.45;pointer-events:none">Out of stock</span>':'<a class="dl-btn dl-btn-w" href="'+msg('I would like to order '+x.name+'.')+'">Order on WhatsApp</a>')+'</div></div>'}).join('')+'</div></div></section>'});
if(anchor){anchor.insertAdjacentHTML('beforebegin',html);old.forEach(function(s){s.remove()})}}
})();
