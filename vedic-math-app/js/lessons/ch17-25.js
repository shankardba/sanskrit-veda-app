'use strict';
/* Chapters XVII–XXV: quadratic/cubic/biquadratic equations, systems, calculus, partial fractions,
   integration and the Kaṭapayādi numerical code */

const nz2=(a,b)=>{ let v; do{ v=ri(a,b); }while(v===0); return v; };
/* plot y = f(x) for x in [xa,xb] into a box at (gx,gy) of size gw×gh px; returns helpers to map points */
function plotBox(s,key,f,xa,xb,{gx=560,gy=-10,gw=300,gh=230}={},roots=[]){
  const N=80, xs=[...Array(N+1)].map((_,i)=>xa+(xb-xa)*i/N), ys=xs.map(f);
  let ya=Math.min(0,...ys), yb=Math.max(0,...ys); const padY=(yb-ya)*0.08||1; ya-=padY; yb+=padY;
  const X=x=>gx+(x-xa)/(xb-xa)*gw, Y=y=>gy+gh-(y-ya)/(yb-ya)*gh;
  s.shape(key+'ax',{pts:[[X(xa),Y(0)],[X(xb),Y(0)]],closed:false,c:'axis'});
  if(xa<0&&xb>0) s.shape(key+'ay',{pts:[[X(0),gy],[X(0),gy+gh]],closed:false,c:'axis'});
  s.shape(key+'cv',{pts:xs.map((x,i)=>[X(x),Y(ys[i])]),closed:false,c:'line'});
  return {X,Y};
}
const dot=(s,k,x,y,r=5,c='dot')=>s.shape(k,{circle:{cx:x,cy:y,rad:r},c});

