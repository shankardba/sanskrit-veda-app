'use strict';
/* Chapters I–VI: new lessons (recurring decimals by division, vinculum, algebraic Ūrdhva,
   compound measures, Ekanyūnena's third case, Parāvartya & argumental polynomial division) */

/* generic repetend of n/d for d coprime to 10, n<d */
function repetendN(n,d){ let r=n%d, s=''; const start=r; do{ r*=10; s+=Math.floor(r/d); r%=d; }while(r!==start && s.length<600); return s; }
/* centre a token on column cx */
const cput=(s,k,cx,y,t,c='n',o={})=>s.put(k,cx-len(String(t))/2,y,t,c,o);
const powLbl = p => p===0 ? '1' : 'x'+(p>1?sup(p):'');

/* ---------- Ch. I: 1/19 by DIVISION, left to right ---------- */
def({
  id:'recipdiv', chn:1, o:20, su:[1],
  name:'Recurring decimals by division (left to right)',
  sutra:{kind:'SŪTRA 1 OF 16', dev:'एकाधिकेन पूर्वेण', iast:'Ekādhikena Pūrveṇa', en:'“By one more than the previous one” — this time used as a divisor'},
  ch:'see also Ch. XXVI',
  short:'1/19 from the front: divide by 2 (not 19); each remainder is prefixed to the quotient digit just written.',
  brief:`<p>Tīrtha’s <b>second method</b> for denominators ending in 9: “by” the ekādhika can mean <i>divide</i> as well as multiply.</p>
    <ol><li>Divide the numerator by the ekādhika E (2 for 19, 3 for 29, 5 for 49).</li><li>Write the quotient digit, and put the remainder <b>in front of</b> it: remainder-then-digit is the next dividend (10r + q).</li><li>Keep dividing by the same small E.</li><li>When the dividend reaches d − n (18 for 1/19), half the block is done — the rest are 9-complements.</li></ol>`,
  why:`<p>Write d = 10E − 1. Then n/d = (n/10) / (E − 1/10), and</p><div class="eqn">n/d = (n/10E) · 1/(1 − 1/(10E))</div><p>so each step is “divide by E, then add one tenth of the quotient”. Prefixing the remainder r to the quotient digit q forms the next dividend 10r + q — which is exactly that: carry the remainder down, and feed the digit just found back in.</p>`,
  hist:`<p>Ch. I gives both one-line methods for 1/19 side by side: multiply by 2 from the right, or divide by 2 from the left. Tīrtha notes the rule in plain terms: in multiplication each surplus digit is carried to the <i>left</i>; in division each remainder is prefixed to the <i>right</i>. Both reach 18 (= 19 − 1) exactly halfway.</p>`,
  ex:{n:1,d:19}, ph:'1/19, 7/49, 3/29 …',
  rand(){ const d=pick([19,29,39,49,59,69,79,89]); let n=1; if(Math.random()<.35){ do{ n=ri(2,d-1); }while(gcd(n,d)!==1); } return {n,d}; },
  parse(str){ const m=String(str).replace(/\s/g,'').match(/^(\d+)\/(\d+)$/); if(!m) throw 'Type a fraction like 1/19 or 7/49.'; const n=+m[1], d=+m[2];
    if(d%10!==9) throw 'The denominator must end in 9.'; if(n<1||n>=d) throw 'Use a proper fraction (numerator smaller than denominator).'; if(gcd(n,d)!==1) throw 'Reduce the fraction first.';
    if(repetendN(n,d).length>60) throw 'That one repeats every '+repetendN(n,d).length+' digits — too long for the board.'; return {n,d}; },
  q:p=>`${p.n}/${p.d}<small>first 8 decimal digits</small>`,
  ans:p=>repetendN(p.n,p.d).repeat(8).slice(0,8),
  check(p,v){ return normIn(v).replace(/^0?\./,'').slice(0,8)===this.ans(p); },
  gen({n,d}){
    const s=new Sc(), E=(d+1)/10, R=repetendN(n,d), P=R.length;
    const lhs=`${n}/${d} = 0.`; s.put('lhs',0,0,lhs);
    const x0=len(lhs)+0.4, X=i=>x0+i*1.3;
    for(let i=0;i<P;i++) s.put('ph'+i,X(i),0,'·','dim');
    s.put('lbl',0,-1.1,`divide by the ekādhika ${E}`,'lbl');
    s.snap(`${d} ends in 9; one more than ${(d-9)/10} gives the ekādhika <b>${E}</b>. Instead of dividing by ${d}, we divide by <b>${E}</b> — from the <b>left</b> this time.`);
    let D=n, out='', half=false;
    for(let i=0;i<P;i++){
      const q=Math.floor(D/E), r=D%E;
      s.del('ph'+i).put('g'+i,X(i),0,q,'key').hl('g'+i);
      if(i>0) s.set('g'+(i-1),{c:'n'});
      s.put('r'+i,X(i)+0.75,0.62,r,'carry');
      s.put('w',0,1.75,`${D} ÷ ${E} = ${q} r ${r}`,'work').hl('w');
      if(i>0) s.link('r'+(i-1),'g'+i,'link',0);
      let say = i===0 ? `First dividend: the numerator <b>${D}</b>. ${D} ÷ ${E} = <b>${q}</b>, remainder ${r} — write the remainder small, just after the digit.` : `Next dividend: remainder ${Math.floor(D/10)} prefixed to the last digit ${D%10} → <b>${D}</b>. ${D} ÷ ${E} = <b>${q}</b> r ${r}.`;
      const next=10*r+q;
      if(next===d-n && !half && i<P-1){ half=true; say+=` <i>The next dividend is ${d-n} = ${d} − ${n}: half the block is done; the rest are 9-complements.</i>`; }
      s.snap(say);
      out+=q; D=next;
    }
    s.del('w'); for(let i=0;i<P;i++) s.del('r'+i);
    for(let i=0;i<P;i++) s.set('g'+i,{c: P%2===0 ? (i<P/2?'h1':'h2') : 'ans'});
    s.put('dotL',X(0),-0.62,'•','sup').put('dotR',X(P-1),-0.62,'•','sup');
    s.snap(`The next dividend would be ${n} again — the block repeats. <span class="ok">${n}/${d} = 0.${out}…</span>${P%2===0?` Halves: ${out.slice(0,P/2)} + ${out.slice(P/2)} = ${'9'.repeat(P/2)}.`:''}` + (out!==R?` <span class="no">mismatch with long division!</span>`:''));
    return s.fr;
  }
});

