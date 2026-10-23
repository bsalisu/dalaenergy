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
})();
