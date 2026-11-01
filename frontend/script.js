const MENU=[
{id:1,n:'Masala Dosa',p:50,c:'Breakfast'},{id:2,n:'Idli Sambar',p:35,c:'Breakfast'},{id:3,n:'Upma',p:30,c:'Breakfast'},
{id:4,n:'Veg Thali',p:90,c:'Meals'},{id:5,n:'Veg Biryani',p:80,c:'Meals'},{id:6,n:'Chole Bhature',p:60,c:'Meals'},{id:7,n:'Fried Rice',p:70,c:'Meals'},
{id:8,n:'Samosa',p:15,c:'Snacks'},{id:9,n:'Vada Pav',p:20,c:'Snacks'},{id:10,n:'Paneer Roll',p:55,c:'Snacks'},{id:11,n:'Veg Sandwich',p:40,c:'Snacks'},
{id:12,n:'Masala Chai',p:12,c:'Drinks'},{id:13,n:'Filter Coffee',p:20,c:'Drinks'},{id:14,n:'Cold Coffee',p:40,c:'Drinks'},{id:15,n:'Lime Soda',p:25,c:'Drinks'}];
const K='cc_orders_v1',KS='cc_stock_v1',KM='cc_mine_v1',KN='cc_name_v1',DAY=864e5;
const ST={new:'Order received',cooking:'Being prepared',ready:'Ready, collect at the counter',done:'Collected',cancelled:'Cancelled'};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const tm=t=>new Date(t).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
const dt=t=>new Date(t).toLocaleDateString('en-IN',{day:'numeric',month:'short'})+', '+tm(t);
const sod=(d=new Date())=>{const x=new Date(d);x.setHours(0,0,0,0);return x.getTime()};
const sum=a=>a.reduce((s,o)=>s+o.total,0);
const payOf=o=>o.pay||(o.id%2?{m:'UPI',s:'paid',ref:'UPI'+(100000000+o.id*7919)}:{m:'Counter',s:'paid'});
const payTxt=o=>{const p=payOf(o);return p.m==='UPI'?'Paid online':(p.s==='paid'||o.status==='done'?'Paid at counter':'Pay at counter')};
function ld(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function seed(){
  let a=7;const r=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const H=[8,9,9,10,10,10,11,11,12,12,13,13,13,14,14,15,16],names=['21CS104','22EC017','20ME221','23CE056','22IT089','21EE032','23CS140','22BT011','21CH075','22MB008'],out=[];let id=1;const now=Date.now();
  for(let d=29;d>=0;d--){
    const day=sod()-d*DAY,dow=new Date(day).getDay(),n=dow===0?12:Math.round(28+r()*34),ts=[];
    for(let i=0;i<n;i++)ts.push(day+H[Math.floor(r()*H.length)]*36e5+Math.floor(r()*60)*6e4);
    ts.sort((x,y)=>x-y);let k=0;
    ts.forEach(t=>{if(t>now)return;const items=[],c=1+Math.floor(r()*3);
      for(let j=0;j<c;j++){const m=MENU[Math.floor(r()*MENU.length)];if(!items.find(x=>x.n===m.n))items.push({n:m.n,p:m.p,q:1+(r()<.3?1:0)})}
      out.push({id:id++,token:101+k++,name:names[Math.floor(r()*names.length)],items,total:items.reduce((s,i)=>s+i.p*i.q,0),status:'done',created:t,readyBy:t+12*6e4})});
  }
  return out;
}
const S={orders:ld(K,null),stock:ld(KS,{}),mine:ld(KM,[]),name:ld(KN,''),cart:{},cat:'All',pm:'online',paid:null,mod:null,slot:null,day:0,cap:ld('cc_cap_v1',6),blocked:ld('cc_blk_v1',{}),auth:(()=>{try{return sessionStorage.getItem('cc_auth')==='1'}catch(e){return false}})(),per:'today',f:{q:'',st:'all',r:'7'}};
if(!S.orders){S.orders=seed();sv(K,S.orders)}
const save=()=>{sv(K,S.orders);sv(KS,S.stock);sv(KM,S.mine);sv('cc_cap_v1',S.cap);sv('cc_blk_v1',S.blocked)};
const VIEWS=['home','student','orders','kitchen','slots','sales','history'];
const view=()=>VIEWS.includes(location.hash.slice(1))?location.hash.slice(1):'home';
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2600)}

