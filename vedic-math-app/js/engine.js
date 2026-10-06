'use strict';
const CW_=16.2, RH_=50;   // board grid: IBM Plex Mono advance at 27px, row height
try{ if(window.self!==window.top) document.documentElement.classList.add('embedded'); }catch(e){ document.documentElement.classList.add('embedded'); }
/* ============================================================
   small helpers
   ============================================================ */
const $ = s => document.querySelector(s);
const ri = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const pick = a => a[Math.floor(Math.random()*a.length)];
const len = s => [...String(s)].length;
const pad = (n,k) => String(n).padStart(k,'0');
const M = '−';
const fmt = n => n<0 ? M+Math.abs(n) : String(n);
const sgn = n => n<0 ? M+Math.abs(n) : '+'+n;               // "+3" / "−4"
const sp = n => n<0 ? M+' '+Math.abs(n) : '+ '+n;           // "+ 3" / "− 4"
const digits = n => String(n).split('').map(Number);
const gcd = (a,b) => { a=Math.abs(a); b=Math.abs(b); while(b){[a,b]=[b,a%b];} return a; };
const dr = n => n===0 ? 0 : 1 + (n-1)%9;                    // digital root (bījāṅka)
const normIn = s => String(s).trim().replace(/[−–—]/g,'-').replace(/[\s,]/g,'');
function frac(n,d){ if(d<0){n=-n;d=-d;} const g=gcd(n,d)||1; return {n:n/g,d:d/g}; }
const fracStr = f => f.d===1 ? fmt(f.n) : fmt(f.n)+'/'+f.d;
function parseNum(s){
  s = normIn(s);
  let m = s.match(/^(-?\d+)\/(-?\d+)$/); if(m) return +m[1]/ +m[2];
  if(/^-?\d*\.?\d+$/.test(s)) return +s;
  return NaN;
}
const yesNo = s => { s=normIn(s).toLowerCase(); if(/^(y|yes|true|1|✓)$/.test(s)) return 'yes'; if(/^(n|no|false|0|✗)$/.test(s)) return 'no'; return null; };
function nums(str){ return (normIn(str).replace(/[×x*÷/:]|by|and|r/gi,' ').match(/-?\d+/g)||[]).map(Number); }
function binop(str, ops){
  const s = String(str).replace(/[−–—]/g,'-');
  const m = s.match(new RegExp('^\\s*(\\d+)\\s*(?:'+ops+')\\s*(\\d+)\\s*$','i'));
  return m ? [+m[1], +m[2]] : null;
}
const MUL = '×|x|\\*|times';
const DIV = '÷|/|by|:';

/* ============================================================
   Scene builder — a technique describes its animation as a list
   of snapshots. Items are keyed: the same key in the next frame
   moves (CSS transition) instead of being redrawn, which is what
   makes digits visibly travel to where they're used.
   Coordinates: x in monospace character cells, y in rows.
   ============================================================ */
