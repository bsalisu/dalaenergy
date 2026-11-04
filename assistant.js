/* DALA ENERGY chat assistant: welcomes visitors, explains services, finds products, collects quote requests and hands over to WhatsApp. */
(function(){
var d=document,W=window,SD=W.DALA_SITE||{},A=SD.assistant||{};if(A.enabled===false)return;
var NAME=A.name||'DALA Assistant',C=SD.contact||{};
function dg(s){return String(s||'').replace(/\D/g,'')}
var PH1=C.phone1||'+234 904 558 1684',PH2=C.phone2||'+234 803 882 3893',EM=C.email||'Dalaenergyltd@gmail.com',AD=C.address||'No. 35 France Road, by Igbo Road, Kano',WA=dg(PH1);
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function sing(t){return t.length>3&&t.slice(-1)==='s'?t.slice(0,-1):t}
function toks(s){return norm(s).split(/[^a-z0-9]+/).filter(Boolean).map(sing)}
function slug(s){return norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function wal(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t)}
var SERV=[
{t:'CCTV camera installation',d:'We install high-quality security cameras with neat wiring, helping protect homes and businesses.',w:['cctv','camera','surveillance','dvr','nvr','security']},
{t:'Solar installation',d:'We set up reliable solar systems that provide steady power and help cut down electricity bills.',w:['solar','inverter','battery','backup','panel','electricity','generator']},
{t:'Smart lock installation',d:'We install modern smart locks for homes and offices, giving you stronger security and easy access.',w:['lock','smartlock','door','access']},
{t:'Starlink installation',d:'We handle setup and mounting, making sure you get a strong, stable internet connection even in rural areas.',w:['starlink','satellite','dish','internet']},
{t:'Ceiling fan installation',d:'We fix or replace ceiling fans neatly and safely, so your home stays cool and comfortable.',w:['fan','ceiling']},
{t:'Networking',d:'We set up home or office networks, making sure your Wi-Fi covers where you need it with clean cabling and proper setup.',w:['network','wifi','router','lan','cabling']},
{t:'AC installation',d:'We install air conditioners safely and neatly, making sure your space stays cool and comfortable.',w:['ac','conditioner','conditioning','cooling','air']}];
/* ---------- products ---------- */
var P=null,PR=null;
function price(x){return x.price?(/^[\d.,\s]+$/.test(x.price)?'₦'+x.price:x.price):'Contact for Price'}
function loadP(){if(PR)return PR;var pr=SD.products;
if(pr&&pr.items&&pr.items.length){P=pr.items.map(function(x){return{id:slug(x.name),name:x.name,cat:x.cat,price:price(x),stock:x.stock||'ask',img:x.image||'',brand:x.brand||'',kw:x.keywords||''}});return PR=Promise.resolve()}
return PR=fetch('equipment.html',{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){var doc=new DOMParser().parseFromString(t,'text/html');P=[].map.call(doc.querySelectorAll('.dl-pc'),function(el){var h=el.querySelector('h3'),s=el.closest('section'),h2=s&&s.querySelector('h2'),im=el.querySelector('.dl-pimg img'),pp=(el.querySelector('.dl-price')||{}).textContent||'';
return{id:slug(h.textContent),name:h.textContent.trim(),cat:h2?h2.textContent.trim():'',price:pp.split(' · ')[0]||'Contact for Price',stock:/out of stock/i.test(pp)?'out':/in stock/i.test(pp)?'in':'ask',img:im?im.getAttribute('src'):'',brand:'',kw:''}})}).catch(function(){P=[]})}
function lev(a,b){var m=a.length,n=b.length,p=[],i,j;for(j=0;j<=n;j++)p[j]=j;for(i=1;i<=m;i++){var c=[i];for(j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
function ts(t,F){var best=0;F.forEach(function(f){f.t.forEach(function(w){var s=0;if(w===t)s=10;else if(t.length>=2&&w.indexOf(t)===0)s=8;else if(t.length>=3&&w.indexOf(t)>-1)s=6;else if(w.length>=4&&t.indexOf(w)===0)s=5;else{var m=t.length<=3?0:t.length<=5?1:2;if(m){var dd=lev(t,w);if(dd<=m)s=6-dd}}s*=f.w;if(s>best)best=s})});return best}
var STOP={do:1,you:1,have:1,any:1,i:1,want:1,to:1,buy:1,the:1,a:1,an:1,is:1,are:1,there:1,price:1,of:1,how:1,much:1,for:1,in:1,stock:1,available:1,looking:1,need:1,please:1,show:1,me:1,can:1,get:1,sell:1,cost:1,what:1,about:1,and:1,or:1,my:1,your:1,u:1,pls:1,product:1,item:1,with:1,on:1,at:1,it:1};
function findP(text){var qt=toks(text).filter(function(t){return!STOP[t]});if(!qt.length||!P)return[];var out=[];
P.forEach(function(p){var F=[{t:toks(p.name),w:1},{t:toks(p.kw),w:.8},{t:toks(p.brand),w:.8},{t:toks(p.cat),w:.5}],tot=0,ok=true;qt.forEach(function(t){var s=ts(t,F);if(!s)ok=false;tot+=s});
if(!ok&&qt.length>1){var cs=ts(qt.join(''),F);if(cs>=6){ok=true;tot=cs}}if(ok)out.push({p:p,s:tot})});
out.sort(function(a,b){return b.s-a.s});return out.map(function(x){return x.p})}
var ST={in:['In stock','in'],out:['Out of stock','out'],ask:['Ask for availability','ask']};
function pcard(p){var s=ST[p.stock]||ST.ask;return '<div class="dla-pc"><span class="dla-ph">'+(p.img?'<img src="'+esc(p.img)+'" alt="" onerror="this.remove()">':'')+'</span><span class="dla-pt"><b>'+esc(p.name)+'</b><span>'+esc(p.price)+'</span><i class="dla-st '+s[1]+'">'+s[0]+'</i><span class="dla-pl"><a href="equipment#p='+p.id+'">View</a><a href="'+wal('Hello DALA ENERGY, I would like to order '+p.name+'.')+'" target="_blank" rel="noopener">Order on WhatsApp</a></span></span></div>'}
/* ---------- UI ---------- */
var log=[],open=false,st=null,name='',busy=false,root,msgs,inp,panel,tip,btn;
try{log=JSON.parse(sessionStorage.getItem('dla_log')||'[]');open=sessionStorage.getItem('dla_open')==='1';st=JSON.parse(sessionStorage.getItem('dla_st')||'null');name=sessionStorage.getItem('dla_name')||''}catch(e){}
function save(){try{sessionStorage.setItem('dla_log',JSON.stringify(log.slice(-60)));sessionStorage.setItem('dla_open',open?'1':'0');sessionStorage.setItem('dla_st',JSON.stringify(st));sessionStorage.setItem('dla_name',name)}catch(e){}}
var MIC='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
function build(){root=d.createElement('div');root.className='dla';root.innerHTML='<div class="dla-wel" role="status" aria-live="polite" hidden></div><button type="button" class="dla-btn" aria-label="Chat with '+esc(NAME)+'">'+MIC+'</button>'+
'<section class="dla-panel" role="dialog" aria-label="'+esc(NAME)+'" hidden><header><img src="logo.png" alt="DALA ENERGY"><div><b>'+esc(NAME)+'</b><span><i></i> Online now</span></div><button type="button" class="dla-x" aria-label="Close chat">×</button></header><div class="dla-msgs" aria-live="polite"></div><form class="dla-in"><input type="text" placeholder="Type your message…" aria-label="Type your message" autocomplete="off"><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 20l18-8L3 4v6l11 2-11 2z"/></svg></button></form></section>';
d.body.appendChild(root);panel=root.querySelector('.dla-panel');msgs=root.querySelector('.dla-msgs');inp=root.querySelector('input');btn=root.querySelector('.dla-btn');tip=root.querySelector('.dla-wel');
btn.addEventListener('click',function(){toggle(!open)});root.querySelector('.dla-x').addEventListener('click',function(){toggle(false)});
root.querySelector('form').addEventListener('submit',function(e){e.preventDefault();var t=inp.value.trim();if(!t||busy)return;inp.value='';me(t);handle(t)});
msgs.addEventListener('click',function(e){var c=e.target.closest('.dla-chip');if(c&&!busy){var t=c.getAttribute('data-t');me(t);handle(t)}});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&open&&!d.querySelector('.dl-pd'))toggle(false)});
log.forEach(function(m,i){paint(m,i===log.length-1)});if(open)toggle(true,true);else if(A.welcome!==false)setTimeout(showWelcome,900)}
var WELCOME=['👋 Hello! Welcome to Dala Energy ⚡','Thank you for contacting us! We’re happy to assist you.','How can we help you today? Are you interested in Solar Energy, CCTV Cameras, Security Systems, or any of our other services?','We’re always here to help! 😊'];
var welTimer=null;
function showWelcome(){if(open||!tip)return;var L=A.welcomeText?String(A.welcomeText).split(/\n+/).filter(Boolean):WELCOME,secs=+A.welcomeSeconds||5;
tip.innerHTML='<button type="button" class="dla-wx" aria-label="Close message">×</button><b>'+esc(L[0])+'</b>'+L.slice(1).map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'<i class="dla-wbar" style="animation-duration:'+secs+'s"></i>';
tip.classList.remove('out');tip.hidden=false;
tip.onclick=function(e){if(e.target.closest('.dla-wx')){hideWelcome();return}toggle(true)};
clearTimeout(welTimer);welTimer=setTimeout(hideWelcome,secs*1000)}
function hideWelcome(){clearTimeout(welTimer);if(!tip||tip.hidden)return;tip.classList.add('out');setTimeout(function(){tip.hidden=true;tip.classList.remove('out')},400)}
function toggle(v,quiet){open=v;panel.hidden=!v;btn.classList.toggle('on',v);hideWelcome();d.documentElement.classList.toggle('dla-open',v&&matchMedia('(max-width:560px)').matches);if(v){if(!log.length)welcome();scroll();if(!quiet)setTimeout(function(){inp.focus()},50)}save()}
function scroll(){msgs.scrollTop=msgs.scrollHeight}
function chipsHtml(c){return c&&c.length?'<div class="dla-chips">'+c.map(function(x){return '<button type="button" class="dla-chip" data-t="'+esc(x)+'">'+esc(x)+'</button>'}).join('')+'</div>':''}
function paint(m,last){var el=d.createElement('div');el.className='dla-m '+(m.r==='u'?'u':'b');el.innerHTML='<div class="dla-b">'+m.h+'</div>'+(m.r==='b'&&last?chipsHtml(m.c):'');msgs.appendChild(el);scroll()}
function me(t){var m={r:'u',h:esc(t)};log.push(m);msgs.querySelectorAll('.dla-chips').forEach(function(c){c.remove()});paint(m);save()}
function say(h,c,cb){busy=true;var ty=d.createElement('div');ty.className='dla-m b';ty.innerHTML='<div class="dla-b dla-ty"><i></i><i></i><i></i></div>';msgs.appendChild(ty);scroll();
setTimeout(function(){ty.remove();var m={r:'b',h:h,c:c||[]};log.push(m);paint(m,true);busy=false;save();if(cb)cb()},Math.min(900,350+h.length*2))}
/* ---------- conversation ---------- */
var MAIN=['Our services','Find a product','Request a quote','Contact us','Talk to a person'];
function hello(){var h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'}
function welcome(){say(A.greeting?esc(A.greeting):WELCOME.map(esc).join('<br>'),MAIN)}
function contactMsg(){return 'You can reach us here:<br>Phone / WhatsApp: <a href="tel:+'+dg(PH1)+'">'+esc(PH1)+'</a> and <a href="tel:+'+dg(PH2)+'">'+esc(PH2)+'</a><br>Email: <a href="mailto:'+esc(EM)+'">'+esc(EM)+'</a><br>Outlet: '+esc(AD)+'<br><a href="'+wal('Hello DALA ENERGY,')+'" target="_blank" rel="noopener" class="dla-go">Chat on WhatsApp</a>'}
function human(){say('Of course. Our team will be happy to talk with you. Tap the button to chat with them on WhatsApp.<br><a href="'+wal('Hello DALA ENERGY, I would like to speak to someone.')+'" target="_blank" rel="noopener" class="dla-go">Chat with our team</a>',['Request a quote','Contact us'])}
function services(){say('Here is what we do:<br>'+SERV.map(function(s){return '• <b>'+s.t+'</b>'}).join('<br>')+'<br>Tap one to learn more, or ask me for a quote.',SERV.map(function(s){return s.t}).concat(['Request a quote']))}
function serviceInfo(s){say('<b>'+esc(s.t)+'</b><br>'+esc(s.d)+'<br>Costs depend on your property, so we give a quote after a few details.',['Request a quote','Find a product','Our services'])}
function unknown(){say('I am not sure I understood that. I can help with our services, products and quotes, or you can speak to our team directly.',MAIN)}
function products(text,prompt){loadP().then(function(){var r=findP(text);if(!toks(text).filter(function(t){return!STOP[t]}).length){st={s:'prod'};save();return say('Sure. Which product are you looking for? For example “CCTV camera”, “inverter” or “BNC connectors”.',['CCTV camera','Solar inverter','Battery','Router'])}
st=null;save();if(!r.length){if(prompt)return unknown();return say('I could not find “'+esc(text)+'” in our product list. It may still be available, so you can ask our team directly.<br><a href="'+wal('Hello DALA ENERGY, do you have '+text+'?')+'" target="_blank" rel="noopener" class="dla-go">Ask on WhatsApp</a>',['Find a product','Our services'])}
say('I found '+r.length+' matching product'+(r.length>1?'s':'')+':'+r.slice(0,4).map(pcard).join('')+(r.length>4?'<a class="dla-go" href="equipment#q='+encodeURIComponent(text)+'">See all '+r.length+' results</a>':''),['Find a product','Request a quote','Talk to a person'])})}
/* quote flow */
var QS=['service','where','details','name','phone'];
function qAsk(){var q=st;if(q.s==='service')say('Happy to prepare a quote request. Which service do you need?',SERV.map(function(s){return s.t}).concat(['Other']));
else if(q.s==='where')say('Where is the property? Please tell me the city or area and state.');else if(q.s==='details')say('Briefly describe what you need. For example the number of cameras, the size of the building, or the equipment you want.');
else if(q.s==='name')say('May I have your name?');else if(q.s==='phone')say('Thank you'+(name?', '+esc(name):'')+'. What phone number can our team call you on?')}
function quote(t){if(!t||t==='start'){st={s:'service',d:{}};save();return qAsk()}
if(/^(cancel|stop|exit|never ?mind)$/i.test(t.trim())){st=null;save();return say('No problem, I have cancelled the quote request.',MAIN)}
var q=st;if(q.s==='service'){q.d.service=t;q.s='where'}else if(q.s==='where'){q.d.where=t;q.s='details'}else if(q.s==='details'){q.d.details=t;q.s='name'}
else if(q.s==='name'){name=t.replace(/^(my name is|i am|i'm|this is)\s+/i,'').trim();q.d.name=name;q.s='phone'}
else if(q.s==='phone'){var dd=dg(t);if(dd.length<7)return say('That does not look like a phone number. Please type it again, for example 0803 123 4567.');q.d.phone=t;
var m='Hello DALA ENERGY, I would like a quote.\nService: '+q.d.service+'\nLocation: '+q.d.where+'\nDetails: '+q.d.details+'\nName: '+q.d.name+'\nPhone: '+q.d.phone;st=null;save();
return say('Thank you, '+esc(q.d.name)+'. Here is your request:<br><b>Service:</b> '+esc(q.d.service)+'<br><b>Location:</b> '+esc(q.d.where)+'<br><b>Details:</b> '+esc(q.d.details)+'<br><b>Phone:</b> '+esc(q.d.phone)+'<br>Tap the button to send it to our team on WhatsApp. They will reply with the next steps.<br><a href="'+wal(m)+'" target="_blank" rel="noopener" class="dla-go">Send request on WhatsApp</a>',['Find a product','Our services'])}
save();qAsk()}
function handle(raw){var t=norm(raw).trim(),R=function(re){return re.test(t)};
if(st&&st.s==='prod'){return products(raw,true)}
if(st&&st.d){return quote(raw)}
if(R(/\b(quote|quotation|estimate|book|appointment|inspection|site visit)\b/)||t==='request a quote')return quote('start');
if(R(/\b(talk|speak|chat)\b.*\b(person|human|agent|someone|staff|team|representative)\b/)||R(/\b(human|agent|representative|call me)\b/))return human();
if(R(/^(hi|hello|hey|hiya|sannu|salam|assalamu|barka|yaya|good (morning|afternoon|evening))\b/)){return say(esc(hello()+(name?', '+name:'')+'! How can I help you today?'),MAIN)}
if(R(/\b(thank|thanks|nagode|gode)\b/))return say('You are welcome. Is there anything else I can help you with?',MAIN);
if(R(/\b(bye|goodbye|see you|sai an jima)\b/))return say('Thank you for visiting DALA ENERGY. Have a great day!',['Contact us']);
if(R(/\b(warranty|guarantee|delivery|deliver|shipping|payment|pay|transfer|refund|return|installment)\b/))return say('I do not have confirmed details about that. Please ask our team directly so you get the right answer.<br><a href="'+wal('Hello DALA ENERGY, I have a question about '+raw+'.')+'" target="_blank" rel="noopener" class="dla-go">Ask on WhatsApp</a>',['Contact us','Our services']);
if(R(/\b(working hours|opening|are you open|open (on|at|today|now)|closing time|what time|weekend)\b/))return say('I do not have the working hours confirmed here. Please message our team on WhatsApp and they will tell you when they are available.<br><a href="'+wal('Hello DALA ENERGY, what are your working hours?')+'" target="_blank" rel="noopener" class="dla-go">Ask on WhatsApp</a>',['Contact us','Our services']);
if(R(/\b(address|location|where|office|outlet|shop|direction|directions|map|find you)\b/))return say('Our outlet and office is at <b>'+esc(AD)+'</b>. We also take projects across Nigeria.<br><a class="dla-go" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(AD)+'">Get directions</a>',['Contact us','Request a quote']);
if(R(/\b(contact|phone|call|number|whatsapp|email|reach)\b/))return say(contactMsg(),['Request a quote','Find a product']);
if(R(/\b(who are you|about (you|us|dala|the company|your company)|your company|experience|years|how long|your name)\b/))return say('I am '+esc(NAME)+', the virtual assistant of DALA ENERGY LTD. We supply and install solar, CCTV, security, networking and electrical systems for homes and businesses, with 15+ years of experience and 1,000+ homes and businesses powered and/or secured. Our outlet is in Kano and we take projects across Nigeria.',MAIN);
var buy=R(/\b(price|prices|cost|how much|buy|stock|available|availability|sell|have|product|products|catalog|catalogue|item|items)\b/)||t==='find a product';
var sv=SERV.filter(function(s){return toks(raw).some(function(w){return s.w.indexOf(w)>-1})})[0];
if(R(/\b(service|services|what do you (do|offer|sell)|offer|provide)\b/)||t==='our services'){var ex=SERV.filter(function(s){return norm(s.t)===t})[0];if(!ex)return services()}
var exact=SERV.filter(function(s){return norm(s.t)===t})[0];if(exact)return serviceInfo(exact);
if(buy)return products(raw);
if(sv&&!buy)return loadP().then(function(){var r=findP(raw);if(r.length&&toks(raw).length<=3)return products(raw);serviceInfo(sv)});
return loadP().then(function(){if(findP(raw).length)return products(raw);unknown()})}
function init(){build()}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init);else init();
})();
