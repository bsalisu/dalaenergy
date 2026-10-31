(function(){var d=document,$=function(i){return d.getElementById(i)};
d.addEventListener('touchstart',function(){},{passive:true});
var dr=$('drawer'),bk=$('back'),op=$('open');
function tog(on){dr.classList.toggle('on',on);bk.classList.toggle('on',on);dr.setAttribute('aria-hidden',!on);op.setAttribute('aria-expanded',on);if(on)$('close').focus();else op.focus()}
op.addEventListener('click',function(){tog(true)});$('close').addEventListener('click',function(){tog(false)});bk.addEventListener('click',function(){tog(false)});
d.addEventListener('keydown',function(e){if(e.key==='Escape')tog(false)});
var p=$('prog');addEventListener('scroll',function(){var h=d.documentElement;p.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+'%'},{passive:true});
$('top').addEventListener('click',function(e){e.preventDefault();scrollTo({top:0})});
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
function cnt(el){var n=+el.dataset.n,s=el.dataset.s||'',t=0;if(rm){el.textContent=n.toLocaleString()+s;return}
var st=performance.now();(function f(now){var k=Math.min((now-st)/1400,1);el.textContent=Math.round(n*k).toLocaleString()+(k===1?s:'');if(k<1)requestAnimationFrame(f)})(st)}
if('IntersectionObserver'in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');if(e.target.dataset.n)cnt(e.target);io.unobserve(e.target)}})},{threshold:.2});
d.querySelectorAll('.dl-rv,[data-n]').forEach(function(x){io.observe(x)})}else{d.querySelectorAll('[data-n]').forEach(function(x){x.textContent=(+x.dataset.n).toLocaleString()+(x.dataset.s||'')});d.querySelectorAll('.dl-rv').forEach(function(x){x.classList.add('in')})}
function initSlider(box,list,secs,caps){
if(list&&list.length){var cur=box.querySelector('img.on'),keep=cur&&cur.getAttribute('src')===list[0]?cur:null;
Array.prototype.slice.call(box.children).forEach(function(c){if(c!==keep)box.removeChild(c)});
list.forEach(function(f,n){if(n===0&&keep)return;var v=/\.(mp4|webm)$/i.test(f),m=d.createElement(v?'video':'img');
if(v){m.muted=true;m.loop=true;m.setAttribute('playsinline','');m.preload='none'}else{m.alt=''}
m.dataset.src=f;box.appendChild(m)})}
var sl=box.children,si=0,bars=[],cap=null;
if(sl.length>1){var hr=box.closest('.dl-hero')||box.parentNode,sb=d.createElement('div');sb.className='dl-sbar';sb.style.setProperty('--d',secs+'ms');
sb.innerHTML='<div class="dl-wrap dl-sbin"><div class="dl-bars"></div><span class="dl-cap"></span></div>';hr.appendChild(sb);
var bw=sb.querySelector('.dl-bars');cap=sb.querySelector('.dl-cap');
for(var q=0;q<sl.length;q++){var bi=d.createElement('i');bi.appendChild(d.createElement('b'));bw.appendChild(bi);bars.push(bi)}}
function mark(n){if(!bars.length)return;for(var k=0;k<bars.length;k++)bars[k].className=k<n?'done':'';void bars[n].offsetWidth;bars[n].className='on';cap.textContent=(caps&&caps[n])||''}
function ld(n){var m=sl[n];if(m&&m.dataset.src){m.src=m.dataset.src;m.removeAttribute('data-src')}}
function act(n,on){var m=sl[n];if(!m)return;
if(on){mark(n);m.classList.remove('out');m.classList.add('on');if(m.tagName==='VIDEO'){try{m.currentTime=0}catch(e){}var p=m.play();if(p&&p.catch)p.catch(function(){})}}
else{m.classList.remove('on');m.classList.add('out');setTimeout(function(){if(!m.classList.contains('on')){m.classList.remove('out');if(m.tagName==='VIDEO')m.pause()}},1700)}}
if(sl.length){ld(0);mark(0);if(!sl[0].classList.contains('on'))act(0,true);
if(sl.length>1){ld(1);setInterval(function(){if(d.hidden)return;act(si,false);si=(si+1)%sl.length;ld(si);act(si,true);ld((si+1)%sl.length)},secs)}}}
d.querySelectorAll('.dl-slides').forEach(function(b,n){
var l=b.dataset.slides?b.dataset.slides.split(',').map(function(x){return x.trim()}).filter(Boolean):(n===0?window.DALA_SLIDES:null);
initSlider(b,l,(+b.dataset.seconds||window.DALA_SLIDE_SECONDS||5)*1000,b.dataset.captions?b.dataset.captions.split('|'):(n===0?window.DALA_CAPTIONS:null))});
})();
