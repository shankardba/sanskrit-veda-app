'use strict';
/* Chapters XXVI–XXX: recurring decimals (remainders, other endings, multiples, converse),
   straight division, auxiliary fractions, negative and multiplex osculators */

const lastDigitOf = d => ({1:9,3:3,7:7,9:1})[d%10];       // the decimal of 1/d ends in this digit
const nz3=(a,b)=>{ let v; do{ v=ri(a,b); }while(v===0); return v; };
function periodOf(d){ let r=1, k=0; do{ r=(r*10)%d; k++; }while(r!==1 && k<2000); return k; }

/* ---------- XXVI.a remainders and Śeṣāṇyaṅkena Carameṇa ---------- */
def({
  id:'remainders', chn:26, o:10, su:[12],
  name:'The remainders — and “the remainders by the last digit”',
  sutra:{kind:'SŪTRA 12 OF 16', dev:'शेषाण्यङ्केन चरमेण', iast:'Śeṣāṇyaṅkena Carameṇa', en:'“The remainders by the last digit”'},
  short:'1/7: remainders 3, 2, 6, 4, 5, 1 (each = 3 × the previous, casting out 7s); × 7 (the last digit of the answer) → 21, 14, 42, 28, 35, 7 → .142857',
  brief:`<ol><li>The first remainder r (10 ÷ d) is a <b>ratio</b>: each remainder is r × the previous one, casting out multiples of d — a geometrical progression.</li><li>When the remainder d − 1 appears, half are done; the rest are the complements from d.</li><li><b>Śeṣāṇyaṅkena Carameṇa</b>: multiply each remainder by the last digit of the answer (7 for 1/7) and keep only the last digit — those are the decimal digits.</li></ol>`,
  why:`<p>The remainder after k steps is 10ᵏ mod d — so each is 10 × the previous, i.e. r × the previous when 10 ≡ r. For the digits: if 1/d ends in L, then d·L ends in 9 (1 = 0.999…). The k-th digit is ⌊10·r_(k−1)/d⌋, and since 10·r_(k−1) = q·d + r_k, multiplying through by L and reading the last digit gives q ≡ L·r_k (mod 10).</p>`,
  hist:`<p>Ch. XXVI uses 1/7 and 1/17 to show remainders forming a geometrical progression (“the fun of the Geometrical Progression is no doubt there; but … also … practical utility”), then states the twelfth sūtra: multiplying the remainders 3, 2, 6, 4, 5, 1 by 7 and keeping last digits gives 1, 4, 2, 8, 5, 7 — “really looking more like magic than like mathematics”.</p>`,
  ex:{d:7}, ph:'7, 13, 17, 23 … (ending in 1, 3, 7 or 9)',
  rand(){ return {d:pick([7,13,17,19,23,29,31,37,41])}; },
  parse(str){ const d=+normIn(str).replace(/^1\//,''); if(!d||![1,3,7,9].includes(d%10)) throw 'Use a denominator ending in 1, 3, 7 or 9.'; if(d<7) throw 'Pick something from 7 up.'; if(periodOf(d)>24) throw '1/'+d+' repeats every '+periodOf(d)+' digits — keep it under 24.'; return {d}; },
  q:p=>`1/${p.d}<small>first 6 decimal digits</small>`,
  ans:p=>repetendN(1,p.d).repeat(6).slice(0,6),
  check(p,v){ return normIn(v).replace(/^0?\./,'').slice(0,6)===this.ans(p); },
  gen({d}){
    const s=new Sc(), L=lastDigitOf(d), P=periodOf(d), r1=10%d, SP=2.6;
    s.put('t',0,-1.1,`1/${d}: first remainder 10 − ${Math.floor(10/d)*d} = ${r1}`,'lbl');
    s.snap(`Divide 1 by ${d}. The first remainder, <b>${r1}</b>, is the ratio of a geometrical progression of remainders.`);
    const rs=[]; let r=r1, half=-1;
    for(let i=0;i<P;i++){ rs.push(r); r=(r*10)%d; }
    rs.forEach((v,i)=>{ if(v===d-1&&half<0) half=i; });
    const show=Math.min(P,12);
    for(let i=0;i<show;i++){
      const v=rs[i];
      s.put('r'+i,i*SP,0,v,'res');
      if(i>0) s.link('r'+(i-1),'r'+i,'link',-0.45);
      s.hl('r'+i);
      const prev=i? rs[i-1] : 1;
      let say = i===0 ? `Remainder 1: <b>${v}</b>.` : `${prev} × ${r1} = ${prev*r1}${prev*r1>=d?`, cast out ${d}s → `:' → '}<b>${v}</b>.`;
      if(half>=0 && i===half) say+=` <i>That is ${d} − 1: half the remainders are done — the rest are their complements from ${d}.</i>`;
      if(i<4||i===half||i===show-1) s.snap(say);
    }
    s.put('Lb',0,1.15,`× ${L}`,'lbl');
    s.snap(`1/${d} must end in <b>${L}</b> (because ${d} × ${L} = ${d*L} ends in 9). Now apply <b>Śeṣāṇyaṅkena Carameṇa</b>: each remainder × ${L}, keep the last digit.`);
    let digits='';
    for(let i=0;i<show;i++){ const pr=rs[i]*L; s.put('p'+i,i*SP,1.9,pr,'work'); s.put('q'+i,i*SP+(len(pr)-1)*0.35,2.9,pr%10,'key'); digits+=pr%10; }
    s.snap(`${rs.slice(0,4).map(v=>`${v} × ${L} = ${v*L}`).join(', ')} … — the last digits are the decimal.`);
    const ok=digits===repetendN(1,d).repeat(3).slice(0,show);
    for(let i=0;i<show;i++) s.set('q'+i,{c:'ans'});
    s.put('A',0,4,`1/${d} = 0.${digits}${P>show?'…':''}`,'ans');
    s.snap(`<span class="ok">1/${d} = 0.${digits}${P>show?'…':''}</span>${P>show?` (period ${P})`:''}.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXVI.b denominators ending in 1, 3, 7 ---------- */
def({
  id:'otherend', chn:26, o:20, su:[1],
  name:'Denominators ending in 1, 3 or 7 — turn them into “…9”',
  sutra:{kind:'SŪTRA 1 OF 16', dev:'एकाधिकेन पूर्वेण', iast:'Ekādhikena Pūrveṇa', en:'“By one more than the previous one”'},
  short:'1/7 = 7/49 → ekādhika 5: divide 7 by 5, 21 by 5, 14 by 5 … → .142857.  1/13 = 3/39 (ekādhika 4).  1/17 = 7/119 (ekādhika 12).',
  brief:`<ol><li>Multiply top and bottom so the denominator ends in 9: ×7 for endings in 7, ×3 for 3, ×9 for 1.</li><li>The ekādhika of the new denominator (one more than what precedes its 9) is the divisor.</li><li>Divide left to right as for 1/19, prefixing each remainder to the quotient digit.</li><li>The halfway mark is the dividend D − N.</li></ol>`,
  why:`<p>n/d = (n·m)/(d·m), and choosing m with d·m ≡ 9 (mod 10) puts the fraction into the 10E − 1 shape the ekādhika method needs. The new numerator is simply m — which is also the last digit of the decimal (Ch. XXVI’s observation that 1/7 ends in 7, 1/13 in 3).</p>`,
  hist:`<p>Ch. XXVI works 1/7 as 7/49 (ekādhika 5) and observes that for 1/49 “the 21st digit … D − N (48)” marks the half. It admits that for 1/47 or 1/31 the ekādhika gets “unwieldy” (33, 28) and then switches to the remainders’ ratio instead.</p>`,
  ex:{d:7}, ph:'7, 13, 17, 21, 23 …',
  rand(){ return {d:pick([7,13,17,21,23,27,31,33,37,41,43,47,51])}; },
  parse(str){ const d=+normIn(str).replace(/^1\//,''); if(!d||![1,3,7].includes(d%10)) throw 'Use a denominator ending in 1, 3 or 7 (for 9, see the Ch. I lessons).'; if(periodOf(d)>46) throw 'Too long a period for the board.'; return {d}; },
  q:p=>`1/${p.d}<small>first 6 decimal digits</small>`,
  ans:p=>repetendN(1,p.d).repeat(6).slice(0,6),
  check(p,v){ return normIn(v).replace(/^0?\./,'').slice(0,6)===this.ans(p); },
  gen({d}){
    const s=new Sc(), m=lastDigitOf(d), D=d*m, E=(D+1)/10, R=repetendN(m,D), P=R.length;
    s.put('E',0,0,`1/${d}`); s.snap(`1/${d}: the denominator ends in ${d%10}, not 9.`);
    s.put('E2',0,0,`1/${d} = ${m}/${D}`,'n',{from:'E'}); s.del('E');
    s.put('lbl',0,-1.1,`×${m} top and bottom → ekādhika ${E}`,'lbl');
    s.snap(`Multiply top and bottom by ${m}: ${d} × ${m} = <b>${D}</b>, which ends in 9. Its ekādhika is <b>${E}</b>, and the new numerator is ${m}.`);
    const x0=len(`1/${d} = ${m}/${D} = 0.`)+0.3; s.put('E2',0,0,`1/${d} = ${m}/${D} = 0.`);
    const show=Math.min(P,16), X=i=>x0+i*1.4;
    let Dv=m, out='', half=false;
    for(let i=0;i<show;i++){
      const q=Math.floor(Dv/E), r=Dv%E;
      s.put('g'+i,X(i),0,q,'key').hl('g'+i); if(i) s.set('g'+(i-1),{c:'n'});
      s.put('r'+i,X(i)+0.8,0.62,r,'carry');
      s.put('w',0,1.8,`${Dv} ÷ ${E} = ${q} r ${r}`,'work').hl('w');
      const next=10*r+q; let say=`${Dv} ÷ ${E} = <b>${q}</b> remainder ${r}; next dividend ${r}${q} = ${next}.`;
      if(next===D-m&&!half&&P%2===0){ half=true; say+=` <i>${D-m} = ${D} − ${m}: halfway — the rest are 9-complements.</i>`; }
      if(i<6||i===show-1||say.includes('halfway')) s.snap(say);
      out+=q; Dv=next;
    }
    s.del('w'); for(let i=0;i<show;i++){ s.del('r'+i); s.set('g'+i,{c:'ans'}); }
    const ok=out===R.repeat(2).slice(0,show);
    s.snap(`<span class="ok">1/${d} = 0.${out}${P>show?'…':''}</span>${P>show?` (period ${P})`:''} — dividing only by ${E}.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXVI.c multiples: n/7 by rotation ---------- */
def({
  id:'cyclic', chn:26, o:30, sub:[3],
  name:'Multiples like 3/7 — rotate the cycle of 1/7',
  sutra:{kind:'SUB-SŪTRA 3', dev:'आद्यमाद्येनान्त्यमन्त्येन', iast:'Ādyamādyenāntyamantyena', en:'“The first by the first and the last by the last”'},
  short:'1/7 = .142857 ends in 7, so 3/7 must end in 1 (3 × 7 = 21): rotate to .428571. Or by the first digits: 3/7 ≈ .42… → .428571.',
  brief:`<p>For a denominator like 7 whose multiples all share one cycle of digits:</p>
    <ol><li><b>Antyam antyena</b>: the last digit of n/d is the last digit of n × (last digit of 1/d).</li><li><b>Ādyam ādyena</b>: or read the start from n/d roughly (3/7 ≈ 0.42…).</li><li>Rotate the cycle of 1/d so that it starts / ends there.</li></ol>`,
  why:`<p>n/d = n × (1/d); for a “full-reptend” denominator (period d − 1), multiplying by n just shifts the cycle, because n ≡ 10ᵏ (mod d) for some k — and multiplying by 10ᵏ moves the decimal point k places. The last digit then follows from n × L (mod 10).</p>`,
  hist:`<p>Ch. XXVI gives three table methods for the sixths of 7: numbering the digits of .142857 by size; reading the opening digits (2/7 should start .28, 4/7 at .57 with a carry); and — “the easiest and therefore the best” — the ending: 1/7 ends in 7, so 2/7 ends in 4, 3/7 in 1, 4/7 in 8, 5/7 in 5, 6/7 in 2.</p>`,
  ex:{d:7,n:3}, ph:'3/7, 5/17, 11/19 …',
  rand(){ const d=pick([7,7,17,19,23,29]); return {d,n:ri(2,d-1)}; },
  parse(str){ const m=normIn(str).match(/^(\d+)\/(\d+)$/); if(!m) throw 'Type a fraction like 3/7.'; const n=+m[1], d=+m[2]; if(![7,17,19,23,29,47,59,61].includes(d)) throw 'Use a full-cycle denominator: 7, 17, 19, 23, 29, 47, 59 or 61.'; if(n<1||n>=d) throw 'Numerator must be less than the denominator.'; return {n,d}; },
  q:p=>`${p.n}/${p.d}<small>first 6 decimal digits (1/${p.d} = 0.${repetendN(1,p.d).slice(0,12)}…)</small>`,
  ans:p=>repetendN(p.n,p.d).repeat(3).slice(0,6),
  check(p,v){ return normIn(v).replace(/^0?\./,'').slice(0,6)===this.ans(p); },
  gen({d,n}){
    const s=new Sc(), R1=repetendN(1,d), P=R1.length, L=lastDigitOf(d), Rn=repetendN(n,d);
    const show=Math.min(P,18);
    s.put('b',0,0,`1/${d} = 0.`); [...R1.slice(0,show)].forEach((c,i)=>s.put('c'+i,len(`1/${d} = 0.`)+i*1.2,0,c));
    s.snap(`We know 1/${d} = 0.${R1}… Its multiples use the <b>same cycle</b>, starting at a different place.`);
    const last=(n*L)%10;
    s.put('w',0,1.4,`ends in: ${n} × ${L} = ${n*L} → ${last}`,'work').hl('w');
    s.snap(`<b>Antyam antyena</b>: 1/${d} ends in ${L}, so ${n}/${d} ends in the last digit of ${n} × ${L} = ${n*L}: <b>${last}</b>.`);
    const approx=Math.floor(n*100/d);
    s.put('w2',0,2.4,`starts: ${n}/${d} ≈ 0.${pad(approx,2)}…`,'work').hl('w2');
    s.snap(`<b>Ādyam ādyena</b>: ${n}/${d} is about 0.${pad(approx,2)} — the cycle must start there.`);
    const k=R1.repeat(2).indexOf(Rn); // rotation offset
    for(let i=0;i<Math.min(show,P);i++){ const j=(k+i)%P; s.put('c'+j,len(`1/${d} = 0.`)+i*1.2,3.6,R1[j],'res',{from:'c'+j}); }
    s.put('b2',0,3.6,`${n}/${d} = 0.`,'n');
    s.snap(`Rotate the cycle so it begins with ${Rn.slice(0,2)} and (one full turn later) ends with ${last}.`);
    for(let i=0;i<Math.min(show,P);i++) s.set('c'+((k+i)%P),{c:'ans'});
    const ok=Rn===R1.slice(k)+R1.slice(0,k) && Rn[P-1]==String(last);
    s.snap(`<span class="ok">${n}/${d} = 0.${Rn}…</span> — no division needed.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXVI.d the converse: decimal → fraction ---------- */
def({
  id:'dec2frac', chn:26, o:40, su:[2,14],
  name:'Recurring decimal back to a fraction — multiply until all nines',
  sutra:{kind:'SŪTRAS 2 & 14', dev:'निखिलं … · एकन्यूनेन पूर्वेण', iast:'Nikhilam · Ekanyūnena Pūrveṇa', en:'All nines equal one'},
  short:'.076923 × 13 = .999999 = 1, so .076923… = 1/13. Find the multiplier digit by digit from the right, making each product digit 9.',
  brief:`<ol><li>0.999… = 1. So if some multiplier turns the repeating block into all nines, the decimal is 1 ÷ that multiplier.</li><li>Find the multiplier from the right: its last digit must make the product end in 9 (last digit 3 → × 3; 7 → × 7; 9 → × 1; 1 → × 9).</li><li>Choose each further digit so the next product digit (with carries) is also 9.</li></ol>`,
  why:`<p>If the block R has p digits, the decimal equals R/(10ᵖ − 1) = R/99…9. A multiplier m with R·m = 99…9 therefore gives decimal = 1/m. Building m digit by digit is just solving R·m ≡ −1 (mod 10ᵏ) for k = 1, 2, … .</p>`,
  hist:`<p>Ch. XXVI’s “converse operation”: “if a given decimal can be multiplied by a multiplier in such a manner as to produce a product consisting of only nines … the operation desired becomes automatically complete”. Its examples: .076923 (× 13), .037 (× 27), .142857 (× 7), .047619 (× 21).</p>`,
  ex:{d:13}, ph:'Random only — press Random', noParse:true,
  rand(){ return {d:pick([7,11,13,21,27,33,37,41,77,101,111,99])}; },
  parse(){ throw 'Use Random.'; },
  q:p=>`0.${repetendN(1,p.d)} recurring<small>as a fraction 1/m — m = ?</small>`,
  ans:p=>String(p.d),
  check(p,v){ const t=normIn(v).replace(/^1\//,''); return +t===p.d; },
  gen({d}){
    const s=new Sc(), R=repetendN(1,d), P=R.length, Rn=BigInt(R), nines=10n**BigInt(P)-1n;
    s.put('E',0,0,`0.${R} ${R.length>1?'(recurring)':''}`);
    s.snap(`Turn the recurring decimal 0.${R}… into a fraction. Look for a multiplier that makes the block all nines.`);
    let m=0n, digits=[];
    for(let j=0;j<12;j++){
      const p10=10n**BigInt(j+1);
      let t=0; for(;t<10;t++){ const mm=m+BigInt(t)*10n**BigInt(j); if(((Rn*mm)%p10)===(p10-1n)%p10 || (Rn*mm)%p10===p10-1n) { m=mm; break; } }
      digits.push(t);
      s.put('m',0,1.3,`multiplier so far: ${m}`,'work').put('pr',0,2.3,`${R} × ${m} = ${Rn*m}`,'work').hl('m','pr');
      s.snap(j===0? `The block ends in ${R[P-1]}; × ${t} makes the product end in 9.` : `Next digit of the multiplier: ${t}, so the product ends in ${'9'.repeat(j+1)}.`);
      if(Rn*m===nines) break;
    }
    const ok=Rn*m===nines && m===BigInt(d);
    s.put('A',0,3.6,`0.${R}… × ${m} = 0.${'9'.repeat(P)}… = 1   ⇒   1/${m}`,'ans');
    s.snap(`The product is ${'9'.repeat(P)} — all nines, i.e. 1. <span class="ok">0.${R}… = 1/${m}</span>.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXVII: straight division (Dhvajāṅka) ---------- */
function straightDivide(N,d){
  const ds=String(d), D0=+ds[0], F=ds.slice(1).split('').map(Number), k=F.length, nd=String(N).split('').map(Number), n=nd.length;
  if(n<=k) return null;
  let g=1; while(g<n-k && Number(nd.slice(0,g).join(''))<D0) g++;
  const m=n-k-g+1;
  /* Each quotient digit is the largest one that keeps every later step non-negative — which is
     exactly the true digit of N ÷ d. (Tested: with these digits no net dividend or remainder ever goes negative.) */
  const Qs=String(Math.floor(N/d)).padStart(m,'0'), q=Qs.split('').map(Number), steps=[]; let r=0;
  for(let j=0;j<m;j++){
    const gross = j===0 ? Number(nd.slice(0,g).join('')) : 10*r+nd[g+j-1];
    let sub=0; const cross=[]; for(let i=1;i<=k;i++){ const t=j-i; if(t>=0){ sub+=F[i-1]*q[t]; cross.push([i-1,t]); } }
    const net=gross-sub, naive=Math.min(9,Math.floor(net/D0)); r=net-q[j]*D0;
    steps.push({gross,sub,cross,net,q:q[j],r,naive});
  }
  const tail=Number(nd.slice(n-k).join(''))||0; let corr=0;
  for(let t=1;t<=k;t++){ let s2=0; for(let i=t;i<=k;i++){ const idx=m+t-i-1; if(idx>=0&&idx<m) s2+=F[i-1]*q[idx]; } corr+=s2*10**(k-t); }
  const Q=Math.floor(N/d), R=r*10**k+tail-corr;
  return {D0,F,k,g,m,q,steps,tail,corr,rLast:r,Q,R,adj:R===N%d?[]:[0]};
}
def({
  id:'straightdiv', chn:27, o:10, su:[3],
  name:'Straight division (Dhvajāṅka) — any divisor, one line',
  sutra:{kind:'SŪTRA 3 · DHVAJĀṄKA', dev:'ऊर्ध्वतिर्यग्भ्याम् · ध्वजाङ्क', iast:'Ūrdhva-Tiryagbhyām · Dhvajāṅka', en:'“Vertically and crosswise”, with the “flag” digits'},
  short:'38982 ÷ 73: divide only by 7; the 3 goes up on the flag. 38 ÷ 7 = 5 r 3; 39 − 3×5 = 24 → 3 r 3; 38 − 3×3 = 29 → 4 r 1; 12 − 3×4 = 0 → 534 exactly.',
  brief:`<p>The general method of division (“the crowning gem”):</p>
    <ol><li>Keep only the <b>first digit</b> of the divisor as the actual divisor; hoist the rest onto the <b>flag</b>.</li><li>Mark off as many digits at the right of the dividend as there are flag digits (the remainder area).</li><li>Divide; prefix the remainder to the next dividend digit (the <i>gross</i> dividend).</li><li>Subtract the crosswise product(s) of the flag digit(s) with the quotient digits already found (the <i>net</i> dividend), then divide again.</li><li>If a subtraction would go negative, take a smaller quotient digit and a bigger remainder.</li></ol>`,
  why:`<p>Write the divisor as 7x + 3 and the dividend as 38x³ + 9x² + 8x + 2 (x = 10). Algebraic long division by 7x + 3 subtracts 3 × (each quotient term) one place later — exactly the flag correction — while the remainders carried as 30x² etc. are the prefixing. Tīrtha shows this algebra in full for 38982 ÷ 73.</p>`,
  hist:`<p>Ch. XXVII calls this “the crowning gem of all … capable of immediate application to all cases”, and it answers the Linking Note after Ch. VI, which admitted that Nikhilam and Parāvartya division suit only special divisors. With several flag digits the subtraction becomes a full Ūrdhva-Tiryak cross-product — “irrespective of the number of digits in the divisor … our actual divisor is of one digit only”.</p>`,
  ex:{N:38982,d:73}, ph:'38982 ÷ 73 or 7031985 ÷ 823',
  rand(){ const d=Math.random()<.65? ri(21,98) : ri(112,989); const N=ri(d*20, Math.min(9999999,d*9999)); return {N,d}; },
  parse(str){ const b=binop(str,DIV); if(!b) throw 'Type it like 38982 ÷ 73.'; const [N,d]=b; if(d<12) throw 'Use a divisor of two or more digits.'; if(String(d)[0]==='1'&&d<100) throw 'A divisor starting with 1 makes a tiny actual divisor — the book would use 12, 13 … as a two-digit main divisor; try another.'; if(!straightDivide(N,d)) throw 'The dividend needs more digits than the divisor.'; if(N>99999999) throw 'Up to 8 digits.'; return {N,d}; },
  q:p=>`${p.N} ÷ ${p.d}<small>quotient r remainder</small>`,
  ans:p=>`${Math.floor(p.N/p.d)} r ${p.N%p.d}`,
  check(p,v){ const m=(String(v).match(/\d+/g)||[]).map(Number); return m[0]===Math.floor(p.N/p.d)&&(m[1]??0)===p.N%p.d; },
  gen({N,d}){
    const s=new Sc(), X=straightDivide(N,d), {D0,F,k,g,m,q,steps}=X, nd=String(N).split(''), n=nd.length;
    const SP=2.2, X0=k+2.2, cx=i=>X0+i*SP;
    F.forEach((f,i)=>s.put('F'+i,i,0,f,'dev')); s.put('D0',Math.max(0,k-1),1.15,D0,'key');
    s.seg('vb',k+0.9,-0.5,k+0.9,2.5,'bar');
    nd.forEach((c,i)=>s.put('n'+i,cx(i),0,c));
    const rbx=cx(n-k)-SP/2+0.5; s.seg('rb',rbx,-0.5,rbx,3.6,'bar');
    s.snap(`Divide <b>${N}</b> by <b>${d}</b>. Keep only <b>${D0}</b> as the divisor; hoist <b>${F.join('')}</b> onto the flag. The last ${k>1?k+' digits':'digit'} of the dividend form${k>1?'':'s'} the remainder area.`);
    const yQ=2.5;
    steps.forEach((st,j)=>{
      const col = j===0 ? g-1 : g+j-1;
      if(j===0){
        for(let i=0;i<g;i++) s.hl('n'+i);
        s.put('w',0,3.7,`${st.gross} ÷ ${D0} = ${st.q} r ${st.r}`,'work');
        s.put('q0',cx(col),yQ,st.q,'res').hl('q0');
        s.put('rr0',cx(col+1)-0.55,0.62,st.r,'carry');
        s.snap(`First, ${g>1?`the first ${g} digits, `:''}<b>${st.gross}</b> ÷ ${D0} = <b>${st.q}</b>, remainder ${st.r} — written small, prefixed to the next digit.`+(st.q<st.naive?` <i>(${st.naive} would fit, but the flag subtraction next would go negative — take ${st.q}.)</i>`:''));
      } else {
        s.hl('n'+col,'rr'+(j-1));
        st.cross.forEach(([fi,t])=>{ s.link('F'+fi,'q'+t,'x').hl('F'+fi,'q'+t); });
        s.put('w',0,3.7,`gross ${st.gross} − (${st.cross.map(([fi,t])=>`${F[fi]}×${q[t]}`).join(' + ')}) = ${st.net}  →  ÷ ${D0} = ${st.q} r ${st.r}`,'work');
        s.put('q'+j,cx(col),yQ,st.q,'res').hl('q'+j);
        if(j<m-1 || k>0) s.put('rr'+j,cx(col+1)-0.55,0.62,st.r,'carry');
        s.snap(`Gross dividend <b>${st.gross}</b> (remainder ${steps[j-1].r} prefixed to ${nd[col]}). Subtract the flag × quotient cross-product${st.cross.length>1?'s':''} ${st.cross.map(([fi,t])=>`${F[fi]} × ${q[t]}`).join(' + ')} = ${st.sub}: net <b>${st.net}</b>. ${st.net} ÷ ${D0} = <b>${st.q}</b> r ${st.r}.`+(st.q<st.naive?` <i>(${st.naive} would fit, but would leave too little for the next subtraction — so take ${st.q} and a bigger remainder, as the book does.)</i>`:''));
      }
    });
    s.del('w');
    const Rraw=X.rLast*10**k+X.tail-X.corr;
    s.put('w',0,3.7,`remainder: ${X.rLast}${pad(X.tail,k)} − ${X.corr} = ${Rraw}`,'work').hl('w');
    s.snap(`Remainder area: the last remainder ${X.rLast} prefixed to ${pad(X.tail,k)} gives ${X.rLast}${pad(X.tail,k)}; subtract the cross-products that fall there (${X.corr}): <b>${Rraw}</b>.`);
    if(X.adj.length){ s.put('w2',0,4.7,`adjust: ${X.adj[0]<0?`R negative → add ${d}, take 1 from Q`:`R ≥ ${d} → subtract ${d}, add 1 to Q`}`,'work').hl('w2'); s.snap(`The remainder is ${Rraw<0?'negative':'too big'}: ${X.adj[0]<0?`borrow one divisor from the quotient`:`take the divisor out once more`}.`); }
    const ok=X.Q===Math.floor(N/d)&&X.R===N%d;
    s.put('A',0,X.adj.length?5.8:4.8,`${N} ÷ ${d} = ${X.Q} r ${X.R}`,'ans');
    s.snap(`<span class="ok">${N} ÷ ${d} = ${X.Q} remainder ${X.R}</span> — every division was by ${D0} alone.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXVIII: auxiliary fractions ---------- */
function auxDigits(n,E,k,type,count){
  const B=10**k, out=[], rem=[]; let D= type===1 ? n : n-1;
  for(let i=0;i<count;i++){ const q=Math.floor(D/E), r=D%E; out.push(q); rem.push(r); D = r*B + (type===1 ? q : (B-1-q)); }
  return {out,rem};
}
def({
  id:'auxfrac1', chn:28, o:10, su:[1],
  name:'Auxiliary fractions — denominators ending in 9, 99, 999 …',
  sutra:{kind:'SŪTRA 1 · SAHĀYAKA', dev:'एकाधिकेन पूर्वेण', iast:'Ekādhikena Pūrveṇa', en:'The “auxiliary fraction”: divide by the ekādhika'},
  short:'21863/49999 → auxiliary 2.1863/5: divide by 5 in 4-digit groups, prefixing each remainder to its group → .4372 6874 5374 …',
  brief:`<ol><li>Drop the final nines from the denominator and add one to what’s left (49999 → 5). That is the divisor.</li><li>Move the numerator’s decimal point as many places as nines dropped.</li><li>Divide in <b>groups</b> of that many digits; prefix each remainder to the group just obtained to form the next dividend.</li></ol>
    <p class="note">With one nine this is exactly the Ch. I division method for 1/19.</p>`,
  why:`<p>For d = E·10ᵏ − 1:</p><div class="eqn">n/d = (n/(E·10ᵏ)) · 1/(1 − 1/(E·10ᵏ))</div><p>Base 10ᵏ plays the role of 10: each k-digit group is a “digit”, and prefixing remainder-then-group is forming the next dividend r·10ᵏ + q.</p>`,
  hist:`<p>Ch. XXVIII introduces the <i>sahāyaka</i> (auxiliary) fractions “by which … the burden of the subsequent operations is also considerably lightened”: division by 49999 becomes division by 5. Tīrtha warns that “the prefixed remainders are not parts of the quotient … and are therefore to be dropped out of the answer”.</p>`,
  ex:{n:21863,E:5,k:4}, ph:'Random only — press Random', noParse:true,
  rand(){ const k=pick([1,2,2,3,4]), E=ri(2,9), d=E*10**k-1; return {n:ri(1,d-1),E,k}; },
  parse(){ throw 'Use Random.'; },
  q:p=>`${p.n}/${p.E*10**p.k-1}<small>first 6 decimal digits</small>`,
  ans(p){ const {out}=auxDigits(p.n,p.E,p.k,1,Math.ceil(6/p.k)+1); return out.map(v=>pad(v,p.k)).join('').slice(0,6); },
  check(p,v){ return normIn(v).replace(/^0?\./,'').slice(0,6)===this.ans(p); },
  gen({n,E,k}){
    const s=new Sc(), d=E*10**k-1, groups=Math.max(3,Math.min(8,Math.ceil(12/k)));
    s.put('F',0,0,`F = ${n}/${d}`); s.snap(`Express <b>${n}/${d}</b> as a decimal.`);
    const AF=`${(n/10**k).toFixed(k)}/${E}`;
    s.put('AF',0,1.1,`AF = ${AF}   (groups of ${k})`,'work').hl('AF');
    s.snap(`Drop the ${k} nine${k>1?'s':''} and add one: <b>${E}</b>. Shift the numerator ${k} place${k>1?'s':''}: auxiliary fraction <b>${AF}</b> — divide by ${E} in groups of ${k} digit${k>1?'s':''}.`);
    const {out,rem}=auxDigits(n,E,k,1,groups), SP=k+1.4, x0=2;
    s.put('pt',0,2.4,'.','n');
    let D=n;
    out.forEach((q,i)=>{ s.put('q'+i,x0+i*SP,2.4,pad(q,k),'key').hl('q'+i); if(i) s.set('q'+(i-1),{c:'n'});
      s.put('r'+i,x0+(i+1)*SP-0.6,3.0,rem[i],'carry');
      s.put('w',0,4,`${D} ÷ ${E} = ${q} r ${rem[i]}`,'work').hl('w');
      if(i<3||i===out.length-1) s.snap(`${D} ÷ ${E} = <b>${pad(q,k)}</b>, remainder ${rem[i]} — prefix it to this group: next dividend ${rem[i]}${pad(q,k)}.`);
      D=rem[i]*10**k+q; });
    s.del('w'); out.forEach((_,i)=>{ s.del('r'+i); s.set('q'+i,{c:'ans'}); });
    const dec=out.map(v=>pad(v,k)).join(''); const truth=(()=>{ let r=n, t=''; for(let i=0;i<dec.length;i++){ r*=10; t+=Math.floor(r/d); r%=d; } return t; })();
    s.snap(`<span class="ok">${n}/${d} = 0.${dec}…</span> — every division was by ${E}.`+(dec===truth?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

def({
  id:'auxfrac2', chn:28, o:20, su:[1,2],
  name:'Auxiliary fractions — denominators ending in 1 (complements from 9)',
  sutra:{kind:'SŪTRAS 1 & 2 · SAHĀYAKA', dev:'एकाधिकेन · निखिलम्', iast:'Ekādhikena · Nikhilam', en:'Auxiliary fraction of the second type'},
  short:'1/41 → AF = 0.0/4: divide by 4, but prefix each remainder to the 9-complement of the quotient digit: 0, 09→2, 17→4, 15→3, 36→9 … = .02439',
  brief:`<ol><li>Drop the final 1 of the denominator and reduce the numerator by 1 (2743/7001 → 2742/7000 = 2.742/7).</li><li>Divide by the shortened denominator (7).</li><li>Prefix each remainder not to the quotient digit but to its <b>complement from 9</b> (or from 99…9 for groups).</li></ol>`,
  why:`<p>For d = E·10ᵏ + 1, 1/d = (1/(E·10ᵏ))·1/(1 + 1/(E·10ᵏ)) — the series now <i>alternates</i>. Subtracting the quotient instead of adding it is the same as adding its complement from 10ᵏ − 1 and taking one away — which is why the numerator starts one less.</p>`,
  hist:`<p>Ch. XXVIII: “after the first division … we prefix the remainder not to each quotient-digit but to its COMPLEMENT from NINE … This is the whole secret of the second type of Auxiliary Fraction.” Examples include 1/41 and 2743/7001 (with three-digit groups).</p>`,
  ex:{n:1,E:4,k:1}, ph:'Random only — press Random', noParse:true,
  rand(){ const k=pick([1,1,2,3]), E=ri(2,9), d=E*10**k+1; return {n:ri(1,d-1),E,k}; },
  parse(){ throw 'Use Random.'; },
  q:p=>`${p.n}/${p.E*10**p.k+1}<small>first 6 decimal digits</small>`,
  ans(p){ const {out}=auxDigits(p.n,p.E,p.k,2,Math.ceil(6/p.k)+1); return out.map(v=>pad(v,p.k)).join('').slice(0,6); },
  check(p,v){ return normIn(v).replace(/^0?\./,'').slice(0,6)===this.ans(p); },
  gen({n,E,k}){
    const s=new Sc(), d=E*10**k+1, B=10**k, groups=Math.max(3,Math.min(8,Math.ceil(12/k)));
    s.put('F',0,0,`F = ${n}/${d}`); s.snap(`Express <b>${n}/${d}</b> as a decimal. The denominator ends in 1.`);
    const AF=`${((n-1)/B).toFixed(k)}/${E}`;
    s.put('AF',0,1.1,`AF = ${n-1}/${E*B} = ${AF}`,'work').hl('AF');
    s.snap(`Drop the final 1 (${d} → ${E*B}) and take one from the numerator (${n} → ${n-1}): auxiliary fraction <b>${AF}</b>.`);
    const {out,rem}=auxDigits(n,E,k,2,groups), SP=k+1.6, x0=2;
    s.put('pt',0,2.4,'.','n');
    let D=n-1;
    out.forEach((q,i)=>{ s.put('q'+i,x0+i*SP,2.4,pad(q,k),'key').hl('q'+i); if(i) s.set('q'+(i-1),{c:'n'});
      const comp=B-1-q;
      s.put('c'+i,x0+i*SP,3.1,pad(comp,k),'dev');
      s.put('w',0,4.1,`${D} ÷ ${E} = ${q} r ${rem[i]};  complement of ${pad(q,k)} is ${pad(comp,k)}`,'work').hl('w','c'+i);
      if(i<3||i===out.length-1) s.snap(`${D} ÷ ${E} = <b>${pad(q,k)}</b> r ${rem[i]}. The next dividend is the remainder prefixed to the <b>complement</b> ${pad(comp,k)}: ${rem[i]}${pad(comp,k)}.`);
      D=rem[i]*B+comp; });
    s.del('w'); out.forEach((_,i)=>{ s.del('c'+i); s.set('q'+i,{c:'ans'}); });
    const dec=out.map(v=>pad(v,k)).join(''); const truth=(()=>{ let r=n, t=''; for(let i=0;i<dec.length;i++){ r*=10; t+=Math.floor(r/d); r%=d; } return t; })();
    s.snap(`<span class="ok">${n}/${d} = 0.${dec}…</span>`+(dec===truth?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- XXIX: negative osculators ---------- */
function negOsc(d){ const m={1:1,3:7,7:3,9:9}[d%10]; return m? {Q:(d*m-1)/10,m} : null; }
def({
  id:'negosc', chn:29, o:20, su:[1], sub:[5], verdict:true,
  name:'Negative osculators — subtract instead of add',
  sutra:{kind:'SUB-SŪTRA 5', dev:'वेष्टनम्', iast:'Veṣṭanam', en:'Osculation by the negative osculator Q'},
  short:'For 7: 7 × 3 = 21 → drop the 1 → Q = 2. 2774: 277 − 2×4 = 269; 26 − 2×9 = 8 → not divisible. And P + Q = D (5 + 2 = 7).',
  brief:`<ol><li>Find Q: multiply the divisor until it ends in <b>1</b>, and drop that 1 (7 × 3 = 21 → 2; 13 × 7 = 91 → 9; 11 → 1).</li><li>Subtract Q × last digit from the rest of the number.</li><li>Repeat (ignoring signs) until the number is small; test that.</li></ol>
    <p class="note">The positive osculator P (Ekādhika) and the negative one Q always add up to the divisor.</p>`,
  why:`<p>By construction 10Q + 1 is a multiple of d, so 10Q ≡ −1 (mod d). For N = 10q + r, 10(q − Q·r) = N − r(10Q + 1) ≡ N (mod d). And since 10P − 1 ≡ 0 too, 10(P + Q) ≡ 0, so P + Q ≡ 0 (mod d) — with both less than d, P + Q = d.</p>`,
  hist:`<p>Ch. XXIX defines the negative osculator in two clauses — “for divisors ending in 1, simply drop the one; in the other cases multiply so as to get 1 as the last digit … and then drop the 1” — tabulates P and Q for divisors up to 81, and notes the beautiful feature P + Q = D. The familiar school test for 7 (“double the last digit and subtract”) is Q = 2.</p>`,
  ex:{n:2774,d:7}, ph:'2774 by 7',
  rand(){ const d=pick([7,11,13,17,21,23,31,41,51,61,71]); let n=d*ri(Math.ceil(300/d),Math.floor(99999/d)); if(Math.random()<.5) n+=ri(1,d-1); return {n,d}; },
  parse(str){ const b=binop(str,DIV+'|,'); if(!b) throw 'Type it like 2774 by 7.'; const [n,d]=b; if(!negOsc(d)||d<3) throw 'The divisor must end in 1, 3, 7 or 9.'; return {n,d}; },
  q:p=>`Is ${p.n} divisible by ${p.d}?<small>yes or no</small>`,
  ans:p=>p.n%p.d===0?'yes':'no',
  check(p,v){ return yesNo(v)===(p.n%p.d===0?'yes':'no'); },
  gen({n,d}){
    const s=new Sc(), {Q,m}=negOsc(d), P=osculator(d).E, W=len(n);
    s.put('lbl',0,-1.2,`${d} × ${m} = ${d*m} → Q = ${Q}   (P = ${P}, P + Q = ${P+Q})`,'lbl');
    s.snap(`Negative osculator for ${d}: ${d} × ${m} = ${d*m}; drop the final 1 → <b>Q = ${Q}</b>. (The positive one is P = ${P}, and P + Q = ${P+Q} = ${d}.)`);
    let N=n, row=0;
    const putRow=(N,row)=>{ const A=Math.abs(N), q=Math.floor(A/10), r=A%10, Qs=q?String(q):''; if(Qs) s.put('q'+row,W-1-len(Qs),row,Qs); s.put('r'+row,W-1,row,r); };
    putRow(N,0);
    let it=0;
    while(Math.abs(N)>=10*d && it<14){
      const A=Math.abs(N), q=Math.floor(A/10), r=A%10, N2=q-Q*r;
      s.hl('r'+row).put('w'+row,W+1.4,row,`${q} − ${Q}×${r} = ${N2}`,'work').hl('w'+row); if(s.has('q'+row)) s.hl('q'+row);
      row++; putRow(N2,row);
      s.snap(`Rest ${q} minus ${Q} × last digit ${r}: <b>${N2}</b>${N2<0?' (the sign doesn’t matter for divisibility)':''}.`);
      s.set('w'+(row-1),{c:'work dim'}); N=N2; it++;
    }
    const A=Math.abs(N), ok=A%d===0;
    s.put('v',0,row+1.4, ok?`${A} = ${d} × ${A/d}  ✓`:`${A} is not a multiple of ${d}  ✗`, ok?'ans':'bad');
    s.snap(ok?`<span class="ok">${n} is divisible by ${d}</span>.`:`<span class="no">${n} is not divisible by ${d}</span> (remainder ${n%d}).`);
    return s.fr;
  }
});

/* ---------- XXX: multiplex osculators (digit groups) ---------- */
function multiplexFor(d){
  let best=null;
  for(let m=1;m<=2000;m++){ const v=d*m, s=String(v);
    for(let k=2;k<=5;k++){ const B=10**k; if(v%B===B-1){ const E=(v+1)/B; if(!best||E+k*0.5<best.E+best.k*0.5) best={type:'P',E,k,m,v}; }
      if(v%B===1){ const E=(v-1)/B; if(E>0&&(!best||E+k*0.5<best.E+best.k*0.5)) best={type:'Q',E,k,m,v}; } } }
  return best;
}
def({
  id:'multiplex', chn:30, o:10, su:[1], sub:[5], verdict:true,
  name:'Multiplex osculators — osculating whole groups of digits',
  sutra:{kind:'SUB-SŪTRA 5', dev:'वेष्टनम्', iast:'Veṣṭanam', en:'Osculation in groups (“multiplex”)'},
  short:'For 499, P₂ = 5: split 106656874269 into 2-digit groups and osculate by 5 — 69×5 + 42 = 387, … → 499. Divisible.',
  brief:`<ol><li>Find a multiple of the divisor that ends in a run of nines (…999) or in 00…01. Then P<sub>k</sub> (or Q<sub>k</sub>) is what stands before them, and k is the group size (499 → P₂ = 5; 7001 → Q₃ = 7; 857 × 7 = 5999 → P₃ = 6).</li><li>Take the last k-digit group × osculator, and add (P) or subtract (Q) it from the rest.</li><li>Repeat; test the small result.</li></ol>`,
  why:`<p>If d divides E·10ᵏ − 1 then E·10ᵏ ≡ 1 (mod d); for N = rest·10ᵏ + g, E·N ≡ rest + E·g. For E·10ᵏ + 1 the sign flips: E·N ≡ −(rest − E·g). Either way the divisibility of N by d is unchanged, but the number shrinks by k digits at a time.</p>`,
  hist:`<p>Ch. XXX handles big divisors “by formulating a scheme of groups of digits which can be osculated, not as individual digits but in a lump”, with the notation P₂ = 5 for 499, Q₃ = 7 for 7001 and so on. Its striking special case: 1001 = 7 × 11 × 13 has Q₃ = 1, so the alternating sum of 3-digit groups tests for 7, 11 and 13 at once.</p>`,
  ex:{n:106656874269,d:499}, ph:'106656874269 by 499',
  rand(){ const d=pick([499,1399,1501,2999,5001,7001,857,43,229,347,359,367,421,433,467,1001,999,99]); const mul=multiplexFor(d); let n=d*ri(10**(mul.k+1),10**(mul.k+4)); if(Math.random()<.5) n+=ri(1,d-1); return {n,d}; },
  parse(str){ const b=binop(str,DIV+'|,'); if(!b) throw 'Type it like 106656874269 by 499.'; const [n,d]=b; if(!multiplexFor(d)) throw 'No small multiplex osculator found for '+d+' (it must not share a factor with 10).'; if(n>1e15) throw 'Keep the number under 16 digits.'; return {n,d}; },
  q:p=>`Is ${p.n} divisible by ${p.d}?<small>yes or no</small>`,
  ans:p=>p.n%p.d===0?'yes':'no',
  check(p,v){ return yesNo(v)===(p.n%p.d===0?'yes':'no'); },
  gen({n,d}){
    const s=new Sc(), O=multiplexFor(d), {type,E,k,m,v}=O, B=10**k;
    s.put('lbl',0,-1.2,`${d}${m>1?` × ${m} = ${v}`:''} → ${type}${['','','₂','₃','₄','₅'][k]} = ${E}`,'lbl');
    s.snap(`${m>1?`${d} × ${m} = ${v}`:`${d}`} ${type==='P'?`ends in ${k} nines`:`ends in ${'0'.repeat(k-1)}1`}: the osculator is <b>${type}${['','','₂','₃','₄','₅'][k]} = ${E}</b> — work in groups of <b>${k}</b> digits, ${type==='P'?'adding':'subtracting'}.`);
    let N=n, row=0; const W=len(n);
    s.put('n0',0,0,String(n));
    let it=0;
    while(Math.abs(N)>=B*d && it<16){
      const A=Math.abs(N), rest=Math.floor(A/B), g=A%B, N2= type==='P'? rest+E*g : rest-E*g;
      s.put('w'+row,W+1.5,row,`${rest} ${type==='P'?'+':'−'} ${E}×${pad(g,k)} = ${N2}`,'work').hl('w'+row);
      row++; s.put('n'+row,0,row,String(N2),'n');
      s.snap(`Last group ${pad(g,k)} × ${E} = ${E*g}, ${type==='P'?'added to':'subtracted from'} the rest ${rest}: <b>${N2}</b>.`);
      s.set('w'+(row-1),{c:'work dim'}); N=N2; it++;
    }
    const A=Math.abs(N), ok=A%d===0;
    s.put('vv',0,row+1.4, ok?`${A} = ${d} × ${A/d}  ✓`:`${A} is not a multiple of ${d}  ✗`, ok?'ans':'bad');
    s.snap(ok?`<span class="ok">${n} is divisible by ${d}</span>.`:`<span class="no">${n} is not divisible by ${d}</span> (remainder ${n%d}).`);
    return s.fr;
  }
});