/* ---------- Student ---------- */
function ticket(o){
  const i=['new','cooking','ready','done'].indexOf(o.status);
  const note=o.status==='ready'?'Show token '+o.token+' at the counter.':(o.status==='new'||o.status==='cooking')?'Pickup slot '+dt(o.readyBy):'';
  return `<div class="tk ${o.status}"><div class="tn">${o.token}</div><div><b>${ST[o.status]}</b>
  ${i>=0?`<div class="pg">${[0,1,2,3].map(k=>`<i class="${k<=i?'f':''}"></i>`).join('')}</div>`:''}
  <div class="mu">${o.items.map(x=>x.q+'× '+esc(x.n)).join(', ')}</div><div class="mu">${note}</div><div class="mu">${payTxt(o)} · ${inr(o.total)}${payOf(o).ref?' · Ref '+payOf(o).ref:''}</div></div></div>`;
}
function student(){
  const cats=['All',...new Set(MENU.map(m=>m.c))],items=MENU.filter(m=>S.cat==='All'||m.c===S.cat);
  const lines=Object.entries(S.cart).map(([id,q])=>({...MENU.find(m=>m.id==id),q})),total=lines.reduce((a,l)=>a+l.p*l.q,0);
  const mine=S.mine.map(id=>S.orders.find(o=>o.id===id)).filter(Boolean).slice(-4).reverse();
  return `<div class="two"><section>
  <div class="chips">${cats.map(c=>`<button class="chip ${c===S.cat?'on':''}" data-a="cat" data-v="${c}">${c}</button>`).join('')}</div>
  <div class="menu">${items.map(m=>{const out=S.stock[m.id]===false,q=S.cart[m.id]||0;
    return `<div class="item ${out?'out':''}"><div><b>${m.n}</b><div class="mu">${inr(m.p)}</div></div>${out?'<span class="mu">Sold out</span>':q?`<div class="step"><button data-a="dec" data-v="${m.id}" aria-label="Remove one ${m.n}">−</button><span>${q}</span><button data-a="inc" data-v="${m.id}" aria-label="Add one ${m.n}">+</button></div>`:`<button class="btn sm" data-a="inc" data-v="${m.id}">Add</button>`}</div>`}).join('')}</div>
  </section><aside>
  <div class="card cart"><h2>Your order</h2>
  ${lines.length?lines.map(l=>`<div class="ln"><span>${l.n} × ${l.q}</span><b>${inr(l.p*l.q)}</b></div>`).join(''):'<p class="mu">Your cart is empty. Add dishes from the menu.</p>'}
  <div class="ln tot"><span>Total</span><b>${inr(total)}</b></div>
  <label>Your name or roll number<input data-m="name" value="${esc(S.name)}" placeholder="e.g. 21CS104"></label>
  <div class="mu" style="margin:14px 0 6px">Choose a pickup time</div>${slotPicker()}<div class="mu" style="margin:12px 0 6px">Payment</div><div class="slots" style="grid-template-columns:1fr 1fr"><button class="slot ${S.pm==='online'?'on':''}" data-a="pm" data-v="online" aria-pressed="${S.pm==='online'}"><b>Pay online</b><span>UPI</span></button><button class="slot ${S.pm==='counter'?'on':''}" data-a="pm" data-v="counter" aria-pressed="${S.pm==='counter'}"><b>Pay at counter</b><span>Cash or UPI</span></button></div><div style="height:12px"></div>
  <button class="btn" data-a="place" ${lines.length?'':'disabled'}>${S.pm==='online'?'Pay '+inr(total)+' online':'Place order, pay at counter'}</button>
  ${mine.length?`<p class="mu" style="margin:14px 0 0">Track your tokens in <a href="#orders">My orders</a>.</p>`:''}
  </div></aside></div>`;
}

