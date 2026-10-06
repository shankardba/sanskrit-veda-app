'use strict';
/* ============================================================
   About the book (shared, bottom of left panel)
   ============================================================ */
const SUTRAS=['Ekādhikena Pūrveṇa','Nikhilaṁ Navataścaramaṁ Daśataḥ','Ūrdhva-Tiryagbhyām','Parāvartya Yojayet','Śūnyaṁ Sāmyasamuccaye','(Ānurūpye) Śūnyamanyat','Saṅkalana-vyavakalanābhyām','Pūraṇāpūraṇābhyām','Calana-Kalanābhyām','Yāvadūnam','Vyaṣṭisamaṣṭiḥ','Śeṣāṇyaṅkena Carameṇa','Sopāntyadvayamantyam','Ekanyūnena Pūrveṇa','Guṇitasamuccayaḥ','Guṇakasamuccayaḥ'];
const SUBS=['Ānurūpyeṇa','Śiṣyate Śeṣasaṁjñaḥ','Ādyamādyenāntyamantyena','Kevalaiḥ Saptakaṁ Guṇyāt','Veṣṭanam','Yāvadūnaṁ Tāvadūnam','Yāvadūnaṁ Tāvadūnīkṛtya Vargañca Yojayet','Antyayor Daśake’pi','Antyayoreva','Samuccayaguṇitaḥ','Lopanasthāpanābhyām','Vilokanam','Guṇitasamuccayaḥ Samuccayaguṇitaḥ'];
function aboutHTML(cur){
  const used=(field,n)=>T.filter(t=>(t[field]||[]).includes(n));
  const li=(name,i,field)=>{ const ls=used(field,i+1); const here=ls.includes(cur);
    return `<li class="${here?'here':''}">${name}${ls.length?` <span class="note">· ${ls.length} lesson${ls.length>1?'s':''}</span>`:''}</li>`; };
  const nCh=new Set(T.map(t=>t.chn)).size;
  return `<p><b>Jagadguru Śaṅkarācārya Bhāratī Kṛṣṇa Tīrtha</b> (1884–1960), born Venkatraman Shastri in the Tirunelveli region of Tamil Nadu, studied science, mathematics and Sanskrit before taking sannyāsa; from 1925 he headed the Govardhana Maṭha at Puri.</p>
  <p>He said he reconstructed sixteen <i>sūtras</i> (aphorisms) and thirteen corollaries during years of study between 1911 and 1918, and wrote sixteen volumes expounding them — manuscripts that were reportedly lost. The single introductory volume we have was written from memory late in his life and published posthumously in <b>1965</b> by Banaras Hindu University, edited by V. S. Agrawala.</p>
  <p class="note"><b>On the “Vedic” claim.</b> Tīrtha attributed the sūtras to a <i>pariśiṣṭa</i> (appendix) of the Atharvaveda, but the editor’s own foreword says they do not appear in the known pariśiṣṭas, and a note on the sūtra list says it was “compiled from stray references in the text”. Historians of Indian mathematics (e.g. K. S. Shukla, S. G. Dani) regard the system as Tīrtha’s own ingenious creation rather than ancient Vedic material. The <i>methods</i> are sound either way — which is why every lesson here shows the algebra that makes it work.</p>
  <p class="note"><b>What’s here.</b> ${T.length} animated lessons covering ${nCh} of the book’s 40 chapters, in the book’s own order. Several chapters (VI, XXII–XXIV, XXXI, XXXVI–XXXIX) teach methods for which Tīrtha names no sūtra, or only “extensions” of one; they are included all the same.</p>
  <p><b>The sixteen sūtras</b></p><ol class="sutra-list">${SUTRAS.map((n,i)=>li(n,i,'su')).join('')}</ol>
  <p><b>The thirteen sub-sūtras (corollaries)</b></p><ol class="sutra-list">${SUBS.map((n,i)=>li(n,i,'sub')).join('')}</ol>`;
}