/* ---------- Ch. II: Ekanyūnena, third case (fewer nines than digits) ---------- */
def({
  id:'ekanyuna2', chn:2, o:65, su:[14],
  name:'Multiplying by 9s when the number is longer (third case)',
  sutra:{kind:'SŪTRA 14 OF 16', dev:'एकन्यूनेन पूर्वेण', iast:'Ekanyūnena Pūrveṇa', en:'“By one less than the previous one” — third case'},
  short:'122 × 9: split 12 : 2 → 122 − 13 = 109 | 10 − 2 = 8 → 1098.',
  brief:`<p>When the multiplier has <b>fewer</b> nines than the multiplicand has digits:</p>
    <ol><li>Split off as many digits on the right as there are nines (122 × 9 → 12 : 2).</li><li><b>Left part</b>: subtract from the whole number <i>one more than</i> its left portion (122 − 13 = 109).</li><li><b>Right part</b>: Nikhilam complement of the right portion (10 − 2 = 8).</li></ol>`,
  why:`<p>Write n = L·10ᵏ + r. Then</p><div class="eqn">n·(10ᵏ − 1) = n·10ᵏ − n
            = (n − L − 1)·10ᵏ + (10ᵏ − r)</div><p>The “one more than L” is an ekādhika hiding inside Ekanyūnena — the two corollaries work as a pair. If r = 0 the right part is a full 10ᵏ and carries 1 back.</p>`,
  hist:`<p>Tīrtha calls this “the third case … to be omitted during a first reading”, and finds the rule by tabulating 11×9 … 30×9: products from 1_ × 9 have a left part 2 less than the multiplicand, from 2_ × 9 three less — i.e. less by one more than the leading digit.</p>`,
  ex:{n:122,k:1}, ph:'122 × 9 or 4567 × 99',
  rand(){ const k=pick([1,1,2,2,3]); const n=ri(10**k+1, 10**(k+2)-1); return {n,k}; },
  parse(str){ const b=binop(str,MUL); if(!b) throw 'Type it like 122 × 9.'; let [n,c]=b; if(!/^9+$/.test(String(c))) [n,c]=[c,n]; if(!/^9+$/.test(String(c))) throw 'One factor must be all nines.'; const k=len(c); if(len(n)<=k) throw 'This case is for numbers with MORE digits than nines — see the main Ekanyūnena lesson otherwise.'; return {n,k}; },
  q:p=>`${p.n} × ${'9'.repeat(p.k)}`, ans:p=>String(p.n*(10**p.k-1)),
  gen({n,k}){
    const s=new Sc(), B=10**k, L=Math.floor(n/B), r=n%B, N9='9'.repeat(k), Ls=String(L), rs=pad(r,k);
    s.put('L',0,0,Ls).put('col',len(Ls)+0.1,0,':','op').put('r',len(Ls)+1,0,rs).put('x',len(Ls)+k+1.8,0,'×','op').put('nn',len(Ls)+k+3.4,0,N9,'dim');
    s.snap(`${N9} has ${k} nine${k>1?'s':''}, so split off ${k} digit${k>1?'s':''} on the right: <b>${Ls} : ${rs}</b>.`);
    const E=L+1, left=n-E;
    s.put('e',0,1.4,`one more than ${Ls} = ${E}`,'work').hl('L','e');
    s.snap(`Take the left portion ${Ls} and go <b>one more</b>: ${E}.`);
    s.put('lt',0,2.5,`${n} − ${E} = ${left}`,'work').hl('lt');
    s.snap(`<b>Left part</b>: subtract that from the whole number: ${n} − ${E} = <b>${left}</b>.`);
    const right=B-r;
    s.put('rt',0,3.6,`${B} − ${rs} = ${pad(right,k)}`,'work').hl('rt','r');
    s.snap(`<b>Right part</b>: all from 9, last from 10 on ${rs}: ${B} − ${rs} = <b>${right===B?right:pad(right,k)}</b>.`);
    let Lf=left, Rf=right;
    if(Rf===B){ Lf+=1; Rf=0; s.put('cy',0,4.6,`${right} has too many digits: carry 1 → ${Lf} | ${pad(0,k)}`,'work').hl('cy'); s.snap(`The right part may have only ${k} digit${k>1?'s':''}; carry 1 to the left.`); }
    const ans=Number(String(Lf)+pad(Rf,k));
    s.put('A',0,5.7,`${n} × ${N9} = ${ans}`,'ans');
    s.snap(`<span class="ok">${n} × ${N9} = ${ans}</span>` + (ans!==n*(B-1)?` <span class="no">mismatch</span>`:''));
    return s.fr;
  }
});