/* ---------- Time slots ---------- */
const OPEN=8,CLOSE=17,STEP=15;
function slotList(day){
  const base=sod()+day*DAY,now=Date.now(),out=[];
  for(let m=OPEN*60;m<CLOSE*60;m+=STEP){const ts=base+m*6e4;
    out.push({ts,booked:S.orders.filter(o=>o.status!=='cancelled'&&o.slot===ts).length,blocked:!!S.blocked[ts],past:ts<now+10*6e4})}
  return out;
}
const dayChips=()=>'';
function slotPicker(){
  const av=slotList(S.day).filter(s=>!s.past);
  return dayChips()+(av.length?`<div class="slots">${av.map(s=>{const full=s.blocked||s.booked>=S.cap;return `<button class="slot ${S.slot===s.ts?'on':''}" data-a="slot" data-v="${s.ts}" ${full?'disabled':''} aria-pressed="${S.slot===s.ts}"><b>${tm(s.ts)}</b><span>${s.blocked?'Closed':full?'Full':(S.cap-s.booked)+' left'}</span></button>`}).join('')}</div>`:'<div class="empty">No more slots left today. Ordering opens again tomorrow at 8:00 am.</div>');
}
function slots(){
  return `<div class="bar-row"><div><h2 class="disp" style="font-size:20px">Time slots</h2><p class="mu" style="margin:0">Students can only book open slots. Tap a slot to close or reopen it.</p></div>
  <div><span class="mu">Orders per slot</span><div class="step" style="margin-top:6px"><button data-a="capd" aria-label="Fewer orders per slot">−</button><span>${S.cap}</span><button data-a="capu" aria-label="More orders per slot">+</button></div></div></div>
  ${dayChips()}<div class="slots wide">${slotList(S.day).map(s=>`<button class="slot ${s.blocked?'blk':''}" data-a="blk" data-v="${s.ts}" ${S.day===0&&s.ts<Date.now()?'disabled':''}><b>${tm(s.ts)}</b><span>${s.blocked?'Closed':s.booked+' / '+S.cap+' booked'}</span></button>`).join('')}</div>`;
}

/* ---------- Online payment (demo) ---------- */
const APPS=[['gpay','Google Pay'],['phonepe','PhonePe'],['paytm','Paytm'],['upi','Other UPI app']];
function cartTotal(){return Object.entries(S.cart).reduce((a,[id,q])=>a+MENU.find(m=>m.id==id).p*q,0)}
function renderMod(){
  const m=S.mod,el=$('#mod');if(!m){el.innerHTML='';return}
  el.innerHTML=`<div class="ov"><div class="dlg" role="dialog" aria-modal="true" aria-label="Online payment"><h2 class="disp" style="font-size:20px">Pay ${inr(cartTotal())}</h2>
  <p class="mu">Demo checkout. No real money moves and nothing is charged.</p>
  <div class="slots" style="grid-template-columns:1fr 1fr;margin:12px 0">${APPS.map(([k,t])=>`<button class="slot ${m.app===k?'on':''}" data-a="app" data-v="${k}" ${m.proc?'disabled':''}><b>${t}</b></button>`).join('')}</div>
  <label>UPI ID<input data-m="upi" value="${esc(m.upi||'')}" placeholder="name@bank" autocomplete="off" ${m.proc?'disabled':''}></label>
  ${m.err?`<p class="late" role="alert" style="margin:0 0 8px">${m.err}</p>`:''}
  <button class="btn" data-a="pay" style="width:100%" ${m.proc?'disabled':''}>${m.proc?'Waiting for approval…':'Pay '+inr(cartTotal())}</button>
  <button class="btn ghost" data-a="paycancel" style="width:100%;margin-top:8px" ${m.proc?'disabled':''}>Cancel</button>
  <p class="mu" style="margin:10px 0 0">To test a failed payment, use a UPI ID ending in @fail.</p></div></div>`;
}

/* ---------- Home, login, my orders ---------- */
function home(){
  return `<div class="home"><a class="role" href="#student"><h2>I’m a student</h2><p>Browse the menu, book a pickup time slot and track your token.</p><span class="btn">Open student dashboard</span></a>
  <a class="role" href="#kitchen"><h2>I’m kitchen staff</h2><p>Manage live orders, time slots, sales and order history. Staff PIN required.</p><span class="btn">Open kitchen dashboard</span></a></div>
  <p class="mu" style="margin-top:18px">Demo: orders are saved in this browser. Open both dashboards in two tabs to watch an order move live.</p>`;
}
function login(){
  return `<div class="card" style="padding:24px;max-width:380px;margin:30px auto"><h2 class="disp" style="font-size:22px">Kitchen staff sign in</h2><p class="mu">Enter the staff PIN to open the kitchen dashboard. Demo PIN: 1234</p><label>Staff PIN<input type="password" inputmode="numeric" data-m="pin" autocomplete="off"></label><button class="btn" data-a="login" style="width:100%">Sign in</button><p class="mu" style="margin-bottom:0"><a href="#home">Back to portals</a></p></div>`;
}
function ordersView(){
  const mine=S.mine.map(id=>S.orders.find(o=>o.id===id)).filter(Boolean).reverse();
  return `<div class="card" style="padding:16px;max-width:640px"><h2 class="disp" style="font-size:20px">My orders</h2>${mine.length?mine.map(ticket).join(''):'<div class="empty" style="margin-top:12px">You haven’t ordered yet. <a href="#student">Browse the menu</a>.</div>'}</div>`;
}