/* ============================================================
   Board renderer — keyed reconciliation with transitions
   ============================================================ */
const CW=CW_, RH=RH_;
const svg=$('#board'), itLayer=$('#itLayer'), lnLayer=$('#lnLayer'), shLayer=$('#shLayer');
const NS='http://www.w3.org/2000/svg';
const live=new Map(), liveLn=new Map(), liveSh=new Map();
let frames=[], idx=0, timer=null, view=null;

const isLeftItem = it => it.c.includes('work')||it.c.includes('lbl');
function itemPos(it){ const w=len(it.t); return {cx:(it.x+w/2)*CW, cy:it.y*RH, w}; }
function shapePts(sh){
  const r=(sh.tf.r||0)*Math.PI/180, c=Math.cos(r), s=Math.sin(r);
  if(sh.circle){ const {cx,cy,rad}=sh.circle; return [[cx-rad,cy-rad],[cx+rad,cy+rad]].map(([x,y])=>[x+sh.tf.x,y+sh.tf.y]); }
  return sh.pts.map(([x,y])=>[x*c-y*s+sh.tf.x, x*s+y*c+sh.tf.y]);
}
function fitView(frs){
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  const grow=(a,b,c,d)=>{ x0=Math.min(x0,a); x1=Math.max(x1,b); y0=Math.min(y0,c); y1=Math.max(y1,d); };
  frs.forEach(f=>{
    f.items.forEach(it=>{ const {cx,cy,w}=itemPos(it);
      if(isLeftItem(it)){ const half=w*CW*(it.c.includes('work')?0.71:0.5); grow(it.x*CW, it.x*CW+half, cy-RH*0.5, cy+RH*0.5); }
      else grow(cx-w*CW/2, cx+w*CW/2, cy-RH*0.5, cy+RH*0.5); });
    f.lines.forEach(l=>{ if(l.x1!==undefined) grow(Math.min(l.x1,l.x2)*CW, Math.max(l.x1,l.x2)*CW, Math.min(l.y1,l.y2)*RH, Math.max(l.y1,l.y2)*RH); });
    (f.shapes||[]).forEach(sh=>shapePts(sh).forEach(([x,y])=>grow(x,x,y,y)));
  });
  if(x0>x1){ x0=0;x1=100;y0=0;y1=60; }
  const pad=16; x0-=pad; x1+=pad; y0-=pad*1.4; y1+=pad;
  const w=x1-x0, h=y1-y0;
  svg.setAttribute('viewBox',`${x0} ${y0} ${w} ${h}`);
  svg.style.maxWidth=Math.round(w*1.15)+'px';
  view={x0,y0,w,h};
}
function makeItem(it){
  const g=document.createElementNS(NS,'g'); g.dataset.k=it.k;
  const r=document.createElementNS(NS,'rect'); r.setAttribute('class','bg'); r.setAttribute('rx','7'); g.appendChild(r);
  const t=document.createElementNS(NS,'text'); g.appendChild(t);
  const v=document.createElementNS(NS,'line'); v.setAttribute('class','vin'); g.appendChild(v);
  itLayer.appendChild(g); return g;
}
function paintItem(g,it){
  const {cx,cy,w}=itemPos(it);
  const left=isLeftItem(it), tx=left? it.x*CW : cx;
  g.setAttribute('class','it '+it.c);
  g.style.transform=`translate(${tx}px,${cy}px)`;
  const t=g.querySelector('text'); if(t.textContent!==it.t) t.textContent=it.t;
  const small=it.c.includes('sup')||it.c.includes('carry');
  const bw=left? w*CW*0.71+12 : (small? 16 : w*CW+10), bh=small?20:38;
  const r=g.querySelector('rect'); r.setAttribute('x',left?-6:-bw/2); r.setAttribute('y',-bh/2); r.setAttribute('width',bw); r.setAttribute('height',bh);
  const v=g.querySelector('.vin');
  if(it.bar){ v.setAttribute('x1',-w*CW/2+3); v.setAttribute('x2',w*CW/2-3); v.setAttribute('y1',-19); v.setAttribute('y2',-19); v.style.display=''; } else v.style.display='none';
}
function lineD(l, pos){
  if(l.x1!==undefined) return `M${l.x1*CW},${l.y1*RH} L${l.x2*CW},${l.y2*RH}`;
  const A=pos.get(l.a), B=pos.get(l.b); if(!A||!B) return null;
  let x1=A.x,y1=A.y,x2=B.x,y2=B.y;
  const dx=x2-x1, dy=y2-y1, d=Math.hypot(dx,dy)||1, sh=Math.min(16,d/3), ux=dx/d, uy=dy/d;
  x1+=ux*sh; y1+=uy*sh; x2-=ux*sh; y2-=uy*sh;
  if(l.bend){ const mx=(x1+x2)/2, my=(y1+y2)/2 + l.bend*RH; return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`; }
  return `M${x1},${y1} L${x2},${y2}`;
}
function shapeD(sh){
  if(sh.circle){ const {cx,cy,rad}=sh.circle; return `M${cx-rad},${cy} a${rad},${rad} 0 1,0 ${2*rad},0 a${rad},${rad} 0 1,0 ${-2*rad},0`; }
  return 'M'+sh.pts.map(p=>p.join(',')).join(' L')+(sh.closed?' Z':'');
}
function render(i){
  const f=frames[i]; if(!f) return;
  /* shapes (under everything) */
  const seenS=new Set();
  (f.shapes||[]).forEach(sh=>{
    seenS.add(sh.k);
    let g=liveSh.get(sh.k), fresh=false;
    if(!g){ g=document.createElementNS(NS,'g'); const p=document.createElementNS(NS,'path'); g.appendChild(p); shLayer.appendChild(g); liveSh.set(sh.k,g); fresh=true; }
    const p=g.firstChild; p.setAttribute('d',shapeD(sh)); g.setAttribute('class','shp '+sh.c);
    const tf=`translate(${sh.tf.x}px,${sh.tf.y}px) rotate(${sh.tf.r||0}deg)`;
    if(fresh){ g.style.transition='none'; g.style.transform=tf; g.style.opacity='0'; g.getBoundingClientRect(); g.style.transition=''; g.style.opacity='1'; }
    else { g.style.opacity='1'; g.style.transform=tf; }
  });
  liveSh.forEach((g,k)=>{ if(!seenS.has(k)){ liveSh.delete(k); g.style.opacity='0'; setTimeout(()=>g.remove(),420); } });
  /* text items */
  const seen=new Set(), pos=new Map();
  f.items.forEach(it=>{
    seen.add(it.k);
    let g=live.get(it.k);
    const target=itemPos(it);
    pos.set(it.k,{x: isLeftItem(it)? it.x*CW+len(it.t)*CW*0.3 : target.cx, y: target.cy});
    if(!g){
      g=makeItem(it); live.set(it.k,g);
      const src=it.from && live.get(it.from);
      if(src){ g.style.transition='none'; paintItem(g,it); g.style.transform=src.style.transform; g.getBoundingClientRect(); g.style.transition=''; paintItem(g,it); }
      else { g.style.transition='none'; paintItem(g,it); g.style.opacity='0'; g.getBoundingClientRect(); g.style.transition=''; g.style.opacity='1'; }
    } else { g.style.opacity='1'; paintItem(g,it); }
  });
  live.forEach((g,k)=>{ if(!seen.has(k)){ live.delete(k); g.style.opacity='0'; setTimeout(()=>g.remove(),420); } });
  /* lines */
  const seenL=new Set();
  f.lines.forEach(l=>{
    const d=lineD(l,pos); if(!d) return;
    seenL.add(l.k);
    let p=liveLn.get(l.k);
    if(!p){ p=document.createElementNS(NS,'path'); p.setAttribute('pathLength','1'); lnLayer.appendChild(p); liveLn.set(l.k,p);
      p.setAttribute('class','ln '+l.c+(l.x1===undefined?' draw':'')); }
    else p.setAttribute('class','ln '+l.c);
    p.setAttribute('d',d);
  });
  liveLn.forEach((p,k)=>{ if(!seenL.has(k)){ liveLn.delete(k); p.classList.add('fade'); setTimeout(()=>p.remove(),320); } });
  $('#say').innerHTML=f.say||'';
  $('#stepNo').textContent=`${i+1} / ${frames.length}`;
  $('#prog').style.width=(frames.length>1? i/(frames.length-1)*100 : 100)+'%';
  $('#bPrev').disabled=i===0; $('#bNext').disabled=i===frames.length-1;
}
function clearBoard(){ [live,liveLn,liveSh].forEach(m=>{ m.forEach(g=>g.remove()); m.clear(); }); }
function load(fr){ stop(); frames=fr; idx=0; clearBoard(); fitView(frames); render(0); }
function go(i){ i=Math.max(0,Math.min(frames.length-1,i)); idx=i; render(idx); }
function play(){ if(timer) return; if(idx>=frames.length-1) go(0); $('#bPlay').textContent='❚❚'; $('#bPlay').setAttribute('aria-label','Pause');
  const tick=()=>{ if(idx>=frames.length-1){ stop(); return; } go(idx+1); timer=setTimeout(tick, +$('#speed').value); };
  timer=setTimeout(tick, Math.min(900,+$('#speed').value)); }
function stop(){ if(timer){clearTimeout(timer); timer=null;} $('#bPlay').textContent='▶'; $('#bPlay').setAttribute('aria-label','Play'); }

/* ============================================================
   Catalogue: book order (by chapter) or grouped by sūtra
   ============================================================ */
T.sort((a,b)=>(a.chn-b.chn)||((a.o??500)-(b.o??500))||(a._i-b._i));
const chapLabel = n => `${ROMAN[n]} · ${CHAPTERS[n][0]}`;
function sutraGroup(t){
  if(t.su&&t.su.length) return {k:'a'+String(t.su[0]).padStart(2,'0'), label:`Sūtra ${t.su[0]} · ${SUTRAS[t.su[0]-1]}`};
  if(t.sub&&t.sub.length) return {k:'b'+String(t.sub[0]).padStart(2,'0'), label:`Sub-sūtra ${t.sub[0]} · ${SUBS[t.sub[0]-1]}`};
  return {k:'c', label:'No sūtra named — the book’s own methods'};
}
let tech=T[0], prob=null, tries=0;
const store={ get(k,d){ try{ const v=localStorage.getItem('vedic-math:'+k); return v?JSON.parse(v):d; }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem('vedic-math:'+k,JSON.stringify(v)); }catch(e){} } };
let stats=store.get('stats',{}), groupMode=store.get('group','chapter'), orderList=T.slice();

function buildSelect(){
  const sel=$('#techSel'); sel.innerHTML='';
  const groups=new Map();
  if(groupMode==='chapter'){
    T.forEach(t=>{ const k=t.chn; if(!groups.has(k)) groups.set(k,{label:chapLabel(k),items:[]}); groups.get(k).items.push(t); });
  } else {
    const keyed=T.map(t=>({t,g:sutraGroup(t)})).sort((a,b)=>a.g.k<b.g.k?-1:a.g.k>b.g.k?1:(a.t.chn-b.t.chn)||(a.t._i-b.t._i));
    keyed.forEach(({t,g})=>{ if(!groups.has(g.k)) groups.set(g.k,{label:g.label,items:[]}); groups.get(g.k).items.push(t); });
  }
  orderList=[];
  groups.forEach(gr=>{ const og=document.createElement('optgroup'); og.label=gr.label; gr.items.forEach(t=>{ const o=document.createElement('option'); o.value=t.id; o.textContent=t.name; og.appendChild(o); orderList.push(t); }); sel.appendChild(og); });
  sel.value=tech.id;
  document.querySelectorAll('.grp-toggle button').forEach(b=>b.classList.toggle('on',b.dataset.g===groupMode));
}
function fillPanel(){
  const t=tech, su=t.sutra, [ctitle,cpage]=CHAPTERS[t.chn];
  const chapBadge=`<div class="ch">Ch. ${ROMAN[t.chn]} · ${ctitle} · p. ${cpage}${t.ch?` <span class="also">${t.ch}</span>`:''}</div>`;
  $('#sutraCard').innerHTML = su
    ? `<div class="kind">${su.kind}</div><div class="dev" lang="sa">${su.dev}</div><div class="iast">${su.iast}</div><div class="en">${su.en}</div>${chapBadge}`
    : `<div class="kind">CHAPTER ${ROMAN[t.chn]}</div><div class="iast" style="margin-top:6px">${ctitle}</div><div class="en">${t.nosutra||'Tīrtha names no single sūtra for this method.'}</div>${chapBadge}`;
  $('#briefCard').innerHTML=`<h2>The method</h2>${t.brief}`;
  $('#whyCard').innerHTML=`<h2>Why it works</h2>${t.why}`;
  $('#histCard').innerHTML=`<h2>History &amp; notes</h2>${t.hist}`;
  $('#aboutBody').innerHTML=aboutHTML(t.id);
  $('#short').textContent=t.short;
  $('#ownIn').placeholder=t.ph; $('#ownIn').value=''; $('#ownErr').textContent='';
  $('#ownHint').textContent= t.noParse ? 'Examples here are generated so the method’s conditions hold — press Random for a new one.' : 'Animate shows every step for your numbers; Random picks a fresh example.';
  $('#ownIn').disabled=!!t.noParse; $('#ownGo').disabled=!!t.noParse;
}
function runParams(p){ try{ load(tech.gen(p)); }catch(e){ console.error(e); $('#say').innerHTML=`<span class="no">Couldn’t animate this one: ${e.message||e}</span>`; } }
function selectTech(id, push=true){
  tech=T.find(t=>t.id===id)||T[0];
  $('#techSel').value=tech.id;
  fillPanel(); runParams(tech.ex); newProblem();
  store.set('last',tech.id);
  if(push) try{ history.replaceState(null,'','#'+tech.id); }catch(e){}
  $('#aside').scrollTop=0;
}
function scoreText(){ const s=stats[tech.id]; $('#score').textContent = s ? `${s.c}/${s.n} correct · streak ${s.st}` : ''; }
function newProblem(){
  prob = tech.prand ? tech.prand() : tech.rand();
  tries=0; $('#pq').innerHTML=tech.q(prob); $('#pIn').value=''; $('#pFb').innerHTML=''; scoreText();
}
function checkAnswer(){
  const v=$('#pIn').value; if(!v.trim()) return;
  const ok = tech.check ? tech.check(prob,v) : normIn(v)===normIn(tech.ans(prob));
  const s=stats[tech.id]||{c:0,n:0,st:0};
  if(tries===0){ s.n++; if(ok){ s.c++; s.st++; } else s.st=0; stats[tech.id]=s; store.set('stats',stats); }
  tries++;
  const extra = tech.after ? tech.after(prob) : '';
  $('#pFb').innerHTML = ok ? `<span class="ok">✓ Correct!</span>${extra} <span class="note">Enter for the next one.</span>` : `<span class="no">✗ Not quite.</span> Try again, or press <b>Show steps</b>.`;
  if(ok) $('#pIn').dataset.done='1';
  scoreText();
}
function showSteps(){
  runParams(prob);
  $('#pFb').innerHTML=`Answer: <b class="mono">${tech.ans(prob)}</b> — watch the board above.`+(tech.after?tech.after(prob):'');
  if(tries===0){ const s=stats[tech.id]||{c:0,n:0,st:0}; s.n++; s.st=0; stats[tech.id]=s; store.set('stats',stats); tries=1; scoreText(); }
  document.querySelector('.board-card').scrollIntoView({behavior:'smooth',block:'nearest'});
  setTimeout(play,500);
}

buildSelect();
$('#techSel').addEventListener('change',e=>selectTech(e.target.value));
$('#prevTech').onclick=()=>{ const i=orderList.indexOf(tech); selectTech(orderList[(i-1+orderList.length)%orderList.length].id); };
$('#nextTech').onclick=()=>{ const i=orderList.indexOf(tech); selectTech(orderList[(i+1)%orderList.length].id); };
document.querySelectorAll('.grp-toggle button').forEach(b=>b.onclick=()=>{ groupMode=b.dataset.g; store.set('group',groupMode); buildSelect(); });
$('#bRestart').onclick=()=>{ stop(); clearBoard(); idx=0; render(0); };
$('#bPrev').onclick=()=>{ stop(); go(idx-1); };
$('#bNext').onclick=()=>{ stop(); go(idx+1); };
$('#bPlay').onclick=()=>{ timer? stop() : play(); };
$('#ownGo').onclick=()=>{ $('#ownErr').textContent=''; const v=$('#ownIn').value.trim(); if(!v){ $('#ownErr').textContent='Type a problem first — e.g. '+tech.ph; return; } try{ const p=tech.parse(v); runParams(p); setTimeout(play,400); }catch(e){ $('#ownErr').textContent= typeof e==='string'? e : (e.message||String(e)); } };
$('#ownIn').addEventListener('keydown',e=>{ if(e.key==='Enter') $('#ownGo').click(); });
$('#ownRand').onclick=()=>{ $('#ownErr').textContent=''; runParams(tech.rand()); setTimeout(play,400); };
$('#pCheck').onclick=checkAnswer;
$('#pIn').addEventListener('keydown',e=>{ if(e.key==='Enter'){ if($('#pIn').dataset.done==='1'){ delete $('#pIn').dataset.done; newProblem(); } else checkAnswer(); } });
$('#pIn').addEventListener('input',()=>{ delete $('#pIn').dataset.done; });
$('#pNew').onclick=()=>{ delete $('#pIn').dataset.done; newProblem(); $('#pIn').focus(); };
$('#pShow').onclick=showSteps;
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea')) return;
  if(e.key==='ArrowRight'){ stop(); go(idx+1); e.preventDefault(); }
  else if(e.key==='ArrowLeft'){ stop(); go(idx-1); e.preventDefault(); }
  else if(e.key===' '){ timer? stop() : play(); e.preventDefault(); }
  else if(e.key==='Home'){ $('#bRestart').click(); }
});
const startId=(location.hash||'').slice(1) || store.get('last','recip');
selectTech(T.some(t=>t.id===startId)?startId:T[0].id, false);

/* exposed for self-tests in the console: VM.selfTest() → [] when every lesson agrees with plain arithmetic */
window.VM={T, selfTest(n=60){
  const bad=[];
  T.forEach(t=>{ for(let i=0;i<n;i++){ const p=i===0?t.ex:t.rand(); try{
      const fr=t.gen(p); const last=fr[fr.length-1].say;
      if(/class="no"/.test(last) && !t.verdict) bad.push([t.id,JSON.stringify(p),last]);
      const pp=t.prand? t.prand() : p;
      if(t.check && !t.check(pp,t.ans(pp))) bad.push([t.id,JSON.stringify(pp),'practice answer fails its own check']);
    }catch(e){ bad.push([t.id,JSON.stringify(p),String(e&&e.stack||e)]); } } });
  return bad;
}};