/* ---------- Ch. I/III: the vinculum ---------- */
function toVinculum(n){
  const D=digits(n); const out=D.map(d=>({d,bar:false})); const runs=[];
  let i=D.length-1;
  while(i>=0){
    if(D[i]>=6){ let j=i; while(j-1>=0 && D[j-1]>=6) j--; runs.push([j,i]); i=j-1; } else i--;
  }
  runs.forEach(([j,i])=>{ const m=i-j+1; const R=Number(D.slice(j,i+1).join('')); const C=pad(10**m-R,m); for(let t=0;t<m;t++) out[j+t]={d:+C[t],bar:+C[t]!==0}; });
  let lead=false;
  runs.forEach(([j])=>{ if(j===0) lead=true; else out[j-1].d+=1; });
  if(lead) out.unshift({d:1,bar:false});
  return {digits:out, runs, lead};
}
const vincValue = ds => ds.reduce((a,x)=>a*10+(x.bar?-x.d:x.d),0);
const vincHTML = ds => ds.map(x=>x.bar?`<span class="vinc">${x.d}</span>`:x.d).join('');
def({
  id:'vinculum', chn:3, o:30, su:[2],
  name:'Vinculum numbers — bars for negative digits',
  sutra:{kind:'SŪTRA 2 OF 16 · APPLIED', dev:'निखिलं नवतश्चरमं दशतः', iast:'Nikhilaṁ Navataścaramaṁ Daśataḥ', en:'“All from nine and the last from ten” — used to remove big digits'},
  ch:'notes to Ch. I & III',
  short:'576 = 600 − 24, written 6 2̄ 4̄: no digit above 5, so multiplication tables stop at 5 × 5.',
  brief:`<p>A <b>vinculum</b> (bar) over a digit makes it negative. Any run of big digits (6–9) can be replaced:</p>
    <ol><li>Apply <b>all from 9, last from 10</b> to the run and put bars over the results (76 → 2̄4̄).</li><li>Add 1 to the digit just before the run (5 → 6).</li></ol>
    <p>To go back: all from 9, last from 10 on the barred run, and <b>subtract</b> 1 from the digit before it.</p>`,
  why:`<div class="eqn">576 = 600 − 24 = 6·100 + (−2)·10 + (−4)</div><p>A run of digits R of length m equals 10ᵐ − (10ᵐ − R): the 10ᵐ becomes “+1 on the digit before”, and 10ᵐ − R is exactly the Nikhilam complement, now subtracted — so it is written barred.</p>`,
  hist:`<p>Tīrtha uses the vinculum throughout — 18 as 2 2̄, 76 as 1 2̄ 4̄, 576 as 6 2̄ 4̄ — so that “the multiplication tables are not really required above 5 × 5”. The word is Latin (“bond”); the bar notation was also used by European arithmeticians such as Cauchy (1840) for “signed-digit” calculation, and signed-digit representations are used in fast computer multipliers today.</p>`,
  ex:{n:576}, ph:'any number, e.g. 1987',
  rand(){ let n; do{ n=ri(16,99999); }while(!digits(n).some(d=>d>=6)); return {n}; },
  parse(str){ const t=normIn(str); if(!/^\d+$/.test(t)) throw 'Enter a whole number.'; const n=+t; if(!digits(n).some(d=>d>=6)) throw 'That number has no digit above 5 — nothing to convert.'; if(len(n)>7) throw 'Up to 7 digits.'; return {n}; },
  q:p=>`${vincHTML(toVinculum(p.n).digits)}<small>write it as an ordinary number</small>`,
  ans:p=>String(p.n),
  gen({n}){
    const s=new Sc(), D=digits(n), V=toVinculum(n), off=V.lead?1:0;
    D.forEach((d,i)=>s.put('d'+i,i*1.3+off*1.3,0,d));
    s.snap(`Write <b>${n}</b> without any digit larger than 5. Look for runs of big digits (6, 7, 8, 9).`);
    V.runs.slice().reverse().forEach(([j,i])=>{
      const run=D.slice(j,i+1).join(''), m=i-j+1, C=pad(10**m-Number(run),m);
      for(let t=j;t<=i;t++) s.hl('d'+t);
      s.snap(`Run <b>${run}</b>: all from 9 and the last from 10 gives <b>${C}</b> — these become barred (negative) digits.`);
      for(let t=0;t<m;t++) s.put('d'+(j+t),(j+t)*1.3+off*1.3,0,C[t],'dev',{bar:+C[t]!==0});
      if(j>0){ s.put('d'+(j-1),(j-1)*1.3+off*1.3,0,D[j-1]+1,'key'); s.snap(`…and the digit before the run goes up by one: ${D[j-1]} → <b>${D[j-1]+1}</b> (because ${run} = ${'1'+'0'.repeat(m)} − ${C}).`); }
      else { s.put('lead',0,0,'1','key'); s.snap(`The run starts the number, so a new leading <b>1</b> appears (${run} = ${'1'+'0'.repeat(m)} − ${C}).`); }
    });
    const val=vincValue(V.digits);
    s.put('eq',0,1.6,`= ${val}`,'work');
    s.snap(`Check: ${vincHTML(V.digits)} = ${V.digits.map((x,i)=>{ const p=V.digits.length-1-i; const v=x.d*10**p; return v? (x.bar?'− ':(i?'+ ':''))+v : ''; }).filter(Boolean).join(' ')} = <span class="ok">${val}</span>.` + (val!==n?` <span class="no">mismatch</span>`:''));
    s.del('eq');
    s.put('back',0,1.6,'back: complement the bars, 1 less before','work');
    s.snap(`Going back is the mirror image: complement the barred digits and take <b>one away</b> from the digit before them — you return to ${n}.`);
    return s.fr;
  }
});