class Sc{
  constructor(){ this.it=new Map(); this.ln=new Map(); this.sh=new Map(); this.fr=[]; this.hot=new Set(); this.tl=[]; this.tc=new Map(); }
  put(k,x,y,t,c='n',o={}){ this.it.set(k,{k,x,y,t:String(t),c,bar:!!o.bar,from:o.from||null}); return this; }
  mv(k,x,y){ const i=this.it.get(k); if(i){i.x=x;i.y=y;} return this; }
  set(k,props){ const i=this.it.get(k); if(i) Object.assign(i,props); return this; }
  del(...ks){ ks.flat().forEach(k=>this.it.delete(k)); return this; }
  has(k){ return this.it.has(k); }
  get(k){ return this.it.get(k); }
  hl(...ks){ ks.flat().forEach(k=>this.hot.add(k)); return this; }
  tcls(k,c){ this.tc.set(k,c); return this; }
  link(a,b,c='link',bend=0){ this.tl.push({k:'t:'+a+'>'+b+':'+c,a,b,c,bend}); return this; }
  plink(k,a,b,c='link',bend=0){ this.ln.set(k,{k,a,b,c,bend}); return this; }
  seg(k,x1,y1,x2,y2,c='rule'){ this.ln.set(k,{k,x1,y1,x2,y2,c}); return this; }
  unseg(...ks){ ks.forEach(k=>this.ln.delete(k)); return this; }
  /* geometry: shapes are drawn in pixel units around their own origin and placed by tf={x,y,r} (r in degrees),
     so a shape keeps its key while it slides/rotates to a new place — that is how proofs by rearrangement move */
  shape(k,o){ this.sh.set(k,{k,c:'g1',closed:true,tf:{x:0,y:0,r:0},...o}); return this; }
  move(k,tf){ const sh=this.sh.get(k); if(sh) sh.tf={...sh.tf,...tf}; return this; }
  shcls(k,c){ const sh=this.sh.get(k); if(sh) sh.c=c; return this; }
  unshape(...ks){ ks.flat().forEach(k=>this.sh.delete(k)); return this; }
  /* put a text token centred on a pixel position (for labels on geometry) */
  putp(k,px,py,t,c='n',o={}){ return this.put(k,px/CW_-len(t)/2,py/RH_,t,c,o); }
  snap(say){
    const items=[...this.it.values()].map(i=>{
      let c=i.c; if(this.hot.has(i.k)) c+=' hot'; if(this.tc.has(i.k)) c+=' '+this.tc.get(i.k);
      return {...i,c};
    });
    this.fr.push({items, lines:[...this.ln.values(), ...this.tl], shapes:[...this.sh.values()].map(x=>({...x,tf:{...x.tf}})), say});
    this.it.forEach(i=>{i.from=null;}); this.hot.clear(); this.tl=[]; this.tc.clear();
    return this;
  }
}
/* lay tokens left-to-right on one row: [[key,text,cls,opts],...] */
function lay(s,y,toks,x0=0,gap=0.6){ let x=x0; for(const [k,t,c,o] of toks){ s.put(k,x,y,t,c||'n',o||{}); x+=len(t)+gap; } return x; }
/* put a number's digits right-aligned so its last digit sits at column xr (spacing w) */
function digitsAt(s,pre,str,xr,y,c='n',w=1){ const a=[...String(str)]; a.forEach((ch,i)=>{ const fromRight=a.length-1-i; s.put(pre+fromRight, xr-fromRight*w, y, ch, c); }); return a.length; }

/* ============================================================
   Shared finishing step for the base-and-deviation family
   (Nikhilam multiplication, Yāvadūnam squaring, Ānurūpyeṇa)
   ============================================================ */
function rightPart(v,k){ return v<0 ? {t:pad(-v,k), bar:true} : {t: v<10**k ? pad(v,k) : String(v), bar:false}; }
function baseFinish(s,{left,right,B,k,W,y,label,expect}){
  let Lf=left, R=right;
  if(R>=B){
    const c=Math.floor(R/B); Lf+=c; R%=B;
    s.put('cy',W-len(left)-1.6,y-0.6,'+'+c,'carry',{from:'rt'}).hl('rt','cy');
    s.snap(`The right part may hold only <b>${k}</b> digit${k>1?'s':''} (one for each zero in the base ${B}). ${right} is too big, so its extra <b>${c}</b> carries over into the left part.`);
    s.put('lt',W-len(Lf),y,Lf,'res').put('rt',W+2,y,pad(R,k),'res').del('cy').hl('lt','rt');
    s.snap(`${left} + ${c} = <b>${Lf}</b> on the left, and <b>${pad(R,k)}</b> stays on the right.`);
  } else if(R<0){
    const b=Math.ceil(-R/B); Lf-=b; R+=b*B;
    s.hl('rt');
    s.snap(`The right part is negative — written with a bar on top, the <i>vinculum</i> (<span class="vinc">${pad(-right,k)}</span> means −${-right}). Borrow ${b} from the left: one unit on the left is worth ${B} here.`);
    s.put('lt',W-len(Lf),y,Lf,'res').put('rt',W+2,y,pad(R,k),'res').hl('lt','rt');
    s.snap(`${left} − ${b} = <b>${Lf}</b> on the left; ${b*B} − ${-right} = <b>${pad(R,k)}</b> on the right.`);
  }
  const ans = Lf*B + R;
  const ansStr = String(Lf)+pad(R,k);
  const yA=y+1.5;
  const pre=label+' =';
  s.put('eqA',0,yA,pre,'op');
  const x0=len(pre)+1;
  s.put('ltA',x0,yA,String(Lf),'ans',{from:'lt'}).put('rtA',x0+len(Lf),yA,pad(R,k),'ans',{from:'rt'});
  s.snap(`Join the two parts: <span class="ok">${label} = ${Number(ansStr)}</span>` + (expect!==undefined && Number(ansStr)!==expect ? ` <span class="no">(check failed: expected ${expect})</span>` : ''));
  return ans;
}



/* ============================================================
   Algebra helpers (polynomials as coefficient arrays, highest power first)
   ============================================================ */
