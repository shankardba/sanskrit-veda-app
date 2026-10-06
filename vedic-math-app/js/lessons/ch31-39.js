'use strict';
/* Chapters XXXI–XXXIX: squares, cubing, general square & cube roots, cube roots by argumentation,
   Pythagoras (animated rearrangement), Apollonius, and analytical conics */

const nz4=(a,b)=>{ let v; do{ v=ri(a,b); }while(v===0); return v; };
const duplex = xs => { const m=xs.length; let s=0; for(let i=0,j=m-1;i<j;i++,j--) s+=2*xs[i]*xs[j]; if(m%2) s+=xs[(m-1)/2]**2; return s; };
const SUBD=['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];

/* ---------- XXXI: sum & difference of squares ---------- */
def({
  id:'squares', chn:31, o:10,
  name:'Pythagorean triples from any number — and differences of squares',
  nosutra:'Tīrtha gives a rule here but names no sūtra.',
  short:'7² = 49 = 24 + 25, so 7² + 24² = 25². Any odd number’s square splits into two consecutive numbers — the other two sides.',
  brief:`<p><b>Sum of two squares</b> (for an odd number a):</p><ol><li>Square it and split the square into two <b>consecutive</b> numbers N and N + 1 (49 = 24 + 25).</li><li>Then a² + N² = (N + 1)² — a right triangle with sides a, N, N + 1.</li><li>For an even number, halve until odd, use the rule, and double back.</li></ol>
    <p><b>Difference of two squares</b>: any number that is a product x·y (x, y both odd or both even) is ((x + y)/2)² − ((x − y)/2)².</p>`,
  why:`<div class="eqn">(N + 1)² − N² = 2N + 1</div><p>so if a² = 2N + 1 — i.e. a² is split into N and N + 1 — then a² + N² = (N + 1)². In Tīrtha’s fraction form, D² + N² = (N + 1)² with D = 2n + 1, N = 2n(n + 1).</p><p>And a² − b² = (a + b)(a − b), so any factorisation x·y with x + y even gives a = (x + y)/2, b = (x − y)/2.</p>`,
  hist:`<p>Ch. XXXI prepares for Pythagoras (and the trigonometric identities sin² + cos² = 1 etc.). It notes that differences of squares are easy — “even if the given number is a prime number … 7 = 7 × 1” — while sums of squares are “a tough one”. This odd-number rule for triples goes back to the Pythagoreans; the Śulba-sūtras list triples such as (5, 12, 13) and (8, 15, 17).</p>`,
  ex:{a:7}, ph:'any number, e.g. 9 or 35',
  rand(){ return {a: Math.random()<.7 ? 2*ri(1,30)+1 : 2*ri(2,20)}; },
  parse(str){ const a=+normIn(str); if(!Number.isInteger(a)||a<3||a>999) throw 'Enter a whole number from 3 to 999.'; if((a&(a-1))===0&&a<4) throw 'Pick something bigger.'; return {a}; },
  triple(a){ let j=0, o=a; while(o%2===0){ o/=2; j++; } if(o===1){ const sc=a/4; return {o:4,scale:sc,legs:[a,3*sc],hyp:5*sc,base:[4,3,5]}; } const N=(o*o-1)/2, sc=2**j; return {o,scale:sc,legs:[a,N*sc],hyp:(N+1)*sc,base:[o,N,N+1]}; },
  q(p){ return `${p.a}² + ? ² = ( ? + 1 )²<small>the other leg of a right triangle with side ${p.a} (the rule’s answer)</small>`; },
  ans(p){ return String(this.triple(p.a).legs[1]); },
  check(p,v){ return parseNum(v)===this.triple(p.a).legs[1]; },
  gen({a}){
    const s=new Sc(), T=this.triple(a), [o,N]=T.base;
    if(T.scale>1){ s.put('h',0,0,`${a} is even: ${a} = ${T.scale} × ${o}`,'work'); s.snap(`${a} is even — work with ${o} and multiply back by ${T.scale} at the end.`); }
    const y0=T.scale>1?1.2:0;
    s.put('sq',0,y0,`${o}² = ${o*o}`); s.snap(`Square ${o}: <b>${o*o}</b>.`);
    if(o===4){ s.put('sp',0,y0+1.1,`4 is a power of two: use the triple 3, 4, 5`,'work'); s.snap(`A power of two has no odd part to split; start from 3, 4, 5.`); }
    else { s.put('sp',0,y0+1.1,`${o*o} = ${N} + ${N+1}`,'work').hl('sp'); s.snap(`Split it into two consecutive numbers: ${o*o} = <b>${N}</b> + <b>${N+1}</b>.`); }
    s.put('tr',0,y0+2.2,`${o}² + ${N}² = ${N+1}²   (${o*o} + ${N*N} = ${(N+1)**2})`,'res').hl('tr');
    s.snap(`So ${o}² + ${N}² = ${N+1}² — check: ${o*o} + ${N*N} = ${(N+1)**2}.`);
    /* draw the triangle */
    const u=Math.min(220/Math.max(o,N),26), gx=520, gy=10;
    s.shape('tri',{pts:[[0,0],[N*u,0],[0,-o*u]].map(([x,y])=>[x,y]),tf:{x:gx,y:gy+o*u+20,r:0},c:'g1'});
    s.putp('la',gx-14,gy+o*u/2+20,String(o*T.scale),'lbl').putp('lb',gx+N*u/2,gy+o*u+42,String(N*T.scale),'lbl').putp('lc',gx+N*u/2+12,gy+o*u/2+4,String((N+1)*T.scale),'lbl');
    const ok=a*a+T.legs[1]**2===T.hyp**2;
    s.put('A',0,y0+3.4,`${a}, ${T.legs[1]}, ${T.hyp}`,'ans');
    s.snap(`<span class="ok">${a}² + ${T.legs[1]}² = ${T.hyp}²</span>${T.scale>1?` (×${T.scale})`:''} — a whole-number right triangle.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXXII: cubing by Ānurūpya ---------- */
def({
  id:'cubing', chn:32, o:10, sub:[1],
  name:'Cubing two-digit numbers — the proportionate row',
  sutra:{kind:'SUB-SŪTRA 1', dev:'आनुरूप्येण', iast:'Ānurūpyeṇa', en:'“Proportionately”'},
  short:'12³: write 1, 2, 4, 8 (each × 2/1); double the middle two (4, 8) underneath; add with carries → 1728.',
  brief:`<p>For a two-digit number ab:</p>
    <ol><li>Write a³, then keep multiplying by the ratio b : a — a³, a²b, ab², b³ (the last is the cube of b).</li><li>Under the two middle terms write <b>twice</b> them (2a²b and 2ab²).</li><li>Add the columns from the right, carrying as usual.</li></ol>`,
  why:`<div class="eqn">(10a + b)³ = a³·1000 + 3a²b·100 + 3ab²·10 + b³</div><p>The top row supplies a²b and ab² once; the row underneath adds them twice more — three times in all. The four terms of the top row are in geometric proportion a : b, which is the Ānurūpya (proportion) the sūtra refers to.</p>`,
  hist:`<p>Ch. XXXII calls this “new material”: someone who knows only the cubes of 1 to 10 can go beyond. “Almost every mathematical worker knows this; but very few people apply it! This is the whole tragedy and the pathos of the situation!” The same chapter does fourth powers with the binomial coefficients 1, 4, 6, 4, 1.</p>`,
  ex:{n:12}, ph:'any two-digit number, e.g. 37',
  rand(){ return {n:ri(11,99)}; },
  parse(str){ const n=+normIn(str).replace(/(\^3|³)$/,''); if(!(n>=10&&n<=99)) throw 'Use a two-digit number.'; return {n}; },
  q:p=>`${p.n}³`, ans:p=>String(p.n**3),
  gen({n}){
    const s=new Sc(), a=Math.floor(n/10), b=n%10, row=[a**3,a*a*b,a*b*b,b**3], dbl=[0,2*a*a*b,2*a*b*b,0], SP=5, cx=i=>2+i*SP;
    s.put('E',0,-1.2,`${n}³:  a = ${a}, b = ${b}`,'lbl');
    row.forEach((v,i)=>cput2(s,'r'+i,cx(i),0,v,'n'));
    s.snap(`Start with ${a}³ = ${row[0]}, then keep multiplying by ${b}/${a}: ${row.join(', ')}. The last is ${b}³ — <b>Ānurūpyeṇa</b>.`);
    [1,2].forEach(i=>cput2(s,'d'+i,cx(i),1,dbl[i],'dev')); s.hl('d1','d2');
    s.seg('rule',0,1.6,cx(3)+3,1.6);
    s.snap(`Under the middle two write twice them: ${dbl[1]} and ${dbl[2]}.`);
    const col=row.map((v,i)=>v+dbl[i]); let carry=0; const out=[];
    for(let i=3;i>=0;i--){ const t=col[i]+carry; const dg= i===0? t : t%10; carry= i===0?0:Math.floor(t/10); out.unshift(dg); cput2(s,'s'+i,cx(i),2.3,dg,'res').hl('s'+i);
      s.snap(`Column ${4-i}: ${col[i]}${t!==col[i]?` + carry ${t-col[i]}`:''} = ${t} → write ${i===0?t:dg}${carry?`, carry ${carry}`:''}.`); }
    const res=Number(out.join('')); s.put('A',0,3.6,`${n}³ = ${res}`,'ans');
    s.snap(`<span class="ok">${n}³ = ${res}</span>.`+(res===n**3?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});
function cput2(s,k,cx,y,t,c='n',o={}){ return s.put(k,cx-len(String(t))/2,y,t,c,o); }

/* ---------- XXXII: cubing by Yāvadūnam ---------- */
def({
  id:'yavcube', chn:32, o:20, su:[10],
  name:'Cubing numbers near a base — Yāvadūnam',
  sutra:{kind:'SŪTRA 10 OF 16', dev:'यावदूनम्', iast:'Yāvadūnam', en:'“Whatever the extent of its deficiency”'},
  short:'104³: 104 + 2×4 = 112 | new surplus 12 × 4 = 48 | 4³ = 64 → 1124864.',
  brief:`<p>For a number near 10, 100, 1000 … with surplus (or deficit) d:</p>
    <ol><li>Left part: the number plus <b>twice</b> d.</li><li>Middle part: the new surplus (3d) × the original d — i.e. 3d².</li><li>Right part: d³.</li><li>Each of the middle and right parts gets as many digits as the base has zeros; carry or borrow (vinculum) as needed.</li></ol>`,
  why:`<div class="eqn">(B + d)³ = B³ + 3B²d + 3Bd² + d³
          = B²·(B + 3d) + B·3d² + d³</div><p>and B + 3d is the number plus 2d. Each power of B shifts a part left by the base’s zeros.</p>`,
  hist:`<p>Ch. XXXII: “The same Yāvadūnam Sūtra can … be applied for cubing too. The only difference is that we take here not the deficit or the surplus but exactly twice the deficit or the surplus”. Its examples run from 103³ = 109/27/27 to 999998³ = 999994/000011/999992 (with vinculums).</p>`,
  ex:{a:104}, ph:'e.g. 104, 96, 1005',
  rand(){ const r=Math.random(); return {a: r<.2? ri(7,13) : r<.75? ri(91,109) : ri(993,1008)}; },
  parse(str){ const a=+normIn(str).replace(/(\^3|³)$/,''); if(!Number.isInteger(a)) throw 'Enter a whole number.'; const B=nearestBase(a,a); if(Math.abs(a-B)>B/5) throw 'Pick a number close to 10, 100, 1000 …'; return {a}; },
  q:p=>`${p.a}³`, ans:p=>String(BigInt(p.a)**3n),
  gen({a}){
    const s=new Sc(), B=nearestBase(a,a), k=Math.round(Math.log10(B)), d=a-B;
    s.put('lbl',0,-1.2,`base ${B}, ${d>=0?'surplus':'deficit'} ${Math.abs(d)}`,'lbl');
    s.put('E',0,0,`${a}³`); s.snap(`Cube ${a}: it is ${Math.abs(d)} ${d>=0?'above':'below'} ${B}.`);
    const L=a+2*d, Mid=3*d*d, Rt=d**3;
    s.put('L',0,1.2,`${a} ${sp(2*d)} = ${L}`,'work').hl('L'); s.snap(`Left part: add <b>twice</b> the ${d>=0?'surplus':'deficit'}: ${a} ${sp(2*d)} = <b>${L}</b>.`);
    s.put('M',0,2.2,`${L-B>=0?L-B:M+Math.abs(L-B)} × ${d} = ${Mid}`,'work').hl('M'); s.snap(`Middle: the new ${d>=0?'surplus':'deficit'} ${L-B} times the original ${d}: <b>${Mid}</b> (= 3d²).`);
    s.put('R',0,3.2,`${d}³ = ${Rt}`,'work').hl('R'); s.snap(`Right: the cube of ${d}: <b>${Rt}</b>${Rt<0?' — negative, a vinculum part':''}.`);
    /* combine with carries: value = L*B^2 + Mid*B + Rt */
    const val=BigInt(L)*BigInt(B)**2n+BigInt(Mid)*BigInt(B)+BigInt(Rt), truth=BigInt(a)**3n;
    const part=(v)=> v<0? `−${pad(-v,k)}` : pad(v,k);
    s.put('P',0,4.4,`${L} | ${part(Mid)} | ${part(Rt)}`,'res').hl('P');
    s.snap(`Set them side by side, each of the last two with ${k} digit${k>1?'s':''}: ${L} | ${part(Mid)} | ${part(Rt)}${(Mid>=B||Rt>=B||Rt<0)?' — then carry or borrow between the parts':''}.`);
    s.put('A',0,5.6,`${a}³ = ${val}`,'ans');
    s.snap(`<span class="ok">${a}³ = ${val}</span>.`+(val===truth?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXXIV: straight square root ---------- */
function sqrtSteps(N,dec){
  const S=String(N), ng=Math.ceil(S.length/2), digs=S.padStart(ng*2,'0').split('').map(Number);
  const first=digs[0]*10+digs[1], a=isqrt(first); let R=first-a*a;
  const rest=digs.slice(2).concat(Array(dec*2).fill(0));
  const big=BigInt(N)*100n**BigInt(dec); let r=BigInt(Math.floor(Math.sqrt(Number(big)))); while(r*r>big) r--; while((r+1n)*(r+1n)<=big) r++;
  let td=String(r).padStart(ng+dec,'0').split('').map(Number);
  const exactSq=BigInt(N)===BigInt(isqrt(N))**2n; const tdAns=td.slice(); if(exactSq&&!dec) td=td.concat(Array(Math.max(0,rest.length+1-td.length)).fill(0));
  const steps=[], xs=[];
  for(let t=0;t<rest.length && t+1<td.length;t++){ const GD=10*R+rest[t], D=duplex(xs), AD=GD-D, x=td[t+1]; R=AD-2*a*x; steps.push({GD,D,AD,x,R,xsBefore:xs.slice()}); xs.push(x); }
  return {a,first,R0:first-a*a,ng,steps,root:tdAns,exact:exactSq};
}
def({
  id:'sqrtgen', chn:34, o:10, su:[3],
  name:'Square root of any number — straight method with duplexes',
  sutra:{kind:'SŪTRA 3 · DVANDVA-YOGA', dev:'ऊर्ध्वतिर्यग्भ्याम्', iast:'Ūrdhva-Tiryagbhyām (Dvandva-yoga)', en:'Straight division by twice the first digit, subtracting duplexes'},
  short:'√119716: 11 → 3 r 2, divisor 6. 29 ÷ 6 = 4 r 5; 57 − 4² = 41 → 6 r 5; 51 − D(4,6) = 3 → 0 r 3; 36 − 6² = 0 → √ = 346.',
  brief:`<ol><li>Mark off pairs of digits from the right. The first group gives the first root digit a (largest square) and a remainder.</li><li>The divisor is <b>2a</b> — fixed for the whole sum.</li><li>Prefix each remainder to the next digit (gross dividend), subtract the <b>duplex</b> of the root digits found after a, divide by 2a: next root digit and remainder.</li><li>The root has as many digits as there are groups; carrying on gives decimals. Zero remainders all along mean a perfect square.</li></ol>`,
  why:`<p>If the root is a, b, c, … (with x = 10) then its square is</p><div class="eqn">a² | 2ab | 2ac + b² | 2ad + 2bc | …</div><p>Column by column, after a² is removed, each column holds 2a × (the new digit) plus the duplex of the digits between — so subtracting that duplex and dividing by 2a recovers the next digit. It is Straight Division (Ch. XXVII) with the divisor 2a.</p>`,
  hist:`<p>Ch. XXXIV (“Vargamūla”) builds on the previous chapter’s duplex squaring: “the procedure … is precisely the same as in Straight Division but with this difference, namely, that … the Divisor should be exactly double the first digit of the square root”. Its examples run to decimal roots such as √2, √3 and √.0009134 to many places.</p>`,
  ex:{N:119716,dec:0}, ph:'119716, 529, or 2 (for √2)',
  rand(){ if(Math.random()<.6){ const r=ri(13,999); return {N:r*r,dec:0}; } return {N:ri(2,99999),dec:3}; },
  parse(str){ const N=+normIn(str).replace(/^√/,''); if(!Number.isInteger(N)||N<1) throw 'Enter a whole number.'; if(N>9999999999) throw 'Up to 10 digits.'; const r=isqrt(N); return {N,dec: r*r===N?0:3}; },
  q(p){ return `√${p.N}<small>${p.dec?'to 3 decimal places':'exact'}</small>`; },
  ans(p){ const X=sqrtSteps(p.N,p.dec); const d=X.root.join(''); return p.dec? `${+d.slice(0,X.ng)}.${d.slice(X.ng)}` : String(+d); },
  check(p,v){ return Math.abs(parseNum(v)-parseNum(this.ans(p)))<1e-9; },
  gen({N,dec}){
    const s=new Sc(), X=sqrtSteps(N,dec), S=String(N), ng=X.ng, digs=S.padStart(ng*2,'0').split('');
    const SP=2.2, x0=4, cx=i=>x0+i*SP;
    const lead=S.length%2; // odd number of digits: first group is one digit
    digs.forEach((c,i)=>{ if(i===0&&lead) return; s.put('n'+i,cx(i),0,c); });
    for(let i=0;i<dec*2;i++) s.put('z'+i,cx(ng*2+i),0,'0','dim');
    s.seg('bar',cx(1)+SP/2,-0.5,cx(1)+SP/2,2.6,'bar');
    if(dec) s.put('dp',cx(ng*2)-SP/2-0.2,0,'.','op');
    s.snap(`Square root of <b>${N}</b>. Pairs from the right: <b>${ng}</b> group${ng>1?'s':''}, so the root has ${ng} digit${ng>1?'s':''} before the decimal point.`);
    const a=X.a;
    s.put('q0',cx(1),2.3,a,'res').put('dv',0,1.15,2*a,'key').put('r0',cx(2)-0.55,0.62,X.R0,'carry').hl('q0','dv');
    s.snap(`First group ${X.first}: the largest square in it is ${a}² = ${a*a}, so the first digit is <b>${a}</b>, remainder ${X.R0}. The divisor is twice ${a}: <b>${2*a}</b>.`);
    X.steps.forEach((st,t)=>{
      const col=2+t, beyond=t+1>=X.ng; if(beyond&&t+1===X.ng) s.put('dp2',cx(col)-SP/2-0.1,2.3,'.','dim');
      s.put('q'+(t+1),cx(col),2.3,st.x,beyond?'dim':'res').hl('q'+(t+1));
      s.put('r'+(t+1),cx(col+1)-0.55,0.62,st.R,'carry');
      const dtxt = st.xsBefore.length? `duplex of ${st.xsBefore.join(',')} = ${st.D}` : 'nothing to subtract yet';
      s.put('w',0,3.6,`${st.GD} − ${st.D} = ${st.AD};  ${st.AD} ÷ ${2*a} = ${st.x} r ${st.R}`,'work');
      if(t<5||t===X.steps.length-1) s.snap(`Gross dividend <b>${st.GD}</b> (remainder prefixed to the next digit). Subtract the ${dtxt}: ${st.AD}. Divide by ${2*a}: next root digit <b>${st.x}</b>, remainder ${st.R}.`);
    });
    s.del('w');
    const d=X.root.join(''), txt= dec? `${+d.slice(0,ng)}.${d.slice(ng)}` : String(+d);
    const ok= dec? Math.abs(+txt-Math.sqrt(N))<0.001 : (+d)**2===N;
    s.put('A',0,3.6,`√${N} = ${txt}${dec?'…':''}`,'ans');
    s.snap(`<span class="ok">√${N} = ${txt}${dec?'…':''}</span>${!dec?' — and the remainders run out to zero: a perfect square.':''}`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXXV: exact cube roots by argumentation ---------- */
const CUBE_LAST={0:0,1:1,2:8,3:7,4:4,5:5,6:6,7:3,8:2,9:9};
def({
  id:'cbrtarg', chn:35, o:20, sub:[12],
  name:'Cube roots of bigger exact cubes — peeling digits from the right',
  sutra:{kind:'SUB-SŪTRA 12', dev:'विलोकनम्', iast:'Vilokanam (and argumentation)', en:'“By observation” — then eliminate digit by digit'},
  short:'∛83453453: ends in 3 → L = 7; subtract 343 → …11; 3L²K = 147K must end in 1 → K = 3; … J = 4 → 437.',
  brief:`<p>For an exact cube with a 3-digit root JKL:</p>
    <ol><li><b>L</b> from the last digit (the cube-ending table).</li><li>Subtract L³ and drop the final 0. The new last digit must be the last digit of 3L²·K — find K.</li><li>Subtract 3L²K, drop the 0; the last digit must match 3L²·J + 3L·K² — find J.</li><li>Cross-check J against the first group by inspection.</li></ol>`,
  why:`<div class="eqn">(100J + 10K + L)³ = L³ + 10·3L²K
   + 100·(3L²J + 3LK²) + 1000·(…)</div><p>Removing the known lower terms exposes each next digit’s contribution in the units place. When 3L² is coprime to 10 (L = 1, 3, 7, 9) each step has a unique answer; for even L or 5 the book warns of ambiguity (“a pure gamble”) and prefers another method.</p>`,
  hist:`<p>Ch. XXXV first sets out the “first principles” (the cube-ending table, the number of digits, the first digit from the first group), then works examples like 33,076,161 → 321 and 83,453,453 → 437 by this elimination, and openly shows a case (792,994,219,216) where the even last digit leaves several choices — motivating the general method of Ch. XXXVI.</p>`,
  ex:{r:437}, ph:'an exact cube with a 3-digit root, e.g. 83453453',
  rand(){ let r; do{ r=ri(101,999); }while(![1,3,7,9].includes(r%10)); return {r}; },
  parse(str){ const n=+normIn(str).replace(/^∛/,''); const r=icbrt(n); if(r**3!==n) throw 'That is not an exact cube.'; if(r<100||r>999) throw 'Use a cube with a 3-digit root (7 to 9 digits).'; if(![1,3,7,9].includes(r%10)) throw 'Choose one whose root ends in 1, 3, 7 or 9 (no ambiguity).'; return {r}; },
  q:p=>`∛${p.r**3}`, ans:p=>String(p.r),
  gen({r}){
    const s=new Sc(), C=r**3, L=r%10, K=Math.floor(r/10)%10, J=Math.floor(r/100);
    s.put('C',0,0,`${C}`); s.snap(`Cube root of <b>${C}</b> — 3 groups of three, so a 3-digit root JKL.`);
    s.put('L',0,1.2,`ends in ${C%10} → L = ${L}`,'work').hl('L'); s.snap(`The cube ends in ${C%10}, so L = <b>${L}</b> (${L}³ = ${L**3}).`);
    const C1=(C-L**3)/10;
    s.put('s1',0,2.2,`(${C} − ${L**3}) ÷ 10 = ${C1}`,'work').hl('s1'); s.snap(`Subtract ${L**3} and drop the zero: <b>${C1}</b>.`);
    const a=3*L*L;
    s.put('K',0,3.2,`${a}K ends in ${C1%10} → K = ${K}`,'work').hl('K'); s.snap(`The units digit now comes only from 3L²K = ${a}K. It must end in ${C1%10}: <b>K = ${K}</b>.`);
    const C2=(C1-a*K)/10;
    s.put('s2',0,4.2,`(${C1} − ${a*K}) ÷ 10 = ${C2}`,'work').hl('s2'); s.snap(`Subtract ${a}×${K} = ${a*K} and drop the zero: <b>${C2}</b>.`);
    const b=3*L*K*K;
    s.put('J',0,5.2,`${a}J + ${b} ends in ${C2%10} → J = ${J}`,'work').hl('J'); s.snap(`Now the units digit is 3L²J + 3LK² = ${a}J + ${b}. It must end in ${C2%10}: <b>J = ${J}</b>. (Check: the first group ${Math.floor(C/1e6)} lies between ${J}³ = ${J**3} and ${J+1}³ = ${(J+1)**3}.)`);
    s.put('A',0,6.4,`∛${C} = ${J}${K}${L}`,'ans');
    const ok=Number(`${J}${K}${L}`)===r && (a*K)%10===C1%10 && (a*J+b)%10===C2%10;
    s.snap(`<span class="ok">∛${C} = ${r}</span>.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXXVI: general cube root ---------- */
function cbrtSteps(N,dec){
  const S=String(N), ng=Math.ceil(S.length/3), digs=S.padStart(ng*3,'0').split('').map(Number);
  const first=digs[0]*100+digs[1]*10+digs[2], a=icbrt(first); let R=first-a**3; const R0=R;
  const rest=digs.slice(3).concat(Array(dec*3).fill(0));
  const big=BigInt(N)*1000n**BigInt(dec); let r=BigInt(Math.floor(Math.cbrt(Number(big)))); while(r**3n>big) r--; while((r+1n)**3n<=big) r++;
  let td=String(r).padStart(ng+dec,'0').split('').map(Number);
  const exactC=icbrt(N)**3===N, tdAns=td.slice(); if(exactC&&!dec) td=td.concat(Array(Math.max(0,rest.length+1-td.length)).fill(0));
  const xs=[a], steps=[], D=3*a*a;
  for(let t=1;t<=rest.length && t<td.length;t++){
    const GD=10*R+rest[t-1]; const X=xs.concat([0]); let c=0; const terms=[];
    for(let i=0;i<=t;i++) for(let j=0;j<=t-i;j++){ const l=t-i-j; c+=(X[i]||0)*(X[j]||0)*(X[l]||0); }
    const x=td[t], AD=GD-c; R=AD-D*x; steps.push({GD,S:c,AD,x,R}); xs.push(x);
  }
  return {a,first,R0,ng,D,steps,root:tdAns,exact:exactC};
}
def({
  id:'cbrtgen', chn:36, o:10, su:[3],
  name:'Cube root of any number — straight method',
  sutra:{kind:'SŪTRA 3 · STRAIGHT DIVISION', dev:'ऊर्ध्वतिर्यग्भ्याम्', iast:'Ūrdhva-Tiryagbhyām', en:'Divide by 3a², subtracting 3ab², 6abc + b³, …'},
  short:'∛258474853: first group 258 → 6 r 42, divisor 3·6² = 108. 424 ÷ 108 = 3 r 100; 1007 − 3·6·3² = 845 → 7 r 89; then 894 − (6·6·3·7 + 3³) = 111 … all remainders → 0: 637.',
  brief:`<ol><li>Mark off groups of three. The first group gives a (largest cube) and a remainder.</li><li>The divisor is <b>3a²</b>, fixed.</li><li>Prefix the remainder to the next digit (gross dividend); subtract the cube-expansion terms not yet accounted for — nothing at first, then 3ab², then 6abc + b³, then 3ac² + 3b²c, …</li><li>Divide by 3a² for the next digit. Zero remainders throughout mean an exact cube; otherwise carry on for decimals.</li></ol>`,
  why:`<p>With root digits a, b, c, … the cube (a + b/10 + c/100 + …)³ has, column by column:</p><div class="eqn">a³ | 3a²b | 3a²c + 3ab² | 3a²d + 6abc + b³ | …</div><p>Each column is 3a² × (its new digit) plus terms from digits already known. Subtract those, divide by 3a², and the new digit appears — the same idea as the straight square root, one power higher.</p>`,
  hist:`<p>Ch. XXXVI gives the digit-by-digit “schedule” for (a + b + c)³ and for (a + b + c + d)³, works 258 474 853 → 637 and 2 to several decimals, and discusses devices for when the divisor 3a² is awkwardly small (taking the first 4–6 digits as one group, or multiplying by a cube such as 8 first).</p>`,
  ex:{N:258474853,dec:0}, ph:'258474853, or 2 (for ∛2)',
  rand(){ if(Math.random()<.6){ const r=ri(21,999); return {N:r**3,dec:0}; } return {N:ri(9,99999),dec:2}; },
  parse(str){ const N=+normIn(str).replace(/^∛/,''); if(!Number.isInteger(N)||N<1) throw 'Enter a whole number.'; if(N>999999999999) throw 'Up to 12 digits.'; return {N,dec: icbrt(N)**3===N?0:3}; },
  q(p){ return `∛${p.N}<small>${p.dec?'to '+p.dec+' decimal places':'exact'}</small>`; },
  ans(p){ const X=cbrtSteps(p.N,p.dec); const d=X.root.join(''); return p.dec? `${+d.slice(0,X.ng)}.${d.slice(X.ng)}` : String(+d); },
  check(p,v){ return Math.abs(parseNum(v)-parseNum(this.ans(p)))<1e-9; },
  gen({N,dec}){
    const s=new Sc(), X=cbrtSteps(N,dec), S=String(N), ng=X.ng, digs=S.padStart(ng*3,'0').split('');
    const SP=2.4, x0=5, cx=i=>x0+i*SP, lead=(3-S.length%3)%3;
    digs.forEach((c,i)=>{ if(i<lead) return; s.put('n'+i,cx(i),0,c); });
    for(let i=0;i<dec*3;i++) s.put('z'+i,cx(ng*3+i),0,'0','dim');
    s.seg('bar',cx(2)+SP/2,-0.5,cx(2)+SP/2,2.6,'bar');
    s.snap(`Cube root of <b>${N}</b>: groups of three from the right — ${ng} group${ng>1?'s':''}, so ${ng} digit${ng>1?'s':''} before the decimal point.`);
    const a=X.a;
    s.put('q0',cx(2),2.3,a,'res').put('dv',0,1.15,X.D,'key').put('r0',cx(3)-0.55,0.62,X.R0,'carry').hl('q0','dv');
    s.snap(`First group ${X.first}: the largest cube is ${a}³ = ${a**3}, so a = <b>${a}</b>, remainder ${X.R0}. Divisor 3a² = <b>${X.D}</b>.`);
    const names=['','nothing yet','3ab²','6abc + b³','3ac² + 3b²c (+6abd)','…','…','…'];
    X.steps.forEach((st,t)=>{
      const col=3+t, beyond=t+1>=X.ng; if(beyond&&t+1===X.ng) s.put('dp2',cx(col)-SP/2-0.1,2.3,'.','dim');
      s.put('q'+(t+1),cx(col),2.3,st.x,beyond?'dim':'res').hl('q'+(t+1));
      s.put('r'+(t+1),cx(col+1)-0.55,0.62,st.R,'carry');
      s.put('w',0,3.6,`${st.GD} − ${st.S} = ${st.AD};  ÷ ${X.D} = ${st.x} r ${st.R}`,'work');
      if(t<5||t===X.steps.length-1) s.snap(`Gross dividend <b>${st.GD}</b>. Subtract ${t===0?'nothing yet':`the known terms (${names[t+1]||'…'}) = ${st.S}`}: ${st.AD}. ÷ ${X.D}: digit <b>${st.x}</b>, remainder ${st.R}.`);
    });
    s.del('w');
    const d=X.root.join(''), txt= dec? `${+d.slice(0,ng)}.${d.slice(ng)}` : String(+d);
    const ok= dec? Math.abs(+txt-Math.cbrt(N))<0.01 : (+d)**3===N;
    s.put('A',0,3.6,`∛${N} = ${txt}${dec?'…':''}`,'ans');
    s.snap(`<span class="ok">∛${N} = ${txt}${dec?'…':''}</span>${!dec?' — every remainder runs out to zero, so it is an exact cube.':''}`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXXVII: Pythagoras — proof by rearrangement ---------- */
def({
  id:'pythag', chn:37, o:10,
  name:'Pythagoras’ theorem — four triangles rearranged',
  nosutra:'A geometrical proof; Tīrtha gives five, all by areas or co-ordinates.',
  short:'Inside a square of side a + b, four copies of the triangle leave a tilted square c². Slide them into two rectangles and the empty space becomes a² + b².',
  brief:`<ol><li>Four copies of a right triangle (legs a, b, hypotenuse c) sit in the corners of a square of side a + b. The space left is a tilted square of area <b>c²</b>.</li><li>Slide three of the triangles (no turning) so they pair up into two a × b rectangles.</li><li>The space left is now a square of side a and a square of side b: area <b>a² + b²</b>.</li><li>Same big square, same four triangles — so the leftover areas are equal: a² + b² = c².</li></ol>`,
  why:`<p>In algebra, Tīrtha’s first proof uses the square on the hypotenuse with the triangles inside it:</p><div class="eqn">c² = (a − b)² + 4·(½ab) = a² + b²</div><p>The rearrangement shown here is the same identity seen from outside: (a + b)² − 4·(½ab) is both c² and a² + b².</p>`,
  hist:`<p>Ch. XXXVII opens by insisting the theorem “was known to the ancient Indians long long before the time of Pythagoras”. The Baudhāyana Śulba-sūtra (perhaps 800–500 BCE) does state it for rectangles (“the diagonal of a rectangle produces both areas which its length and breadth produce separately”); Old Babylonian tablets such as Plimpton 322 (c. 1800 BCE) already list large triples. Bhāskara II (12th c.) gave the inner-square figure with the single word “Behold!”. Tīrtha’s five proofs include a trapezium proof (like President Garfield’s, 1876) and one by co-ordinates.</p>`,
  ex:{a:4,b:3}, ph:'two legs, e.g. 5, 12',
  rand(){ const T=pick([[4,3],[12,5],[8,6],[15,8],[3,2],[5,2],[7,3],[24,7]]); return {a:T[0],b:T[1]}; },
  parse(str){ const n=(String(str).match(/\d+/g)||[]).map(Number); if(n.length!==2) throw 'Give two legs, e.g. 5, 12.'; let [a,b]=n; if(a===b) throw 'Use two different legs.'; if(a<b) [a,b]=[b,a]; if(a/b>6) throw 'Keep the legs within a factor of 6 of each other.'; return {a,b}; },
  q:p=>`legs ${p.a} and ${p.b}<small>c² = ?</small>`, ans:p=>String(p.a*p.a+p.b*p.b),
  gen({a,b}){
    const s=new Sc(), u=320/(a+b), A=a*u, B=b*u, S=A+B, ox=40, oy=10;
    const P=(x,y)=>[ox+x,oy+y];
    s.shape('big',{pts:[P(0,0),P(S,0),P(S,S),P(0,S)],c:'g0'});
    const tri=[[0,0],[A,0],[0,B]];        // right angle at origin, leg a along x, leg b along y
    const put=(k,x,y,r,c)=>s.shape(k,{pts:tri,tf:{x:ox+x,y:oy+y,r},c});
    put('t1',0,0,0,'g1'); put('t2',S,0,90,'g2'); put('t3',S,S,180,'g3'); put('t4',0,S,270,'g5');
    s.putp('la',ox+A/2,oy-14,`a = ${a}`,'lbl').putp('lb',ox-26,oy+B/2,`b = ${b}`,'lbl');
    s.snap(`A square of side a + b = ${a+b}, with four copies of the right triangle (legs ${a} and ${b}) in its corners.`);
    s.shape('csq',{pts:[P(A,0),P(S,A),P(B,S),P(0,B)],c:'g4 hot'});
    s.putp('lc',ox+S/2,oy+S/2,`c²`,'key');
    s.snap(`The space between them is a tilted square on the hypotenuse c: its area is <b>c²</b>.`);
    s.unshape('csq'); s.del('lc');
    s.move('t1',{x:ox+0,y:oy+A}); s.move('t3',{x:ox+A,y:oy+S}); s.move('t4',{x:ox+A,y:oy+A});
    s.snap(`Now slide three triangles — no turning — so they pair up into two ${a} × ${b} rectangles.`);
    s.shape('asq',{pts:[P(0,0),P(A,0),P(A,A),P(0,A)],c:'g4 hot'}).shape('bsq',{pts:[P(A,A),P(S,A),P(S,S),P(A,S)],c:'g4 hot'});
    s.putp('l1',ox+A/2,oy+A/2,`a² = ${a*a}`,'key').putp('l2',ox+A+B/2,oy+A+B/2,`b²`,'key');
    s.snap(`The space left is now a square of side ${a} and a square of side ${b}: <b>a² + b²</b>.`);
    s.put('eq',30,2,`a² + b² = c²`,'ans').put('eq2',30,3.2,`${a*a} + ${b*b} = ${a*a+b*b}`,'res');
    const c=Math.sqrt(a*a+b*b);
    s.snap(`Same big square, same four triangles — so the empty areas are equal. <span class="ok">a² + b² = c²</span>: ${a*a} + ${b*b} = ${a*a+b*b}${Number.isInteger(c)?` = ${c}²`:''}.`);
    return s.fr;
  }
});

/* ---------- XXXVIII: Apollonius ---------- */
def({
  id:'apollonius', chn:38, o:10,
  name:'Apollonius’ theorem by co-ordinates',
  nosutra:'Proved by co-ordinate geometry, which Tīrtha says the sūtras establish from first principles.',
  short:'D the midpoint of BC: AB² + AC² = 2(AD² + BD²). Put the foot of the altitude at the origin and both sides become 2p² + 2m² + 4mn + 4n².',
  brief:`<ol><li>Drop the perpendicular AO from A to BC; take O as the origin, BC along the x-axis.</li><li>Call BO = m, OD = n, OA = p. Then BD = DC = m + n.</li><li>Write each squared length with Pythagoras: AB² = m² + p², AC² = (m + 2n)² + p², AD² = n² + p².</li><li>Expand both sides — they agree.</li></ol>`,
  why:`<div class="eqn">AB² + AC² = (m² + p²) + ((m + 2n)² + p²)
          = 2p² + 2m² + 4mn + 4n²
2(AD² + BD²) = 2[(n² + p²) + (m + n)²]
          = 2p² + 2m² + 4mn + 4n²</div>`,
  hist:`<p>Ch. XXXVIII calls the theorem “practically a direct and elementary corollary or offshoot from Pythagoras’ Theorem” and gives this co-ordinate proof, adding that the circum-centre, in-centre, centroid, nine-point circle etc. “can all be similarly proved” — and that “Cartesian” co-ordinates, like “Arabic” numerals, are a historical misnomer.</p>`,
  ex:{m:2,n:3,p:4}, ph:'Random only — press Random', noParse:true,
  rand(){ return {m:ri(1,6),n:ri(1,5),p:ri(2,7)}; },
  parse(){ throw 'Use Random.'; },
  q:p=>`BO = ${p.m}, OD = ${p.n}, OA = ${p.p}<small>AB² + AC² = ?</small>`,
  ans:p=>String((p.m**2+p.p**2)+((p.m+2*p.n)**2+p.p**2)),
  check(p,v){ return parseNum(v)===+this.ans(p); },
  gen({m,n,p}){
    const s=new Sc(), u=240/Math.max(2*m+2*n,2*p), ox=560+m*240/Math.max(2*m+2*n,2*p), oy=40+p*u, X=x=>ox+x*u, Y=y=>oy-y*u;
    const Bx=-m, Cx=m+2*n, Dx=n;
    s.shape('ax',{pts:[[X(Bx-0.6),Y(0)],[X(Cx+0.6),Y(0)]],closed:false,c:'axis'}).shape('ay',{pts:[[X(0),Y(-0.6)],[X(0),Y(p+0.6)]],closed:false,c:'axis'});
    s.shape('T',{pts:[[X(Bx),Y(0)],[X(Cx),Y(0)],[X(0),Y(p)]],c:'g1'});
    s.putp('A',X(0)+12,Y(p)-12,'A','lbl').putp('B',X(Bx)-12,Y(0)+16,'B','lbl').putp('C',X(Cx)+12,Y(0)+16,'C','lbl').putp('O',X(0)+10,Y(0)+16,'O','lbl');
    s.snap(`Triangle ABC with the altitude AO; O is the origin. BO = ${m}, OA = ${p}.`);
    s.shape('med',{pts:[[X(0),Y(p)],[X(Dx),Y(0)]],closed:false,c:'line'}); s.putp('D',X(Dx)+4,Y(0)+16,'D','lbl');
    s.snap(`D is the midpoint of BC; OD = ${n}, so BD = DC = ${m+n} and OC = ${m+2*n}.`);
    const AB=m*m+p*p, AC=(m+2*n)**2+p*p, AD=n*n+p*p, BD=(m+n)**2;
    s.put('l1',0,0,`AB² = ${m}² + ${p}² = ${AB}`,'work').put('l2',0,1,`AC² = ${m+2*n}² + ${p}² = ${AC}`,'work');
    s.snap(`By Pythagoras: AB² = m² + p² = ${AB}; AC² = (m + 2n)² + p² = ${AC}.`);
    s.put('l3',0,2.2,`AD² = ${n}² + ${p}² = ${AD},  BD² = ${m+n}² = ${BD}`,'work');
    s.snap(`And AD² = n² + p² = ${AD}, BD² = (m + n)² = ${BD}.`);
    s.put('l4',0,3.5,`${AB} + ${AC} = ${AB+AC} = 2(${AD} + ${BD})`,'ans');
    s.snap(`<span class="ok">AB² + AC² = ${AB+AC} = 2(AD² + BD²)</span> — and in general both sides expand to 2p² + 2m² + 4mn + 4n².`+(AB+AC===2*(AD+BD)?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* clip the line a·x + b·y = c to the box [x0,x1]×[y0,y1]; returns two endpoints or null */
function clipLine(a,b,c,x0,x1,y0,y1){
  const P=[]; const add=(x,y)=>{ if(x>=x0-1e-9&&x<=x1+1e-9&&y>=y0-1e-9&&y<=y1+1e-9&&!P.some(q=>Math.abs(q[0]-x)<1e-9&&Math.abs(q[1]-y)<1e-9)) P.push([x,y]); };
  if(b!==0){ add(x0,(c-a*x0)/b); add(x1,(c-a*x1)/b); }
  if(a!==0){ add((c-b*y0)/a,y0); add((c-b*y1)/a,y1); }
  if(P.length<2) return null; P.sort((p1,p2)=>p1[0]-p2[0]||p1[1]-p2[1]); return [P[0],P[P.length-1]];
}
/* ---------- XXXIX: line through two points ---------- */
function plane(s,xmin,xmax,ymin,ymax,{ox=470,oy=0,size=260}={}){
  const span=Math.max(xmax-xmin,ymax-ymin), u=size/span, X=x=>ox+(x-xmin)*u, Y=y=>oy+(ymax-y)*u;
  if(ymin<=0&&ymax>=0) s.shape('px',{pts:[[X(xmin),Y(0)],[X(xmax),Y(0)]],closed:false,c:'axis'});
  if(xmin<=0&&xmax>=0) s.shape('py',{pts:[[X(0),Y(ymin)],[X(0),Y(ymax)]],closed:false,c:'axis'});
  return {X,Y};
}
def({
  id:'lineeq', chn:39, o:10, su:[4], sub:[3],
  name:'The straight line through two points — at sight',
  sutra:{kind:'SŪTRA 4 · SUB-SŪTRA 3', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'Cross the differences over; “first by first, last by last”'},
  short:'(9, 17) and (7, −2): x-coefficient = 17 − (−2) = 19, y-coefficient = 9 − 7 = 2, constant = 17·7 − 9·(−2) = 137 → 19x − 2y = 137.',
  brief:`<p>For points (a, b) and (c, d), write the line as … x − … y = …:</p>
    <ol><li><b>x-coefficient</b>: the difference of the y-co-ordinates, b − d.</li><li><b>y-coefficient</b>: the difference of the x-co-ordinates, a − c.</li><li><b>Constant</b>: “product of the means minus product of the extremes”, bc − ad (or just substitute one point).</li></ol>`,
  why:`<div class="eqn">(b − d)x − (a − c)y = bc − ad</div><p>Put (a, b) in: (b − d)a − (a − c)b = cb − ad ✓; put (c, d) in: (b − d)c − (a − c)d = bc − ad ✓. A first-degree equation satisfied by both points is their line — the slope (b − d)/(a − c) has simply been “transposed” into the coefficients.</p>`,
  hist:`<p>Ch. XXXIX contrasts the textbook routes (y = mx + c with two simultaneous equations, or the two-point formula) — “cumbrous and confusing” — with “the Vedic at-sight, one-line, mental method”. Its example (9, 17) and (7, −2) → 19x − 2y = 137 is the default here.</p>`,
  ex:{a:9,b:17,c:7,d:-2}, ph:'(9,17) and (7,-2)',
  rand(){ let a,b,c,d; do{ a=ri(-9,12); b=ri(-9,18); c=ri(-9,12); d=ri(-9,18); }while(a===c||b===d); return {a,b,c,d}; },
  parse(str){ const n=(String(str).replace(/[−–—]/g,'-').match(/-?\d+/g)||[]).map(Number); if(n.length!==4) throw 'Give two points, e.g. (9,17) and (7,-2).'; const [a,b,c,d]=n; if(a===c&&b===d) throw 'The points must differ.'; return {a,b,c,d}; },
  coefs(p){ let A=p.b-p.d, Bc=-(p.a-p.c), K=p.b*p.c-p.a*p.d; const g=gcd(gcd(A,Bc),K)||1; let sgn=(A<0||(A===0&&Bc<0))?-1:1; return [A/g*sgn,Bc/g*sgn,K/g*sgn]; },
  q:p=>`(${p.a}, ${p.b}) and (${p.c}, ${p.d})<small>equation of the line, e.g. 19x - 2y = 137</small>`,
  ans(p){ const [A,B,K]=this.coefs(p); return `${linForm([A,B],['x','y'])} = ${K}`; },
  check(p,v){ const t=String(v).replace(/\s/g,'').replace(/[−–—]/g,'-'); const m=t.split('='); if(m.length!==2) return false;
    let f; try{ f=parseExpr(m[0]+'-('+m[1]+')'); }catch(e){ return false; }
    const at=(x,y)=>f({x,y}); if(Math.abs(at(p.a,p.b))>1e-9||Math.abs(at(p.c,p.d))>1e-9) return false; return Math.abs(at(p.a+1,p.b+7))>1e-9 || Math.abs(at(p.a+3,p.b-2))>1e-9; },
  gen(p){
    const {a,b,c,d}=p, s=new Sc(), A=b-d, Bc=a-c, K=b*c-a*d;
    const xs=[a,c,0], ys=[b,d,0]; const pad_=2; const {X,Y}=plane(s,Math.min(...xs)-pad_,Math.max(...xs)+pad_,Math.min(...ys)-pad_,Math.max(...ys)+pad_);
    s.shape('P1',{circle:{cx:X(a),cy:Y(b),rad:6},c:'dot'}).shape('P2',{circle:{cx:X(c),cy:Y(d),rad:6},c:'dot'});
    s.putp('l1',X(a)+16,Y(b)-14,`(${a}, ${b})`,'lbl').putp('l2',X(c)+16,Y(d)+18,`(${c}, ${d})`,'lbl');
    s.put('E',0,0,`(${a}, ${b})  and  (${c}, ${d})`); s.snap(`Find the line through (${a}, ${b}) and (${c}, ${d}). The answer has the shape … x − … y = … .`);
    s.put('x',0,1.2,`x-coefficient: ${b} − (${d}) = ${A}`,'work').hl('x'); s.snap(`<b>Parāvartya</b>: the difference of the <b>y</b>-co-ordinates becomes the <b>x</b>-coefficient: ${A}.`);
    s.put('y',0,2.2,`y-coefficient: ${a} − (${c}) = ${Bc}`,'work').hl('y'); s.snap(`…and the difference of the <b>x</b>-co-ordinates becomes the <b>y</b>-coefficient: ${Bc}.`);
    s.put('k',0,3.2,`constant: ${b}·${c} − ${a}·(${d}) = ${K}`,'work').hl('k'); s.snap(`The constant: product of the means minus product of the extremes, ${b}×${c} − ${a}×(${d}) = <b>${K}</b>.`);
    const [A2,B2,K2]=this.coefs(p);
    /* draw the line across the plotted window */
    const W=[Math.min(...xs)-pad_, Math.max(...xs)+pad_, Math.min(...ys)-pad_, Math.max(...ys)+pad_];
    const span=Math.max(W[1]-W[0],W[3]-W[2]); const seg=clipLine(A2,B2,K2,W[0],W[0]+span,W[3]-span,W[3]);
    if(seg) s.shape('L',{pts:seg.map(([x,y])=>[X(x),Y(y)]),closed:false,c:'line'});
    s.put('A',0,4.5,`${linForm([A2,B2],['x','y'])} = ${K2}`,'ans');
    const ok=A2*a+B2*b===K2 && A2*c+B2*d===K2;
    s.snap(`<span class="ok">${linForm([A2,B2],['x','y'])} = ${K2}</span>${(A!==A2)?' (divided through by the common factor)':''}. Both points satisfy it.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXXIX: pair of straight lines; asymptotes ---------- */
def({
  id:'pairlines', chn:39, o:20, sub:[11,3],
  name:'When a quadratic is two straight lines — and a hyperbola’s asymptotes',
  sutra:{kind:'SUB-SŪTRAS 11 & 3', dev:'लोपनस्थापनाभ्याम् · आद्यमाद्येन', iast:'Lopana-sthāpana · Ādyamādyena', en:'Factor the quadratic part, then fill in the constants'},
  short:'12x² + 7xy − 10y² + 13x + 45y − 35 = (3x − 2y + 7)(4x + 5y − 5): two straight lines. For a hyperbola, the same factors with the right constant give its asymptotes.',
  brief:`<ol><li>Factor the second-degree part (x², xy, y² terms) by Ādyamādyena: e.g. 12x² + 7xy − 10y² = (3x − 2y)(4x + 5y).</li><li>Find constants e, f so that (3x − 2y + e)(4x + 5y + f) gives the right x- and y-terms (Lopana-sthāpana: put y = 0, then x = 0).</li><li>If e·f equals the given constant, the equation <b>is</b> two straight lines.</li><li>If not, it is a hyperbola: the product with constant e·f is its pair of <b>asymptotes</b>, and the conjugate hyperbola has constant 2ef − (given).</li></ol>`,
  why:`<p>A second-degree equation factors into two lines exactly when its constant fits the pattern the linear terms force. For a hyperbola H = 0 with asymptotes A = 0 (A − H a constant), the conjugate hyperbola lies the same distance on the other side: 2A − H = 0.</p>`,
  hist:`<p>Ch. XXXIX contrasts S. L. Loney’s 41-line textbook treatment (discriminants, substitutions) with the mental method: factor 3x² − 5xy − 2y² as (3x + y)(x − 2y), find −4 and 3 as the only possible constants, and read off the asymptotes 3x² − 5xy − 2y² + 5x + 11y − 12 = 0 and the conjugate hyperbola (… − 16 = 0) — “and that is all.”</p>`,
  ex:{F:[3,-2,7],G:[4,5,-5],v:'pair',k:0}, ph:'Random only — press Random', noParse:true,
  rand(){ let F,G; do{ F=[pick([1,2,3]),nz4(-4,4),nz4(-8,8)]; G=[pick([1,2,3,4]),nz4(-4,4),nz4(-8,8)]; }while(F[0]*G[1]===F[1]*G[0]||F[0]===G[0]);
    const v=Math.random()<.5?'pair':'asym'; return {F,G,v,k: v==='asym'? nz4(-9,9) : 0}; },
  parse(){ throw 'Use Random.'; },
  quad(p){ const {F,G}=p; return {xx:F[0]*G[0], xy:F[0]*G[1]+F[1]*G[0], yy:F[1]*G[1], x:F[0]*G[2]+F[2]*G[0], y:F[1]*G[2]+F[2]*G[1], c:F[2]*G[2]}; },
  str(q,c){ return `${linForm([q.xx,q.xy,q.yy,q.x,q.y],['x²','xy','y²','x','y'])} ${sp(c)} = 0`; },
  q(p){ const Q=this.quad(p); return p.v==='pair' ? `${this.str(Q,Q.c)}<small>the two lines’ constants? (e.g. 7, -5)</small>` : `hyperbola ${this.str(Q,Q.c+p.k)}<small>constant term of the asymptotes?</small>`; },
  ans(p){ return p.v==='pair' ? `${p.F[2]}, ${p.G[2]}` : String(p.F[2]*p.G[2]); },
  check(p,v){ if(p.v==='asym') return parseNum(v)===p.F[2]*p.G[2]; const n=(String(v).replace(/[−–—]/g,'-').match(/-?\d+/g)||[]).map(Number); return n.length===2 && ((n[0]===p.F[2]&&n[1]===p.G[2])||(n[0]===p.G[2]&&n[1]===p.F[2])); },
  gen(p){
    const {F,G}=p, Q=this.quad(p), s=new Sc(), given=Q.c+p.k;
    s.put('E',0,0,this.str(Q,given)); s.snap(p.v==='pair'?`Does this second-degree equation represent two straight lines?`:`A hyperbola. Find its asymptotes (and the conjugate hyperbola).`);
    s.put('h',0,1.2,`${linForm([Q.xx,Q.xy,Q.yy],['x²','xy','y²'])} = (${linForm([F[0],F[1]],['x','y'])})(${linForm([G[0],G[1]],['x','y'])})`,'work').hl('h');
    s.snap(`<b>Ādyamādyena</b>: factor the second-degree part: (${linForm([F[0],F[1]],['x','y'])})(${linForm([G[0],G[1]],['x','y'])}).`);
    s.put('y0',0,2.3,`y = 0: ${Q.xx}x² ${sp(Q.x)}x ${sp(Q.c)} = (${linForm([F[0],F[2]],['x',''])})(${linForm([G[0],G[2]],['x',''])})`,'work').hl('y0');
    s.snap(`<b>Lopana-sthāpana</b>: put y = 0 — the x-terms must come from (${linForm([F[0],F[2]],['x',''])})(${linForm([G[0],G[2]],['x',''])}), so the constants are <b>${F[2]}</b> and <b>${G[2]}</b>.`);
    s.put('x0',0,3.3,`x = 0: ${Q.yy}y² ${sp(Q.y)}y ${sp(Q.c)} = (${linForm([F[1],F[2]],['y',''])})(${linForm([G[1],G[2]],['y',''])}) ✓`,'work').hl('x0');
    s.snap(`Check with x = 0: the y-terms agree too.`);
    /* draw the two lines */
    const {X,Y}=plane(s,-8,8,-8,8,{ox:800,oy:-20,size:240});
    const lineShape=(k,L,c)=>{ const [a,b,e]=L; const seg=clipLine(a,b,-e,-8,8,-8,8); if(seg) s.shape(k,{pts:seg.map(([x,y])=>[X(x),Y(y)]),closed:false,c}); };
    lineShape('L1',F,'line'); lineShape('L2',G,'line');
    if(p.v==='pair'){
      s.put('A',0,4.6,`= (${linForm(F,['x','y',''])})(${linForm(G,['x','y',''])})`,'ans');
      s.snap(`${F[2]} × ${G[2]} = ${Q.c}, exactly the constant given — so <span class="ok">the equation is the pair of lines ${linForm(F,['x','y',''])} = 0 and ${linForm(G,['x','y',''])} = 0</span>.`);
    } else {
      const ef=F[2]*G[2], conj=2*ef-given;
      s.put('A',0,4.6,`asymptotes: … ${sp(ef)} = 0;  conjugate: … ${sp(conj)} = 0`,'ans');
      s.snap(`${F[2]} × ${G[2]} = ${ef}, but the hyperbola has ${given}. So <span class="ok">the asymptotes are ${linForm([Q.xx,Q.xy,Q.yy,Q.x,Q.y],['x²','xy','y²','x','y'])} ${sp(ef)} = 0</span> (the two lines drawn), and the conjugate hyperbola is the same with ${conj} (= 2 × ${ef} − (${given})).`);
    }
    return s.fr;
  }
});

/* ---------- XL: miscellaneous matters — the π verse ---------- */
def({
  id:'piverse', chn:40, o:10,
  name:'π/10 to 31 places in one verse',
  nosutra:'Ch. XL lists topics left for later volumes, and quotes this verse.',
  short:'gopībhāgya madhuvrāta śṛṅgiśo dadhisandhiga | khalajīvita khātāva galahālā rasandhara — decoded with the Kaṭapayādi code (Ch. XXV).',
  brief:`<p>The last chapter names subjects held over for later volumes — interest and annuities, trigonometry, spherical geometry, why there are only five regular solids, eclipses — and ends with a verse that “can bear three different meanings”: a hymn to Kṛṣṇa, a hymn to Śiva, and a value of π/10.</p><p>Decode it with the Kaṭapayādi table (Ch. XXV): each syllable’s consonant is a digit.</p>`,
  why:`<p>See the Kaṭapayādi lesson: ka-ṭa-pa-ya groups map consonants to 1–9 and 0; conjuncts count by their last consonant. Read left to right, the 32 syllables give 3141592653589793238462643383279|2.</p>`,
  hist:`<p>Tīrtha quotes a comment by Dr V. P. Dalal: “It shows how deeply the ancient Indian mathematicians penetrated, in the subtlety of their calculations”. The book does not say where the verse comes from. The first 31 digits are correct; the last syllable gives 2 where π continues …50.</p>`,
  ex:{verse:true}, ph:'', noParse:true,
  rand(){ return {verse:true}; },
  parse(){ throw 'This one is fixed.'; },
  q:()=>`gopībhāgya<small>its four digits</small>`, ans:()=>'3141', check:(p,v)=>normIn(v)==='3141',
  gen(){ return T.find(t=>t.id==='katapayadi').gen({verse:true}); }
});