/* ---------- Ch. III: Ūrdhva-Tiryak for algebra ---------- */
def({
  id:'algmul', chn:3, o:20, su:[3],
  name:'Ūrdhva-Tiryak for algebraic expressions',
  sutra:{kind:'SŪTRA 3 OF 16', dev:'ऊर्ध्वतिर्यग्भ्याम्', iast:'Ūrdhva-Tiryagbhyām', en:'“Vertically and crosswise” — on coefficients'},
  short:'(2x + 3)(4x − 5): vertical 8x², crosswise −10x + 12x, vertical −15 → 8x² + 2x − 15.',
  brief:`<p>Multiply two polynomials exactly like numbers, but with <b>no carrying</b>:</p>
    <ol><li>Line up the coefficients by power.</li><li>Each power of x in the answer is the sum of vertical and crosswise products whose powers add up to it.</li></ol>
    <p class="note">Put x = 10 and you are back to ordinary Ūrdhva multiplication.</p>`,
  why:`<div class="eqn">(ax² + bx + c)(dx² + ex + f)
 = ad·x⁴ + (ae+bd)x³ + (af+be+cd)x²
   + (bf+ce)x + cf</div><p>Tīrtha derives the arithmetic method from this very expansion: “if our multiplicand and multiplier be of 3 digits each, it merely means that we are multiplying (ax²+bx+c) by (dx²+ex+f) where x = 10.”</p>`,
  hist:`<p>Ch. III closes with algebraic examples such as (a + b)(a + 9b) to show that one formula serves both arithmetic and algebra. Without carries the pattern is the bare <b>convolution</b> of the coefficient lists — the operation behind polynomial multiplication everywhere.</p>`,
  ex:{A:[2,3],B:[4,-5]}, ph:'(2x+3)(4x-5)',
  rand(){ const r=()=>{ let v; do{ v=ri(-9,9); }while(!v); return v; }; const da=pick([1,1,2]), db=pick([1,2]); const A=[r()], B=[r()]; for(let i=0;i<da;i++) A.push(ri(-9,9)); for(let i=0;i<db;i++) B.push(ri(-9,9)); return {A,B}; },
  parse(str){
    const parts=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-').match(/\(([^)]+)\)\(([^)]+)\)/); if(!parts) throw 'Type it like (2x+3)(4x-5).';
    const P=t=>{ const terms=t.replace(/-/g,'+-').split('+').filter(Boolean); const m={}; let deg=0;
      terms.forEach(tt=>{ const mm=tt.match(/^(-?\d*)(x(?:\^?(\d)|²|³)?)?$/); if(!mm) throw 'Could not read “'+tt+'”.'; let c=mm[1]===''||mm[1]==='-'? (mm[1]==='-'?-1:1) : +mm[1]; if(!mm[2]) { m[0]=(m[0]||0)+(+mm[1]); return; } const p=mm[3]?+mm[3]: tt.includes('²')?2: tt.includes('³')?3:1; m[p]=(m[p]||0)+c; deg=Math.max(deg,p); });
      const a=[]; for(let p=deg;p>=0;p--) a.push(m[p]||0); return a; };
    const A=P(parts[1]), B=P(parts[2]); if(A.length>4||B.length>4) throw 'Up to cubic factors.'; if(!A[0]||!B[0]) throw 'Leading coefficients must be non-zero.'; return {A,B}; },
  prand(){ const p=this.rand(); const n=p.A.length+p.B.length-2; p.k=ri(Math.max(0,1),Math.max(1,n-1)); return p; },
  q(p){ const k=p.k??1; return `(${fmtPoly(p.A)})(${fmtPoly(p.B)})<small>coefficient of ${powLbl(k)} in the product?</small>`; },
  ans(p){ const R=polyMul(p.A,p.B); const k=p.k??1; return String(R[R.length-1-k]); },
  check(p,v){ return parseNum(v)===+this.ans(p); },
  gen({A,B}){
    const s=new Sc(), n=Math.max(A.length,B.length), Ap=Array(n-A.length).fill(0).concat(A), Bp=Array(n-B.length).fill(0).concat(B);
    const SP=4.2, top=2*n-2, cx=p=>(top-p)*SP+2;            // column for power p
    for(let p=top;p>=0;p--) cput(s,'h'+p,cx(p),-1,powLbl(p),'lbl');
    Ap.forEach((c,i)=>{ const p=n-1-i; cput(s,'a'+p,cx(p),0,fmt(c), i<n-A.length?'dim':'n'); });
    Bp.forEach((c,i)=>{ const p=n-1-i; cput(s,'b'+p,cx(p),1.25,fmt(c), i<n-B.length?'dim':'n'); });
    s.seg('rule',cx(top)-2,1.95,cx(0)+2,1.95);
    s.snap(`Write the coefficients of (${fmtPoly(A)}) over those of (${fmtPoly(B)}), column by column of powers of x.`);
    const R=new Array(top+1).fill(0);
    for(let p=0;p<=top;p++){
      const pairs=[]; for(let i=0;i<n;i++){ const j=p-i; if(j>=0&&j<n) pairs.push([i,j]); }
      let sum=0; const parts=[];
      pairs.forEach(([i,j])=>{ const a=Ap[n-1-i], b=Bp[n-1-j]; sum+=a*b; parts.push(`(${fmt(a)})(${fmt(b)})`); s.link('a'+i,'b'+j,i===j?'v':'x').hl('a'+i,'b'+j); });
      R[top-p]=sum;
      cput(s,'r'+p,cx(p),2.75,fmt(sum),'res'); s.hl('r'+p);
      s.put('w',0,4,`${powLbl(p)}: ${parts.join(' + ')} = ${sum}`,'work');
      s.snap(`${powLbl(p)}: ${pairs.length===1?'vertical':'vertical and crosswise'} — ${parts.join(' + ')} = <b>${sum}</b>. No carrying in algebra.`);
    }
    const ok=polyMul(Ap,Bp).every((c,i)=>c===R[i]);
    s.put('w',0,4,`= ${fmtPoly(R)}`,'work'); for(let p=0;p<=top;p++) s.set('r'+p,{c:'ans'});
    s.snap(`<span class="ok">(${fmtPoly(A)})(${fmtPoly(B)}) = ${fmtPoly(R)}</span>. (Put x = 10 to see an ordinary multiplication: ${polyEval(A,10)} × ${polyEval(B,10)} = ${polyEval(R,10)}.)`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. III: compound multiplication — feet & inches ---------- */
def({
  id:'compound', chn:3, o:40, su:[3],
  name:'Compound multiplication — areas in feet & inches',
  sutra:{kind:'SŪTRA 3 · PRACTICAL APPLICATION', dev:'ऊर्ध्वतिर्यग्भ्याम्', iast:'Ūrdhva-Tiryagbhyām', en:'“Vertically and crosswise”, with x = 12 inches'},
  short:'7′ 8″ × 6′ 11″ = (7x + 8)(6x + 11) with x = 12 → 42x² + 125x + 88 → 53 sq ft 4 sq in.',
  brief:`<p>Treat feet and inches as a two-digit number in base 12: a′ b″ = a·x + b with x = 12 inches.</p>
    <ol><li>Ūrdhva: ac x², (ad + bc) x, bd.</li><li><b>Split the middle term</b> by 12: quotient goes up to square feet, remainder r stays as r·12 square inches.</li><li>Add the square inches; carry any 144 to square feet.</li></ol>`,
  why:`<div class="eqn">(ax + b)(cx + d) = ac·x² + (ad+bc)·x + bd,   x = 12 in</div><p>x² = 144 sq in = 1 sq ft. A middle term m·x with m = 12q + r is q·x² + r·x — q more square feet and r·12 square inches.</p>`,
  hist:`<p>Tīrtha’s “Practical Application” section notes that the usual method converts everything to inches or fractions of a foot and then divides by 144 — while Ūrdhva does it mentally. He extends it to volumes (three dimensions) and to rupees and annas (base 16) in “Practice and Proportion”.</p>`,
  ex:{a:7,b:8,c:6,d:11}, ph:"7'8\" x 6'11\"",
  rand(){ return {a:ri(1,12),b:ri(1,11),c:ri(1,12),d:ri(1,11)}; },
  parse(str){ const n=(String(str).match(/\d+/g)||[]).map(Number); if(n.length!==4) throw 'Type it like 7\'8" x 6\'11".'; const [a,b,c,d]=n; if(b>11||d>11) throw 'Inches must be 0–11.'; return {a,b,c,d}; },
  q:p=>`${p.a}′ ${p.b}″ × ${p.c}′ ${p.d}″<small>answer as sq ft and sq in, e.g. 53 4</small>`,
  ans(p){ const t=(12*p.a+p.b)*(12*p.c+p.d); return `${Math.floor(t/144)} sq ft ${t%144} sq in`; },
  check(p,v){ const t=(12*p.a+p.b)*(12*p.c+p.d); const m=(String(v).match(/\d+/g)||[]).map(Number); return m[0]===Math.floor(t/144) && (m[1]??0)===t%144; },
  gen({a,b,c,d}){
    const s=new Sc();
    lay(s,0,[['L',`${a}′ ${b}″`],['x','×','op'],['B',`${c}′ ${d}″`]]);
    s.snap(`Area of a ${a}′ ${b}″ by ${c}′ ${d}″ rectangle. Think of feet as “x” = 12 inches.`);
    lay(s,1.3,[['L2',`(${a}x + ${b})`,'n',{from:'L'}],['x2','×','op'],['B2',`(${c}x + ${d})`,'n',{from:'B'}]]);
    s.snap(`So the sides are <b>${a}x + ${b}</b> and <b>${c}x + ${d}</b> (in inches, with x = 12).`);
    const A2=a*c, M=a*d+b*c, C=b*d;
    lay(s,2.6,[['t2',`${A2}x²`,'res'],['t1',`+ ${M}x`,'res'],['t0',`+ ${C}`,'res']]);
    s.hl('t2','t1','t0');
    s.snap(`Ūrdhva: vertical ${a}×${c} = ${A2}; crosswise ${a}×${d} + ${b}×${c} = <b>${M}</b>; vertical ${b}×${d} = ${C}.`);
    const q=Math.floor(M/12), r=M%12;
    lay(s,3.9,[['s2',`${A2+q}x²`,'res'],['s1',`+ ${r}x`,'res'],['s0',`+ ${C}`,'res']]);
    s.hl('s2','s1');
    s.snap(`Split the middle term by 12: ${M} = ${q} × 12 + ${r}. The ${q} moves up to the x² (square-foot) column: ${A2} + ${q} = <b>${A2+q}</b>.`);
    const inch=r*12+C, ft=A2+q+Math.floor(inch/144), inch2=inch%144;
    s.put('w',0,5.2,`${r} × 12 + ${C} = ${inch} sq in${inch>=144?` = ${Math.floor(inch/144)} sq ft ${inch2} sq in`:''}`,'work').hl('w');
    s.snap(`The rest is square inches: ${r}·x + ${C} = ${r} × 12 + ${C} = <b>${inch}</b> sq in${inch>=144?` — that contains ${Math.floor(inch/144)} more square foot`:''}.`);
    const tot=(12*a+b)*(12*c+d), ok=ft===Math.floor(tot/144)&&inch2===tot%144;
    s.put('A',0,6.5,`${ft} sq ft ${inch2} sq in`,'ans');
    s.snap(`<span class="ok">Area = ${ft} sq ft ${inch2} sq in</span> (check: ${12*a+b} × ${12*c+d} = ${tot} sq in).`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. V: Parāvartya for polynomial division ---------- */
def({
  id:'synthdiv', chn:5, o:20, su:[4],
  name:'Parāvartya division of polynomials (remainder theorem)',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”'},
  short:'(12x² − 8x − 32) ÷ (x − 2): write +2 under the divisor; 12 → 12×2 − 8 = 16 → 16×2 − 32 = 0.',
  brief:`<p>For a divisor like x − 2 (or x² + x − 3), <b>transpose</b> everything after the leading x: −2 becomes +2.</p>
    <ol><li>Bring the first coefficient down.</li><li>Multiply it by the transposed number(s) and add to the next coefficient(s).</li><li>Repeat; the last column(s) give the remainder.</li></ol>
    <p class="note">For x − p the remainder is the dividend with p put in for x — the Remainder Theorem.</p>`,
  why:`<p>If P(x) = Q(x)·(x − p) + R, putting x = p gives P(p) = R. The column work is just P evaluated by Horner’s nesting:</p><div class="eqn">12x² − 8x − 32 at x = 2:
((12)·2 − 8)·2 − 32 = 0</div><p>and the partial results 12, 16 are the quotient’s coefficients.</p>`,
  hist:`<p>Tīrtha points out that the remainder theorem and Horner’s synthetic division (1819; Ruffini 1804) are “only a very small part of the Parāvartya formula”. For divisors with a leading coefficient other than 1 he advises dividing the divisor through first and dividing the quotient back at the end.</p>`,
  ex:{P:[12,-8,-32],D:[1,-2]}, ph:'(x^3+7x^2+6x+5)/(x-2)',
  rand(){ const deg2=Math.random()<.3; const D= deg2? [1,ri(-3,3),ri(-4,4)] : [1,pick([-5,-4,-3,-2,-1,1,2,3,4])];
    const Q=[ri(1,9)]; const qd=ri(1,deg2?2:3); for(let i=0;i<qd;i++) Q.push(ri(-9,9));
    const R=deg2? [ri(-5,5),ri(-9,9)] : [Math.random()<.4?0:ri(-20,20)];
    const prod=polyMul(Q,D); const P=prod.slice(); for(let i=0;i<R.length;i++) P[P.length-R.length+i]+=R[i]; return {P,D}; },
  parse(str){
    const t=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-').replace(/÷/g,'/'); const m=t.match(/^\(?([^)]+)\)?\/\(([^)]+)\)$/); if(!m) throw 'Type it like (x^3+7x^2+6x+5)/(x-2).';
    const P=t2=>{ const terms=t2.replace(/-/g,'+-').split('+').filter(Boolean); const mm={}; let deg=0; terms.forEach(tt=>{ const r=tt.match(/^(-?\d*)(x(?:\^(\d))?)?$/); if(!r) throw 'Could not read “'+tt+'”.'; const c = r[2] ? (r[1]===''?1:r[1]==='-'?-1:+r[1]) : +r[1]; const p = r[2] ? (r[3]?+r[3]:1) : 0; mm[p]=(mm[p]||0)+c; deg=Math.max(deg,p); }); const a=[]; for(let p=deg;p>=0;p--) a.push(mm[p]||0); return a; };
    const Pp=P(m[1]), D=P(m[2]); if(D[0]!==1) throw 'Make the divisor start with plain x (divide it through first).'; if(D.length<2||D.length>3) throw 'Use a divisor of degree 1 or 2.'; if(Pp.length<D.length) throw 'The dividend must have higher degree.'; return {P:Pp,D}; },
  prand(){ let p; do{ p=this.rand(); }while(p.D.length!==2); return p; },
  q:p=>`(${fmtPoly(p.P)}) ÷ (${fmtPoly(p.D)})<small>remainder?</small>`,
  ans:p=>String(polyDiv(p.P,p.D).r.reduce((a,c)=>a*1+c,0)),
  check(p,v){ return parseNum(v)===polyDiv(p.P,p.D).r[0]; },
  gen({P,D}){
    const s=new Sc(), n=P.length, k=D.length-1, deg=n-1, qn=n-k;
    const adj=D.slice(1).map(c=>-c);
    const SP=4.2, X0=8, cx=i=>X0+i*SP;
    const dv=fmtPoly(D); s.put('dv',0,0,dv);
    for(let i=0;i<n;i++){ cput(s,'h'+i,cx(i),-1,powLbl(deg-i),'lbl'); cput(s,'P'+i,cx(i),0,fmt(P[i])); }
    s.seg('vbar',len(dv)+0.8,-0.5,len(dv)+0.8,qn+1.1,'bar');
    const rbx=cx(qn)-SP/2; s.seg('rbar',rbx,-0.5,rbx,qn+2.2,'bar');
    s.snap(`Divide ${fmtPoly(P)} by <b>${dv}</b>. The last ${k} column${k>1?'s':''} (right of the bar) will hold the remainder.`);
    adj.forEach((a,t)=>cput(s,'A'+t,len(dv)/2,1+t*0,a===0?'0':fmt(a),'dev'));
    if(k===2){ s.put('A0',0.2,1,fmt(adj[0]),'dev').put('A1',len(fmt(adj[0]))+1.2,1,fmt(adj[1]),'dev'); }
    s.snap(`<b>Parāvartya Yojayet</b> — transpose: the terms after x change sign, giving <b>${adj.map(fmt).join(', ')}</b>.`);
    const tot=P.slice(), q=[]; const yT=qn+1.6;
    s.seg('rule',X0-2,qn+0.85,cx(n-1)+2.2,qn+0.85);
    for(let i=0;i<qn;i++){
      q[i]=tot[i];
      const above=[]; for(let r=0;r<i;r++) if(s.has(`Q${r}_${i}`)) above.push(`Q${r}_${i}`);
      cput(s,'T'+i,cx(i),yT,fmt(q[i]),'res',{from:'P'+i}); s.hl('T'+i,'P'+i,...above);
      s.snap(i===0 ? `Bring the first coefficient down: <b>${q[i]}</b>.` : `Add the column: ${P[i]}${above.map(k=>' + ('+s.get(k).t+')').join('')} = <b>${q[i]}</b>.`);
      if(q[i]===0) continue;
      const made=[];
      adj.forEach((a,t)=>{ const j=i+1+t; if(j<n){ const v=q[i]*a; tot[j]+=v; cput(s,`Q${i}_${j}`,cx(j),1+i,fmt(v),'dev',{from:'T'+i}); made.push(`Q${i}_${j}`); } });
      s.hl('T'+i,...made);
      s.snap(`Multiply ${q[i]} by ${adj.map(fmt).join(' and ')} → ${made.map(k=>s.get(k).t).join(', ')}, placed under the next column${k>1?'s':''}.`);
    }
    const rem=[]; for(let j=qn;j<n;j++){ rem.push(tot[j]); cput(s,'T'+j,cx(j),yT,fmt(tot[j]),'res',{from:'P'+j}); s.hl('T'+j); }
    s.snap(`Add the remainder column${k>1?'s':''}: <b>${rem.join(', ')}</b>.`);
    const Qp=fmtPoly(q), Rp=fmtPoly(rem), chk=polyDiv(P,D), ok=chk.q.every((c,i)=>c===q[i]) && chk.r.every((c,i)=>c===rem[i]);
    s.put('QR',0,yT+1.4,`Q = ${Qp} · R = ${Rp}`,'ans');
    let say=`<span class="ok">Quotient ${Qp}, remainder ${Rp}</span>.`;
    if(k===1){ const pp=-D[1]; say+=` Remainder theorem check: putting x = ${pp} in the dividend gives ${polyEval(P,pp)}.`; }
    s.snap(say+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});

/* ---------- Ch. VI: argumental division (reverse Ūrdhva) ---------- */
def({
  id:'argdiv', chn:6, o:10, su:[3],
  name:'Argumental division — reversing vertically & crosswise',
  sutra:{kind:'SŪTRA 3 · USED IN REVERSE', dev:'ऊर्ध्वतिर्यग्भ्याम्', iast:'Ūrdhva-Tiryagbhyām', en:'“Vertically and crosswise”, argued backwards'},
  short:'(x³ + 7x² + 6x + 5) ÷ (x − 2): x², then “−2x² but we need 7x², so 9x” … → x² + 9x + 24, R 53.',
  brief:`<p>Set the division up as an unfinished <b>multiplication</b>: divisor × (unknown quotient) = dividend. Then argue term by term:</p>
    <ol><li>First term of the quotient: first of dividend ÷ first of divisor.</li><li>For each next power: what the crosswise products already give falls short of the dividend’s coefficient — the missing amount must come from (first term of divisor) × (next quotient term).</li><li>Whatever is left over at the end is the remainder.</li></ol>`,
  why:`<p>If D·Q = P, the coefficient of each power in P is a vertical-and-crosswise sum (Ūrdhva). In that sum only one product involves the newest quotient term — the one with the divisor’s leading term — so it can be solved for:</p><div class="eqn">q_k = (p_k − Σ d_i·q_(k−i)) / d_0</div>`,
  hist:`<p>Tīrtha calls this “a third method of division which is one of simple argumentation (based on the Ūrdhva-Tiryak Sūtra and practically amounts to a converse thereof)”. His long list of examples includes divisors of degree 2 and 3 such as (12x⁴ + 41x³ + 81x² + 79x + 42) ÷ (4x² + 7x + 6). He concedes that for arithmetic it is hard to know when to prefer it — a gap he closes with Straight Division (Ch. XXVII).</p>`,
  ex:{D:[1,-2],Q:[1,9,24],R:[53]}, ph:'Random only — press Random', noParse:true,
  rand(){ const r=()=>{ let v; do{ v=ri(-6,6); }while(!v); return v; }; const dd=pick([1,1,2]); const D=[pick([1,1,2,3,4])]; for(let i=0;i<dd;i++) D.push(r());
    const Q=[ri(1,5)]; const qd=ri(1,2); for(let i=0;i<qd;i++) Q.push(ri(-6,9)); const R= Math.random()<.6 ? Array(dd).fill(0) : Array.from({length:dd},()=>ri(-9,9)); return {D,Q,R}; },
  parse(){ throw 'Use Random — examples are generated with whole-number quotients.'; },
  P(p){ const P=polyMul(p.D,p.Q); p.R.forEach((c,i)=>{ P[P.length-p.R.length+i]+=c; }); return P; },
  q(p){ return `(${fmtPoly(this.P(p))}) ÷ (${fmtPoly(p.D)})<small>quotient’s constant term?</small>`; },
  ans:p=>String(p.Q[p.Q.length-1]),
  check(p,v){ return parseNum(v)===p.Q[p.Q.length-1]; },
  gen(p){
    const {D,Q}=p, P=this.P(p), s=new Sc(), n=P.length, m=D.length, qn=Q.length;
    const SP=4.4, cx=i=>2+i*SP;   // column i = power n-1-i
    for(let i=0;i<n;i++) cput(s,'h'+i,cx(i),-1,powLbl(n-1-i),'lbl');
    D.forEach((c,i)=>cput(s,'d'+i,cx(qn-1+i),0,fmt(c)));       // divisor aligned under its powers in the product chart
    s.put('dl',cx(qn-1)-SP*0.8-3,0,'D','lbl');
    for(let i=0;i<qn;i++) cput(s,'q'+i,cx(n-qn+i),1.25,'?','dim');
    s.put('ql',cx(n-qn)-SP*0.8-1,1.25,'Q','lbl');
    s.seg('rule',cx(0)-2,1.95,cx(n-1)+2,1.95);
    P.forEach((c,i)=>cput(s,'p'+i,cx(i),2.75,fmt(c)));
    s.put('pl',cx(0)-SP*0.8-1,2.75,'P','lbl');
    s.snap(`Think of the division as an unfinished multiplication: (${fmtPoly(D)}) × Q = ${fmtPoly(P)}. Find Q one term at a time.`);
    const found=[];
    for(let k=0;k<qn;k++){
      let known=0; const parts=[];
      for(let i=1;i<m;i++){ const j=k-i; if(j>=0){ known+=D[i]*found[j]; parts.push(`(${fmt(D[i])})(${fmt(found[j])})`); s.link('d'+i,'q'+j,'x').hl('d'+i,'q'+j); } }
      const need=P[k]-known, qk=need/D[0]; found.push(qk);
      cput(s,'q'+k,cx(n-qn+k),1.25,fmt(qk),'key'); s.hl('p'+k,'d0','q'+k).link('d0','q'+k,'v');
      s.put('w',0,4,k===0?`${fmt(P[0])} ÷ ${fmt(D[0])} = ${fmt(qk)}`:`${fmt(P[k])} − [${parts.join(' + ')}] = ${need} → ÷ ${D[0]} = ${fmt(qk)}`,'work');
      s.snap(k===0 ? `First term: ${fmt(P[0])}${powLbl(n-1)} ÷ ${fmt(D[0])}${powLbl(m-1)} gives <b>${fmt(qk)}${powLbl(qn-1)}</b>.` : `Coefficient of ${powLbl(n-1-k)} in P is ${P[k]}. The crosswise products already known give ${known}; the missing <b>${need}</b> must be ${fmt(D[0])} × (next quotient term) → <b>${fmt(qk)}</b>.`);
      s.set('q'+k,{c:'res'});
    }
    const rem=[];
    for(let k=qn;k<n;k++){ let known=0; for(let i=0;i<m;i++){ const j=k-i; if(j>=0&&j<qn) known+=D[i]*found[j]; } rem.push(P[k]-known); }
    s.put('w',0,4,`what is left: R = ${fmtPoly(rem)}`,'work');
    s.snap(`The remaining powers are fully determined now; what the products don’t account for is the remainder: <b>${fmtPoly(rem)}</b>.`);
    const ok=found.every((c,i)=>c===Q[i]) && rem.every((c,i)=>c===p.R[i]);
    s.put('w',0,4,`Q = ${fmtPoly(found)} · R = ${fmtPoly(rem)}`,'work'); for(let k=0;k<qn;k++) s.set('q'+k,{c:'ans'});
    s.snap(`<span class="ok">Quotient ${fmtPoly(found)}, remainder ${fmtPoly(rem)}</span>.`+(ok?'':' <span class="no">mismatch</span>'));
    return s.fr;
  }
});