/* ---------- Kitchen ---------- */
function kitchen(){
  const t=sod(),today=S.orders.filter(o=>o.created>=t&&o.status!=='cancelled');
  const cols=[['new','New orders','Start cooking'],['cooking','Preparing','Mark ready'],['ready','Ready for pickup','Handed over']];
  const open=S.orders.filter(o=>['new','cooking','ready'].includes(o.status));
  return `<div class="kpis"><div class="kpi"><span class="mu">Open orders</span><b>${open.length}</b></div><div class="kpi"><span class="mu">Orders today</span><b>${today.length}</b></div><div class="kpi"><span class="mu">Sales today</span><b>${inr(sum(today))}</b></div></div>
  <div class="cols">${cols.map(([s,h,btn])=>{const L=open.filter(o=>o.status===s).sort((a,b)=>a.readyBy-b.readyBy);
    return `<div class="col"><h2>${h}<span class="mu">${L.length}</span></h2>${L.length?L.map(o=>{const late=s!=='ready'&&o.readyBy<Date.now();
      return `<div class="kc ${s}"><div class="top"><span class="tkn">${o.token}</span><span class="mu">${esc(o.name)}</span></div>
      <ul>${o.items.map(x=>`<li>${x.q}× ${esc(x.n)}</li>`).join('')}</ul>
      <div class="mu ${late?'late':''}">${late?'Late, was due ':'Pickup by '}${tm(o.readyBy)} · placed ${Math.max(0,Math.round((Date.now()-o.created)/6e4))} min ago</div>
      <div class="mu">${payOf(o).m==='UPI'?'<b style="color:var(--rd)">Paid online</b>':'<b>Collect '+inr(o.total)+' at the counter</b>'}</div><div class="acts"><button class="btn" data-a="adv" data-v="${o.id}">${btn}</button>${s==='ready'?'':`<button class="btn ghost" data-a="cancel" data-v="${o.id}">Cancel</button>`}</div></div>`}).join(''):'<div class="empty">Nothing here right now.</div>'}</div>`}).join('')}</div>
  <div class="sec" style="margin-top:24px"><h2>Menu availability</h2><p class="mu">Tap a dish to mark it sold out. Students can’t order it until you switch it back.</p>
  <div class="chips">${MENU.map(m=>`<button class="chip ${S.stock[m.id]===false?'off':''}" data-a="stock" data-v="${m.id}" aria-pressed="${S.stock[m.id]!==false}">${m.n}</button>`).join('')}</div></div>`;
}