const SUP={0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹'};
const sup = n => String(n).split('').map(c=>SUP[c]).join('');
/* one term with its sign: termStr(-3,2) -> "− 3x²"; first term has no leading "+" */
function termStr(c,p,v='x',first=false){
  if(c===0) return '';
  const a=Math.abs(c), coef = (a===1 && p>0) ? '' : String(a);
  const body = coef + (p>0 ? v + (p>1?sup(p):'') : '');
  if(first) return (c<0?M:'')+body;
  return (c<0?M+' ':'+ ')+body;
}
function fmtPoly(cs,v='x'){
  const n=cs.length-1; const parts=[]; let first=true;
  cs.forEach((c,i)=>{ if(c!==0){ parts.push(termStr(c,n-i,v,first)); first=false; } });
  return parts.length? parts.join(' ') : '0';
}
function polyMul(a,b){ const r=new Array(a.length+b.length-1).fill(0); a.forEach((x,i)=>b.forEach((y,j)=>{ r[i+j]+=x*y; })); return r; }
function polyEval(cs,x){ return cs.reduce((acc,c)=>acc*x+c,0); }
/* exact division of integer polynomials; returns {q, r} (r has length deg(b)) */
function polyDiv(a,b){
  const q=new Array(Math.max(1,a.length-b.length+1)).fill(0), r=a.slice();
  for(let i=0;i<=a.length-b.length;i++){ const f=r[i]/b[0]; q[i]=f; for(let j=0;j<b.length;j++) r[i+j]-=f*b[j]; }
  return {q, r:r.slice(a.length-b.length+1)};
}
/* binomial "(x + 3)" / "(2x − 5)" */
const bin = (a,b,v='x') => `(${a===1?'':a===-1?M:a}${v} ${sp(b)})`;
/* fractions */
const fracVal = f => f.n/f.d;
const fadd=(a,b)=>frac(a.n*b.d+b.n*a.d,a.d*b.d), fsub=(a,b)=>frac(a.n*b.d-b.n*a.d,a.d*b.d), fmul=(a,b)=>frac(a.n*b.n,a.d*b.d), fdiv=(a,b)=>frac(a.n*b.d,a.d*b.n);
const F = (n,d=1)=>frac(n,d);
function checkFrac(f,v){ const x=parseNum(String(v).replace(/^\s*[a-z]\s*=/i,'')); return Math.abs(x-f.n/f.d)<1e-9; }
/* several fractional roots, any order, comma/"or" separated */
function checkRoots(roots,v){
  const got=String(v).replace(/[−–—]/g,'-').split(/,|;|\bor\b|\band\b/i).map(s=>parseNum(s.replace(/^\s*[a-z]\s*=/i,''))).filter(x=>!isNaN(x));
  if(got.length!==roots.length) return false;
  const want=roots.map(fracVal).sort((a,b)=>a-b); got.sort((a,b)=>a-b);
  return want.every((w,i)=>Math.abs(w-got[i])<1e-6);
}
const rootsStr = rs => rs.map(fracStr).join(', ');
/* integer helpers */
const isqrt = n => { let r=Math.floor(Math.sqrt(n)); while(r*r>n) r--; while((r+1)*(r+1)<=n) r++; return r; };
const icbrt = n => { let r=Math.floor(Math.cbrt(n)); while(r*r*r>n) r--; while((r+1)**3<=n) r++; return r; };
function divisors(n){ n=Math.abs(n); const d=[]; for(let i=1;i<=n;i++) if(n%i===0) d.push(i); return d; }
const ROMAN=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII','XXXIX','XL'];

/* ============================================================
   The book's chapters (titles and first page, 1965 BHU edition)
   ============================================================ */
const CHAPTERS={
 1:['A spectacular illustration',1], 2:['Arithmetical computations — multiplication by Nikhilam',13], 3:['Multiplication by Ūrdhva-Tiryak',40],
 4:['Division by the Nikhilam method',55], 5:['Division by the Parāvartya method',64], 6:['Argumental division',79],
 7:['Factorisation of simple quadratics',86], 8:['Factorisation of harder quadratics',90], 9:['Factorisation of cubics etc.',93],
 10:['Highest common factor',98], 11:['Simple equations — first principles',103], 12:['Simple equations by Śūnyam etc.',107],
 13:['Merger type of easy simple equations',126], 14:['Complex mergers',134], 15:['Simultaneous simple equations',140],
 16:['Miscellaneous (simple) equations',145], 17:['Quadratic equations',157], 18:['Cubic equations',168],
 19:['Biquadratic equations',171], 20:['Multiple simultaneous equations',174], 21:['Simultaneous quadratic equations',178],
 22:['Factorisation & differential calculus',182], 23:['Partial fractions',186], 24:['Integration by partial fractions',191],
 25:['The Vedic numerical code',194], 26:['Recurring decimals',196], 27:['Straight division',240], 28:['Auxiliary fractions',255],
 29:['Divisibility & simple osculators',273], 30:['Divisibility & complex multiplex osculators',285], 31:['Sum & difference of squares',296],
 32:['Elementary squaring, cubing etc.',300], 33:['Straight squaring',305], 34:['Vargamūla (square root)',308],
 35:['Cube roots of exact cubes',316], 36:['Cube roots (general)',327], 37:['Pythagoras’ theorem etc.',349],
 38:['Apollonius’ theorem',352], 39:['Analytical conics',354], 40:['Miscellaneous matters',361]
};

/* lesson registry — lesson files call def({...}); app.js sorts by chapter */
const T=[];
const def=o=>{ o._i=T.length; T.push(o); };

/* ============================================================
   Tiny expression parser for checking typed algebra
   (implicit multiplication, ^ and ²³⁴, variables a–z)
   ============================================================ */
function parseExpr(src){
  let s=String(src).replace(/[−–—]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/²/g,'^2').replace(/³/g,'^3').replace(/⁴/g,'^4').replace(/\s+/g,'');
  const toks=[]; let i=0;
  while(i<s.length){ const c=s[i];
    if(/[0-9.]/.test(c)){ let j=i; while(j<s.length&&/[0-9.]/.test(s[j])) j++; toks.push({t:'n',v:parseFloat(s.slice(i,j))}); i=j; }
    else if(/[a-z]/i.test(c)){ toks.push({t:'v',v:c.toLowerCase()}); i++; }
    else if('+-*/^()'.includes(c)){ toks.push({t:c}); i++; }
    else throw 'Unexpected “'+c+'”';
  }
  let p=0; const peek=()=>toks[p], eat=t=>{ if(!toks[p]||toks[p].t!==t) throw 'Expected '+t; return toks[p++]; };
  const expr=()=>{ let f=term(); while(peek()&&(peek().t==='+'||peek().t==='-')){ const op=toks[p++].t, g=term(), a=f; f= op==='+'? (e=>a(e)+g(e)) : (e=>a(e)-g(e)); } return f; };
  const term=()=>{ let f=unary(); for(;;){ const k=peek(); if(!k) break;
      if(k.t==='*'||k.t==='/'){ p++; const g=unary(), a=f; f= k.t==='*'? (e=>a(e)*g(e)) : (e=>a(e)/g(e)); }
      else if(k.t==='n'||k.t==='v'||k.t==='('){ const g=power(), a=f; f=e=>a(e)*g(e); }
      else break; } return f; };
  const unary=()=>{ const k=peek(); if(k&&k.t==='-'){ p++; const g=unary(); return e=>-g(e); } if(k&&k.t==='+'){ p++; return unary(); } return power(); };
  const power=()=>{ const b=primary(); if(peek()&&peek().t==='^'){ p++; const ex=unary(); return e=>Math.pow(b(e),ex(e)); } return b; };
  const primary=()=>{ const k=peek(); if(!k) throw 'Unexpected end';
    if(k.t==='n'){ p++; return ()=>k.v; }
    if(k.t==='v'){ p++; return e=>{ if(!(k.v in e)) throw 'Unknown letter '+k.v; return e[k.v]; }; }
    if(k.t==='('){ p++; const f=expr(); eat(')'); return f; }
    throw 'Unexpected '+k.t; };
  const f=expr(); if(p!==toks.length) throw 'Could not read the whole expression';
  return f;
}
/* does the typed expression equal fn (a JS function of a vars object) everywhere? */
function sameExpr(str, fn, vars=['x'], scaleOK=false){
  let g; try{ g=parseExpr(str); }catch(e){ return false; }
  let ratio=null;
  for(let t=0;t<7;t++){
    const e={}; vars.forEach(v=>{ e[v]=Math.round((Math.random()*6-3)*1000)/1000+0.37*(t+1); });
    let a,b; try{ a=g(e); b=fn(e); }catch(err){ return false; }
    if(!isFinite(a)||!isFinite(b)) continue;
    if(scaleOK){ if(Math.abs(b)<1e-9) continue; const r=a/b; if(ratio===null) ratio=r; if(Math.abs(r-ratio)>1e-6*Math.max(1,Math.abs(ratio))||Math.abs(ratio)<1e-9) return false; }
    else if(Math.abs(a-b)>1e-6*Math.max(1,Math.abs(b))) return false;
  }
  return true;
}
const isProductForm = str => (String(str).match(/\(/g)||[]).length>=2;
