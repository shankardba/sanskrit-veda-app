'use strict';
/* Chapters VII–XVI: factorisation, HCF and the simple-equation chapters */

const nz = (a,b)=>{ let v; do{ v=ri(a,b); }while(v===0); return v; };
/* "x + 2y − 3z + 4" from coefficients and variable names ('' = constant) */
function linForm(cs,vars){ const parts=[]; cs.forEach((c,i)=>{ if(!c) return; const v=vars[i]; const a=Math.abs(c); const body=(a===1&&v)? v : a+v;
  parts.push(parts.length? (c<0?M+' ':'+ ')+body : (c<0?M:'')+body); }); return parts.join(' ')||'0'; }
const par = s => `(${s})`;
/* quadratic factor pair from coefficients of (px+q)(rx+s) */
const binF = (p,q,v='x') => `(${p===1?'':p===-1?M:p}${v} ${sp(q)})`;
const solveCheck=(f,fn)=>Math.abs(fn(fracVal(f)))<1e-7;

/* ---------- Ch. VII: quadratics by Ānurūpyeṇa + Ādyamādyena ---------- */
def({
  id:'factquad', chn:7, o:10, sub:[1,3],
  name:'Factorising quadratics — “the first by the first, the last by the last”',
  sutra:{kind:'SUB-SŪTRAS 1 & 3', dev:'आनुरूप्येण · आद्यमाद्येनान्त्यमन्त्येन', iast:'Ānurūpyeṇa · Ādyamādyenāntyamantyena', en:'“Proportionately” · “the first by the first and the last by the last”'},
  short:'2x² + 5x + 2: split 5 = 4 + 1 so that 2 : 4 = 1 : 2 → (x + 2); then 2x²÷x and 2÷2 → (2x + 1).',
  brief:`<p>For ax² + bx + c:</p>
    <ol><li><b>Ānurūpyeṇa</b>: split b into two parts b₁ + b₂ so that a : b₁ = b₂ : c. That common ratio, in lowest terms, is the first factor.</li><li><b>Ādyam ādyena</b>: divide the first term ax² by the first term of that factor.</li><li><b>Antyam antyena</b>: divide the last term c by the last term of that factor. These two give the second factor.</li></ol>
    <p class="note">Check with Guṇita-samuccaya: (sum of coefficients of one factor) × (of the other) = a + b + c.</p>`,
  why:`<p>If ax² + bx + c = (px + q)(rx + s) then a = pr, c = qs and b = ps + qr. Take b₁ = qr and b₂ = ps:</p><div class="eqn">a : b₁ = pr : qr = p : q
b₂ : c = ps : qs = p : q</div><p>so the ratio p : q is exactly the factor (px + q), and the other factor’s first and last terms are a/p and c/q.</p>`,
  hist:`<p>Tīrtha’s complaint in Ch. VII is that pupils taught the four-step “split the middle term and group” method never learn the mental shortcut. The same pair of sub-sūtras reappears in Ch. VIII (homogeneous quadratics), Ch. IX (cubics) and Ch. XXXIX (pairs of straight lines). Note that the split can be taken in either order — the factors come out the same.</p>`,
  ex:{p:1,q:2,r:2,s:1}, ph:'2x^2+5x+2',
  rand(){ let p,q,r,s; do{ p=pick([1,1,2,3]); r=pick([1,2,3,4,5]); q=nz(-7,7); s=nz(-7,7); }while(gcd(p,q)!==1||gcd(r,s)!==1||(p===r&&q===s)); return {p,q,r,s}; },
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-').replace(/x²/g,'x^2'); const m=t.match(/^(-?\d*)x\^2([+-]\d*)x([+-]\d+)$/); if(!m) throw 'Type it like 2x^2+5x+2.';
    const co=x=>x===''||x==='+'?1:x==='-'?-1:+x; const a=co(m[1]), b=co(m[2]), c=+m[3];
    for(const p of divisors(a)) for(const sgn of [1,-1]) for(const q0 of divisors(c)){ const q=sgn*q0, r=a/p, s=c/q; if(Number.isInteger(s)&&p*s+q*r===b && gcd(p,Math.abs(q))===1) return {p,q,r,s}; }
    throw 'That quadratic has no whole-number factors.'; },
  coefs:p=>[p.p*p.r, p.p*p.s+p.q*p.r, p.q*p.s],
  q(p){ return `${fmtPoly(this.coefs(p))}<small>factorise, e.g. (x+2)(2x+1)</small>`; },
  ans:p=>`${binF(p.p,p.q)}${binF(p.r,p.s)}`,
  check(p,v){ const [a,b,c]=this.coefs(p); return isProductForm(v) && sameExpr(v,e=>a*e.x*e.x+b*e.x+c); },
  gen(P){
    const {p,q,r,s}=P, [a,b,c]=this.coefs(P), b1=q*r, b2=p*s, sc=new Sc();
    lay(sc,0,[['A',termStr(a,2,'x',true)],['B',termStr(b,1)],['C',termStr(c,0)]]);
    sc.snap(`Factorise <b>${fmtPoly([a,b,c])}</b>.`);
    lay(sc,1.4,[['A1',termStr(a,2,'x',true)],['B1',termStr(b1,1),'key'],['B2',termStr(b2,1),'key'],['C1',termStr(c,0)]]);
    sc.hl('B1','B2');
    sc.snap(`<b>Ānurūpyeṇa</b>: split the middle coefficient ${b} into ${b1} and ${b2}, so that ${a} : ${b1} = ${b2} : ${c}.`);
    sc.put('rat',0,2.7,`${a} : ${b1} = ${b2} : ${c} = ${p} : ${q}`,'work').hl('rat').link('A1','B1','pair',-0.6).link('B2','C1','pair',-0.6);
    sc.snap(`Both ratios reduce to <b>${p} : ${q}</b> — so one factor is <b>${binF(p,q)}</b>.`);
    sc.put('f1',0,3.9,binF(p,q),'res');
    sc.snap(`First factor: ${binF(p,q)}.`);
    sc.put('w2',0,5,`${termStr(a,2,'x',true)} ÷ ${termStr(p,1,'x',true)} = ${termStr(r,1,'x',true)}   ·   ${c} ÷ ${q} = ${s}`,'work').hl('w2');
    sc.snap(`<b>Ādyam ādyena</b>: ${termStr(a,2,'x',true)} ÷ ${termStr(p,1,'x',true)} = ${termStr(r,1,'x',true)}. <b>Antyam antyena</b>: ${c} ÷ ${q} = ${s}. Second factor: <b>${binF(r,s)}</b>.`);
    const sc1=p+q, sc2=r+s, scE=a+b+c, ok=polyMul([p,q],[r,s]).every((x,i)=>x===[a,b,c][i]);
    sc.put('ans',0,6.2,`${fmtPoly([a,b,c])} = ${binF(p,q)}${binF(r,s)}`,'ans');
    sc.snap(`<span class="ok">${fmtPoly([a,b,c])} = ${binF(p,q)}${binF(r,s)}</span>. Guṇita-samuccaya check: (${sc1}) × (${sc2}) = ${sc1*sc2} = ${a} ${sp(b)} ${sp(c)} ✓`+(ok&&sc1*sc2===scE?'':' <span class="no">mismatch</span>'));
    return sc.fr;
  }
});

/* ---------- Ch. VIII: homogeneous quadratics by Lopana-sthāpana ---------- */
function homTerms(F,G,vars){
  /* product of two linear forms; returns ordered [coef, label] list in the book's order x², y², z², xy, yz, zx (constant as '') */
  const n=vars.length, res=[];
  for(let i=0;i<n;i++) res.push([F[i]*G[i], vars[i]? vars[i]+'²' : '' , i, i]);
  for(let i=0;i<n;i++){ const j=(i+1)%n; if(i===j||(n===2&&i===1)) continue; res.push([F[i]*G[j]+F[j]*G[i], (vars[i]+vars[j])||'', i, j]); }
  return res;
}
function homStr(F,G,vars){ const ts=homTerms(F,G,vars); const parts=[]; ts.forEach(([c,lab])=>{ if(!c) return; const a=Math.abs(c); const body=(a===1&&lab)? lab : a+lab; parts.push(parts.length? (c<0?M+' ':'+ ')+body : (c<0?M:'')+body); }); return parts.join(' '); }
def({
  id:'facthom', chn:8, o:10, sub:[11,3],
  name:'Factorising “harder” quadratics in x, y, z — by elimination and retention',
  sutra:{kind:'SUB-SŪTRA 11', dev:'लोपनस्थापनाभ्याम्', iast:'Lopana-sthāpanābhyām', en:'“By (alternate) elimination and retention”'},
  short:'2x² + 6y² + 3z² + 7xy + 11yz + 7zx: put z = 0 → (x + 2y)(2x + 3y); put y = 0 → (x + 3z)(2x + z); fill the gaps → (x + 2y + 3z)(2x + 3y + z).',
  brief:`<p>For a quadratic in several letters:</p>
    <ol><li><b>Eliminate</b> z (put z = 0) and factorise what is left — an ordinary two-letter quadratic.</li><li>Eliminate y instead and factorise again.</li><li><b>Retain</b> both results and fill in the gaps: each factor gets its y-term from the first and its z-term from the second.</li></ol>
    <p class="note">A constant term works the same way — treat it as a third letter equal to 1.</p>`,
  why:`<p>If E = (ax + by + cz)(dx + ey + fz), then setting z = 0 leaves (ax + by)(dx + ey), and setting y = 0 leaves (ax + cz)(dx + fz). Each factor keeps the same x-term in both, which is how the pieces are matched up — provided the two x-coefficients differ.</p>`,
  hist:`<p>Ch. VIII calls these “generally fought shy of by students (and teachers too) as being too difficult”. The book’s further examples run to four letters (x, y, z, w) by eliminating two at a time, and Ch. XXXIX reuses the trick to split a conic into two straight lines.</p>`,
  ex:{F:[1,2,3],G:[2,3,1],k:0}, ph:'Random only — press Random', noParse:true,
  rand(){ let F,G; const k=Math.random()<.35?1:0; do{ F=[pick([1,2,3]),nz(-5,5),nz(-5,5)]; G=[pick([1,2,3,4]),nz(-5,5),nz(-5,5)]; }while(F[0]===G[0] || gcd(gcd(F[0],F[1]),F[2])!==1 || gcd(gcd(G[0],G[1]),G[2])!==1); return {F,G,k}; },
  parse(){ throw 'Use Random.'; },
  vars:p=>p.k? ['x','y',''] : ['x','y','z'],
  q(p){ return `${homStr(p.F,p.G,this.vars(p))}<small>factorise, e.g. (x+2y+3z)(2x+3y+z)</small>`; },
  ans(p){ const v=this.vars(p); return par(linForm(p.F,v))+par(linForm(p.G,v)); },
  check(p,v){ const V=this.vars(p); const f=e=>{ const val=(C)=>C[0]*e.x+C[1]*e.y+C[2]*(V[2]?e.z:1); return val(p.F)*val(p.G); }; return isProductForm(v)&&sameExpr(v,f,V[2]?['x','y','z']:['x','y']); },
  gen(p){
    const {F,G}=p, V=this.vars(p), s=new Sc(), third=V[2]||'1', zName=V[2]||'the constant';
    s.put('E',0,0,homStr(F,G,V)); s.snap(`Factorise <b>${homStr(F,G,V)}</b>.`);
    const xy=homStr([F[0],F[1],0],[G[0],G[1],0],V);
    s.put('z0',0,1.4,`${V[2]?'z = 0':'drop the constant terms'}:  ${xy}`,'work').hl('z0');
    s.snap(`<b>Lopana</b> — eliminate ${zName}: keep only the terms in x and y: ${xy}.`);
    const f1=par(linForm([F[0],F[1]],['x','y'])), g1=par(linForm([G[0],G[1]],['x','y']));
    s.put('z0f',0,2.4,`= ${f1}${g1}`,'res').hl('z0f');
    s.snap(`That is an ordinary quadratic: <b>${f1}${g1}</b>.`);
    const xz=homStr([F[0],0,F[2]],[G[0],0,G[2]],V);
    s.put('y0',0,3.6,`y = 0:  ${xz}`,'work').hl('y0');
    s.snap(`Now eliminate y instead and <b>retain</b> ${zName}: ${xz}.`);
    const f2=par(linForm([F[0],0,F[2]],V)), g2=par(linForm([G[0],0,G[2]],V));
    s.put('y0f',0,4.6,`= ${f2}${g2}`,'res').hl('y0f');
    s.snap(`Factorised: <b>${f2}${g2}</b>.`);
    const A=par(linForm(F,V)), B=par(linForm(G,V));
    s.put('ans',0,5.9,`E = ${A}${B}`,'ans');
    s.snap(`Fill in the gaps: match factors by their x-terms (${termStr(F[0],1,'x',true)} with ${termStr(F[0],1,'x',true)}, ${termStr(G[0],1,'x',true)} with ${termStr(G[0],1,'x',true)}). <span class="ok">E = ${A}${B}</span>.`);
    return s.fr;
  }
});

