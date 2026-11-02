/* DALA ENERGY smart product search: live suggestions, typo tolerance, results view, product details. Reads the products on this page (managed from the dashboard). */
(function(){
var d=document,q=d.getElementById('dlq');if(!q)return;
var form=q.closest('form'),sug=d.getElementById('dlsug'),res=d.getElementById('dlres'),clr=form.querySelector('.dl-s-x'),P=[],act=-1,cur=[];
var DEFDESC='Available at our outlet. Prices and availability are confirmed on request.';
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function sing(t){return t.length>3&&t.slice(-1)==='s'?t.slice(0,-1):t}
function toks(s){return norm(s).split(/[^a-z0-9]+/).filter(Boolean).map(sing)}
function slug(s){return norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var SYN=[['cctv','camera','cam','surveillance','security'],['solar','pv','photovoltaic','panel'],['hdd','harddrive','hard','disk','drive','storage'],['psu','power','supply','adapter','adaptor'],['wifi','router','network','wireless','networking'],['ethernet','lan','rj45','cat5','cat6','patch'],['bnc','coax','coaxial','rg59'],['dvr','recorder'],['nvr','recorder'],['battery','batt','cell'],['inverter','ups'],['surge','protector','protection','spd'],['bracket','mount','mounting','stand'],['conduit','pipe','pvc'],['trunking','duct','channel'],['cable','wire','cord','lead'],['connector','plug','jack'],['multimeter','meter','tester'],['monitor','screen','display','tv'],['switch','poe','hub']].map(function(g){return g.map(sing)});
function lev(a,b){var m=a.length,n=b.length,p=[],i,j;for(j=0;j<=n;j++)p[j]=j;for(i=1;i<=m;i++){var c=[i];for(j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
function tokScore(t,F){var best=0;F.forEach(function(f){f.t.forEach(function(w){var s=0;
if(w===t)s=10;else if(t.length>=2&&w.indexOf(t)===0)s=8;else if(t.length>=3&&w.indexOf(t)>-1)s=6;else if(w.length>=4&&t.indexOf(w)===0)s=5;
else{var m=t.length<=3?0:t.length<=5?1:2;if(m){var dd=lev(t,w);if(dd<=m)s=6-dd}}
s*=f.w;if(s>best)best=s})});return best}
/* index the products on the page */
function index(){P=[];d.querySelectorAll('.dl-pc').forEach(function(el){if(res.contains(el))return;var h=el.querySelector('h3');if(!h)return;
var sec=el.closest('section'),h2=sec&&sec.querySelector('h2'),pr=(el.querySelector('.dl-price')||{}).textContent||'',im=el.querySelector('.dl-pimg img'),ds=((el.querySelector('p')||{}).textContent||'').trim();
var st=/out of stock/i.test(pr)?'out':/in stock/i.test(pr)?'in':'ask',o={id:slug(h.textContent),name:h.textContent.trim(),cat:h2?h2.textContent.trim():'',price:pr.split(' · ')[0].trim()||'Contact for Price',stock:st,img:im?im.getAttribute('src'):'',desc:ds,brand:el.getAttribute('data-brand')||'',kw:el.getAttribute('data-kw')||'',el:el};
o.F=[{t:toks(o.name),w:1},{t:toks(o.kw),w:.8},{t:toks(o.brand),w:.8},{t:toks(o.cat),w:.5}];if(ds&&ds!==DEFDESC)o.F.push({t:toks(ds),w:.15});o.full=norm(o.name);P.push(o)})}
function search(text){var qt=toks(text);if(!qt.length)return[];var qn=norm(text).trim(),out=[];
P.forEach(function(p){var tot=0,ok=true;qt.forEach(function(t){var s=tokScore(t,p.F);if(!s){SYN.forEach(function(g){if(g.indexOf(t)>-1)g.forEach(function(a){if(a!==t){var v=tokScore(a,p.F)*.7;if(v>s)s=v}})})}if(!s)ok=false;tot+=s});
if(ok){if(p.full.indexOf(qn)>-1)tot+=8;out.push({p:p,s:tot})}});
out.sort(function(a,b){return b.s-a.s||a.p.name.localeCompare(b.p.name)});return out.map(function(x){return x.p})}
function didYouMean(text){var vocab={};P.forEach(function(p){toks(p.name+' '+p.kw+' '+p.brand).forEach(function(w){vocab[w]=1})});var out=toks(text).map(function(t){if(vocab[t])return t;var b=t,bd=3;Object.keys(vocab).forEach(function(w){var dd=lev(t,w);if(dd<bd){bd=dd;b=w}});return b});var r=out.join(' ');return r&&r!==toks(text).join(' ')&&search(r).length?r:''}
function hl(name,text){var s=esc(name);toks(text).filter(function(t){return t.length>1}).forEach(function(t){s=s.replace(new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![^<]*>)','ig'),'<mark>$1</mark>')});return s}
var ST={in:['In stock','in'],out:['Out of stock','out'],ask:['Ask for availability','ask']};
function thumb(p){return '<span class="ph">'+(p.img?'<img src="'+esc(p.img)+'" alt="" onerror="this.remove()">':'')+'<i>Photo</i></span>'}
function item(p,i,text){return '<a class="it" role="option" id="dls'+i+'" href="#p='+p.id+'" data-id="'+p.id+'">'+thumb(p)+'<span class="tx"><span class="nm">'+hl(p.name,text)+'</span><span class="ct">'+esc(p.cat)+(p.brand?' · '+esc(p.brand):'')+'</span></span><span class="rt"><span class="pr">'+esc(p.price)+'</span><br><span class="chipS '+ST[p.stock][1]+'">'+ST[p.stock][0]+'</span></span></a>'}
function showSug(){var text=q.value.trim();clr.hidden=!q.value;if(!text){hideSug();return}cur=search(text);act=-1;
if(!cur.length){var dm=didYouMean(text);sug.innerHTML='<div class="none">No products found for “'+esc(text)+'”.'+(dm?' <a href="#q='+encodeURIComponent(dm)+'" class="dym">Did you mean <b>'+esc(dm)+'</b>?</a>':'')+'</div>'}
else sug.innerHTML=cur.slice(0,6).map(function(p,i){return item(p,i,text)}).join('')+'<a class="all" href="#q='+encodeURIComponent(text)+'">See all '+cur.length+' result'+(cur.length>1?'s':'')+' for “'+esc(text)+'”</a>';
sug.hidden=false;q.setAttribute('aria-expanded','true')}
function hideSug(){sug.hidden=true;act=-1;q.setAttribute('aria-expanded','false')}
function move(n){var its=sug.querySelectorAll('.it');if(!its.length)return;act=(act+n+its.length)%its.length;its.forEach(function(e,i){e.classList.toggle('on',i===act)});its[act].scrollIntoView({block:'nearest'});q.setAttribute('aria-activedescendant',its[act].id)}
q.addEventListener('input',showSug);q.addEventListener('focus',function(){if(q.value.trim())showSug()});
q.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();if(sug.hidden)showSug();move(1)}else if(e.key==='ArrowUp'){e.preventDefault();move(-1)}else if(e.key==='Escape'){hideSug()}else if(e.key==='Enter'&&act>=0){e.preventDefault();var it=sug.querySelectorAll('.it')[act];if(it){hideSug();location.hash='p='+it.dataset.id}}});
form.addEventListener('submit',function(e){e.preventDefault();var t=q.value.trim();hideSug();if(!t)return;location.hash='q='+encodeURIComponent(t)});
clr.addEventListener('click',function(){q.value='';clr.hidden=true;hideSug();q.focus();if(/q=/.test(location.hash))location.hash='';});
d.addEventListener('click',function(e){if(!form.contains(e.target))hideSug();var v=e.target.closest('.dl-btn-vd');if(v){e.preventDefault();var c=v.closest('.dl-pc');location.hash='p='+slug(c.querySelector('h3').textContent)+(/q=/.test(location.hash)?'&'+location.hash.slice(1).split('&').filter(function(x){return x.indexOf('q=')===0})[0]:'')}
var x=e.target.closest('.it');if(x){hideSug()}});
/* results page and product details, driven by the address hash so Back works */
function params(){return new URLSearchParams(location.hash.slice(1))}
function secs(){return[].slice.call(d.querySelectorAll('main section.dl-sec')).filter(function(s){return s.querySelector('.dl-pc')&&!res.contains(s)})}
function showResults(text){var r=search(text);q.value=text;clr.hidden=false;secs().forEach(function(s){s.hidden=true});
var h='<section class="dl-sec"><div class="dl-wrap"><div class="dl-rh"><h2>'+r.length+' result'+(r.length===1?'':'s')+' for “'+esc(text)+'”</h2><button type="button" class="dl-btn dl-btn-o dl-sm dl-rc">Clear search</button></div>';
if(r.length)h+='<div class="dl-grid" id="dlrg"></div>';else{var dm=didYouMean(text);h+='<p class="dl-lead2">No products matched. '+(dm?'Did you mean <a href="#q='+encodeURIComponent(dm)+'"><b>'+esc(dm)+'</b></a>? ':'')+'You can also ask us on WhatsApp if we can get it for you.</p><a class="dl-btn dl-btn-w" href="https://wa.me/'+wanum()+'?text='+encodeURIComponent('Hello DALA ENERGY, do you have '+text+'?')+'">Ask on WhatsApp</a>'}
res.innerHTML=h+'</div></section>';var g=d.getElementById('dlrg');if(g)r.forEach(function(p){g.appendChild(p.el.cloneNode(true))});
res.querySelector('.dl-rc').addEventListener('click',function(){q.value='';clr.hidden=true;location.hash=''})}
function hideResults(){res.innerHTML='';secs().forEach(function(s){s.hidden=false})}
function wanum(){var a=d.querySelector('.dl-pc a.dl-btn-w[href*="wa.me"]')||d.querySelector('a[href*="wa.me"]');var m=a&&a.href.match(/wa\.me\/(\d+)/);return m?m[1]:'2349045581684'}
function telnum(){var a=d.querySelector('a[href^="tel:"]');return a?a.getAttribute('href'):'tel:+2349045581684'}
function closeDetails(){var o=d.querySelector('.dl-pd');if(o)o.remove();d.documentElement.classList.remove('dl-lock')}
function openDetails(id){var p=P.filter(function(x){return x.id===id})[0];closeDetails();if(!p)return;var s=ST[p.stock];
var o=d.createElement('div');o.className='dl-pd';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label',p.name);
o.innerHTML='<div class="dl-pdc"><button type="button" class="dl-pdx" aria-label="Close">×</button><div class="dl-pdi">'+(p.img?'<img src="'+esc(p.img)+'" alt="'+esc(p.name)+'" onerror="this.remove()">':'')+'<span>Product image</span></div><div class="dl-pdt"><div class="ct">'+esc(p.cat)+(p.brand?' · '+esc(p.brand):'')+'</div><h2>'+esc(p.name)+'</h2><span class="chipS '+s[1]+'">'+s[0]+'</span><div class="pr">'+esc(p.price)+'</div><p>'+esc(p.desc)+'</p><div class="dl-row"><a class="dl-btn dl-btn-w" href="https://wa.me/'+wanum()+'?text='+encodeURIComponent('Hello DALA ENERGY, I would like to order '+p.name+'.')+'">Order on WhatsApp</a><a class="dl-btn dl-btn-vd" href="'+telnum()+'">Call us</a></div></div></div>';
d.body.appendChild(o);d.documentElement.classList.add('dl-lock');var x=o.querySelector('.dl-pdx');x.focus();
function back(){var pr=params();pr.delete('p');var s=pr.toString();location.hash=s}
x.addEventListener('click',back);o.addEventListener('click',function(e){if(e.target===o)back()})}
function route(){var pr=params(),t=pr.get('q'),pid=pr.get('p');if(t)showResults(t);else hideResults();if(pid)openDetails(pid);else closeDetails()}
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.querySelector('.dl-pd')){var pr=params();pr.delete('p');location.hash=pr.toString()}});
addEventListener('hashchange',route);
index();route();
})();