/* ---------- Sales ---------- */
const range=p=>{const t=sod();return p==='today'?[t,t+DAY]:p==='week'?[t-6*DAY,t+DAY]:[t-29*DAY,t+DAY]};
const inP=p=>{const[a,b]=range(p);return S.orders.filter(o=>o.status!=='cancelled'&&o.created>=a&&o.created<b)};
function sales(){
  const p=S.per,os=inP(p),rev=sum(os),n=os.length;let labels=[],names=[],vals=[];
  if(p==='today'){for(let h=8;h<=18;h++){labels.push((h%12||12)+(h<12?'am':'pm'));names.push((h%12||12)+(h<12?' am':' pm'));vals.push(sum(os.filter(o=>Math.min(18,Math.max(8,new Date(o.created).getHours()))===h)))}}
  else{const days=p==='week'?7:30,t=sod();for(let d=days-1;d>=0;d--){const a=t-d*DAY,dd=new Date(a);
    labels.push(p==='week'?dd.toLocaleDateString('en-IN',{weekday:'short'}):(d%3===0?dd.getDate():''));
    names.push(dd.toLocaleDateString('en-IN',{day:'numeric',month:'short'}));vals.push(sum(os.filter(o=>o.created>=a&&o.created<a+DAY)))}}
  const mx=Math.max(...vals,1),pk=vals.indexOf(Math.max(...vals)),sv_=vals.length<=11;
  const q={};os.forEach(o=>o.items.forEach(i=>{q[i.n]=q[i.n]||{q:0,r:0};q[i.n].q+=i.q;q[i.n].r+=i.q*i.p}));
  const top=Object.entries(q).sort((a,b)=>b[1].q-a[1].q).slice(0,5),tq=top.length?top[0][1].q:1;
  const T={today:'Today',week:'Last 7 days',month:'Last 30 days'};
  return `<div class="bar-row"><div class="chips" style="margin:0">${Object.keys(T).map(k=>`<button class="chip ${k===p?'on':''}" data-a="per" data-v="${k}">${k==='today'?'Today’s sales':k==='week'?'Weekly sales':'Monthly sales'}</button>`).join('')}</div>
  <button class="btn ghost" data-a="exp" data-v="sales">Export ${T[p].toLowerCase()} as CSV</button></div>
  <div class="kpis"><div class="kpi"><span class="mu">Revenue</span><b>${inr(rev)}</b></div><div class="kpi"><span class="mu">Orders</span><b>${n}</b></div><div class="kpi"><span class="mu">Average order</span><b>${inr(n?rev/n:0)}</b></div><div class="kpi"><span class="mu">Paid online</span><b>${inr(sum(os.filter(o=>payOf(o).m==='UPI')))}</b></div><div class="kpi"><span class="mu">Busiest ${p==='today'?'hour':'day'}</span><b>${n?names[pk]:'–'}</b></div></div>
  <div class="card chartbox"><h2 style="font-size:16px;margin-bottom:12px">${p==='today'?'Sales by hour':'Sales by day'}</h2><div class="chart" role="img" aria-label="Bar chart of ${p==='today'?'hourly':'daily'} sales">
  ${vals.map((v,i)=>`<div class="c ${n&&i===pk?'pk':''}" title="${names[i]}: ${inr(v)}">${sv_?`<span class="v">${v?inr(v):''}</span>`:''}<div class="b" style="height:${v/mx*(sv_?82:92)}%"></div><span class="l">${labels[i]}</span></div>`).join('')}</div></div>
  <div class="card sec top5" style="padding:16px;margin-top:16px"><h2>Top dishes, ${T[p].toLowerCase()}</h2>
  ${top.length?top.map(([k,v])=>`<div class="r"><span>${esc(k)}</span><div class="t"><i style="width:${v.q/tq*100}%"></i></div><b>${v.q} sold</b></div>`).join(''):'<p class="mu">No orders in this period yet. Place one from the Student tab.</p>'}</div>`;
}

/* ---------- History ---------- */
function hist(){
  const f=S.f,t=sod(),from=f.r==='all'?0:f.r==='1'?t:t-(+f.r-1)*DAY,q=f.q.trim().toLowerCase();
  return S.orders.filter(o=>o.created>=from&&(f.st==='all'||o.status===f.st)&&(!q||String(o.token).includes(q)||o.name.toLowerCase().includes(q)||o.items.some(i=>i.n.toLowerCase().includes(q)))).sort((a,b)=>b.created-a.created);
}
function histRows(){
  const L=hist();if(!L.length)return '<div class="empty">No orders match these filters.</div>';
  return `<div class="scroll"><table class="tbl"><thead><tr><th>Token</th><th>Date and time</th><th>Student</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>
  ${L.slice(0,100).map(o=>`<tr><td><b>${o.token}</b></td><td>${dt(o.created)}</td><td>${esc(o.name)}</td><td>${o.items.map(i=>i.q+'× '+esc(i.n)).join(', ')}</td><td>${inr(o.total)}</td><td>${payTxt(o)}</td><td><span class="pill ${o.status}">${o.status==='done'?'Collected':ST[o.status].split(',')[0]}</span></td></tr>`).join('')}</tbody></table></div>
  <p class="mu" style="padding:10px 12px">Showing ${Math.min(100,L.length)} of ${L.length} orders.${L.length>100?' Export to see all.':''}</p>`;
}
function histView(){
  const f=S.f,o=(v,t,c)=>`<option value="${v}" ${c==v?'selected':''}>${t}</option>`;
  return `<div class="card" style="padding:16px"><h2 class="disp" style="font-size:20px;margin-bottom:12px">Order history</h2><div class="filters">
  <label>Search token, student or dish<input data-m="hq" value="${esc(f.q)}" placeholder="e.g. 104 or dosa"></label>
  <label>Status<select data-m="hs">${o('all','All','')}${o('new','New',f.st)}${o('cooking','Preparing',f.st)}${o('ready','Ready',f.st)}${o('done','Collected',f.st)}${o('cancelled','Cancelled',f.st)}</select></label>
  <label>Period<select data-m="hr">${o('1','Today',f.r)}${o('7','Last 7 days',f.r)}${o('30','Last 30 days',f.r)}${o('all','All time',f.r)}</select></label>
  <button class="btn ghost" data-a="exp" data-v="hist" style="margin-bottom:0">Export CSV</button></div><div id="hres">${histRows()}</div></div>`;
}