/* ---------- Ch. IX: cubics ---------- */
def({
  id:'factcubic', chn:9, o:10, sub:[3,13], su:[15],
  name:'Factorising cubics by coefficient sums and argumentation',
  sutra:{kind:'SŪTRA 15 · SUB-SŪTRA 3', dev:'गुणितसमुच्चयः · आद्यमाद्येन', iast:'Guṇitasamuccayaḥ · Ādyamādyena', en:'Sums of coefficients, then “first by first, last by last”'},
  short:'x³ + 6x² + 11x + 6: odd-power sum 1 + 11 = even-power sum 6 + 6, so (x + 1) is a factor; quotient x² + 5x + 6 = (x + 2)(x + 3).',
  brief:`<p>Find one factor first, then the rest by “first by first, last by last”:</p>
    <ol><li><b>S<sub>c</sub></b> = sum of all coefficients. If it is 0, (x − 1) is a factor.</li><li>If (sum of coefficients of odd powers) = (sum for even powers), (x + 1) is a factor.</li><li>Otherwise try factors (x + a) where a divides the constant term — and 1 + a must divide S<sub>c</sub>.</li><li>Quotient: first term x², last term (constant ÷ a); the middle from the x²-coefficient.</li><li>Factorise that quadratic.</li></ol>`,
  why:`<p>S<sub>c</sub> is the cubic’s value at x = 1, and the odd/even test is its value at x = −1 — the remainder theorem for (x − 1) and (x + 1). For (x + a)(x + b)(x + c):</p><div class="eqn">x³ + (a+b+c)x² + (ab+bc+ca)x + abc</div><p>and Guṇita-samuccaya says S<sub>c</sub> = (1 + a)(1 + b)(1 + c), which is why each 1 + a must divide it.</p>`,
  hist:`<p>Ch. IX works through examples such as x³ − 2x² − 23x + 60 by listing the factors of the constant and of S<sub>c</sub> and crossing out impossibilities (“x + 1 and x − 1 are out of court”). For x³ − 7x + 6 it adds a neat trick: write it as (x³ − 1) − 7x + 7 = (x − 1)(x² + x − 6).</p>`,
  ex:{a:1,b:2,c:3}, ph:'x^3+6x^2+11x+6',
  rand(){ let a,b,c; do{ a=nz(-6,6); b=nz(-6,6); c=nz(-6,6); }while(Math.abs(a*b*c)>120); return {a,b,c}; },
  coefs:p=>polyMul(polyMul([1,p.a],[1,p.b]),[1,p.c]),
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-').replace(/x³/g,'x^3').replace(/x²/g,'x^2'); const m=t.match(/^x\^3([+-]\d*)x\^2([+-]\d*)x([+-]\d+)$/); if(!m) throw 'Type a monic cubic like x^3+6x^2+11x+6.';
    const co=x=>x==='+'?1:x==='-'?-1:+x; const C=[1,co(m[1]),co(m[2]),+m[3]]; const roots=[]; let P=C.slice();
    for(const d of divisors(C[3]).flatMap(d=>[d,-d])){ while(P.length>1 && polyEval(P,-d)===0){ roots.push(d); P=polyDiv(P,[1,d]).q; } }
    if(roots.length!==3) throw 'That cubic does not split into whole-number factors.'; return {a:roots[0],b:roots[1],c:roots[2]}; },
  q(p){ return `${fmtPoly(this.coefs(p))}<small>factorise, e.g. (x+1)(x+2)(x+3)</small>`; },
  ans:p=>`${bin(1,p.a)}${bin(1,p.b)}${bin(1,p.c)}`,
  check(p,v){ const C=this.coefs(p); return isProductForm(v)&&sameExpr(v,e=>polyEval(C,e.x)); },
  gen(p){
    const C=this.coefs(p), s=new Sc(), [_,B,Cc,D]=C;
    s.put('E',0,0,fmtPoly(C)); s.snap(`Factorise <b>${fmtPoly(C)}</b>.`);
    const Sc_=C.reduce((x,y)=>x+y,0), So=C[0]+C[2], Se=C[1]+C[3];
    s.put('sc',0,1.3,`Sc = ${C.join(' + ').replace(/\+ -/g,'− ')} = ${Sc_}    So = ${So}, Se = ${Se}`,'work').hl('sc');
    s.snap(`Sum of all coefficients S<sub>c</sub> = <b>${Sc_}</b>; odd powers (x³, x) give ${So}, even powers (x², 1) give ${Se}.`);
    /* pick the first factor the way the book would */
    let a, how;
    if(Sc_===0){ a=-1; how=`S<sub>c</sub> = 0, so (x − 1) is a factor.`; }
    else if(So===Se){ a=1; how=`The odd and even sums are equal (${So} = ${Se}), so (x + 1) is a factor.`; }
    else { const cands=divisors(D).flatMap(d=>[d,-d]).filter(d=>1+d!==0 && Sc_%(1+d)===0);
      a=cands.find(d=>polyEval(C,-d)===0); if(a===undefined) a=[p.a,p.b,p.c].find(r=>polyEval(C,-r)===0);
      how=`Neither quick test works. Try (x + a) with a dividing ${D} and (1 + a) dividing ${Sc_}: candidates ${cands.slice(0,8).map(d=>bin(1,d)).join(', ')}${cands.length>8?'…':''}. Testing: x = ${-a} makes the cubic 0, so <b>${bin(1,a)}</b> is a factor.`; }
    s.put('f1',0,2.5,bin(1,a),'key').hl('f1');
    s.snap(how);
    const qd=polyDiv(C,[1,a]).q, m=qd[1], n=qd[2];
    s.put('qw',0,3.7,`quotient: x² … ${D} ÷ ${a} = ${n};  middle: ${B} − (${a}) = ${m}`,'work').hl('qw');
    s.snap(`<b>Ādyam ādyena</b>: x³ ÷ x gives x². <b>Antyam antyena</b>: ${D} ÷ ${a} gives ${n}. The x² coefficient ${B} must equal ${a} + (middle), so the middle is <b>${m}</b>: quotient ${fmtPoly(qd)}.`);
    const rest=[p.a,p.b,p.c]; rest.splice(rest.indexOf(a),1);
    s.put('q2',0,4.9,`${fmtPoly(qd)} = ${bin(1,rest[0])}${bin(1,rest[1])}`,'res').hl('q2');
    s.snap(`Factorise the quadratic: two numbers adding to ${m} and multiplying to ${n}: ${rest[0]} and ${rest[1]}.`);
    const prod=(1+p.a)*(1+p.b)*(1+p.c);
    s.put('ans',0,6.2,`= ${bin(1,a)}${bin(1,rest[0])}${bin(1,rest[1])}`,'ans');
    s.snap(`<span class="ok">${fmtPoly(C)} = ${bin(1,a)}${bin(1,rest[0])}${bin(1,rest[1])}</span>. Guṇita-samuccaya: (${1+a})(${1+rest[0]})(${1+rest[1]}) = ${prod} = S<sub>c</sub> ✓`+(prod===Sc_?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. X: HCF by Lopana-sthāpana ---------- */
def({
  id:'hcf', chn:10, o:10, sub:[11], su:[7],
  name:'Highest common factor — destroy the highest and the lowest powers',
  sutra:{kind:'SUB-SŪTRA 11 · SŪTRA 7', dev:'लोपनस्थापनाभ्याम्', iast:'Lopana-sthāpanābhyām', en:'“By elimination and retention” (with Saṅkalana-vyavakalana: addition and subtraction)'},
  short:'HCF of x² + 7x + 6 and x² − 5x − 6: subtract to kill x² → 12x + 12 → (x + 1); add to kill the constants → 2x² + 2x → (x + 1).',
  brief:`<p>Combine the two expressions so that:</p>
    <ol><li>the <b>highest</b> powers cancel (subtract suitable multiples), then strip any number factor;</li><li>separately, the <b>lowest</b> (constant) terms cancel, then strip the power of x and any number factor.</li></ol>
    <p>Whatever survives both ways is the HCF.</p>`,
  why:`<p>If P = H·A and Q = H·B then any combination M·P ± N·Q = H·(M·A ± N·B) still contains H. Choosing M and N to wipe out the top power (or the constant) makes the bracket a mere number (or a number times a power of x), which we divide away — leaving H.</p>`,
  hist:`<p>Ch. X contrasts three methods: factorise both (often hard), the repeated-division “G.C.M.” method (“mechanical … long and cumbrous”), and this one, which works with one or two combinations. The proof Tīrtha gives is exactly the one above: the HCF of P and Q is also the HCF of P ± Q, 2P ± Q, MP ± NQ.</p>`,
  ex:{H:[1,1],A:[1,6],B:[1,-6]}, ph:'Random only — press Random', noParse:true,
  rand(){ const H= Math.random()<.5 ? [1,nz(-5,5)] : [1,ri(-4,4),nz(-6,6)]; let A,B; do{ A=[pick([1,1,2,3]),nz(-6,6)]; B=[pick([1,1,2]),nz(-6,6)]; }while(A[0]*B[1]===A[1]*B[0] || polyEval(H,-A[1]/A[0])===0 || polyEval(H,-B[1]/B[0])===0); return {H,A,B}; },
  parse(){ throw 'Use Random.'; },
  q:p=>`HCF of ${fmtPoly(polyMul(p.H,p.A))} and ${fmtPoly(polyMul(p.H,p.B))}?`,
  ans:p=>fmtPoly(p.H),
  check(p,v){ return sameExpr(v,e=>polyEval(p.H,e.x),['x'],true); },
  gen({H,A,B}){
    const P=polyMul(H,A), Q=polyMul(H,B), s=new Sc();
    s.put('P',0,0,`P = ${fmtPoly(P)}`).put('Q',0,1,`Q = ${fmtPoly(Q)}`);
    s.snap(`Find the HCF of P and Q.`);
    /* kill highest: A[0]·Q − B[0]·P = H·(A0·B − B0·A) = H·const */
    const r=B[0], pp=A[0], top=polyMul(H,[0,pp*B[1]-r*A[1]]).slice(1).map(c=>c);
    const comb1=P.map((c,i)=>pp*Q[i]-r*P[i]); const k1=pp*B[1]-r*A[1];
    s.put('c1',0,2.3,`${pp===1?'':pp}Q − ${r===1?'':r}P = ${fmtPoly(comb1)}`,'work').hl('c1');
    s.snap(`<b>Lopana</b> — destroy the highest power: ${pp===1?'':pp}Q − ${r===1?'':r}P = ${fmtPoly(comb1)}.`);
    const h1=comb1.slice(comb1.findIndex(c=>c!==0)).map(c=>c/k1);
    s.put('h1',0,3.3,`÷ ${k1}  →  ${fmtPoly(h1)}`,'res').hl('h1');
    s.snap(`Take out the number ${k1}: <b>${fmtPoly(h1)}</b>.`);
    /* kill lowest: B_last·P − A_last·Q = H·x·(...) */
    const bl=B[1], al=A[1]; const comb2=P.map((c,i)=>bl*P[i]-al*Q[i]); const k2=bl*A[0]-al*B[0];
    s.put('c2',0,4.6,`${bl}P ${sp(-al)}Q = ${fmtPoly(comb2)}`,'work').hl('c2');
    s.snap(`Now destroy the <b>lowest</b> (constant) terms instead: ${bl}·P ${sp(-al)}·Q = ${fmtPoly(comb2)}.`);
    const trimmed=comb2.slice(0,comb2.length-1).map(c=>c/k2);
    s.put('h2',0,5.6,`÷ ${k2}x  →  ${fmtPoly(trimmed)}`,'res').hl('h2');
    s.snap(`Take out ${k2}x: <b>${fmtPoly(trimmed)}</b> — the same expression again.`);
    const ok=h1.length===H.length && h1.every((c,i)=>c===H[i]) && trimmed.every((c,i)=>c===H[i]);
    s.put('ans',0,6.9,`HCF = ${fmtPoly(H)}`,'ans');
    s.snap(`Both ways leave the same thing, so <span class="ok">HCF = ${fmtPoly(H)}</span> (indeed P = (${fmtPoly(H)})(${fmtPoly(A)}) and Q = (${fmtPoly(H)})(${fmtPoly(B)})).`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XI: the third and fourth general types ---------- */
def({
  id:'eqtypes', chn:11, o:20, su:[4],
  name:'Simple equations — the third and fourth general types',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”'},
  short:'(ax + b)/(cx + d) = p/q ⇒ x = (dp − bq)/(aq − cp);  m/(x+a) + n/(x+b) + p/(x+c) = 0 with m + n + p = 0 ⇒ a one-line formula.',
  brief:`<p>Tīrtha wants these handled as ready-made formulas, “assimilated and assumed”:</p>
    <ul><li><b>Third type</b>: (ax + b)/(cx + d) = p/q gives x = (dp − bq)/(aq − cp).</li><li><b>Fourth type</b>: m/(x+a) + n/(x+b) + p/(x+c) = 0. If m + n + p = 0 the x² terms vanish and<br>x = −(mbc + nca + pab) / (m(b+c) + n(c+a) + p(a+b)).</li></ul>
    <p class="note">Rule of thumb: x-terms to the left, plain numbers to the right, and every crossing changes + ↔ − and × ↔ ÷.</p>`,
  why:`<p><b>Third type</b>: cross-multiply, q(ax + b) = p(cx + d), so x(aq − cp) = dp − bq.</p><p><b>Fourth type</b>: over the common denominator the numerator is</p><div class="eqn">m(x+b)(x+c) + n(x+c)(x+a) + p(x+a)(x+b)
= (m+n+p)x² + [m(b+c)+n(c+a)+p(a+b)]x
  + (mbc + nca + pab)</div><p>With m + n + p = 0 only a first-degree equation is left.</p>`,
  hist:`<p>Ch. XI lists four “general types” of simple equation. Tīrtha’s point is pedagogical: pupils re-derive these every time, “just as if on every occasion when a³ + b³ + c³ − 3abc comes up, one should go through the long process of multiplying” instead of using the known factors.</p>`,
  ex:{v:'ratio',a:3,b:4,c:2,d:1,p:5,q:3}, ph:'Random only — press Random', noParse:true,
  rand(){
    if(Math.random()<.5){ let a,b,c,d,p,q; do{ a=nz(-6,7); b=nz(-9,9); c=nz(-6,7); d=nz(-9,9); p=nz(-5,6); q=nz(1,6); }while(a*q-c*p===0||a*d===b*c); return {v:'ratio',a,b,c,d,p,q}; }
    let m,n,pp,a,b,c,den; do{ m=nz(-6,6); n=nz(-6,6); pp=-(m+n); a=nz(-7,7); b=nz(-7,7); c=nz(-7,7); den=m*(b+c)+n*(c+a)+pp*(a+b); }while(!pp||den===0||new Set([a,b,c]).size<3||[a,b,c].some(u=>-(m*b*c+n*c*a+pp*a*b)===-u*den));
    return {v:'three',m,n,p:pp,a,b,c}; },
  parse(){ throw 'Use Random.'; },
  sol(P){ if(P.v==='ratio') return frac(P.d*P.p-P.b*P.q, P.a*P.q-P.c*P.p); const {m,n,p,a,b,c}=P; return frac(-(m*b*c+n*c*a+p*a*b), m*(b+c)+n*(c+a)+p*(a+b)); },
  eqStr(P){ if(P.v==='ratio') return `(${linForm([P.a,P.b],['x',''])})/(${linForm([P.c,P.d],['x',''])}) = ${P.p}/${P.q}`;
    const {m,n,p,a,b,c}=P; const t=(k,s,first)=>`${first?(k<0?M:''):(k<0?' '+M+' ':' + ')}${Math.abs(k)}/(x ${sp(s)})`; return t(m,a,true)+t(n,b)+t(p,c)+' = 0'; },
  q(P){ return `${this.eqStr(P)}<small>x = ?</small>`; },
  ans(P){ return fracStr(this.sol(P)); },
  check(P,v){ return checkFrac(this.sol(P),v); },
  gen(P){
    const s=new Sc(), f=this.sol(P);
    s.put('E',0,0,this.eqStr(P));
    if(P.v==='ratio'){
      const {a,b,c,d,p,q}=P;
      s.snap(`The third type: <b>(ax + b)/(cx + d) = p/q</b> with a = ${a}, b = ${b}, c = ${c}, d = ${d}, p = ${p}, q = ${q}.`);
      s.put('c',0,1.3,`${q}(${linForm([a,b],['x',''])}) = ${p}(${linForm([c,d],['x',''])})`,'work').hl('c');
      s.snap(`Cross-multiply: the denominators transpose and become multipliers.`);
      s.put('t',0,2.5,`x(${a}·${q} − ${c}·${p}) = ${d}·${p} − ${b}·${q}`,'work').hl('t');
      s.snap(`x-terms left, numbers right — every crossing changes sign: x(aq − cp) = dp − bq.`);
      s.put('r',0,3.7,`x = ${d*p-b*q}/${a*q-c*p} = ${fracStr(f)}`,'ans');
    } else {
      const {m,n,p,a,b,c}=P;
      s.snap(`The fourth type, and the numerators ${m} + ${n} + ${p} = 0 — so the x² terms will cancel.`);
      s.put('c',0,1.3,`${m}(x${sp(b)})(x${sp(c)}) ${sp(n)}(x${sp(c)})(x${sp(a)}) ${sp(p)}(x${sp(a)})(x${sp(b)}) = 0`,'work').hl('c');
      s.snap(`Each numerator multiplies the two factors missing from its denominator.`);
      const X=m*(b+c)+n*(c+a)+p*(a+b), K=m*b*c+n*c*a+p*a*b;
      s.put('t',0,2.5,`x[${m}(${b+c}) ${sp(n)}(${c+a}) ${sp(p)}(${a+b})] = −[${m}·${b*c} ${sp(n)}·${c*a} ${sp(p)}·${a*b}]`,'work').hl('t');
      s.snap(`Coefficient of x: m(b+c) + n(c+a) + p(a+b) = <b>${X}</b>; constant: mbc + nca + pab = <b>${K}</b>.`);
      s.put('r',0,3.7,`x = ${-K}/${X} = ${fracStr(f)}`,'ans');
    }
    const x=fracVal(f); let ok;
    if(P.v==='ratio') ok=Math.abs((P.a*x+P.b)/(P.c*x+P.d)-P.p/P.q)<1e-9; else ok=Math.abs(P.m/(x+P.a)+P.n/(x+P.b)+P.p/(x+P.c))<1e-9;
    s.snap(`<span class="ok">x = ${fracStr(f)}</span>.`+(ok?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XII: more meanings of Śūnyam ---------- */
def({
  id:'sunyam2', chn:12, o:20, su:[5],
  name:'Śūnyam — the other meanings of “samuccaya”',
  sutra:{kind:'SŪTRA 5 OF 16', dev:'शून्यं साम्यसमुच्चये', iast:'Śūnyaṁ Sāmyasamuccaye', en:'“When the samuccaya is the same, that samuccaya is zero”'},
  short:'Common factor, equal products, sums of denominators, the quadratic’s second root, and “cubics” that are really first-degree.',
  brief:`<p><i>Samuccaya</i> can mean several things; in each case, spot it and set it to zero:</p>
    <ol><li>a <b>common factor</b> on both sides — 9(x + 1) = 7(x + 1) ⇒ x + 1 = 0;</li><li>the <b>product of independent terms</b> — (x+7)(x+9) = (x+3)(x+21) has 63 = 63 ⇒ x = 0;</li><li>the <b>sum of denominators</b> with equal numerators — 1/(2x−1) + 1/(3x−1) = 0 ⇒ 5x − 2 = 0;</li><li>for a quadratic N₁/D₁ = N₂/D₂ with N₁ + N₂ = D₁ + D₂: that total is 0, <b>and</b> N₁ − D₁ = 0 gives the second root;</li><li>“cubics” like (x−3)³ + (x−9)³ = 2(x−6)³: the sum of the bases is 2(x − 6) ⇒ x − 6 = 0.</li></ol>`,
  why:`<p><b>Equal products</b>: (x+a)(x+b) = (x+c)(x+d) gives x(a+b−c−d) = cd − ab, so cd = ab forces x = 0.</p><p><b>Quadratic</b>: with S = N₁+N₂ = D₁+D₂, N₁D₂ − N₂D₁ = N₁(S−D₁) − (S−N₁)D₁ = S(N₁−D₁), so the roots are S = 0 and N₁ = D₁.</p><p><b>Cubic</b>: (x−2a)³ + (x−2b)³ − 2(x−a−b)³ expands to 6(a−b)²·(x − a − b) — the x³ and x² terms cancel.</p>`,
  hist:`<p>Ch. XII explains the word sense by sense — “Samuccaya is a technical term which has several meanings (under different contexts)” — and then shows “disguises (thin, thick or ultra-thick)” of the same patterns. The cubic family it calls equations that “look like cubic equations but … turn out to be simple equations of the first degree”, e.g. (x−149)³ + (x−51)³ = 2(x−100)³ ⇒ x = 100.</p>`,
  ex:{v:'prod',a:7,b:9,c:3,d:21}, ph:'Random only — press Random', noParse:true, verdict:false,
  rand(){
    const v=pick(['common','prod','den1','quad','cubic','cube2']);
    if(v==='common'){ let p,q,k; do{ p=nz(2,9); q=nz(2,9); k=nz(-9,9); }while(p===q); return {v,p,q,k}; }
    if(v==='prod'){ for(;;){ const a=ri(1,12), b=ri(1,12); const ab=a*b; const ds=divisors(ab).filter(c=>c!==a&&c!==b); if(!ds.length) continue; const c=pick(ds), d=ab/c; if(c+d!==a+b) return {v,a,b,c,d}; } }
    if(v==='den1'){ let p,q,r,t; do{ p=ri(1,6); q=nz(-7,7); r=ri(1,6); t=nz(-7,7); }while(p+r===0||(p*t===r*q)); return {v,p,q,r,t}; }
    if(v==='quad'){ for(;;){ const N1=[nz(-4,5),nz(-6,6)], D1=[nz(-4,5),nz(-6,6)], S=[nz(1,6),nz(-6,6)]; const N2=[S[0]-N1[0],S[1]-N1[1]], D2=[S[0]-D1[0],S[1]-D1[1]];
        if(N1[0]===D1[0]) continue; const r1=frac(-S[1],S[0]), r2=frac(D1[1]-N1[1],N1[0]-D1[0]); if(r1.n*r2.d===r2.n*r1.d) continue;
        const bad=f=>{ const x=fracVal(f); return Math.abs(D1[0]*x+D1[1])<1e-9||Math.abs(D2[0]*x+D2[1])<1e-9; }; if(bad(r1)||bad(r2)) continue;
        if(!N2[0]&&!N2[1]||!D2[0]&&!D2[1]) continue; return {v,N1,D1,N2,D2}; } }
    if(v==='cubic'){ let a,b; do{ a=nz(-12,12); b=nz(-12,12); }while(a===b||(a+b)%2); return {v,a,b}; }
    let u,d; do{ u=nz(-6,6); d=nz(1,4); }while((2*u+3*d)===0); return {v:'cube2',u,d};
  },
  parse(){ throw 'Use Random.'; },
  roots(P){ switch(P.v){
    case 'common': return [frac(-P.k,1)];
    case 'prod': return [frac(0,1)];
    case 'den1': return [frac(-(P.q+P.t),P.p+P.r)];
    case 'quad': { const S=[P.N1[0]+P.N2[0],P.N1[1]+P.N2[1]]; return [frac(-S[1],S[0]), frac(P.D1[1]-P.N1[1],P.N1[0]-P.D1[0])]; }
    case 'cubic': return [frac(P.a+P.b,2)];
    case 'cube2': return [frac(-(2*P.u+3*P.d),2)];
  } },
  eqStr(P){ const L=(c)=>linForm(c,['x','']); switch(P.v){
    case 'common': return `${P.p}(x ${sp(P.k)}) = ${P.q}(x ${sp(P.k)})`;
    case 'prod': return `(x + ${P.a})(x + ${P.b}) = (x + ${P.c})(x + ${P.d})`;
    case 'den1': return `1/(${L([P.p,P.q])}) + 1/(${L([P.r,P.t])}) = 0`;
    case 'quad': return `(${L(P.N1)})/(${L(P.D1)}) = (${L(P.N2)})/(${L(P.D2)})`;
    case 'cubic': return `(x ${sp(-P.a)})³ + (x ${sp(-P.b)})³ = 2(x ${sp(-(P.a+P.b)/2)})³`;
    case 'cube2': { const t=k=>`x ${sp(P.u+k*P.d)}`; return `(${t(1)})³/(${t(2)})³ = (${t(0)})/(${t(3)})`; }
  } },
  q(P){ return `${this.eqStr(P)}<small>${P.v==='quad'?'both roots, e.g. -5/4, -1':'x = ?'}</small>`; },
  ans(P){ return rootsStr(this.roots(P)); },
  check(P,v){ return checkRoots(this.roots(P),v); },
  gen(P){
    const s=new Sc(), R=this.roots(P), L=(c)=>linForm(c,['x','']);
    s.put('E',0,0,this.eqStr(P));
    let ok=true;
    switch(P.v){
      case 'common':
        s.snap(`<b>First meaning</b>: a factor common to every term. (x ${sp(P.k)}) multiplies both sides.`);
        s.put('z',0,1.4,`x ${sp(P.k)} = 0`,'key'); s.snap(`The samuccaya (x ${sp(P.k)}) is the same on both sides with different multipliers (${P.p} ≠ ${P.q}), so it is zero.`);
        break;
      case 'prod':
        s.snap(`<b>Second meaning</b>: the product of the independent terms.`);
        s.put('pp',0,1.4,`${P.a} × ${P.b} = ${P.a*P.b}   and   ${P.c} × ${P.d} = ${P.c*P.d}`,'work').hl('pp');
        s.snap(`The products are the same on both sides — so x itself must be zero. (Expanding: x(${P.a+P.b} − ${P.c+P.d}) = ${P.c*P.d} − ${P.a*P.b} = 0.)`);
        break;
      case 'den1':
        s.snap(`<b>Third meaning</b>: two fractions with the same numerator adding to zero — their samuccaya is the sum of the denominators.`);
        s.put('z',0,1.4,`(${L([P.p,P.q])}) + (${L([P.r,P.t])}) = ${L([P.p+P.r,P.q+P.t])} = 0`,'key');
        s.snap(`Add the denominators and set the total to zero.`);
        break;
      case 'quad': {
        const S=[P.N1[0]+P.N2[0],P.N1[1]+P.N2[1]];
        s.snap(`Cross-multiplying would give different x² coefficients (${P.N1[0]*P.D2[0]} and ${P.N2[0]*P.D1[0]}), so this is a <b>quadratic</b>. Look at the totals.`);
        s.put('s1',0,1.4,`N₁ + N₂ = ${L(S)}    D₁ + D₂ = ${L(S)}`,'work').hl('s1');
        s.snap(`N₁ + N₂ and D₁ + D₂ are both <b>${L(S)}</b> — the same samuccaya, so it is zero: x = ${fracStr(R[0])}.`);
        s.put('s2',0,2.6,`N₁ − D₁ = ${L([P.N1[0]-P.D1[0],P.N1[1]-P.D1[1]])}    N₂ − D₂ = ${L([P.N2[0]-P.D2[0],P.N2[1]-P.D2[1]])}`,'work').hl('s2');
        s.snap(`<b>Fifth meaning</b> (for quadratics): the differences N₁ − D₁ and N₂ − D₂ are the same apart from sign — set that to zero for the second root: x = ${fracStr(R[1])}.`);
        break; }
      case 'cubic':
        s.snap(`It looks like a cubic. But add the bases on the left: (x ${sp(-P.a)}) + (x ${sp(-P.b)}) = 2x ${sp(-(P.a+P.b))} = 2(x ${sp(-(P.a+P.b)/2)}).`);
        s.put('z',0,1.4,`x ${sp(-(P.a+P.b)/2)} = 0`,'key'); s.snap(`That is twice the base on the right — the same samuccaya — so it is zero. No cubing needed.`);
        break;
      case 'cube2': {
        const t=k=>`x ${sp(P.u+k*P.d)}`;
        s.snap(`A seeming biquadratic. The four binomials ${t(0)}, ${t(1)}, ${t(2)}, ${t(3)} are in arithmetical progression.`);
        s.put('z',0,1.4,`N₁ + D₁ = (${t(1)}) + (${t(2)}) = 2x ${sp(2*P.u+3*P.d)}`,'work').hl('z');
        s.put('z2',0,2.4,`N₂ + D₂ = (${t(0)}) + (${t(3)}) = 2x ${sp(2*P.u+3*P.d)}`,'work').hl('z2');
        s.snap(`N + D under the cube equals N + D on the right — the essential test — so 2x ${sp(2*P.u+3*P.d)} = 0.`);
        break; }
    }
    /* substitution check */
    R.forEach(f=>{ const x=fracVal(f); let l,r;
      switch(P.v){ case 'common': l=P.p*(x+P.k); r=P.q*(x+P.k); break; case 'prod': l=(x+P.a)*(x+P.b); r=(x+P.c)*(x+P.d); break;
        case 'den1': l=1/(P.p*x+P.q)+1/(P.r*x+P.t); r=0; break; case 'quad': l=(P.N1[0]*x+P.N1[1])*(P.D2[0]*x+P.D2[1]); r=(P.N2[0]*x+P.N2[1])*(P.D1[0]*x+P.D1[1]); break;
        case 'cubic': l=(x-P.a)**3+(x-P.b)**3; r=2*(x-(P.a+P.b)/2)**3; break; case 'cube2': l=(x+P.u+P.d)**3*(x+P.u+3*P.d); r=(x+P.u)*(x+P.u+2*P.d)**3; break; }
      if(Math.abs(l-r)>1e-6*Math.max(1,Math.abs(l))) ok=false; });
    s.put('A',0,4,`x = ${R.map(fracStr).join('  or  ')}`,'ans');
    s.snap(`<span class="ok">x = ${R.map(fracStr).join(' or ')}</span>.`+(ok?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XIII: merger ---------- */
const fracTerm=(n,a,first)=>`${first?(n<0?M:''):(n<0?' '+M+' ':' + ')}${Math.abs(n)}/(x ${sp(a)})`;
def({
  id:'merger', chn:13, o:10, su:[4],
  name:'Merger equations — absorbing the right-hand fraction',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply” — the merger'},
  short:'3/(x+1) + 4/(x+2) = 7/(x+3): 3 + 4 = 7, so merge: (1−3)·3/(x+1) + (2−3)·4/(x+2) = 0 → x = −8/5.',
  brief:`<p>When several fractions on the left equal one on the right and <b>the left numerators add up to the right numerator</b>:</p>
    <ol><li>“Merge” the right-hand term into each left term: subtract its independent term (c) from that term’s (a), and multiply by the numerator: m → m(a − c).</li><li>The right side becomes 0.</li><li>If the new numerators again add to zero with three terms, merge again; with two terms, solve m′/(x+a) + n′/(x+b) = 0 at sight.</li></ol>`,
  why:`<p>Since m + n = (m + n), we can write</p><div class="eqn">m/(x+a) − m/(x+c) = m(c − a)/((x+a)(x+c))</div><p>and similarly for n. Multiplying the whole equation by (x + c) removes that factor — the merged equation is m(a−c)/(x+a) + n(b−c)/(x+b) = 0 (signs flipped together, which changes nothing).</p>`,
  hist:`<p>Ch. XIII presents the merger as another face of Parāvartya, and Tīrtha stresses the test before the work: “Here N₁ + N₂ (3 + 4) = N (7). So the Sūtra applies.” The “multiple merger” extends it to any number of terms, with the general formula m(a−w)…(a−e)(a−d)(a−c)/(x+a) + … .</p>`,
  ex:{m:3,a:1,n:4,b:2,c:3}, ph:'Random only — press Random', noParse:true,
  rand(){
    if(Math.random()<.6){ let m,n,a,b,c,A,B; do{ m=ri(1,7); n=ri(1,7); a=nz(-6,6); b=nz(-6,6); c=nz(-6,6); A=m*(a-c); B=n*(b-c); }while(new Set([a,b,c]).size<3||A+B===0||!this.okRoot({m,a,n,b,c})); return {m,a,n,b,c}; }
    for(;;){ const m=ri(1,6), n=ri(1,6), a=ri(-5,6), b=ri(-5,6), c=ri(-5,6), w=ri(-5,6); if(new Set([a,b,c,w]).size<4) continue;
      const num=-(m*(a-w)+n*(b-w)); if(num%(c-w)) continue; const p=num/(c-w); if(p<=0) continue;
      const A=m*(a-w)*(a-c), B=n*(b-w)*(b-c); if(A+B===0) continue; const P={m,a,n,b,p,c,w}; if(!this.okRoot(P)) continue; return P; } },
  parse(){ throw 'Use Random.'; },
  okRoot(P){ const x=fracVal(this.sol(P)); return [P.a,P.b,P.c,P.w].filter(v=>v!==undefined).every(u=>Math.abs(x+u)>1e-9); },
  sol(P){ if(P.w===undefined){ const A=P.m*(P.a-P.c), B=P.n*(P.b-P.c); return frac(-(A*P.b+B*P.a),A+B); }
    const A=P.m*(P.a-P.w)*(P.a-P.c), B=P.n*(P.b-P.w)*(P.b-P.c); return frac(-(A*P.b+B*P.a),A+B); },
  eqStr(P){ if(P.w===undefined) return fracTerm(P.m,P.a,true)+fracTerm(P.n,P.b)+` = ${P.m+P.n}/(x ${sp(P.c)})`;
    return fracTerm(P.m,P.a,true)+fracTerm(P.n,P.b)+fracTerm(P.p,P.c)+` = ${P.m+P.n+P.p}/(x ${sp(P.w)})`; },
  q(P){ return `${this.eqStr(P)}<small>x = ?</small>`; },
  ans(P){ return fracStr(this.sol(P)); },
  check(P,v){ return checkFrac(this.sol(P),v); },
  gen(P){
    const s=new Sc(), f=this.sol(P);
    s.put('E',0,0,this.eqStr(P));
    let A,B,a=P.a,b=P.b;
    if(P.w===undefined){
      s.snap(`Test: the left numerators ${P.m} + ${P.n} = ${P.m+P.n}, the right numerator. <b>Merger applies.</b>`);
      A=P.m*(P.a-P.c); B=P.n*(P.b-P.c);
      s.put('m1',0,1.4,`(${P.a} − ${P.c})·${P.m} = ${A},   (${P.b} − ${P.c})·${P.n} = ${B}`,'work').hl('m1');
      s.snap(`Merge the right term in: subtract its ${P.c} from each left term’s independent term and multiply by the numerator.`);
      s.put('d1',0,2.6,fracTerm(A,a,true)+fracTerm(B,b)+' = 0','res').hl('d1');
      s.snap(`The derived equation: ${fracTerm(A,a,true)}${fracTerm(B,b)} = 0.`);
    } else {
      s.snap(`Test: ${P.m} + ${P.n} + ${P.p} = ${P.m+P.n+P.p}, the right numerator. <b>Merger applies.</b>`);
      const A1=P.m*(P.a-P.w), B1=P.n*(P.b-P.w), C1=P.p*(P.c-P.w);
      s.put('m1',0,1.4,fracTerm(A1,P.a,true)+fracTerm(B1,P.b)+fracTerm(C1,P.c)+' = 0','res').hl('m1');
      s.snap(`Merge the right term (subtract ${P.w}, multiply): new numerators ${A1}, ${B1}, ${C1}. They add to ${A1+B1+C1} — <b>yes, again</b>: merge the third term into the first two.`);
      A=A1*(P.a-P.c); B=B1*(P.b-P.c);
      s.put('d1',0,2.6,fracTerm(A,a,true)+fracTerm(B,b)+' = 0','res').hl('d1');
      s.snap(`Second merger (subtract ${P.c}): ${fracTerm(A,a,true)}${fracTerm(B,b)} = 0.`);
    }
    s.put('x',0,3.8,`x = −(${A}·${b} ${sp(B)}·${a})/(${A} ${sp(B)}) = ${fracStr(f)}`,'ans');
    const x=fracVal(f); const lhs = P.w===undefined ? P.m/(x+P.a)+P.n/(x+P.b)-(P.m+P.n)/(x+P.c) : P.m/(x+P.a)+P.n/(x+P.b)+P.p/(x+P.c)-(P.m+P.n+P.p)/(x+P.w);
    s.snap(`Cross-multiply the two-term equation (or use −(mb + na)/(m + n)): <span class="ok">x = ${fracStr(f)}</span>.`+(Math.abs(lhs)<1e-8?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XIV: complex mergers ---------- */
def({
  id:'complexmerger', chn:14, o:10, su:[4,5],
  name:'Complex mergers — equal numerators after transposing',
  sutra:{kind:'SŪTRAS 4 & 5', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”, then Śūnyam'},
  short:'51/(3x+5) − 68/(4x+11) = 52/(4x−15) − 39/(3x−7): make all x-coefficients 12; both sides then have numerator 2652 ⇒ (12x+20)(12x+33) = (12x−45)(12x−28).',
  brief:`<p>For two fractions on each side:</p>
    <ol><li>Scale every fraction so that all x-coefficients are the same (their LCM).</li><li>Transpose so each side is a <b>difference</b> of two fractions with the same numerator.</li><li><b>Test</b>: combining each side, the numerators come out equal.</li><li>Then the denominators’ products are equal: (Lx+p)(Lx+n) = (Lx+m)(Lx+q), a simple equation (x² cancels).</li></ol>`,
  why:`<div class="eqn">A/(Lx+p) − A/(Lx+n) = A(n−p) / ((Lx+p)(Lx+n))</div><p>If A(n − p) equals the corresponding B(q − m) on the other side, the numerators cancel and only the denominators remain: (Lx+p)(Lx+n) = (Lx+m)(Lx+q), so Lx = (mq − pn)/(p + n − m − q).</p>`,
  hist:`<p>Ch. XIV calls these “a special and complex type … usually dubbed ‘harder’” and gives the three tests in turn. Its worked example is exactly this lesson’s default: 51/(3x+5) − 68/(4x+11) = 52/(4x−15) − 39/(3x−7), where both derived numerators are 12 × 13 × 17, giving 126x = 50.</p>`,
  ex:{l1:3,l2:4,p1:5,n1:11,m1:-15,q1:-7,A:204,B:156}, ph:'Random only — press Random', noParse:true,
  rand(){ for(;;){ const [l1,l2]=pick([[2,3],[3,4],[2,5],[3,5],[4,5],[2,3]]); const L=l1*l2/gcd(l1,l2), k1=L/l1, k2=L/l2;
      const p1=nz(-9,9), n1=nz(-9,9), m1=nz(-9,9), q1=nz(-9,9); const p=k1*p1, n=k2*n1, m=k2*m1, q=k1*q1;
      if(n===p||q===m) continue; const g=gcd(n-p,q-m); const base=k1*k2/gcd(k1,k2);
      const A=base*(q-m)/g, B=base*(n-p)/g; if(Math.abs(A)>400||Math.abs(B)>400) continue;
      const den=p+n-m-q; if(!den) continue; const P={l1,l2,p1,n1,m1,q1,A,B}; const x=fracVal(this.sol(P));
      if([l1*x+p1,l2*x+n1,l2*x+m1,l1*x+q1].some(v=>Math.abs(v)<1e-9)) continue; return P; } },
  parse(){ throw 'Use Random.'; },
  dims(P){ const L=P.l1*P.l2/gcd(P.l1,P.l2), k1=L/P.l1, k2=L/P.l2; return {L,k1,k2,p:k1*P.p1,n:k2*P.n1,m:k2*P.m1,q:k1*P.q1}; },
  sol(P){ const {L,p,n,m,q}=this.dims(P); return frac(m*q-p*n, L*(p+n-m-q)); },
  eqStr(P){ const {k1,k2}=this.dims(P); const t=(num,l,c,first,neg)=>`${first?'':(neg?' '+M+' ':' + ')}${num}/(${linForm([l,c],['x',''])})`;
    return t(P.A/k1,P.l1,P.p1,true)+t(P.A/k2,P.l2,P.n1,false,true)+' = '+t(P.B/k2,P.l2,P.m1,true)+t(P.B/k1,P.l1,P.q1,false,true); },
  q(P){ return `${this.eqStr(P)}<small>x = ?</small>`; },
  ans(P){ return fracStr(this.sol(P)); },
  check(P,v){ return checkFrac(this.sol(P),v); },
  gen(P){
    const s=new Sc(), {L,p,n,m,q}=this.dims(P), f=this.sol(P), A=P.A, B=P.B;
    s.put('E',0,0,this.eqStr(P)); s.snap(`A “harder” equation: two fractions on each side, with different x-coefficients (${P.l1} and ${P.l2}).`);
    const t=(num,c,first,neg)=>`${first?'':(neg?' '+M+' ':' + ')}${num}/(${L}x ${sp(c)})`;
    s.put('E2',0,1.3,t(A,p,true)+t(A,n,false,true)+' = '+t(B,m,true)+t(B,q,false,true),'work').hl('E2');
    s.snap(`Make every x-coefficient ${L} (multiply numerator and denominator). Now each side is a difference of two fractions with equal numerators (${A} and ${B}).`);
    s.put('T',0,2.5,`${A}·(${n} − ${p}) = ${A*(n-p)}    ${B}·(${q} − ${m}) = ${B*(q-m)}`,'work').hl('T');
    s.snap(`<b>Test</b>: combine each side — the numerators are ${A}(${n} − ${p}) and ${B}(${q} − ${m}): both <b>${A*(n-p)}</b>. The sūtra applies.`);
    s.put('D',0,3.7,`(${L}x ${sp(p)})(${L}x ${sp(n)}) = (${L}x ${sp(m)})(${L}x ${sp(q)})`,'res').hl('D');
    s.snap(`Equal numerators cancel, leaving the denominators’ products equal. The (${L}x)² terms cancel too.`);
    s.put('x',0,4.9,`${L}x = (${m}·${q} − ${p}·${n})/(${p} ${sp(n)} ${sp(-m)} ${sp(-q)}) = ${fracStr(fmul(f,F(L)))}`,'res');
    const x=fracVal(f); const lhs=(P.A/this.dims(P).k1)/(P.l1*x+P.p1)-(P.A/this.dims(P).k2)/(P.l2*x+P.n1)-((P.B/this.dims(P).k2)/(P.l2*x+P.m1)-(P.B/this.dims(P).k1)/(P.l1*x+P.q1));
    s.put('A',0,6,`x = ${fracStr(f)}`,'ans');
    s.snap(`As with (x+a)(x+b) = (x+c)(x+d): ${L}x = (mq − pn)/(p + n − m − q). <span class="ok">x = ${fracStr(f)}</span>.`+(Math.abs(lhs)<1e-8?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XV: simultaneous equations (three lessons) ---------- */
def({
  id:'simcross', chn:15, o:10, su:[4],
  name:'Simultaneous equations — the cross-multiplication formula',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”'},
  short:'2x + 3y = 8, 4x + 5y = 14: x = (3·14 − 5·8)/(3·4 − 2·5) = 1, y = (8·4 − 14·2)/(same) = 2.',
  brief:`<p>For ax + by = c and dx + ey = f:</p>
    <ol><li><b>x numerator</b>: start at the y-coefficient on top, go across to the number below, minus the reverse: b·f − e·c.</li><li><b>Denominator</b>: y-coefficient on top across to the x-coefficient below, minus the reverse: b·d − e·a.</li><li><b>y numerator</b>: cyclically onward — number on top across to x below, minus the reverse: c·d − f·a. Same denominator.</li></ol>`,
  why:`<p>Eliminating y: e(ax + by) − b(dx + ey) = ec − bf, so x(ae − bd) = ce − bf, i.e.</p><div class="eqn">x = (bf − ce)/(bd − ae),   y = (cd − af)/(bd − ae)</div><p>Going round the coefficients in one cyclic direction keeps every sign right — and the denominator is shared, so it is computed once.</p>`,
  hist:`<p>Ch. XV notes that the usual “cross-multiplication method … is somewhat akin to the Vedic Parāvartya method”, but that students “often get confused as regards the plus and the minus signs” and fall back on substitution. The cyclic reading — always across, always “minus the reverse” — is Tīrtha’s cure.</p>`,
  ex:{a:2,b:3,c:8,d:4,e:5,f:14}, ph:'2x+3y=8, 4x+5y=14',
  rand(){ let a,b,d,e,x,y; do{ a=nz(-7,9); b=nz(-7,9); d=nz(-7,9); e=nz(-7,9); x=ri(-6,8); y=ri(-6,8); }while(b*d-a*e===0); return {a,b,c:a*x+b*y,d,e,f:d*x+e*y}; },
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-'); const eqs=t.split(/[,;]|and/); if(eqs.length!==2) throw 'Type two equations separated by a comma.';
    const one=q=>{ const m=q.match(/^(-?\d*)x([+-]\d*)y=(-?\d+)$/); if(!m) throw 'Use the form ax+by=c.'; const co=x=>x===''||x==='+'?1:x==='-'?-1:+x; return [co(m[1]),co(m[2]),+m[3]]; };
    const [a,b,c]=one(eqs[0]), [d,e,f]=one(eqs[1]); if(b*d-a*e===0) throw 'Those equations are not independent.'; return {a,b,c,d,e,f}; },
  sol(P){ const D=P.b*P.d-P.a*P.e; return [frac(P.b*P.f-P.c*P.e,D), frac(P.c*P.d-P.f*P.a,D)]; },
  q(P){ return `${linForm([P.a,P.b],['x','y'])} = ${P.c},  ${linForm([P.d,P.e],['x','y'])} = ${P.f}<small>x, y = ?</small>`; },
  ans(P){ const [x,y]=this.sol(P); return `x = ${fracStr(x)}, y = ${fracStr(y)}`; },
  check(P,v){ const [x,y]=this.sol(P); const nums=String(v).replace(/[−–—]/g,'-').split(/,|;|\band\b/).map(t=>parseNum(t.replace(/^\s*[xy]\s*=/i,''))); return nums.length===2 && Math.abs(nums[0]-fracVal(x))<1e-9 && Math.abs(nums[1]-fracVal(y))<1e-9; },
  gen(P){
    const s=new Sc(), {a,b,c,d,e,f}=P, [X,Y]=this.sol(P), SP=4.4, col=i=>2+i*SP;
    [['x',0],['y',1],['=',2]].forEach(([t,i])=>cputX(s,'h'+i,col(i),-1,t==='='?'c':t,'lbl'));
    [[a,b,c],[d,e,f]].forEach((row,r)=>row.forEach((v,i)=>cputX(s,`k${r}${i}`,col(i),r*1.3,fmt(v))));
    s.snap(`Write the coefficients in two rows: x, y and the right-hand number.`);
    const D=b*d-a*e;
    s.link('k01','k10','x').link('k11','k00','x2').hl('k01','k10','k11','k00');
    s.put('w',0,2.8,`denominator: ${b}·${d} − ${e}·${a} = ${D}`,'work');
    s.snap(`<b>Denominator</b>: from the top y-coefficient across to the bottom x-coefficient, minus the reverse: ${b}×${d} − ${e}×${a} = <b>${D}</b>.`);
    s.link('k01','k12','x').link('k11','k02','x2').hl('k01','k12','k11','k02');
    s.put('w',0,2.8,`x = (${b}·${f} − ${e}·${c}) / ${D} = ${fracStr(X)}`,'work');
    s.snap(`<b>x</b>: top y-coefficient across to the bottom number, minus the reverse: (${b}×${f} − ${e}×${c}) ÷ ${D} = <b>${fracStr(X)}</b>.`);
    s.link('k02','k10','x').link('k12','k00','x2').hl('k02','k10','k12','k00');
    s.put('w2',0,3.9,`y = (${c}·${d} − ${f}·${a}) / ${D} = ${fracStr(Y)}`,'work');
    s.snap(`<b>y</b>: carry on round the cycle — top number across to the bottom x-coefficient, minus the reverse: (${c}×${d} − ${f}×${a}) ÷ ${D} = <b>${fracStr(Y)}</b>. Same denominator.`);
    const x=fracVal(X), y=fracVal(Y), ok=Math.abs(a*x+b*y-c)<1e-9&&Math.abs(d*x+e*y-f)<1e-9;
    s.put('A',0,5.1,`x = ${fracStr(X)},  y = ${fracStr(Y)}`,'ans');
    s.snap(`<span class="ok">x = ${fracStr(X)}, y = ${fracStr(Y)}</span>.`+(ok?'':' <span class="no">check failed</span>'));
    return s.fr;
  }
});
function cputX(s,k,cx,y,t,c='n',o={}){ return s.put(k,cx-len(String(t))/2,y,t,c,o); }

def({
  id:'anurupye', chn:15, o:20, su:[6],
  name:'Simultaneous equations — “if one is in ratio, the other is zero”',
  sutra:{kind:'SŪTRA 6 OF 16', dev:'आनुरूप्ये शून्यमन्यत्', iast:'(Ānurūpye) Śūnyamanyat', en:'“If one is in ratio, the other one is zero”'},
  short:'6x + 7y = 8, 19x + 14y = 16: the y-coefficients 7 : 14 match 8 : 16, so x = 0 and y = 8/7.',
  brief:`<p>Look at one unknown’s coefficients and the right-hand numbers:</p>
    <ol><li>If they are in the <b>same ratio</b> (7 : 14 = 8 : 16), the <b>other</b> unknown is 0.</li><li>Then either equation gives the first unknown directly (7y = 8).</li></ol>
    <p class="note">The coefficients of the other unknown can be as ugly as you like — they never get used.</p>`,
  why:`<p>If b : e = c : f, then y = c/b satisfies both b·y = c and e·y = f. So (x, y) = (0, c/b) solves the system, and if the equations are independent it is the only solution.</p>`,
  hist:`<p>This is the sixth main sūtra. Tīrtha’s examples deliberately use huge coefficients — 499x + 172y = 212 and 9779x + 387y = 477 (172 = 4·43, 387 = 9·43, 212 = 4·53, 477 = 9·53) — “the big coefficients need not frighten us!” He also extends it to three unknowns.</p>`,
  ex:{a:6,b:7,c:8,d:19,k:2,which:'y'}, ph:'Random only — press Random', noParse:true,
  rand(){ let a,b,c,d,k; do{ a=ri(2,99); d=ri(2,999); b=ri(2,40); c=ri(2,60); k=ri(2,9); }while(a*k*b===d*b||gcd(b,c)===c); return {a,b,c,d,k,which:pick(['x','y'])}; },
  parse(){ throw 'Use Random.'; },
  /* equations: which='y' → a x + b y = c ; d x + (k b) y = k c */
  eqs(P){ return P.which==='y' ? [[P.a,P.b,P.c],[P.d,P.k*P.b,P.k*P.c]] : [[P.b,P.a,P.c],[P.k*P.b,P.d,P.k*P.c]]; },
  sol(P){ return P.which==='y' ? [F(0),frac(P.c,P.b)] : [frac(P.c,P.b),F(0)]; },
  q(P){ const [e1,e2]=this.eqs(P); return `${linForm(e1.slice(0,2),['x','y'])} = ${e1[2]},  ${linForm(e2.slice(0,2),['x','y'])} = ${e2[2]}<small>x, y = ?</small>`; },
  ans(P){ const [x,y]=this.sol(P); return `x = ${fracStr(x)}, y = ${fracStr(y)}`; },
  check(P,v){ const [x,y]=this.sol(P); const nums=String(v).replace(/[−–—]/g,'-').split(/,|;|\band\b/).map(t=>parseNum(t.replace(/^\s*[xy]\s*=/i,''))); return nums.length===2 && Math.abs(nums[0]-fracVal(x))<1e-9 && Math.abs(nums[1]-fracVal(y))<1e-9; },
  gen(P){
    const s=new Sc(), [e1,e2]=this.eqs(P), [X,Y]=this.sol(P), u=P.which, o=u==='y'?'x':'y', ui=u==='y'?1:0;
    s.put('e1',0,0,`${linForm(e1.slice(0,2),['x','y'])} = ${e1[2]}`).put('e2',0,1.2,`${linForm(e2.slice(0,2),['x','y'])} = ${e2[2]}`);
    s.snap(`Two equations — compare the ${u}-coefficients with the right-hand numbers.`);
    s.put('r',0,2.5,`${e1[ui]} : ${e2[ui]} = ${e1[2]} : ${e2[2]} (both 1 : ${P.k})`,'work').hl('r');
    s.snap(`The ${u}-coefficients ${e1[ui]} : ${e2[ui]} are in the same ratio as ${e1[2]} : ${e2[2]}. <b>Ānurūpye Śūnyamanyat</b> — the other unknown, ${o}, is zero.`);
    const val=u==='y'?Y:X;
    s.put('z',0,3.7,`${o} = 0,   ${e1[ui]}${u} = ${e1[2]}  ⇒  ${u} = ${fracStr(val)}`,'ans');
    const [x,y]=[fracVal(X),fracVal(Y)], ok=Math.abs(e1[0]*x+e1[1]*y-e1[2])<1e-9&&Math.abs(e2[0]*x+e2[1]*y-e2[2])<1e-9;
    s.snap(`<span class="ok">x = ${fracStr(X)}, y = ${fracStr(Y)}</span> — and it satisfies the second equation too.`+(ok?'':' <span class="no">check failed</span>'));
    return s.fr;
  }
});

def({
  id:'sankalana', chn:15, o:30, su:[7],
  name:'Simultaneous equations — by addition and subtraction',
  sutra:{kind:'SŪTRA 7 OF 16', dev:'सङ्कलनव्यवकलनाभ्याम्', iast:'Saṅkalana-vyavakalanābhyām', en:'“By addition and by subtraction”'},
  short:'45x − 23y = 113, 23x − 45y = 91: add → 68(x − y) = 204; subtract → 22(x + y) = 22; so x − y = 3, x + y = 1.',
  brief:`<p>When the x- and y-coefficients are <b>interchanged</b> between the two equations:</p>
    <ol><li><b>Add</b> them: the coefficients become equal, giving x ± y directly.</li><li><b>Subtract</b> them: the same, with the other sign.</li><li>x + y and x − y together give x and y by one more addition/subtraction.</li></ol>`,
  why:`<p>From ax + by = c and bx + ay = d:</p><div class="eqn">(a + b)(x + y) = c + d
(a − b)(x − y) = c − d</div><p>Only additions, subtractions and two small divisions — “however big and complex the coefficients may be, there is no multiplication involved.”</p>`,
  hist:`<p>Saṅkalana-vyavakalanābhyām is the seventh main sūtra. Ch. XV gives it this one application and promises “other special types … at a later stage”.</p>`,
  ex:{a:45,b:-23,x:2,y:-1}, ph:'45x-23y=113, 23x-45y=91',
  rand(){ let a,b; do{ a=nz(-60,60); b=nz(-60,60); }while(Math.abs(a)===Math.abs(b)); return {a,b,x:ri(-6,8),y:ri(-6,8)}; },
  parse(str){ const P=T.find(t=>t.id==='simcross').parse(str); if(!(P.a===P.e&&P.b===P.d)) throw 'The coefficients should be interchanged, like 45x−23y and −23x+45y.'; const D=P.a*P.a-P.b*P.b; if(!D) throw 'Not independent.';
    const x=(P.c*P.a-P.f*P.b)/D, y=(P.f*P.a-P.c*P.b)/D; return {a:P.a,b:P.b,x,y}; },
  q(P){ return `${linForm([P.a,P.b],['x','y'])} = ${P.a*P.x+P.b*P.y},  ${linForm([P.b,P.a],['x','y'])} = ${P.b*P.x+P.a*P.y}<small>x, y = ?</small>`; },
  ans:P=>`x = ${fmt(P.x)}, y = ${fmt(P.y)}`,
  check(P,v){ const nums=String(v).replace(/[−–—]/g,'-').split(/,|;|\band\b/).map(t=>parseNum(t.replace(/^\s*[xy]\s*=/i,''))); return nums.length===2&&Math.abs(nums[0]-P.x)<1e-9&&Math.abs(nums[1]-P.y)<1e-9; },
  gen(P){
    const {a,b,x,y}=P, c=a*x+b*y, d=b*x+a*y, s=new Sc();
    s.put('e1',0,0,`${linForm([a,b],['x','y'])} = ${c}`).put('e2',0,1.2,`${linForm([b,a],['x','y'])} = ${d}`);
    s.snap(`The coefficients are interchanged: ${a} and ${b} swap places.`);
    s.put('ad',0,2.5,`add:  ${a+b}x ${sp(a+b)}y = ${c+d}  ⇒  x + y = ${(c+d)/(a+b)}`,'work').hl('ad');
    s.snap(`<b>Saṅkalana</b> — add: ${a+b}(x + y) = ${c+d}, so x + y = <b>${(c+d)/(a+b)}</b>.`);
    s.put('sb',0,3.6,`subtract:  ${a-b}x ${sp(b-a)}y = ${c-d}  ⇒  x − y = ${(c-d)/(a-b)}`,'work').hl('sb');
    s.snap(`<b>Vyavakalana</b> — subtract: ${a-b}(x − y) = ${c-d}, so x − y = <b>${(c-d)/(a-b)}</b>.`);
    const S=(c+d)/(a+b), Dd=(c-d)/(a-b);
    s.put('A',0,4.9,`x = (${S} ${sp(Dd)})/2 = ${(S+Dd)/2},   y = (${S} ${sp(-Dd)})/2 = ${(S-Dd)/2}`,'ans');
    s.snap(`Add and subtract once more: <span class="ok">x = ${(S+Dd)/2}, y = ${(S-Dd)/2}</span>.`+((S+Dd)/2===x&&(S-Dd)/2===y?'':' <span class="no">check failed</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XVI: miscellaneous equations ---------- */
const bx = (u)=>`(x ${sp(u)})`;
def({
  id:'cyclicfrac', chn:16, o:10, su:[4],
  name:'Cyclic fractions — numerator × the missing factor',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”'},
  short:'1/((x−1)(x−3)) + 3/((x−3)(x−5)) + 5/((x−5)(x−1)) = 0 → 1(x−5) + 3(x−1) + 5(x−3) = 0 → x = 23/9.',
  brief:`<p>When the denominators run cyclically through three factors (AB, BC, CA):</p>
    <ol><li>Multiply each numerator by the one factor missing from its own denominator.</li><li>Add and set to zero — that is the numerator of the whole sum.</li></ol>`,
  why:`<p>The common denominator is ABC; each fraction m/(AB) becomes m·C/(ABC). So the sum is zero exactly when mC + nA + pB = 0 — a first-degree equation:</p><div class="eqn">x = −(mc + na + pb)/(m + n + p)   for A = x+a, B = x+b, C = x+c</div>`,
  hist:`<p>Ch. XVI’s “first type”. Tīrtha remarks that multiplying each numerator by the absent factor “is usually and actually done everywhere but not as a rule of mental practice. This, however, should be regularly practised.” Disguised versions hide the factors inside quadratics like x² + 3x + 2.</p>`,
  ex:{m:1,n:3,p:5,a:-1,b:-3,c:-5}, ph:'Random only — press Random', noParse:true,
  rand(){ let m,n,p,a,b,c; do{ m=nz(-5,6); n=nz(-5,6); p=nz(-5,6); a=nz(-7,7); b=nz(-7,7); c=nz(-7,7); }while(new Set([a,b,c]).size<3||m+n+p===0||[a,b,c].some(u=>(m*c+n*a+p*b)===u*(m+n+p))); return {m,n,p,a,b,c}; },
  parse(){ throw 'Use Random.'; },
  sol:P=>frac(-(P.m*P.c+P.n*P.a+P.p*P.b),P.m+P.n+P.p),
  eqStr:P=>`${P.m}/(${bx(P.a)}${bx(P.b)}) ${sp(P.n)}/(${bx(P.b)}${bx(P.c)}) ${sp(P.p)}/(${bx(P.c)}${bx(P.a)}) = 0`,
  q(P){ return `${this.eqStr(P)}<small>x = ?</small>`; },
  ans(P){ return fracStr(this.sol(P)); },
  check(P,v){ return checkFrac(this.sol(P),v); },
  gen(P){
    const s=new Sc(), f=this.sol(P), {m,n,p,a,b,c}=P;
    s.put('E',0,0,this.eqStr(P)); s.snap(`The denominators go round the three factors ${bx(a)}, ${bx(b)}, ${bx(c)} cyclically.`);
    s.put('N',0,1.4,`${m}${bx(c)} ${sp(n)}${bx(a)} ${sp(p)}${bx(b)} = 0`,'work').hl('N');
    s.snap(`Each numerator × the factor its denominator lacks: ${m}·${bx(c)}, ${n}·${bx(a)}, ${p}·${bx(b)}. Their sum is the whole numerator — set it to zero.`);
    s.put('S',0,2.6,`${m+n+p}x ${sp(m*c+n*a+p*b)} = 0`,'res').hl('S');
    s.snap(`Collect: ${m+n+p}x ${sp(m*c+n*a+p*b)} = 0.`);
    const x=fracVal(f), l=m/((x+a)*(x+b))+n/((x+b)*(x+c))+p/((x+c)*(x+a));
    s.put('A',0,3.8,`x = ${fracStr(f)}`,'ans');
    s.snap(`<span class="ok">x = ${fracStr(f)}</span>.`+(Math.abs(l)<1e-8?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

def({
  id:'sopantya', chn:16, o:20, su:[13],
  name:'Sopāntyadvayamantyam — “the ultimate and twice the penultimate”',
  sutra:{kind:'SŪTRA 13 OF 16', dev:'सोपान्त्यद्वयमन्त्यम्', iast:'Sopāntyadvayamantyam', en:'“The ultimate and twice the penultimate”'},
  short:'1/AB + 1/AC = 1/AD + 1/BC with A, B, C, D in A.P. ⇒ D + 2C = 0. E.g. (x+5) + 2(x+4) = 0 ⇒ x = −13/3.',
  brief:`<p>For the pattern</p><div class="eqn">1/(AB) + 1/(AC) = 1/(AD) + 1/(BC)</div><p>where A, B, C, D are binomials in arithmetical progression, the answer is at sight:</p><ol><li>Take the <b>last</b> binomial D and <b>twice the penultimate</b> C.</li><li>Set D + 2C = 0.</li></ol>`,
  why:`<p>Multiply through by ABCD:</p><div class="eqn">CD + BD = BC + AD
⇒ C(D − B) + D(B − A) = 0</div><p>With common difference d, D − B = 2d and B − A = d, so 2d·C + d·D = 0, i.e. <b>D + 2C = 0</b> — the ultimate plus twice the penultimate.</p>`,
  hist:`<p>Sopāntyadvayamantyam is the thirteenth main sūtra, and Ch. XVI is its only appearance in the book. Tīrtha’s example: 1/((x+2)(x+3)) + 1/((x+2)(x+4)) = 1/((x+2)(x+5)) + 1/((x+3)(x+4)) ⇒ (x+5) + 2(x+4) = 3x + 13 = 0.</p>`,
  ex:{u:2,d:1}, ph:'Random only — press Random', noParse:true,
  rand(){ let u,d; do{ u=nz(-6,6); d=nz(-3,4); }while((3*u+7*d)===0 || [0,1,2,3].some(k=>(u+k*d)*3===(3*u+7*d))); return {u,d}; },
  parse(){ throw 'Use Random.'; },
  sol:P=>frac(-(3*P.u+7*P.d),3),
  eqStr(P){ const [A,B,C,D]=[0,1,2,3].map(k=>bx(P.u+k*P.d)); return `1/(${A}${B}) + 1/(${A}${C}) = 1/(${A}${D}) + 1/(${B}${C})`; },
  q(P){ return `${this.eqStr(P)}<small>x = ?</small>`; },
  ans(P){ return fracStr(this.sol(P)); },
  check(P,v){ return checkFrac(this.sol(P),v); },
  gen(P){
    const s=new Sc(), f=this.sol(P), [A,B,C,D]=[0,1,2,3].map(k=>bx(P.u+k*P.d));
    s.put('E',0,0,this.eqStr(P));
    s.snap(`The four binomials ${A}, ${B}, ${C}, ${D} are in arithmetical progression (common difference ${P.d}), arranged as 1/AB + 1/AC = 1/AD + 1/BC.`);
    s.put('S',0,1.4,`ultimate + twice penultimate:  ${D} + 2${C} = 0`,'work').hl('S');
    s.snap(`<b>Sopāntyadvayamantyam</b>: the last, D = ${D}, plus twice the one before it, C = ${C}.`);
    s.put('S2',0,2.6,`3x ${sp(3*P.u+7*P.d)} = 0`,'res').hl('S2');
    const x=fracVal(f), v=k=>x+P.u+k*P.d, l=1/(v(0)*v(1))+1/(v(0)*v(2))-1/(v(0)*v(3))-1/(v(1)*v(2));
    s.put('A',0,3.8,`x = ${fracStr(f)}`,'ans');
    s.snap(`<span class="ok">x = ${fracStr(f)}</span>.`+(Math.abs(l)<1e-8?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

def({
  id:'antyayoreva', chn:16, o:30, sub:[9],
  name:'Antyayoreva — “only the last terms”',
  sutra:{kind:'SUB-SŪTRA 9', dev:'अन्त्ययोरेव', iast:'Antyayoreva', en:'“Only the last terms”'},
  short:'(x+1)(x+2)(x+9) = (x+3)(x+4)(x+5): regroup as (x+1)(x+2)/((x+4)(x+5)) = (x+3)/(x+9); the x-parts match, so each side = 2/20.',
  brief:`<p>Regroup the equation as a fraction of quadratics equal to a fraction of binomials. If the left side <b>without its independent terms</b> reduces to exactly the right side, then:</p>
    <ol><li>both sides also equal the ratio of the <b>last</b> (independent) terms of the left;</li><li>so set the right side equal to that ratio and solve a simple equation.</li></ol>`,
  why:`<p>If N/D = n/d and N = A + a, D = B + b with A/B = n/d, then (by componendo) n/d = (N − A)/(D − B) = a/b. Here (x² + 3x)/(x² + 9x) = (x + 3)/(x + 9) — the x-parts — so (x + 3)/(x + 9) = 2/20.</p>`,
  hist:`<p>Tīrtha brings this in at Ch. XVI with the warning that the totals on both sides are equal (3x + 12 here) “but the Śūnyam Samuccaye sūtra does not apply. The Antyayoreva formula is the one to be applied.” The same sub-sūtra then sums series in the next section.</p>`,
  ex:{a:1,b:2,d:4,e:5}, ph:'Random only — press Random', noParse:true,
  rand(){ let a,b,d,e; do{ a=ri(1,6); b=ri(1,7); d=ri(1,7); e=ri(1,8); }while(a*b===d*e||new Set([a,b,d,e,a+b,d+e]).size<6); return {a,b,d,e}; },
  parse(){ throw 'Use Random.'; },
  sol(P){ const {a,b,d,e}=P, f=a+b, c=d+e, ab=a*b, de=d*e; return frac(ab*c-de*f, de-ab); },
  eqStr(P){ const {a,b,d,e}=P; return `${bx(a)}${bx(b)}${bx(d+e)} = ${bx(d)}${bx(e)}${bx(a+b)}`; },
  q(P){ return `${this.eqStr(P)}<small>x = ?</small>`; },
  ans(P){ return fracStr(this.sol(P)); },
  check(P,v){ return checkFrac(this.sol(P),v); },
  gen(P){
    const s=new Sc(), {a,b,d,e}=P, f=this.sol(P);
    s.put('E',0,0,this.eqStr(P)); s.snap(`A cubic-looking equation. Regroup it as a ratio.`);
    s.put('R',0,1.3,`${bx(a)}${bx(b)} / (${bx(d)}${bx(e)}) = ${bx(a+b)} / ${bx(d+e)}`,'work').hl('R');
    s.snap(`Move factors across: ${bx(a)}${bx(b)} over ${bx(d)}${bx(e)} equals ${bx(a+b)} over ${bx(d+e)}.`);
    s.put('X',0,2.5,`without the last terms: (x² + ${a+b}x)/(x² + ${d+e}x) = (x + ${a+b})/(x + ${d+e})`,'work').hl('X');
    s.snap(`Strip the independent terms from the left: (x² + ${a+b}x)/(x² + ${d+e}x) reduces to exactly the right side.`);
    s.put('L',0,3.7,`so (x + ${a+b})/(x + ${d+e}) = ${a*b}/${d*e}`,'res').hl('L');
    s.snap(`<b>Antyayoreva</b> — then both sides equal the ratio of the <b>last terms</b> alone: ${a}·${b} : ${d}·${e} = ${a*b} : ${d*e}.`);
    const x=fracVal(f), l=(x+a)*(x+b)*(x+d+e)-(x+d)*(x+e)*(x+a+b);
    s.put('A',0,4.9,`x = ${fracStr(f)}`,'ans');
    s.snap(`Cross-multiply the simple equation: <span class="ok">x = ${fracStr(f)}</span>.`+(Math.abs(l)<1e-7?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

def({
  id:'series', chn:16, o:40, sub:[9],
  name:'Summing a series of fractions at sight',
  sutra:{kind:'SUB-SŪTRA 9', dev:'अन्त्ययोरेव', iast:'Antyayoreva', en:'“Only the last terms” — here, only the two ends'},
  short:'1/((x+1)(x+2)) + 1/((x+2)(x+3)) + 1/((x+3)(x+4)) = 3/((x+1)(x+4)): add the numerators, keep only the two end factors.',
  brief:`<p>When consecutive denominators share a factor and the factors step evenly (an A.P.):</p>
    <ol><li><b>Numerator</b> of the sum = sum of the numerators.</li><li><b>Denominator</b> = product of the very first and very last factors — all the middle ones drop out.</li></ol>`,
  why:`<p>Each term splits (partial fractions):</p><div class="eqn">1/((x+a)(x+a+d)) = (1/d)·[1/(x+a) − 1/(x+a+d)]</div><p>Adding n terms, everything in the middle cancels, leaving (1/d)[1/(x+a) − 1/(x+a+nd)] = n/((x+a)(x+a+nd)).</p>`,
  hist:`<p>Ch. XVI’s “fourth type”: “the sum of this series is a fraction whose numerator is the sum of the numerators … and whose denominator is the product of the two ends”. Tīrtha then varies the A.P. — in the x-coefficients, e.g. 1/((x+1)(3x+1)) + 1/((3x+1)(5x+1)) + … — and applies it to plain numbers.</p>`,
  ex:{a:1,d:1,n:3}, ph:'Random only — press Random', noParse:true,
  rand(){ return {a:nz(-5,6),d:ri(1,3),n:ri(3,6)}; },
  parse(){ throw 'Use Random.'; },
  q(P){ const terms=[]; for(let i=0;i<P.n;i++) terms.push(`${P.d}/(${bx(P.a+i*P.d)}${bx(P.a+(i+1)*P.d)})`); return `${terms.join(' + ')}<small>numerator of the sum over ${bx(P.a)}${bx(P.a+P.n*P.d)}?</small>`; },
  ans:P=>String(P.n*P.d),
  check(P,v){ return parseNum(v)===P.n*P.d; },
  gen(P){
    const s=new Sc(), {a,d,n}=P, terms=[]; for(let i=0;i<n;i++) terms.push(`${d}/(${bx(a+i*d)}${bx(a+(i+1)*d)})`);
    s.put('E',0,0,terms.join(' + ')); s.snap(`A series of ${n} fractions. The factors ${bx(a)}, ${bx(a+d)}, … step by ${d}, and each denominator shares a factor with the next.`);
    for(let i=0;i<n;i++) s.put('t'+i,0,1.3+i*0.9,`${d}/(${bx(a+i*d)}${bx(a+(i+1)*d)}) = 1/${bx(a+i*d)} − 1/${bx(a+(i+1)*d)}`,'work');
    s.snap(`Why it works: each term is a difference — and neighbouring differences cancel.`);
    for(let i=0;i<n;i++) s.del('t'+i);
    const y=1.3;
    s.put('S',0,y,`numerators: ${Array(n).fill(d).join(' + ')} = ${n*d}`,'work').hl('S');
    s.snap(`<b>Antyayoreva</b>: the numerator of the sum is the sum of the numerators, <b>${n*d}</b>.`);
    s.put('D',0,y+1.1,`ends: ${bx(a)} … ${bx(a+n*d)}`,'work').hl('D');
    s.snap(`The denominator keeps only the two ends: ${bx(a)} and ${bx(a+n*d)}.`);
    const xv=3.7; let sum=0; for(let i=0;i<n;i++) sum+=d/((xv+a+i*d)*(xv+a+(i+1)*d)); const ok=Math.abs(sum-n*d/((xv+a)*(xv+a+n*d)))<1e-9;
    s.put('A',0,y+2.4,`= ${n*d}/(${bx(a)}${bx(a+n*d)})`,'ans');
    s.snap(`<span class="ok">Sum = ${n*d}/(${bx(a)}${bx(a+n*d)})</span>.`+(ok?'':' <span class="no">check failed</span>'));
    return s.fr;
  }
});