/* ---------- Ch. XVII: quadratic by the calculus rule ---------- */
def({
  id:'quadcalc', chn:17, o:10, su:[9],
  name:'Quadratic equations — the first differential is ±√discriminant',
  sutra:{kind:'SŪTRA 9 OF 16', dev:'चलनकलनाभ्याम्', iast:'Calana-kalanābhyām', en:'“By differential calculus”'},
  short:'x² − 5x + 6 = 0: D₁ = 2x − 5 and the discriminant is 25 − 24 = 1, so 2x − 5 = ±1 → x = 3 or 2.',
  brief:`<p>For ax² + bx + c = 0:</p>
    <ol><li>The <b>first differential</b> is D₁ = 2ax + b (for x² + bx + c it is the sum of the two factors).</li><li>The <b>discriminant</b> is b² − 4ac.</li><li>Set D₁ = ±√discriminant — two simple equations, two roots.</li></ol>`,
  why:`<p>Rearranging the usual formula x = (−b ± √(b² − 4ac))/2a gives exactly</p><div class="eqn">2ax + b = ±√(b² − 4ac)</div><p>Geometrically, 2ax + b is the slope of the parabola; the two roots sit where the slope is ±√(b²−4ac), symmetric about the vertex where the slope is 0.</p>`,
  hist:`<p>Ch. XVII opens with “a brief exposition of the calculus”: in every quadratic the sum of the two binomial factors is its first differential, and “the first differential is equal to the square root of the discriminant”. Tīrtha calls the textbook formula “a very crude and clumsy way of stating” this, and mentions the medieval Śrīdhara’s method (c. 750–850 CE) as better but not as good.</p>`,
  ex:{p:1,q:-2,r:1,s:-3}, ph:'x^2-5x+6=0',
  rand(){ let p,q,r,s; do{ p=pick([1,1,1,2,3]); r=pick([1,1,2]); q=nz2(-8,8); s=nz2(-8,8); }while(gcd(p,Math.abs(q))!==1||gcd(r,Math.abs(s))!==1||p*s===r*q); return {p,q,r,s}; },
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-').replace(/x²/g,'x^2').replace(/=0$/,''); const m=t.match(/^(-?\d*)x\^2([+-]\d*)x([+-]\d+)$/); if(!m) throw 'Type it like x^2-5x+6=0.';
    const co=x=>x===''||x==='+'?1:x==='-'?-1:+x; const a=co(m[1]), b=co(m[2]), c=+m[3]; const D=b*b-4*a*c; if(D<0) throw 'No real roots.'; const r=isqrt(D); if(r*r!==D) throw 'The discriminant '+D+' is not a perfect square — try one with whole-number roots.';
    return {A:[a,b,c]}; },
  co(P){ return P.A || [P.p*P.r, P.p*P.s+P.q*P.r, P.q*P.s]; },
  roots(P){ const [a,b,c]=this.co(P), D=b*b-4*a*c, r=isqrt(D); return [frac(-b+r,2*a), frac(-b-r,2*a)]; },
  q(P){ return `${fmtPoly(this.co(P))} = 0<small>both roots, e.g. 3, 2</small>`; },
  ans(P){ return rootsStr(this.roots(P)); },
  check(P,v){ return checkRoots(this.roots(P),v); },
  gen(P){
    const [a,b,c]=this.co(P), s=new Sc(), D=b*b-4*a*c, r=isqrt(D), R=this.roots(P);
    s.put('E',0,0,`${fmtPoly([a,b,c])} = 0`);
    const xs=R.map(fracVal), mid=-b/(2*a), half=Math.max(1.5,Math.abs(xs[0]-xs[1])*0.9);
    const {X,Y}=plotBox(s,'g',x=>a*x*x+b*x+c, mid-half-0.5, mid+half+0.5,{gx:430,gw:260,gh:220});
    s.snap(`Solve <b>${fmtPoly([a,b,c])} = 0</b>. On the right, its graph.`);
    s.put('D1',0,1.3,`D₁ = ${fmtPoly([2*a,b])}`,'work').hl('D1');
    s.shape('vx',{pts:[[X(mid),Y(a*mid*mid+b*mid+c)-60],[X(mid),Y(a*mid*mid+b*mid+c)+60]],closed:false,c:'axis'});
    s.snap(`<b>Calana-kalana</b>: the first differential is <b>${fmtPoly([2*a,b])}</b>${a===1?` — also the sum of the two factors`:''}. It is zero at the turning point, x = ${fracStr(frac(-b,2*a))}.`);
    s.put('Ds',0,2.4,`discriminant = ${b}² − 4·${a}·${c} = ${D}`,'work').hl('Ds');
    s.snap(`Discriminant: (${b})² − 4 × ${a} × ${c} = <b>${D}</b>, whose square root is <b>${r}</b>.`);
    s.put('eq',0,3.5,`${fmtPoly([2*a,b])} = ±${r}`,'key').hl('eq');
    s.snap(`So <b>${fmtPoly([2*a,b])} = ±${r}</b> — the quadratic breaks into two simple equations at sight.`);
    xs.forEach((x,i)=>dot(s,'rt'+i,X(x),Y(0),6,'dot hot'));
    s.put('A',0,4.7,`x = ${R.map(fracStr).join('  or  ')}`,'ans');
    const ok=R.every(f=>Math.abs(a*fracVal(f)**2+b*fracVal(f)+c)<1e-9);
    s.snap(`${fmtPoly([2*a,b])} = ${r} gives x = ${fracStr(R[0])}; ${fmtPoly([2*a,b])} = −${r} gives x = ${fracStr(R[1])}. <span class="ok">x = ${R.map(fracStr).join(' or ')}</span> — the two crossings on the graph.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XVII: reciprocal type ---------- */
def({
  id:'reciprocal', chn:17, o:20, sub:[12],
  name:'Quadratics of the reciprocal type — split at sight',
  sutra:{kind:'SUB-SŪTRA 12', dev:'विलोकनम्', iast:'Vilokanam', en:'“By mere observation”'},
  short:'x + 1/x = 17/4: write 17/4 as 4 + 1/4, so x = 4 or 1/4. Likewise y + 1/y = 37/6 = 6 + 1/6.',
  brief:`<p>When the left side is a quantity plus its reciprocal (or minus it):</p>
    <ol><li>Split the right side into the same shape: N/D = p/q + q/p, where D = pq and N = p² + q² (or p² − q² for the minus case).</li><li>Then the quantity is p/q or q/p (for the minus case: p/q or −q/p).</li><li>If the quantity is itself a fraction in x, solve each simple equation.</li></ol>`,
  why:`<p>y + 1/y = a + 1/a means y² − (a + 1/a)y + 1 = 0 = (y − a)(y − 1/a). The two roots are a and its reciprocal — obvious once you see the form.</p><div class="eqn">p/q + q/p = (p² + q²)/(pq)</div><p>so the job is to factor the denominator into two numbers whose squares add to the numerator.</p>`,
  hist:`<p>Ch. XVII’s “first special type”. Tīrtha notes the trap in the minus case: for x − 1/x = 5/6 = 3/2 − 2/3 the second root is −2/3, not 2/3. Since splitting a number into a sum of two squares isn’t always easy, he promises rules for it later (Ch. XXXI).</p>`,
  ex:{v:'plain',p:4,q:1}, ph:'Random only — press Random', noParse:true,
  rand(){ const v=pick(['plain','plain','minus','frac']); let p,q; do{ p=ri(1,9); q=ri(1,9); }while(p===q||gcd(p,q)!==1);
    if(v==='frac'){ let c,d; do{ c=nz2(-6,6); d=nz2(-6,6); }while(c===d); return {v,p,q,c,d}; } return {v,p,q}; },
  parse(){ throw 'Use Random.'; },
  roots(P){ const {p,q}=P;
    if(P.v==='plain') return [frac(p,q),frac(q,p)];
    if(P.v==='minus') return [frac(p,q),frac(-q,p)];
    /* (x+c)/(x+d) = t  →  x = (td − c)/(1 − t) */
    const sol=t=>{ const num=fsub(fmul(t,F(P.d)),F(P.c)), den=fsub(F(1),t); return fdiv(num,den); };
    return [sol(frac(p,q)), sol(frac(q,p))]; },
  lhs(P){ return P.v==='plain'?'x + 1/x':P.v==='minus'?'x − 1/x':`(x ${sp(P.c)})/(x ${sp(P.d)}) + (x ${sp(P.d)})/(x ${sp(P.c)})`; },
  rhs(P){ const {p,q}=P; return P.v==='minus'? fracStr(frac(p*p-q*q,p*q)) : fracStr(frac(p*p+q*q,p*q)); },
  q(P){ return `${this.lhs(P)} = ${this.rhs(P)}<small>both roots</small>`; },
  ans(P){ return rootsStr(this.roots(P)); },
  check(P,v){ return checkRoots(this.roots(P),v); },
  gen(P){
    const s=new Sc(), {p,q}=P, R=this.roots(P);
    s.put('E',0,0,`${this.lhs(P)} = ${this.rhs(P)}`);
    s.snap(`The left side is ${P.v==='minus'?'a quantity minus its reciprocal':'a quantity plus its reciprocal'}. Can the right side be split the same way?`);
    s.put('sp',0,1.3,`${this.rhs(P)} = ${p}/${q} ${P.v==='minus'?'−':'+'} ${q}/${p}`,'work').hl('sp');
    s.snap(`<b>Vilokanam</b>: the denominator ${p*q} = ${p} × ${q}, and ${p}² ${P.v==='minus'?'−':'+'} ${q}² = ${P.v==='minus'?p*p-q*q:p*p+q*q} — so ${this.rhs(P)} = <b>${p}/${q} ${P.v==='minus'?'−':'+'} ${q}/${p}</b>.`);
    if(P.v==='frac'){
      s.put('y',0,2.5,`(x ${sp(P.c)})/(x ${sp(P.d)}) = ${p}/${q}  or  ${q}/${p}`,'res').hl('y');
      s.snap(`So the quantity (x ${sp(P.c)})/(x ${sp(P.d)}) is ${p}/${q} or ${q}/${p}. Each is a simple equation.`);
    }
    s.put('A',0,3.7,`x = ${R.map(fracStr).join('  or  ')}`,'ans');
    const f=x=> P.v==='plain'? x+1/x : P.v==='minus'? x-1/x : (x+P.c)/(x+P.d)+(x+P.d)/(x+P.c);
    const target=P.v==='minus'?(p*p-q*q)/(p*q):(p*p+q*q)/(p*q);
    const ok=R.every(r=>Math.abs(f(fracVal(r))-target)<1e-9);
    s.snap(`<span class="ok">x = ${R.map(fracStr).join(' or ')}</span>${P.v==='minus'?` — note the minus on the second root: x = ${p}/${q} would not work twice.`:'.'}`+(ok?'':' <span class="no">substitution check failed</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XVIII: cubic by completing the cube ---------- */
def({
  id:'cubicpurana', chn:18, o:10, su:[8,4],
  name:'Cubic equations — completing the cube (Pūraṇa)',
  sutra:{kind:'SŪTRA 8 OF 16', dev:'पूरणापूरणाभ्याम्', iast:'Pūraṇāpūraṇābhyām', en:'“By the completion or non-completion” (of the square, the cube …)'},
  short:'x³ − 6x² + 11x − 6 = 0: (x − 2)³ = x³ − 6x² + 12x − 8 = (−11x + 6) + 12x − 8 = x − 2, so y³ = y with y = x − 2.',
  brief:`<p>For x³ + bx² + cx + d = 0:</p>
    <ol><li>Keep x³ + bx² on the left; transpose the rest.</li><li><b>Complete the cube</b>: (x + b/3)³ = x³ + bx² + … — substitute the left side from the equation.</li><li>Write everything in terms of y = x + b/3. The x² term is gone: y³ = py + q.</li><li>Solve that by inspection (or factorising), then x = y − b/3.</li></ol>`,
  why:`<div class="eqn">(x + k)³ = x³ + 3kx² + 3k²x + k³</div><p>With 3k = b the first two terms are exactly the left side we kept. Replacing them by −cx − d leaves only first-degree terms on the right, which regroup as multiples of (x + k) — the reduced (“depressed”) cubic y³ = py + q.</p>`,
  hist:`<p>Ch. XVIII notes that the Pūraṇa (completion) method “is well-known to the current system” — it is how the quadratic formula is derived — and simply carries it one degree higher. The same substitution, x = y − b/3, is the first step of Cardano’s formula (1545). Tīrtha’s examples are chosen so the reduced cubic factorises at sight.</p>`,
  ex:{r:[1,2,3]}, ph:'x^3-6x^2+11x-6=0',
  rand(){ for(;;){ const r=[nz2(-6,6),nz2(-6,6),nz2(-6,6)]; if(new Set(r).size<3) continue; if((r[0]+r[1]+r[2])%3) continue; return {r}; } },
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-').replace(/x³/g,'x^3').replace(/x²/g,'x^2').replace(/=0$/,''); const m=t.match(/^x\^3([+-]\d*)x\^2([+-]\d*)x([+-]\d+)$/); if(!m) throw 'Type a monic cubic like x^3-6x^2+11x-6=0.';
    const co=x=>x==='+'?1:x==='-'?-1:+x; const C=[1,co(m[1]),co(m[2]),+m[3]]; if(C[1]%3) throw 'This method needs the x² coefficient to be a multiple of 3.';
    const r=[]; let P=C.slice(); for(const d of divisors(C[3]).flatMap(d=>[d,-d])) while(P.length>1&&polyEval(P,d)===0){ r.push(d); P=polyDiv(P,[1,-d]).q; }
    if(r.length!==3||new Set(r).size<3) throw 'Choose a cubic with three different whole-number roots.'; return {r}; },
  co:P=>polyMul(polyMul([1,-P.r[0]],[1,-P.r[1]]),[1,-P.r[2]]),
  q(P){ return `${fmtPoly(this.co(P))} = 0<small>all three roots</small>`; },
  ans:P=>P.r.slice().sort((a,b)=>a-b).join(', '),
  check(P,v){ return checkRoots(P.r.map(x=>F(x)),v); },
  gen(P){
    const C=this.co(P), [_,b,c,d]=C, k=b/3, s=new Sc();
    s.put('E',0,0,`${fmtPoly(C)} = 0`);
    const rs=P.r, lo=Math.min(...rs), hi=Math.max(...rs);
    const {X,Y}=plotBox(s,'g',x=>polyEval(C,x),lo-1,hi+1,{gx:500,gw:260,gh:260});
    s.snap(`Solve <b>${fmtPoly(C)} = 0</b>.`);
    s.put('t',0,1.2,`${fmtPoly([1,b,0,0])} = ${fmtPoly([-c,-d])}`,'work').hl('t');
    s.snap(`Keep x³ ${sp(b)}x² on the left; transpose the rest: ${fmtPoly([1,b,0,0])} = ${fmtPoly([-c,-d])}.`);
    const cube=[1,3*k,3*k*k,k*k*k];
    s.put('c',0,2.3,`${bin(1,k)}³ = ${fmtPoly(cube)}`,'work').hl('c');
    s.snap(`<b>Pūraṇa</b> — complete the cube: ${bin(1,k)}³ begins with exactly x³ ${sp(b)}x².`);
    const rhs=[-c+3*k*k, -d+k*k*k];
    s.put('c2',0,3.4,`${bin(1,k)}³ = (${fmtPoly([-c,-d])}) ${sp(3*k*k)}x ${sp(k*k*k)} = ${fmtPoly(rhs)}`,'work').hl('c2');
    s.snap(`Replace x³ ${sp(b)}x² by ${fmtPoly([-c,-d])}: the cube equals <b>${fmtPoly(rhs)}</b> — only first-degree terms left.`);
    const pcoef=rhs[0], qcoef=rhs[1]-pcoef*k;          // rhs = p(x+k) + q
    s.put('y',0,4.5,`y = x ${sp(k)}:   y³ = ${fmtPoly([pcoef,qcoef],'y')}`,'res').hl('y');
    s.snap(`Write it in terms of y = x ${sp(k)}: ${fmtPoly(rhs)} = ${pcoef}(x ${sp(k)}) ${sp(qcoef)}, so <b>y³ = ${fmtPoly([pcoef,qcoef],'y')}</b>.`);
    const ys=rs.map(r=>r+k).sort((a,b)=>a-b);
    s.put('ys',0,5.6,`by inspection: y = ${ys.join(', ')}`,'work').hl('ys');
    s.snap(`Solve y³ = ${fmtPoly([pcoef,qcoef],'y')} by inspection — try small whole numbers (${ys.map(y=>`${y}³ = ${y**3}`).join(', ')}): <b>y = ${ys.join(', ')}</b>.`);
    rs.forEach((x,i)=>dot(s,'rt'+i,X(x),Y(0),6,'dot hot'));
    const xs=ys.map(y=>y-k);
    const ok=xs.every(x=>polyEval(C,x)===0);
    s.put('A',0,6.8,`x = y ${sp(-k)} = ${xs.join(', ')}`,'ans');
    s.snap(`<span class="ok">x = ${xs.join(', ')}</span> — where the curve crosses the axis.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XIX: biquadratic special type ---------- */
def({
  id:'biquad', chn:19, o:10, su:[11],
  name:'Biquadratics — (x + a)⁴ + (x + b)⁴ = N',
  sutra:{kind:'SŪTRA 11 OF 16', dev:'व्यष्टिसमष्टिः', iast:'Vyaṣṭisamaṣṭiḥ', en:'“Part and whole” — work from the average'},
  short:'(x + 7)⁴ + (x + 5)⁴ = 706: let y = x + 6 (the mean); then 2y⁴ + 12y² + 2 = 706, so y² = 16 and x = −2 or −10.',
  brief:`<p>When the left side is the sum of fourth powers of two binomials:</p>
    <ol><li>Let y be their <b>average</b> (x + 6 for x + 7 and x + 5); the binomials are y ± h.</li><li>(y + h)⁴ + (y − h)⁴ = 2y⁴ + 12h²y² + 2h⁴ — the odd powers cancel.</li><li>That is a quadratic in y²; solve it, then x = y − (average shift).</li></ol>
    <p class="note">Small cases fall to Vilokanam: 706 = 625 + 81 = 5⁴ + 3⁴.</p>`,
  why:`<div class="eqn">(y+h)⁴ = y⁴ + 4y³h + 6y²h² + 4yh³ + h⁴
(y−h)⁴ = y⁴ − 4y³h + 6y²h² − 4yh³ + h⁴</div><p>Adding, the y³ and y terms cancel. Working from the average of the two parts (vyaṣṭi) as a whole (samaṣṭi) is what makes the equation collapse.</p>`,
  hist:`<p>Ch. XIX: “there are several special types of Biquadratic equations dealt with in the Vedic Sūtras. But we shall here deal with only one.” Tīrtha gives the general formula for (x + m + n)⁴ + (x + m − n)⁴ = p and notes the complex roots that the quadratic in y² also yields.</p>`,
  ex:{m:6,h:1,y0:4}, ph:'Random only — press Random', noParse:true,
  rand(){ return {m:nz2(-8,8),h:ri(1,3),y0:ri(1,5)}; },
  parse(){ throw 'Use Random.'; },
  N:P=>(P.y0-P.h)**4+(P.y0+P.h)**4,
  roots:P=>[F(P.y0-P.m),F(-P.y0-P.m)],
  q(P){ return `(x ${sp(P.m+P.h)})⁴ + (x ${sp(P.m-P.h)})⁴ = ${this.N(P)}<small>the two real roots</small>`; },
  ans(P){ return rootsStr(this.roots(P)); },
  check(P,v){ return checkRoots(this.roots(P),v); },
  gen(P){
    const {m,h,y0}=P, N=this.N(P), s=new Sc();
    s.put('E',0,0,`(x ${sp(m+h)})⁴ + (x ${sp(m-h)})⁴ = ${N}`);
    s.snap(`A biquadratic: the sum of fourth powers of two binomials.`);
    s.put('y',0,1.2,`y = x ${sp(m)}  (the average)`,'work').hl('y');
    s.snap(`Take their <b>average</b>: y = x ${sp(m)}. The binomials are y + ${h} and y − ${h}.`);
    s.put('ex',0,2.3,`2y⁴ + ${12*h*h}y² + ${2*h**4} = ${N}`,'work').hl('ex');
    s.snap(`Expand: odd powers cancel, leaving 2y⁴ + ${12*h*h}y² + ${2*h**4} = ${N}.`);
    const B=6*h*h, Cc=h**4-N/2, disc=B*B-4*Cc, sq=Math.sqrt(disc), z1=(-B+sq)/2, z2=(-B-sq)/2;
    s.put('qd',0,3.4,`(y²)² + ${B}(y²) ${sp(Cc)} = 0  ⇒  y² = ${z1} or ${z2}`,'work').hl('qd');
    s.snap(`Halve and treat y² as the unknown — a quadratic: y² = <b>${z1}</b> (or ${z2}, which gives complex roots).`);
    s.put('A',0,4.6,`y = ±${y0}  ⇒  x = ${y0-m}  or  ${-y0-m}`,'ans');
    const ok=[y0-m,-y0-m].every(x=>(x+m+h)**4+(x+m-h)**4===N) && Math.abs(z1-y0*y0)<1e-9;
    s.snap(`<span class="ok">x = ${y0-m} or ${-y0-m}</span>. (Vilokanam check: ${N} = ${(y0+h)**4} + ${(y0-h)**4} = ${y0+h}⁴ + ${Math.abs(y0-h)}⁴.)`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XX: three unknowns ---------- */
const lin3=(c)=>linForm(c,['x','y','z']);
def({
  id:'sim3', chn:20, o:10, sub:[11], su:[4],
  name:'Three simultaneous equations — eliminate, then cross-multiply',
  sutra:{kind:'SUB-SŪTRA 11 · SŪTRA 4', dev:'लोपनस्थापनाभ्याम्', iast:'Lopana-sthāpanābhyām', en:'“By elimination and retention”, then Parāvartya'},
  short:'Eliminate z from two pairs of equations, solve the resulting pair by the cross-multiplication formula, then put back for z.',
  brief:`<ol><li><b>Lopana</b>: combine equations A and B, and A and C, with multipliers that wipe out the same unknown (z).</li><li><b>Sthāpana</b>: two equations in x and y remain — solve them by the cross-multiplication formula (Ch. XV).</li><li>Substitute back for the third unknown.</li></ol>`,
  why:`<p>Multiplying equation A by the z-coefficient of B and B by that of A, then subtracting, removes z exactly (Ch. X’s idea applied to equations). Two independent such combinations give a 2 × 2 system with the same solution.</p>`,
  hist:`<p>Ch. XX uses Lopana-sthāpana, Ānurūpya and Parāvartya, and stresses “we can make our own choice of the unknown to be eliminated, the multiples to be taken etc.” Several of its examples are deliberately chosen so that one variable vanishes by mere observation.</p>`,
  ex:{A:[1,1,1],B:[2,3,1],C:[1,-1,2],x:1,y:2,z:3}, ph:'Random only — press Random', noParse:true,
  rand(){ for(;;){ const A=[nz2(-4,5),nz2(-4,5),nz2(-4,5)], B=[nz2(-4,5),nz2(-4,5),nz2(-4,5)], C=[nz2(-4,5),nz2(-4,5),nz2(-4,5)];
      const det=A[0]*(B[1]*C[2]-B[2]*C[1])-A[1]*(B[0]*C[2]-B[2]*C[0])+A[2]*(B[0]*C[1]-B[1]*C[0]); if(!det) continue;
      const u=[B[2]*A[0]-A[2]*B[0], B[2]*A[1]-A[2]*B[1]], v=[C[2]*A[0]-A[2]*C[0], C[2]*A[1]-A[2]*C[1]]; if(u[1]*v[0]-u[0]*v[1]===0) continue;
      return {A,B,C,x:ri(-5,6),y:ri(-5,6),z:ri(-5,6)}; } },
  parse(){ throw 'Use Random.'; },
  rhs(P,E){ return E[0]*P.x+E[1]*P.y+E[2]*P.z; },
  q(P){ return `${lin3(P.A)} = ${this.rhs(P,P.A)}, ${lin3(P.B)} = ${this.rhs(P,P.B)}, ${lin3(P.C)} = ${this.rhs(P,P.C)}<small>x, y, z</small>`; },
  ans:P=>`x = ${P.x}, y = ${P.y}, z = ${P.z}`,
  check(P,v){ const n=String(v).replace(/[−–—]/g,'-').split(/,|;|\band\b/).map(t=>parseNum(t.replace(/^\s*[xyz]\s*=/i,''))); return n.length===3&&n[0]===P.x&&n[1]===P.y&&n[2]===P.z; },
  gen(P){
    const {A,B,C}=P, a=this.rhs(P,A), b=this.rhs(P,B), c=this.rhs(P,C), s=new Sc();
    s.put('A',0,0,`A: ${lin3(A)} = ${a}`).put('B',0,1,`B: ${lin3(B)} = ${b}`).put('C',0,2,`C: ${lin3(C)} = ${c}`);
    s.snap(`Three equations in x, y, z. Eliminate z first.`);
    const u=[B[2]*A[0]-A[2]*B[0], B[2]*A[1]-A[2]*B[1], B[2]*a-A[2]*b], v=[C[2]*A[0]-A[2]*C[0], C[2]*A[1]-A[2]*C[1], C[2]*a-A[2]*c];
    s.put('U',0,3.3,`${B[2]}A ${sp(-A[2])}B:  ${linForm(u.slice(0,2),['x','y'])} = ${u[2]}`,'work').hl('U');
    s.snap(`<b>Lopana</b>: ${B[2]}·A − (${A[2]})·B wipes out z: ${linForm(u.slice(0,2),['x','y'])} = ${u[2]}.`);
    s.put('V',0,4.4,`${C[2]}A ${sp(-A[2])}C:  ${linForm(v.slice(0,2),['x','y'])} = ${v[2]}`,'work').hl('V');
    s.snap(`Likewise ${C[2]}·A − (${A[2]})·C: ${linForm(v.slice(0,2),['x','y'])} = ${v[2]}.`);
    const D=u[1]*v[0]-u[0]*v[1], X=frac(u[1]*v[2]-u[2]*v[1],D), Y=frac(u[2]*v[0]-v[2]*u[0],D);
    s.put('xy',0,5.6,`cross-multiplication: x = ${fracStr(X)}, y = ${fracStr(Y)}`,'res').hl('xy');
    s.snap(`<b>Sthāpana</b> — two equations in x and y remain. The cross-multiplication formula gives x = (${u[1]}·${v[2]} − ${u[2]}·${v[1]})/${D} = <b>${fracStr(X)}</b> and y = <b>${fracStr(Y)}</b>.`);
    const zv=frac(a-A[0]*fracVal(X)-A[1]*fracVal(Y),A[2]);
    s.put('z',0,6.7,`from A: ${A[2]}z = ${a} ${sp(-A[0]*P.x)} ${sp(-A[1]*P.y)}  ⇒  z = ${fracStr(zv)}`,'res').hl('z');
    s.snap(`Put them back into A to get z = <b>${fracStr(zv)}</b>.`);
    const ok=fracVal(X)===P.x&&fracVal(Y)===P.y&&fracVal(zv)===P.z;
    s.put('ans',0,7.9,`x = ${P.x},  y = ${P.y},  z = ${P.z}`,'ans');
    s.snap(`<span class="ok">x = ${P.x}, y = ${P.y}, z = ${P.z}</span> (check in C: ${lin3(C)} = ${c} ✓).`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XXI: simultaneous quadratics ---------- */
def({
  id:'simquad', chn:21, o:10, sub:[12],
  name:'Simultaneous quadratics — sum and product',
  sutra:{kind:'SUB-SŪTRA 12', dev:'विलोकनम्', iast:'Vilokanam', en:'“By mere observation” — and reversal'},
  short:'x + y = 5, xy = 6: (x − y)² = 25 − 24 = 1, so x − y = ±1 → (3, 2) or (2, 3).',
  brief:`<p>For x + y = s and xy = p:</p>
    <ol><li>(x − y)² = (x + y)² − 4xy = s² − 4p.</li><li>x − y = ±√(s² − 4p); add and subtract with x + y.</li><li>One solution is usually visible at sight; the other is the reversal (swap x and y).</li></ol>
    <p class="note">For x − y = d, xy = p use (x + y)² = d² + 4p instead — and watch the signs.</p>`,
  why:`<div class="eqn">(x − y)² = x² − 2xy + y² = (x + y)² − 4xy</div><p>So knowing the sum and product fixes the difference up to sign; the two signs are the two orderings of the same pair (or, in the difference form, a pair and its negative).</p>`,
  hist:`<p>Ch. XXI says the needed sūtras “have practically all been explained already. Only the actual applicational procedure … ha[s] to be explained”. Its first remark is that symmetric systems give one solution by Vilokanam “and also because symmetrical values can always be reversed”.</p>`,
  ex:{v:'sum',x:3,y:2}, ph:'Random only — press Random', noParse:true,
  rand(){ let x,y; do{ x=ri(-7,9); y=ri(-7,9); }while(x===y||!x||!y); return {v:pick(['sum','sum','diff']),x,y}; },
  parse(){ throw 'Use Random.'; },
  sys(P){ return P.v==='sum' ? `x + y = ${P.x+P.y},  xy = ${P.x*P.y}` : `x − y = ${P.x-P.y},  xy = ${P.x*P.y}`; },
  sols(P){ return P.v==='sum' ? [[P.x,P.y],[P.y,P.x]] : [[P.x,P.y],[-P.y,-P.x]]; },
  q(P){ return `${this.sys(P)}<small>one solution x, y</small>`; },
  ans(P){ return this.sols(P).map(([a,b])=>`(${a}, ${b})`).join(' or '); },
  check(P,v){ const n=String(v).replace(/[−–—]/g,'-').match(/-?\d+(\.\d+)?/g); if(!n||n.length<2) return false; const [a,b]=n.slice(0,2).map(Number);
    return P.v==='sum' ? (a+b===P.x+P.y&&a*b===P.x*P.y) : (a-b===P.x-P.y&&a*b===P.x*P.y); },
  gen(P){
    const s=new Sc(), S=P.x+P.y, D=P.x-P.y, Pr=P.x*P.y;
    s.put('E',0,0,this.sys(P)); s.snap(`Two equations — one linear, one a product.`);
    if(P.v==='sum'){
      s.put('d',0,1.3,`(x − y)² = ${S}² − 4·${Pr} = ${D*D}`,'work').hl('d');
      s.snap(`(x − y)² = (x + y)² − 4xy = ${S*S} − ${4*Pr} = <b>${D*D}</b>.`);
      s.put('d2',0,2.4,`x − y = ±${Math.abs(D)}`,'res').hl('d2');
      s.snap(`So x − y = ±${Math.abs(D)}.`);
    } else {
      s.put('d',0,1.3,`(x + y)² = ${D}² + 4·${Pr} = ${S*S}`,'work').hl('d');
      s.snap(`(x + y)² = (x − y)² + 4xy = ${D*D} ${sp(4*Pr)} = <b>${S*S}</b>.`);
      s.put('d2',0,2.4,`x + y = ±${Math.abs(S)}`,'res').hl('d2');
      s.snap(`So x + y = ±${Math.abs(S)}.`);
    }
    const [s1,s2]=this.sols(P);
    s.put('A',0,3.6,`(x, y) = (${s1[0]}, ${s1[1]})  or  (${s2[0]}, ${s2[1]})`,'ans');
    const ok=this.sols(P).every(([a,b])=> P.v==='sum' ? (a+b===S&&a*b===Pr) : (a-b===D&&a*b===Pr));
    s.snap(`Add and subtract: <span class="ok">(${s1[0]}, ${s1[1]})</span>, and by ${P.v==='sum'?'reversal':'reversal with a change of sign'} <span class="ok">(${s2[0]}, ${s2[1]})</span>.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XXII: successive differentials from the factors ---------- */
def({
  id:'gunaka', chn:22, o:10, su:[16],
  name:'Successive differentials as sums of products of factors',
  sutra:{kind:'SŪTRA 16 OF 16', dev:'गुणकसमुच्चयः', iast:'Guṇakasamuccayaḥ', en:'“The factors of the sum are equal to the sum of the factors”'},
  short:'(x+1)(x+2)(x+3): D₁ = sum of the products taken two at a time = 3x² + 12x + 11; D₂ = 2!·(sum of the factors) = 6x + 12; D₃ = 3! = 6.',
  brief:`<p>If a polynomial is a product of binomial factors:</p>
    <ol><li><b>D₁</b> = the sum of all products leaving out one factor at a time.</li><li><b>D₂</b> = 2! × the sum of all products leaving out two at a time.</li><li>… and so on, down to n! for the last.</li></ol>
    <p class="note">For a quadratic (x+a)(x+b), D₁ is simply the sum of the factors — the rule used in Ch. XVII.</p>`,
  why:`<p>This is the product rule applied repeatedly: d/dx of a product of n factors is the sum of n terms, each with one factor differentiated (to 1). Differentiating again knocks out a second factor in every possible way, and each pair is reached twice — hence the 2!.</p>`,
  hist:`<p>Ch. XXII says the relevant sūtras (Guṇaka-samuccaya etc.) cover “Leibnitz’s theorem, Maclaurin’s theorem, Taylor’s theorem etc.”, but gives only “a very brief sketch”. Its examples go up to (x+1)(x+2)(x+3)(x+4)(x+5) with D₁ = Σabcd, D₂ = 2!Σabc, D₃ = 3!Σab, D₄ = 4!Σa.</p>`,
  ex:{r:[1,2,3]}, ph:'Random only — press Random', noParse:true,
  rand(){ const n=pick([3,3,4]); const r=[]; while(r.length<n){ const v=nz2(-5,6); if(!r.includes(v)) r.push(v); } return {r}; },
  parse(){ throw 'Use Random.'; },
  E:P=>P.r.reduce((acc,a)=>polyMul(acc,[1,a]),[1]),
  deriv:cs=>{ const n=cs.length-1; return cs.slice(0,-1).map((c,i)=>c*(n-i)); },
  q(P){ return `E = ${P.r.map(a=>bin(1,a)).join('')}<small>value of D₁ at x = 1?</small>`; },
  ans(P){ return String(polyEval(this.deriv(this.E(P)),1)); },
  check(P,v){ return parseNum(v)===+this.ans(P); },
  gen(P){
    const s=new Sc(), r=P.r, n=r.length, E=this.E(P), facs=r.map(a=>bin(1,a));
    s.put('E',0,0,`E = ${facs.join('')} = ${fmtPoly(E)}`);
    s.snap(`E is a product of ${n} binomial factors.`);
    let row=1.3, D=E, fact=1;
    for(let k=1;k<n;k++){
      fact*=k; D=this.deriv(D);
      /* products leaving out k factors */
      const combos=[]; const pick_=(start,chosen)=>{ if(chosen.length===n-k){ combos.push(chosen.slice()); return; } for(let i=start;i<n;i++){ chosen.push(i); pick_(i+1,chosen); chosen.pop(); } }; pick_(0,[]);
      const txt=combos.map(c=>c.map(i=>facs[i]).join('')).join(' + ');
      let sum=[0]; combos.forEach(c=>{ const pr=c.reduce((acc,i)=>polyMul(acc,[1,r[i]]),[1]); const L=Math.max(sum.length,pr.length); const a=Array(L-sum.length).fill(0).concat(sum), b=Array(L-pr.length).fill(0).concat(pr); sum=a.map((x,i)=>x+b[i]); });
      const scaled=sum.map(c=>c*fact), ok=scaled.length===D.length&&scaled.every((c,i)=>c===D[i]);
      s.put('D'+k,0,row,`D${['','₁','₂','₃','₄','₅'][k]} = ${fact>1?fact+'·':''}[${combos.length>6?combos.slice(0,6).map(c=>c.map(i=>facs[i]).join('')).join(' + ')+' + …':txt}]`,'work').hl('D'+k);
      s.put('V'+k,0,row+1,`   = ${fmtPoly(scaled)}`,'res');
      s.snap(`D${['','₁','₂','₃','₄'][k]}: ${k===1?'leave out one factor at a time and add':`leave out ${k} factors at a time, add, and multiply by ${k}! = ${fact}`} → <b>${fmtPoly(scaled)}</b>${ok?'':' <span class="no">mismatch with the power rule</span>'}.`);
      row+=2.2;
    }
    fact*=n;
    s.put('Dn',0,row,`D${['','₁','₂','₃','₄','₅'][n]} = ${n}! = ${fact}`,'ans');
    s.snap(`Finally D${['','₁','₂','₃','₄'][n]} = ${n}! = <span class="ok">${fact}</span>. Each line agrees with differentiating ${fmtPoly(E)} term by term.`);
    return s.fr;
  }
});

def({
  id:'repeated', chn:22, o:20, su:[16,9],
  name:'Repeated factors detected by the first differential',
  sutra:{kind:'SŪTRAS 16 & 9', dev:'गुणकसमुच्चयः · चलनकलनाभ्याम्', iast:'Guṇakasamuccayaḥ · Calana-kalanābhyām', en:'Factors and differentials together'},
  short:'4x³ − 12x² − 15x − 4: D₁ = 12x² − 24x − 15 = 3(2x − 5)(2x + 1); (2x + 1) also divides E, so E = (2x + 1)²(x − 4).',
  brief:`<ol><li>Differentiate: D₁.</li><li>Factorise D₁ (it is one degree lower — usually easy).</li><li>A factor of D₁ that also divides E is a <b>repeated</b> factor of E.</li><li>Divide it out twice (or use first-by-first, last-by-last) for the rest.</li></ol>`,
  why:`<p>If E = (x − r)²·G then D₁ = 2(x − r)G + (x − r)²G′ = (x − r)(2G + (x − r)G′). So a squared factor of E survives as a factor of D₁ — while a single factor generally does not.</p>`,
  hist:`<p>The second half of Ch. XXII: “the use of successive differentials for the detection of repeated factors”, e.g. x⁴ − 6x³ + 13x² − 24x + 36 = (x − 3)²(x² + 4) and 2x⁴ − 23x³ + 84x² − 80x − 64.</p>`,
  ex:{p:2,q:1,r:1,s:-4}, ph:'Random only — press Random', noParse:true,
  rand(){ let p,q,r,s; do{ p=pick([1,1,2,3]); q=nz2(-5,5); r=pick([1,1,2]); s=nz2(-6,6); }while(gcd(p,Math.abs(q))!==1||gcd(r,Math.abs(s))!==1||p*s===r*q); return {p,q,r,s}; },
  parse(){ throw 'Use Random.'; },
  E:P=>polyMul(polyMul([P.p,P.q],[P.p,P.q]),[P.r,P.s]),
  q(P){ return `${fmtPoly(this.E(P))}<small>factorise — it has a repeated factor</small>`; },
  ans:P=>`${binF2(P.p,P.q)}²${binF2(P.r,P.s)}`,
  check(P,v){ const E=this.E(P); return /\(/.test(v)&&sameExpr(v,e=>polyEval(E,e.x)); },
  gen(P){
    const s=new Sc(), E=this.E(P), D1=E.slice(0,-1).map((c,i)=>c*(E.length-1-i));
    s.put('E',0,0,`E = ${fmtPoly(E)}`); s.snap(`Factorise E. Suspect a repeated factor? Differentiate.`);
    s.put('D',0,1.3,`D₁ = ${fmtPoly(D1)}`,'work').hl('D'); s.snap(`<b>Calana-kalana</b>: D₁ = ${fmtPoly(D1)}.`);
    const other=polyDiv(D1,[P.p,P.q]).q, g=Math.abs(other.reduce((a,c)=>gcd(a,c),0))||1, oth=other.map(c=>c/g);
    s.put('Df',0,2.4,`D₁ = ${g>1?g:''}${binF2(P.p,P.q)}(${fmtPoly(oth)})`,'res').hl('Df');
    s.snap(`Factorise D₁ (a quadratic): <b>${g>1?g:''}${binF2(P.p,P.q)}(${fmtPoly(oth)})</b>.`);
    s.put('T',0,3.5,`test ${binF2(P.p,P.q)} on E:  E(${fracStr(frac(-P.q,P.p))}) = 0 ✓`,'work').hl('T');
    s.snap(`Which factor of D₁ also divides E? ${binF2(P.p,P.q)} does (E is 0 at x = ${fracStr(frac(-P.q,P.p))}) — so it is a <b>repeated</b> factor of E.`);
    const ok=polyDiv(polyDiv(E,[P.p,P.q]).q,[P.p,P.q]).q.every((c,i)=>c===[P.r,P.s][i]);
    s.put('A',0,4.7,`E = ${binF2(P.p,P.q)}²${binF2(P.r,P.s)}`,'ans');
    s.snap(`Divide it out twice (first-by-first: ${P.p*P.p*P.r}x³ ÷ ${P.p*P.p}x² = ${termStr(P.r,1,'x',true)}; last-by-last: ${P.q*P.q*P.s} ÷ ${P.q*P.q} = ${P.s}): <span class="ok">E = ${binF2(P.p,P.q)}²${binF2(P.r,P.s)}</span>.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});
function binF2(p,q){ return `(${p===1?'':p===-1?M:p}x ${sp(q)})`; }

/* ---------- Ch. XXIII: partial fractions ---------- */
def({
  id:'partfrac', chn:23, o:10, su:[4],
  name:'Partial fractions — cover the factor, put in its root',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”'},
  short:'(3x² + 12x + 11)/((x+1)(x+2)(x+3)): A = value at x = −1 of the rest = (3 − 12 + 11)/((1)(2)) = 1, and so on.',
  brief:`<p>For a fraction over distinct factors (x − a)(x − b)(x − c):</p>
    <ol><li>To find the coefficient over (x − a): <b>cover up</b> that factor and put x = a into everything that is left.</li><li>Repeat for each factor — no simultaneous equations at all.</li></ol>
    <p class="note">For a repeated factor such as (x − a)²: write N = A + B(x − a); x = a gives A at once, and x = 0 (or comparing coefficients) gives B.</p>`,
  why:`<div class="eqn">N(x) = A(x−b)(x−c) + B(x−a)(x−c) + C(x−a)(x−b)</div><p>Putting x = a kills the B and C terms, leaving N(a) = A(a − b)(a − c). That is precisely “cover up (x − a) and substitute x = a”. Parāvartya — make the factor zero by transposing its constant.</p>`,
  hist:`<p>Ch. XXIII shows the textbook way first — equate coefficients, solve three simultaneous equations — and then: “all this work can be done mentally; and all the laborious work of deriving and solving three simultaneous equations is totally avoided”. In English-language teaching the same trick is known as Heaviside’s cover-up method (Oliver Heaviside, c. 1890s).</p>`,
  ex:{v:3,a:-1,b:-2,c:-3,A:1,B:1,C:1}, ph:'Random only — press Random', noParse:true,
  rand(){ if(Math.random()<.25){ return {v:'rep',a:nz2(-4,4),A:nz2(-6,6),B:nz2(-4,4)}; }
    const n=pick([2,3]); const roots=[]; while(roots.length<n){ const v=nz2(-5,5); if(!roots.includes(v)) roots.push(v); }
    return {v:n,a:roots[0],b:roots[1],c:roots[2],A:nz2(-5,5),B:nz2(-5,5),C:n===3?nz2(-5,5):0}; },
  parse(){ throw 'Use Random.'; },
  num(P){ if(P.v==='rep') return [P.B, P.A-P.B*P.a];
    const fs=P.v===3?[P.a,P.b,P.c]:[P.a,P.b], cs=P.v===3?[P.A,P.B,P.C]:[P.A,P.B]; let N=[0];
    fs.forEach((r,i)=>{ const others=fs.filter((_,j)=>j!==i).reduce((acc,t)=>polyMul(acc,[1,-t]),[1]); const term=others.map(c=>c*cs[i]); const L=Math.max(N.length,term.length); const a=Array(L-N.length).fill(0).concat(N), b=Array(L-term.length).fill(0).concat(term); N=a.map((x,k)=>x+b[k]); });
    while(N.length>1&&N[0]===0) N.shift(); return N; },
  den(P){ return P.v==='rep'? `${bin(1,-P.a)}²` : (P.v===3?[P.a,P.b,P.c]:[P.a,P.b]).map(r=>bin(1,-r)).join(''); },
  q(P){ return `(${fmtPoly(this.num(P))}) / ${this.den(P)}<small>the numerator over ${P.v==='rep'?bin(1,-P.a)+'²':bin(1,-P.a)}?</small>`; },
  ans:P=>String(P.A),
  check(P,v){ return parseNum(v)===P.A; },
  gen(P){
    const s=new Sc(), N=this.num(P);
    s.put('E',0,0,`(${fmtPoly(N)}) / ${this.den(P)}`);
    if(P.v==='rep'){
      s.snap(`A repeated factor ${bin(1,-P.a)}². Write ${fmtPoly(N)} = A + B${bin(1,-P.a)}.`);
      s.put('a',0,1.3,`x = ${P.a}:  A = ${fmtPoly(N)} at ${P.a} = ${polyEval(N,P.a)}`,'work').hl('a');
      s.snap(`<b>Parāvartya</b>: make the factor zero, x = ${P.a}: A = <b>${polyEval(N,P.a)}</b>.`);
      s.put('b',0,2.4,`x = 0:  A ${sp(-P.a)}B = ${N[1]}  ⇒  B = ${P.B}`,'work').hl('b');
      s.snap(`It is an identity, true for every x — so put x = 0: A − (${P.a})B = ${N[1]}, giving B = <b>${P.B}</b>.`);
      s.put('A',0,3.6,`= ${P.A}/${bin(1,-P.a)}² ${sp(P.B)}/${bin(1,-P.a)}`,'ans');
      const x=2.37, ok=Math.abs(polyEval(N,x)/(x-P.a)**2-(P.A/(x-P.a)**2+P.B/(x-P.a)))<1e-9;
      s.snap(`<span class="ok">${P.A}/${bin(1,-P.a)}² ${sp(P.B)}/${bin(1,-P.a)}</span>.`+(ok?'':' <span class="no">mismatch</span>'));
      return s.fr;
    }
    const fs=P.v===3?[P.a,P.b,P.c]:[P.a,P.b], cs=P.v===3?[P.A,P.B,P.C]:[P.A,P.B], L=['A','B','C']; let allOk=true;
    s.snap(`Split into ${fs.map((r,i)=>`${L[i]}/${bin(1,-r)}`).join(' + ')}.`);
    fs.forEach((r,i)=>{
      const others=fs.filter((_,j)=>j!==i), den=others.reduce((acc,t)=>acc*(r-t),1), val=polyEval(N,r);
      s.put('c'+i,0,1.3+i*1.1,`${L[i]}: cover ${bin(1,-r)}, x = ${r}:  ${val} / (${others.map(t=>`(${r} ${sp(-t)})`).join('')}) = ${val/den}`,'work').hl('c'+i);
      s.snap(`Cover up ${bin(1,-r)} and put x = ${r} in the rest: ${L[i]} = ${val} ÷ ${den} = <b>${val/den}</b>.`);
      if(val/den!==cs[i]) allOk=false;
    });
    const ans=fs.map((r,i)=>`${i?(cs[i]<0?' '+M+' ':' + '):(cs[i]<0?M:'')}${Math.abs(cs[i])}/${bin(1,-r)}`).join('');
    s.put('A',0,1.3+fs.length*1.1+0.3,`= ${ans}`,'ans');
    s.snap(`<span class="ok">${ans}</span> — every coefficient found mentally.`+(allOk?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XXIV: integration by partial fractions ---------- */
def({
  id:'integrate', chn:24, o:10, su:[1,4],
  name:'Integration by partial fractions',
  sutra:{kind:'SŪTRAS 1 & 4', dev:'एकाधिकेन पूर्वेण · परावर्त्य योजयेत्', iast:'Ekādhikena Pūrveṇa · Parāvartya Yojayet', en:'Raise the index by one (and divide by it); split by transposing'},
  short:'∫ 3x² dx = x³: add one to the index and divide by it. ∫ (px + q)/((x−a)(x−b)) dx: split, then each piece gives a logarithm.',
  brief:`<ol><li><b>Powers</b>: to integrate xⁿ, add one to the index — its <i>ekādhika</i> — and divide by the new index: xⁿ⁺¹/(n + 1).</li><li><b>Fractions</b>: split into partial fractions by the cover-up rule (Ch. XXIII).</li><li>Each A/(x − a) integrates to A·log(x − a).</li></ol>`,
  why:`<p>Differentiating xⁿ⁺¹ gives (n + 1)xⁿ, so integration reverses it by dividing by n + 1. And d/dx log(x − a) = 1/(x − a), so a sum of simple fractions integrates term by term into a sum of logarithms.</p>`,
  hist:`<p>Ch. XXIV opens with a sketch of integration “as dealt with by the Ekādhika Sūtra”: “in order to find the integral of a power of x, we add unity to the pūrva (i.e. the original index) and divide…”. Its worked examples are ∫(7x − 1)/(6x² − 5x + 1) dx and ∫(x² − 7x + 1)/(x³ − 6x² + 11x − 6) dx.</p>`,
  ex:{a:1,b:2,A:2,B:3,n:2,k:3}, ph:'Random only — press Random', noParse:true,
  rand(){ let a,b; do{ a=nz2(-5,5); b=nz2(-5,5); }while(a===b); return {a,b,A:nz2(-5,5),B:nz2(-5,5),n:ri(1,4),k:nz2(-5,6)}; },
  parse(){ throw 'Use Random.'; },
  num:P=>[P.A+P.B, -(P.A*P.b+P.B*P.a)],
  q(P){ return `∫ (${fmtPoly(this.num(P))}) / (${bin(1,-P.a)}${bin(1,-P.b)}) dx<small>coefficient of log(x ${sp(-P.a)})?</small>`; },
  ans:P=>String(P.A),
  check(P,v){ return parseNum(v)===P.A; },
  gen(P){
    const s=new Sc(), N=this.num(P), {a,b,A,B,n,k}=P;
    s.put('w',0,0,`warm-up: ∫ ${k*(n+1)}x${sup(n)} dx`,'work');
    s.snap(`First the principle. Integrate ${k*(n+1)}x${sup(n)}.`);
    s.put('w2',0,1.1,`index ${n} → its ekādhika ${n+1};  ${k*(n+1)}x${sup(n+1)} ÷ ${n+1} = ${termStr(k,n+1,'x',true)}`,'work').hl('w2');
    s.snap(`<b>Ekādhikena Pūrveṇa</b>: raise the index ${n} to one more, ${n+1}, and divide by it — <b>${termStr(k,n+1,'x',true)}</b> (+ a constant).`);
    s.del('w','w2');
    s.put('E',0,0,`∫ (${fmtPoly(N)}) / (${bin(1,-a)}${bin(1,-b)}) dx`);
    s.snap(`Now a fraction. Split it first.`);
    s.put('A',0,1.2,`cover ${bin(1,-a)}, x = ${a}:  A = ${polyEval(N,a)}/(${a} ${sp(-b)}) = ${A}`,'work').hl('A');
    s.put('B',0,2.3,`cover ${bin(1,-b)}, x = ${b}:  B = ${polyEval(N,b)}/(${b} ${sp(-a)}) = ${B}`,'work').hl('B');
    s.snap(`<b>Parāvartya</b> cover-up: A = <b>${A}</b>, B = <b>${B}</b>.`);
    s.put('S',0,3.5,`= ∫ ${A}/${bin(1,-a)} dx ${sp(B)}·∫ 1/${bin(1,-b)} dx`,'res').hl('S');
    s.snap(`So the integrand is ${A}/${bin(1,-a)} ${sp(B)}/${bin(1,-b)}.`);
    const ok=(polyEval(N,a)/(a-b)===A)&&(polyEval(N,b)/(b-a)===B);
    s.put('R',0,4.7,`= ${A} log(x ${sp(-a)}) ${sp(B)} log(x ${sp(-b)}) + C`,'ans');
    s.snap(`Each 1/(x − r) integrates to log(x − r): <span class="ok">${A} log(x ${sp(-a)}) ${sp(B)} log(x ${sp(-b)}) + C</span>.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. XXV: the Kaṭapayādi code ---------- */
const KTP={k:1,kh:2,g:3,gh:4,'ṅ':5,c:6,ch:7,j:8,jh:9,'ñ':0,'ṭ':1,'ṭh':2,'ḍ':3,'ḍh':4,'ṇ':5,t:6,th:7,d:8,dh:9,n:0,p:1,ph:2,b:3,bh:4,m:5,y:1,r:2,l:3,v:4,'ś':5,'ṣ':6,s:7,h:8};
const KTP_V=['ai','au','ā','ī','ū','ṛ','ṝ','ḷ','a','i','u','e','o'];
function ktpSyllables(word){
  const w=word.toLowerCase().normalize('NFC').replace(/[^a-zāīūṛṝḷṅñṭḍṇśṣṃḥ]/g,'');
  const out=[]; let i=0, cons=[];
  const consAt=j=>{ for(const L of [2,1]){ const t=w.slice(j,j+L); if(t in KTP){ if(L===1&&(t==='k'||t==='g'||t==='c'||t==='j'||t==='ṭ'||t==='ḍ'||t==='t'||t==='d'||t==='p'||t==='b')&&w[j+1]==='h') continue; return t; } } return null; };
  while(i<w.length){
    const v=KTP_V.find(v=>w.startsWith(v,i));
    if(v){ let j=i+v.length; let tail=''; while(j<w.length&&(w[j]==='ṃ'||w[j]==='ḥ')){ tail+=w[j]; j++; }
      out.push({text:cons.join('')+v+tail, cons:cons.slice(), digit: cons.length? KTP[cons[cons.length-1]] : 0}); cons=[]; i=j; continue; }
    const c=consAt(i); if(c){ cons.push(c); i+=c.length; continue; }
    i++;
  }
  return out;
}
const PI_VERSE=['gopībhāgya','madhuvrāta','śṛṅgiśo','dadhisandhiga','khalajīvita','khātāva','galahālā','rasandhara'];
const KTP_WORDS=['kanakāṅgī','ratnāṅgī','gānamūrti','vanaspati','mānavatī','tānarūpi','senāvatī','hanumatoḍi','dhenukā','nāṭakapriyā','kīravāṇi','kharaharapriyā','gaurīmanoharī','harikāmbhojī','dhīraśaṅkarābharaṇam','mecakalyāṇī','sūryakāntam','calanāṭa'];
def({
  id:'katapayadi', chn:25, o:10,
  name:'The Kaṭapayādi code — numbers hidden in words (and π in a verse)',
  nosutra:'A cipher, not a sūtra: consonants stand for digits so that numbers can be memorised as verse.',
  short:'ka = 1, kha = 2 … ; ṭa = 1 …; pa = 1 …; ya = 1 … Read the consonant before each vowel. “gopībhāgya madhuvrāta …” = 3141592653589793…',
  brief:`<p>Each consonant stands for a digit; vowels only carry it:</p>
    <ul><li><b>ka</b> kha ga gha ṅa ca cha ja jha ña = 1 2 3 4 5 6 7 8 9 0</li><li><b>ṭa</b> ṭha ḍa ḍha ṇa ta tha da dha na = 1 … 9 0</li><li><b>pa</b> pha ba bha ma = 1 … 5</li><li><b>ya</b> ra la va śa ṣa sa ha = 1 … 8</li></ul>
    <p>In a conjunct (e.g. <i>ndh</i>, <i>gy</i>) only the <b>last</b> consonant counts; a vowel with no consonant is 0. Hence the name: ka-ṭa-pa-ya-ādi, “starting with ka, ṭa, pa, ya”.</p>`,
  why:`<p>It is a substitution cipher with many letters per digit, so an author can choose syllables that form meaningful words. A single verse can carry a long number and a second meaning at once — Tīrtha’s π verse is also read as a hymn to Kṛṣṇa and to Śiva.</p>`,
  hist:`<p>Ch. XXV explains the code; Ch. XL quotes the verse <i>gopībhāgyamadhuvrāta-śṛṅgiśodadhisandhiga | khalajīvitakhātāva galahālārasandhara ||</i> and reads it as π/10 = 0.31415926535897932384626433832792 — correct to 31 places. Kaṭapayādi is attested in Kerala astronomy from at least the 7th century, and it numbers the 72 Mēḷakarta rāgas of Carnatic music — there the first two syllables are read in <i>reverse</i> (“aṅkānāṁ vāmato gatiḥ”, numbers run leftwards): ka-na = 1, 0 → 01 → kanakāṅgī is rāga 1; me-ca = 5, 6 → 65 → Mecakalyāṇī.</p>`,
  ex:{verse:true}, ph:'any IAST word, e.g. kharaharapriyā',
  rand(){ return Math.random()<.25? {verse:true} : {word:pick(KTP_WORDS)}; },
  parse(str){ const w=String(str).trim(); if(!ktpSyllables(w).length) throw 'Type a word in IAST transliteration, e.g. kanakāṅgī.'; if(ktpSyllables(w).length>14) throw 'Keep it under 14 syllables.'; return {word:w}; },
  prand(){ return {word:pick(KTP_WORDS)}; },
  q(P){ return `${P.word}<small>digits of its first two syllables, as written (left to right)</small>`; },
  ans(P){ return ktpSyllables(P.word).slice(0,2).map(x=>x.digit).join(''); },
  check(P,v){ return normIn(v)===this.ans(P); },
  gen(P){
    const s=new Sc();
    const rows=P.verse? PI_VERSE : [P.word];
    let all='';
    rows.forEach((w,ri_)=>{
      const sy=ktpSyllables(w), y=ri_*1.9;
      let x=0; const keys=[];
      sy.forEach((t,i)=>{ s.put(`s${ri_}_${i}`,x,y,t.text,'n'); keys.push([x,t]); x+=len(t.text)+0.8; });
      if(ri_===0) s.snap(P.verse? `Tīrtha’s verse, one quarter at a time: <i>${PI_VERSE.join(' ')}</i>.` : `Decode <b>${w}</b>. First split it into syllables.`);
      keys.forEach(([kx,t],i)=>{ const last=t.cons[t.cons.length-1];
        s.hl(`s${ri_}_${i}`).put(`d${ri_}_${i}`,kx+len(t.text)/2-0.5,y+0.85,t.digit,'key');
        if(!P.verse || (ri_===0&&i<3)) s.snap(`<b>${t.text}</b>: ${t.cons.length? (t.cons.length>1?`conjunct ${t.cons.join('+')} — the last consonant, <b>${last}</b>,`:`<b>${last}</b>`)+` stands for <b>${t.digit}</b>` : 'a bare vowel counts as 0'}.`);
        s.set(`d${ri_}_${i}`,{c:'res'}); all+=t.digit; });
      if(P.verse) s.snap(`<i>${w}</i> → <b>${sy.map(t=>t.digit).join('')}</b>`);
    });
    if(P.verse){
      const ok=all==='31415926535897932384626433832792';
      s.put('pi',0,rows.length*1.9+0.2,`π/10 = 0.${all}`,'ans');
      s.snap(`All together: <span class="ok">π/10 = 0.${all}</span>. Tīrtha calls it 32 places; the first <b>31</b> agree with π (…8327|950…), the last syllable giving 2 where π continues 5.`+(ok?'':' <span class="no">mismatch</span>'));
    } else {
      const sy=ktpSyllables(P.word), two=sy.slice(0,2).map(t=>t.digit).join('');
      s.put('n',0,2.2,`digits: ${sy.map(t=>t.digit).join('')}    first two reversed: ${two.split('').reverse().join('')}`,'ans');
      s.snap(`Digits: <span class="ok">${sy.map(t=>t.digit).join('')}</span>. If this is a Mēḷakarta rāga name, its first two syllables read <i>backwards</i> (${two} → ${two.split('').reverse().join('')}) give its number${KTP_WORDS.includes(P.word)?` — <b>${P.word}</b> is rāga ${+two.split('').reverse().join('')}`:''}.`);
    }
    return s.fr;
  }
});