/* ---------- Export ---------- */
async function exportCSV(L,name){
  const c=v=>'"'+String(v).replace(/"/g,'""')+'"';
  const rows=[['Order ID','Token','Date','Time','Student','Items','Amount (INR)','Payment','Payment ref','Status']].concat(L.map(o=>[o.id,o.token,new Date(o.created).toLocaleDateString('en-CA'),tm(o.created),o.name,o.items.map(i=>i.q+'x '+i.n).join('; '),o.total,payTxt(o),payOf(o).ref||'',o.status]));
  let d=null;try{d=window.claude&&await claude.use('downloads')}catch(e){}
  if(!d){toast('Downloads aren’t available in this view. Open the artifact in claude.ai.');return}
  try{await d.save({filename:name+'.csv',data:rows.map(r=>r.map(c).join(',')).join('\n')});toast('CSV ready')}catch(e){if(e&&e.code!=='declined')toast('Couldn’t export the file.')}
}

/* ---------- Actions ---------- */
const NEXT={new:'cooking',cooking:'ready',ready:'done'};
const A={
  cat:v=>S.cat=v,per:v=>S.per=v,
  pm:v=>{S.pm=v},
  app:v=>{S.mod.app=v;renderMod();return 'skip'},
  paycancel:()=>{S.mod=null;renderMod();return 'skip'},
  pay:()=>{const m=S.mod,u=(m.upi||'').trim();
    if(!/^[\w.\-]{2,}@[a-z]{2,}$/i.test(u)){m.err='Enter a valid UPI ID, for example name@bank.';renderMod();return 'skip'}
    m.err='';m.proc=true;renderMod();
    setTimeout(()=>{
      if(/@fail$/i.test(u)){m.proc=false;m.err='Payment declined by the bank. Try again or use another UPI ID.';renderMod();return}
      S.paid={m:'UPI',s:'paid',ref:'UPI'+String(Date.now()).slice(-9),app:m.app};S.mod=null;renderMod();A.place();render()},1600);
    return 'skip'},
  day:v=>{S.day=+v;S.slot=null},slot:v=>{S.slot=+v},
  blk:v=>{if(S.blocked[v])delete S.blocked[v];else S.blocked[v]=true;save()},
  capd:()=>{S.cap=Math.max(1,S.cap-1);save()},capu:()=>{S.cap=Math.min(30,S.cap+1);save()},
  login:()=>{const i=$('[data-m="pin"]');if(i&&i.value==='1234'){S.auth=true;try{sessionStorage.setItem('cc_auth','1')}catch(e){}toast('Signed in')}else toast('Wrong PIN. Try again.')},
  logout:()=>{S.auth=false;try{sessionStorage.removeItem('cc_auth')}catch(e){}},
  inc:v=>S.cart[v]=(S.cart[v]||0)+1,
  dec:v=>{S.cart[v]=(S.cart[v]||0)-1;if(S.cart[v]<=0)delete S.cart[v]},
  stock:v=>{S.stock[v]=S.stock[v]===false;save()},
  adv:v=>{const o=S.orders.find(x=>x.id==v);if(o){o.status=NEXT[o.status];save();if(o.status==='ready')toast('Token '+o.token+' is ready for pickup')}},
  cancel:v=>{const o=S.orders.find(x=>x.id==v);if(o){o.status='cancelled';save()}},
  place:()=>{
    if(!S.name.trim()){toast('Enter your name or roll number first.');return}
    const lines=Object.entries(S.cart).map(([id,q])=>({...MENU.find(m=>m.id==id),q}));if(!lines.length)return;const sl=slotList(S.day).find(s=>s.ts===S.slot);if(!sl||sl.blocked||sl.past||sl.booked>=S.cap){S.slot=null;toast('Choose an available pickup time slot.');return}
    if(S.pm==='online'&&!S.paid){S.mod={app:'gpay',upi:'',proc:false,err:''};renderMod();return 'skip'}
    const t=sod(),now=Date.now(),o={id:now,token:101+S.orders.filter(x=>x.created>=t).length,name:S.name.trim(),items:lines.map(l=>({n:l.n,p:l.p,q:l.q})),total:lines.reduce((a,l)=>a+l.p*l.q,0),status:'new',created:now,slot:S.slot,readyBy:S.slot,pay:S.paid||{m:'Counter',s:'due'}};
    S.orders.push(o);S.mine.push(o.id);S.cart={};S.slot=null;S.paid=null;save();toast((o.pay.s==='paid'?'Payment received. ':'')+'Order placed. Your token is '+o.token);
  },
  exp:v=>{if(v==='hist')exportCSV(hist(),'order-history');else exportCSV(inP(S.per),'sales-'+S.per);return 'skip'},
  reset:()=>{if(confirm('Reset all demo data? This clears orders and tokens in this browser.')){S.orders=seed();S.mine=[];S.stock={};S.cart={};S.blocked={};S.slot=null;save()}}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;if(A[b.dataset.a](b.dataset.v)!=='skip')render()});
document.addEventListener('input',e=>{const m=e.target.dataset.m;if(!m)return;
  if(m==='name'){S.name=e.target.value;sv(KN,S.name)}
  if(m==='upi'&&S.mod)S.mod.upi=e.target.value;
  if(m==='hq'){S.f.q=e.target.value;$('#hres').innerHTML=histRows()}});
document.addEventListener('change',e=>{const m=e.target.dataset.m;if(!m)return;
  if(m==='slot')S.slot=+e.target.value;
  if(m==='hs'||m==='hr'){S.f[m==='hs'?'st':'r']=e.target.value;$('#hres').innerHTML=histRows()}});

/* ---------- Render ---------- */
const KV=['kitchen','slots','sales','history'];
function render(){
  const v=view(),kv=KV.includes(v),open=S.orders.filter(o=>o.status==='new').length;
  const tabs=kv?[['kitchen','Live orders'],['slots','Time slots'],['sales','Sales'],['history','Order history']]:v==='home'?[]:[['student','Order food'],['orders','My orders']];
  $('#bt').textContent=kv?'Kitchen dashboard':v==='home'?'Campus Canteen':'Student dashboard';
  $('#bp').textContent=kv?'Run live orders, time slots and sales.':v==='home'?'Order ahead, get a token, collect when it’s ready.':'Book a pickup time slot and skip the queue.';
  $('#nav').hidden=v==='home'||(kv&&!S.auth);
  $('#ft').hidden=!(kv&&S.auth);
  $('#nav').innerHTML=tabs.map(([k,t])=>`<a href="#${k}" class="${k===v?'on':''}" ${k===v?'aria-current="page"':''}>${t}${k==='kitchen'&&open?`<b>${open}</b>`:''}</a>`).join('')+(kv?'<a href="#home" data-a="logout">Sign out</a>':'<a href="#home">Switch portal</a>');
  const views={home,student,orders:ordersView,kitchen,slots,sales,history:histView};
  $('#main').innerHTML=kv&&!S.auth?login():views[v]();
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.m==='pin'){A.login();render()}});
window.addEventListener('hashchange',()=>{render();scrollTo(0,0)});
window.addEventListener('storage',()=>{S.orders=ld(K,S.orders);S.stock=ld(KS,S.stock);S.mine=ld(KM,S.mine);S.cap=ld('cc_cap_v1',S.cap);S.blocked=ld('cc_blk_v1',S.blocked);const a=document.activeElement;if(!a||!a.dataset.m)render()});
setInterval(()=>{if(!document.hidden&&S.auth&&['kitchen','slots','sales'].includes(view()))render()},30000);
render();
