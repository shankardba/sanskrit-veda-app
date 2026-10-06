'use strict';
/* ============================================================
   TECHNIQUES
   ============================================================ */

/* ---------- 1a. Ekādhikena: squares ending in 5 ---------- */
def({
  id:'sq5', ch:'also Ch. XXXII', chn:2, o:40, su:[1], group:'Sūtra 1 · Ekādhikena Pūrveṇa', name:'Squaring numbers that end in 5',
  sutra:{kind:'SŪTRA 1 OF 16', dev:'एकाधिकेन पूर्वेण', iast:'Ekādhikena Pūrveṇa', en:'“By one more than the previous one”'},
  short:'Square any number ending in 5 in one line: (previous part) × (one more) | 25.',
  brief:`<p>For a number ending in 5, take the part <i>before</i> the 5, multiply it by its <b>ekādhika</b> (one more than itself), and write 25 after it.</p>
    <ol><li>Split <span class="mono">65</span> into <span class="mono">6</span> | <span class="mono">5</span>.</li><li>6 × (6+1) = 42 → left part.</li><li>5 × 5 = 25 → right part.</li><li>Answer: <span class="mono">4225</span>.</li></ol>
    <p class="note">Works for any prefix: 115² → 11 × 12 = 132 | 25 = 13225.</p>`,
  why:`<p>Write the number as 10a + 5:</p><div class="eqn">(10a + 5)² = 100a² + 100a + 25
         = 100·a(a+1) + 25</div><p>The “100 ·” is why a(a+1) sits two places to the left, and the 25 is always 5². The sūtra’s “one more than the previous” is exactly the (a+1).</p>`,
  hist:`<p>This is the first application Tīrtha gives, and the example everyone remembers. The same one-word sūtra, <i>Ekādhikena Pūrveṇa</i>, also drives his flagship demonstration — the one-line conversion of 1/19 into a recurring decimal — and the divisibility “osculators” of Ch. XXIX.</p><p>The identity itself is ancient and universal; it appears in many folk-arithmetic traditions. What the book adds is the habit of reading one compact phrase as a reusable <i>procedure</i>.</p>`,
  ex:{a:6}, ph:'e.g. 85 or 115',
  rand(){ return {a: Math.random()<.7 ? ri(1,9) : ri(10,19)}; },
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/(\^2|²)$/,''); if(!/^\d+$/.test(t)||!t.endsWith('5')) throw 'Enter a number ending in 5, like 85.'; const n=+t; if(n<5||n>99995) throw 'Pick something between 5 and 99995.'; return {a:(n-5)/10}; },
  q:p=>`${p.a*10+5}²`, ans:p=>String((p.a*10+5)**2),
  gen({a}){
    const s=new Sc(), A=String(a), la=len(A), n=a*10+5, E=a+1, P=a*E;
    if(a>0){ s.put('a',0,0,A); }
    s.put('f',la,0,'5').put('sq',la+1,-0.32,'2','sup');
    s.snap(a>0 ? `We want <b>${n}²</b>. Split it into the part before the final 5 — <b>${A}</b> — and the 5 itself.` : `5² = 25 — the previous part is 0, so the left part is 0 × 1 = 0.`);
    if(a===0){ s.put('r',0,1.5,'25','ans'); s.snap(`<span class="ok">5² = 25</span>`); return s.fr; }
    const y1=1.5;
    s.put('a2',0,y1,A,'n',{from:'a'}).put('x1',la+0.6,y1,'×','op').put('e',la+2.2,y1,String(E),'key',{from:'a'}).hl('a','e');
    s.snap(`<b>Ekādhikena Pūrveṇa</b> — “by one more than the previous one”. The previous part is ${A}; one more than it is <b>${E}</b>, its <i>ekādhika</i>.`);
    let x=la+2.2+len(E)+0.6;
    s.put('eq1',x,y1,'=','op').put('p',x+1.6,y1,P,'res').hl('a2','e','p');
    s.snap(`Multiply: ${A} × ${E} = <b>${P}</b>. That is the whole left part of the answer.`);
    const y2=2.7;
    s.put('f2',0,y2,'5','n',{from:'f'}).put('x2',1.6,y2,'×','op').put('f3',3.2,y2,'5','n',{from:'f'}).put('eq2',4.8,y2,'=','op').put('r',6.4,y2,'25','res').hl('f2','f3','r');
    s.snap(`The right part is always 5 × 5 = <b>25</b>.`);
    const y3=4.1, lp=len(P);
    s.put('pA',0,y3,P,'res',{from:'p'}).put('bar',lp+0.3,y3,'|','op').put('rA',lp+1.6,y3,'25','res',{from:'r'});
    s.snap(`Set them side by side: <b>${P} | 25</b>.`);
    s.del('bar').put('pA',0,y3,P,'ans').put('rA',lp,y3,'25','ans');
    s.snap(`<span class="ok">${n}² = ${n*n}</span> — two small multiplications instead of a long one.`);
    return s.fr;
  }
});

/* ---------- 1b. Ekādhikena: recurring decimals 1/x9 ---------- */
function repetend(d){ let r=1, s=''; do{ r*=10; s+=Math.floor(r/d); r%=d; }while(r!==1 && s.length<500); return s; }
def({
  id:'recip', ch:'see also Ch. XXVI', chn:1, o:10, su:[1], group:'Sūtra 1 · Ekādhikena Pūrveṇa', name:'Recurring decimals: 1/19, 1/29 …',
  sutra:{kind:'SŪTRA 1 OF 16', dev:'एकाधिकेन पूर्वेण', iast:'Ekādhikena Pūrveṇa', en:'“By one more than the previous one”'},
  short:'Write the whole repeating block of 1/19 from right to left, multiplying by 2 each time.',
  brief:`<p>For a denominator ending in 9, its <b>ekādhika</b> is one more than the digits before the 9 (19 → 2, 29 → 3, 49 → 5).</p>
    <ol><li>Write <span class="mono">1</span> as the <i>last</i> digit.</li><li>Multiply it by the ekādhika, write the result to its left; carry tens like ordinary multiplication.</li><li>Keep multiplying the newest digit (plus carry) by the ekādhika until the block is complete.</li></ol>
    <p class="note">Halfway, you’ll meet d − 1 (18 for 1/19). From there the rest are 9-complements of what you already wrote — Tīrtha’s shortcut.</p>`,
  why:`<p>Let d = 10E − 1 (so 19 = 10·2 − 1). Then 1/d = 0.1/E ÷ (1 − 1/(10E)), and</p><div class="eqn">1/d = (1/10E)·(1 + 1/10E + 1/(10E)² + …)</div><p>Read from the right, each digit block is E times the one before it — the repeating block R satisfies <span class="mono">E·R ≡ R shifted one place</span>. Multiplying by E and shifting left reproduces the block, so it can be generated digit by digit from its last digit, 1.</p><p><b>The complement halves.</b> If the period is even, first half + second half = 99…9. This is <i>Midy’s theorem</i> (E. Midy, 1836); the book cites it as the corollary <i>Ekanyūnena</i> at work.</p>`,
  hist:`<p>This is the book’s opening showpiece. Tīrtha notes that conventional long division needs 18 steps of trial division for 1/19, while this needs only doubling. 19 is a “full-reptend” prime: 10 generates every non-zero remainder mod 19, so the period reaches the maximum, 18.</p><p>He also gives a second, left-to-right version — <i>divide</i> by the ekādhika instead of multiplying (1 ÷ 2 = 0 r 1, 10 ÷ 2 = 5 …) — which produces the same digits from the front.</p>`,
  ex:{d:19}, ph:'1/19 (denominator ending in 9)',
  rand(){ return {d: pick([19,29,39,49,59,69,79,89])}; },
  parse(str){ const m=String(str).match(/(\d+)\s*$/); if(!m) throw 'Enter a denominator ending in 9, like 1/29.'; const d=+m[1]; if(d%10!==9) throw 'The denominator must end in 9 (19, 29, 39 …).'; if(d>299) throw 'Keep the denominator under 300 so the block fits.'; const R=repetend(d); if(R.length>60) throw `1/${d} repeats every ${R.length} digits — too long for the board. Try 19, 29, 39, 79 or 69.`; return {d}; },
  practiceSet:[19,39,79,69,29],
  prand(){ return {d: pick(this.practiceSet)}; },
  q:p=>`1/${p.d}<small>type the repeating block (${repetend(p.d).length} digits)</small>`,
  ans:p=>repetend(p.d),
  check(p,v){ let s=normIn(v).replace(/^0?\./,''); return s===repetend(p.d); },
  gen({d}){
    const s=new Sc(), E=(d+1)/10, R=repetend(d), P=R.length;
    const lhs=`1/${d} = 0.`; s.put('lhs',0,0,lhs);
    const x0=len(lhs)+0.4, X=j=>x0+P-1-j;               // j = position from the right
    for(let j=0;j<P;j++) s.put('ph'+j,X(j),0,'·','dim');
    s.put('lbl',0,-1.1,`ekādhika of ${(d-9)/10} → ${E}`,'lbl');
    s.snap(`${d} ends in 9. The part before the 9 is ${(d-9)/10}; one more than that — its <i>ekādhika</i> — is <b>${E}</b>. The block repeats every <b>${P}</b> digits, and we’ll write it from the <b>right</b>.`);
    let prev=1, carry=0; const got=[1];
    s.del('ph0').put('g0',X(0),0,'1','key').hl('g0');
    s.snap(`Start at the far right with <b>1</b> — the numerator.`);
    let half=null;
    for(let j=1;j<P;j++){
      const v=prev*E+carry, dg=v%10, c=Math.floor(v/10);
      s.del('ph'+j).put('g'+j,X(j),0,dg,'key',{from:'g'+(j-1)}).set('g'+(j-1),{c:'n'});
      if(c) s.put('c'+j,X(j)-0.42,0.62,c,'carry');
      s.put('w',0,1.75,`${prev} × ${E}${carry?' + '+carry:''} = ${v}`,'work').hl('g'+j,'w').link('g'+(j-1),'g'+j,'link',-0.5);
      let say=`${prev} × ${E}${carry?` + carry ${carry}`:''} = ${v}: write <b>${dg}</b>${c?`, carry ${c} (small, under it)`:''}.`;
      if(v===d-1 && half===null){ half=j; say+=` <i>Halfway: we’ve reached ${d-1} = denominator − numerator. Everything still to come is the 9-complement of what’s already written.</i>`; }
      s.snap(say);
      got.push(dg); prev=dg; carry=c;
    }
    const built=got.slice().reverse().join('');
    s.del('w');
    for(let j=1;j<P;j++) s.del('c'+j);
    s.put('dotL',X(P-1),-0.62,'•','sup').put('dotR',X(0),-0.62,'•','sup');
    if(P%2===0){
      for(let j=0;j<P;j++) s.set('g'+j,{c: j>=P/2 ? 'h1':'h2'});
      const A=built.slice(0,P/2), B=built.slice(P/2);
      s.put('w2',0,1.75,`${A} + ${B} = ${'9'.repeat(P/2)}`,'work');
      s.snap(`Done — dots over the first and last digit mark the repeating block. <span class="ok">1/${d} = 0.${built}…</span> The two halves are 9-complements: ${A} + ${B} = ${'9'.repeat(P/2)} (Midy’s theorem).` + (built!==R?` <span class="no">mismatch with long division!</span>`:''));
    } else {
      for(let j=0;j<P;j++) s.set('g'+j,{c:'ans'});
      s.snap(`Done — dots mark the repeating block. <span class="ok">1/${d} = 0.${built}…</span> (odd period ${P}, so no complement halves this time).` + (built!==R?` <span class="no">mismatch with long division!</span>`:''));
    }
    return s.fr;
  }
});

/* ---------- 1c. Veṣṭana: divisibility by osculation ---------- */
function osculator(d){ const u=d%10, m={9:1,3:3,7:7,1:9}[u]; return m ? {E:(d*m+1)/10, m} : null; }
def({
  id:'osc', verdict:true, chn:29, o:10, su:[1], sub:[5], group:'Sūtra 1 · Ekādhikena Pūrveṇa', name:'Divisibility test by osculation (Veṣṭana)',
  sutra:{kind:'SUB-SŪTRA 5 · USES SŪTRA 1', dev:'वेष्टनम्', iast:'Veṣṭanam', en:'“Osculation” — by the ekādhika of the divisor'},
  short:'Is 2774 divisible by 19? Repeatedly fold the last digit back in using the ekādhika.',
  brief:`<p>Find the divisor’s <b>osculator</b>: multiply it until it ends in 9, then take the ekādhika of what’s before the 9.</p>
    <ul><li>19 → 2 · 29 → 3 (already end in 9)</li><li>7 × 7 = 49 → 5 · 13 × 3 = 39 → 4 · 17 × 7 = 119 → 12</li></ul>
    <ol><li>Multiply the <b>last digit</b> by the osculator.</li><li>Add that to the rest of the number (the number with its last digit removed).</li><li>Repeat until the number is small. It’s divisible exactly when the small number is.</li></ol>`,
  why:`<p>Let the osculator be E, so 10E − 1 is a multiple of d. For N = 10q + r the step gives N′ = q + E·r, and</p><div class="eqn">10·N′ = 10q + 10E·r = N + r·(10E − 1)</div><p>The last term is a multiple of d, so 10N′ ≡ N (mod d). Since d shares no factor with 10, d divides N exactly when it divides N′. The number shrinks; divisibility is preserved.</p>`,
  hist:`<p><i>Veṣṭana</i> means “enveloping”; Tīrtha’s English is “osculation”. He also defines <i>negative</i> osculators (subtract instead of add), of which the familiar school test for 7 — “double the last digit and subtract” — is one.</p><p>The positive test for 7 (×5 and add) is the same idea seen through the ekādhika: 7 × 7 = 49, and one more than 4 is 5.</p>`,
  ex:{n:2774,d:19}, ph:'2774 by 19',
  rand(){ const d=pick([7,13,17,19,23,29,39,59]); let n=d*ri(Math.ceil(300/d),Math.floor(99999/d)); if(Math.random()<.5) n+=ri(1,d-1); return {n,d}; },
  parse(str){ const b=binop(str,DIV+'|,'); if(!b) throw 'Type it like 2774 by 19 (or 2774 / 19).'; const [n,d]=b; if(!osculator(d)||d<3) throw 'The divisor must end in 1, 3, 7 or 9 (and be more than 1).'; if(n>9999999) throw 'Keep the number under 10 million.'; return {n,d}; },
  q:p=>`Is ${p.n} divisible by ${p.d}?<small>answer yes or no</small>`,
  ans:p=>p.n%p.d===0?'yes':'no',
  check(p,v){ return yesNo(v)===(p.n%p.d===0?'yes':'no'); },
  gen({n,d}){
    const s=new Sc(), {E,m}=osculator(d), W=len(n);
    s.put('lbl',0,-1.2, m===1 ? `${d} ends in 9 → osculator ${E}` : `${d} × ${m} = ${d*m} → osculator ${E}`,'lbl');
    let N=n, row=0;
    const putRow=(N,row,from)=>{ const q=Math.floor(N/10), r=N%10, Q=q?String(q):''; if(Q) s.put('q'+row,W-1-len(Q),row,Q,'n',from?{from}:{}); s.put('r'+row,W-1,row,r,'n',from?{from}:{}); };
    putRow(N,0);
    s.snap(m===1 ? `Is <b>${n}</b> divisible by <b>${d}</b>? ${d} ends in 9, so its osculator is simply one more than ${(d-9)/10}: <b>${E}</b>.` : `Is <b>${n}</b> divisible by <b>${d}</b>? Multiply ${d} until it ends in 9: ${d} × ${m} = ${d*m}. One more than ${(d*m-9)/10} is the osculator, <b>${E}</b>.`);
    let it=0;
    while(N>=10 && it<14){
      const q=Math.floor(N/10), r=N%10, N2=q+E*r;
      if(N2>=N || N<=d*2) break;
      s.hl('r'+row).put('w'+row,W+1.4,row,`${r} × ${E} + ${q} = ${N2}`,'work').hl('w'+row);
      if(s.has('q'+row)) s.hl('q'+row);
      row++; putRow(N2,row,'w'+(row-1));
      s.hl('q'+row,'r'+row);
      s.snap(`Last digit ${r} × ${E} = ${r*E}; add it to the rest, ${q}: <b>${N2}</b>.`);
      s.set('w'+(row-1),{c:'work dim'});
      N=N2; it++;
    }
    const ok=N%d===0;
    s.put('v',0,row+1.4, ok?`${N} = ${d} × ${N/d}  ✓`:`${N} is not a multiple of ${d}  ✗`, ok?'ans':'bad');
    s.snap(ok ? `<b>${N}</b> is ${N/d} × ${d}, so <span class="ok">${n} is divisible by ${d}</span> (indeed ${n} = ${d} × ${n/d}).` : `<b>${N}</b> is not a multiple of ${d}, so <span class="no">${n} is not divisible by ${d}</span> (remainder ${n%d}).`);
    return s.fr;
  }
});

/* ---------- 2a. Nikhilam subtraction ---------- */
def({
  id:'niksub', chn:2, o:5, su:[2], group:'Sūtra 2 · Nikhilaṁ Navataścaramaṁ Daśataḥ', name:'Subtracting from 10, 100, 1000 …',
  sutra:{kind:'SŪTRA 2 OF 16', dev:'निखिलं नवतश्चरमं दशतः', iast:'Nikhilaṁ Navataścaramaṁ Daśataḥ', en:'“All from nine and the last from ten”'},
  short:'1000 − 357: every digit from 9, the last from 10 — no borrowing.',
  brief:`<p>To subtract a number from a power of ten, take <b>each digit from 9</b> and the <b>last digit from 10</b>.</p>
    <ol><li>Pad the number with zeros to match the base’s zeros (1000 − 57 → 1000 − 057).</li><li>9 − 0, 9 − 5 → 9, 4 …</li><li>10 − 7 → 3 for the last non-zero digit. Trailing zeros stay zeros.</li></ol>
    <p class="note">This complement — the <b>deviation</b> from the base — is the engine of Nikhilam multiplication and division.</p>`,
  why:`<div class="eqn">1000 − n = (999 − n) + 1</div><p>Subtracting from 999 never borrows: each digit is just 9 − digit. Adding the 1 back only touches the last digit, turning “from 9” into “from 10”. Trailing zeros: 1000 − 350 = 10·(100 − 35), so the zero simply rides along.</p>`,
  hist:`<p>This is the <b>ten’s complement</b>. Mechanical calculators from the 17th century on subtracted by adding nines’ complements, and modern computers still subtract using <i>two’s</i> complement — the binary twin of this sūtra (“all from 1, then add 1”).</p>`,
  ex:{n:357,k:3}, ph:'1000 − 357',
  rand(){ const k=ri(2,5); let n=ri(1,10**k-1); if(Math.random()<.2) n=Math.max(10, n-n%10); return {n,k}; },
  parse(str){ const b=binop(str,'-'); if(!b) throw 'Type it like 1000 − 357.'; const [B,n]=b; const k=Math.round(Math.log10(B)); if(10**k!==B||k<1) throw 'The first number must be 10, 100, 1000 …'; if(n<=0||n>=B) throw `The number must be between 1 and ${B-1}.`; if(k>8) throw 'Up to 100000000 please.'; return {n,k}; },
  q:p=>`${10**p.k} − ${p.n}`, ans:p=>String(10**p.k-p.n),
  gen({n,k}){
    const s=new Sc(), B=10**k, ns=pad(n,k);
    let z=0; while(ns[k-1-z]==='0') z++;
    const last=k-1-z;
    digitsAt(s,'B',String(B),k,0);
    s.put('minus',-0.4,1,M,'op');
    [...ns].forEach((ch,i)=>s.put('n'+i,1+i,1,ch, i<k-len(n)?'dim':'n'));
    s.seg('rule',-0.6,1.62,k+1.2,1.62);
    s.snap(`${B} has ${k} zeros, so treat ${n} as a ${k}-digit number: <b>${ns}</b>. Now go digit by digit — no borrowing at all.`);
    [...ns].forEach((ch,i)=>{
      const dgt=+ch; let r, say;
      if(i<last){ r=9-dgt; say=`<b>All from 9</b>: 9 − ${dgt} = <b>${r}</b>.`; s.put('w',k+2.4,1,`9 − ${dgt} = ${r}`,'work'); }
      else if(i===last){ r=10-dgt; say=`<b>The last from 10</b>: 10 − ${dgt} = <b>${r}</b>.` + (z?` (It’s the last non-zero digit — the trailing zero${z>1?'s':''} after it stay${z>1?'':'s'} 0.)`:''); s.put('w',k+2.4,1,`10 − ${dgt} = ${r}`,'work'); }
      else { r=0; say=`A trailing zero stays <b>0</b>.`; s.put('w',k+2.4,1,`0 → 0`,'work'); }
      s.put('r'+i,1+i,2.4,r,'res',{from:'n'+i}).hl('n'+i,'r'+i,'w');
      s.snap(say);
    });
    s.del('w');
    const ans=B-n; [...ns].forEach((_,i)=>s.set('r'+i,{c:'ans'}));
    s.snap(`<span class="ok">${B} − ${n} = ${ans}</span>` + (Number([...ns].map((_,i)=>s.get('r'+i).t).join(''))!==ans?` <span class="no">mismatch</span>`:''));
    return s.fr;
  }
});

/* ---------- 2b. Nikhilam multiplication ---------- */
function nearestBase(a,b){ let best=10, bs=1e18; for(let k=1;k<=6;k++){ const B=10**k, sc=Math.abs(a-B)+Math.abs(b-B); if(sc<bs){bs=sc;best=B;} } return best; }
def({
  id:'nikmul', chn:2, o:10, su:[2], group:'Sūtra 2 · Nikhilaṁ Navataścaramaṁ Daśataḥ', name:'Multiplying numbers near a base',
  sutra:{kind:'SŪTRA 2 OF 16', dev:'निखिलं नवतश्चरमं दशतः', iast:'Nikhilaṁ Navataścaramaṁ Daśataḥ', en:'“All from nine and the last from ten”'},
  short:'97 × 96: deviations −3 and −4 → cross 93 | product 12 → 9312.',
  brief:`<p>For numbers close to 10, 100, 1000…</p>
    <ol><li>Write each number’s <b>deviation</b> from the base (−3 for 97, +4 for 104).</li><li><b>Left part</b>: add one number to the <i>other’s</i> deviation (cross-wise). Both diagonals agree.</li><li><b>Right part</b>: multiply the deviations. It gets as many digits as the base has zeros.</li><li>Carry or borrow if the right part over- or under-flows.</li></ol>`,
  why:`<p>With base B and deviations p, q (a = B + p, b = B + q):</p><div class="eqn">a·b = (B+p)(B+q)
    = B·(B + p + q) + p·q
    = B·(a + q) + p·q</div><p>a + q is the cross-sum, and multiplying by B just shifts it left by as many places as B has zeros — leaving exactly that many slots for p·q.</p>`,
  hist:`<p>Tīrtha presents this as the first great application of <i>Nikhilam</i>. The same identity underlies the medieval European <b>finger multiplication</b> for 6–10 (fingers raised = deviation from 5, folded = complement from 10).</p><p>The book handles mixed cases (one above, one below) with the <b>vinculum</b> — a bar over a digit meaning it’s negative — which also appears in Ch. I’s notes on writing 18 as 2<span class="vinc">2</span> (20 − 2).</p>`,
  ex:{a:97,b:96}, ph:'97 × 96 or 1004 × 997',
  rand(){ const r=Math.random(); if(r<.2) return {a:ri(6,14),b:ri(6,14)}; if(r<.8){ return {a:ri(86,114),b:ri(86,114)}; } return {a:ri(985,1015),b:ri(985,1015)}; },
  parse(str){ const b=binop(str,MUL); if(!b) throw 'Type it like 97 × 96.'; const [a,c]=b; const B=nearestBase(a,c); if(Math.abs(a-B)>=B/2||Math.abs(c-B)>=B/2) throw `Both numbers should be near the same base (10, 100, 1000 …). For any numbers, use Ūrdhva-Tiryagbhyām.`; return {a,b:c}; },
  q:p=>`${p.a} × ${p.b}`, ans:p=>String(p.a*p.b),
  gen({a,b}){
    const s=new Sc(), B=nearestBase(a,b), k=Math.round(Math.log10(B)), da=a-B, db=b-B, W=Math.max(len(a),len(b));
    s.put('lbl',0,-1.1,`base ${B}`,'lbl');
    s.put('a',W-len(a),0,a).put('b',W-len(b),1,b).put('x',-1.4,1,'×','op').put('bar0',W+0.5,0,'|','bar').put('bar1',W+0.5,1,'|','bar');
    s.snap(`Both numbers are close to the base <b>${B}</b>. Beside each, we’ll write how far it is from ${B}.`);
    const desc=(v,d)=> d<0 ? `${v} is ${-d} below ${B} (all from 9, last from 10: ${pad(B-v,k)})` : d>0 ? `${v} is ${d} above ${B}` : `${v} is exactly ${B}`;
    s.put('da',W+2,0,sgn(da),'dev',{from:'a'}).put('db',W+2,1,sgn(db),'dev',{from:'b'}).hl('da','db');
    s.snap(`Deviations: ${desc(a,da)}; ${desc(b,db)}.`);
    const left=a+db, y=2.5;
    s.seg('rule',-1.8,1.62,W+3+Math.max(len(sgn(da)),len(sgn(db)),k),1.62);
    s.put('lt',W-len(left),y,left,'res',{from:'a'}).put('bar2',W+0.5,y,'|','bar').link('a','db','x1').link('b','da','x2').hl('a','db','lt');
    s.snap(`<b>Cross-wise</b>: ${a} ${db<0?M:'+'} ${Math.abs(db)} = <b>${left}</b>. (The other diagonal agrees: ${b} ${da<0?M:'+'} ${Math.abs(da)} = ${b+da}.) This is the left part.`);
    const right=da*db, rp=rightPart(right,k);
    s.put('rt',W+2,y,rp.t,'res',{from:'da',bar:rp.bar}).link('da','db','v').hl('da','db','rt');
    s.snap(`<b>Vertically</b>: (${fmt(da)}) × (${fmt(db)}) = <b>${right}</b>${Math.abs(right)<B/10&&right>=0?`, written with ${k} digits as ${rp.t}`:''}. This is the right part.`);
    baseFinish(s,{left,right,B,k,W,y,label:`${a} × ${b}`,expect:a*b});
    return s.fr;
  }
});

/* ---------- 2c / 4a. Division: Nikhilam & Parāvartya ---------- */
function divSetup(N,d,mode){
  let B,k,adj;
  if(mode==='nik'){ k=len(d); B=10**k; adj=[...pad(B-d,k)].map(Number); }
  else { k=len(d)-1; B=10**k; adj=[...pad(d-B,k)].map(c=>-Number(c)); }
  return {B,k,adj};
}
function divGen(N,d,mode){
  const s=new Sc(), {B,k,adj}=divSetup(N,d,mode), D=digits(N), n=D.length, qn=n-k;
  const X0=len(d)+2.6, SP=2.3, cx=i=>X0+i*SP;
  s.put('dv',0,0,d,'n');
  s.seg('dbar',len(d)+0.9,-0.5,len(d)+0.9,qn+1.0,'bar');
  D.forEach((v,i)=>s.put('D'+i,cx(i),0,v,'n'));
  const rbx=cx(qn)-SP/2+0.5;
  s.seg('rbar',rbx,-0.5,rbx,qn+2.2,'bar');
  s.snap(mode==='nik'
    ? `Divide <b>${N}</b> by <b>${d}</b>. ${d} is just below the base ${B}, so split off the last <b>${k}</b> digit${k>1?'s':''} of the dividend (one per zero in ${B}) — that’s where the remainder will form.`
    : `Divide <b>${N}</b> by <b>${d}</b>. ${d} is just above the base ${B}, so split off the last <b>${k}</b> digit${k>1?'s':''} of the dividend — that’s where the remainder will form.`);
  adj.forEach((v,t)=>s.put('A'+t,len(d)-k+t,1,Math.abs(v),'dev',{bar:v<0,from:'dv'}));
  s.snap(mode==='nik'
    ? `<b>Nikhilam</b>: all from 9 and the last from 10 turns ${d} into its complement <b>${pad(B-d,k)}</b> (${B} − ${d}). These are the adjustment digits.`
    : `<b>Parāvartya Yojayet</b> — “transpose and apply”: ${d} exceeds ${B} by ${pad(d-B,k)}. Transpose (flip the sign of) each digit: <b>${adj.map(v=>v?(M+Math.abs(v)):'0').join(' ')}</b>, written with a bar (vinculum).`);
  const tot=D.slice(), q=[];
  const yT=qn+1.5;
  s.seg('rule',X0-1,qn+0.75,cx(n-1)+1.4,qn+0.75);
  for(let i=0;i<qn;i++){
    q[i]=tot[i];
    const above=[]; for(let r=0;r<i;r++){ if(s.has(`P${r}_${i}`)) above.push(`P${r}_${i}`); }
    s.put('T'+i,cx(i),yT,Math.abs(q[i]),'res',{bar:q[i]<0, from:'D'+i}).hl('T'+i,'D'+i,...above);
    s.snap(i===0
      ? `The first digit comes straight down: <b>${q[i]}</b> is the first quotient figure.`
      : `Add up column ${i+1}: ${D[i]}${above.map(k=>{const v=s.get(k); return ` ${v.bar?M:'+'} ${v.t}`;}).join('')} = <b>${q[i]}</b> — the next quotient figure${q[i]<0?' (negative — fine, it will be settled at the end)':q[i]>9?' (two digits — it will carry when we combine)':''}.`);
    if(q[i]===0){ continue; }
    const made=[];
    adj.forEach((a,t)=>{ const j=i+1+t; if(j<n){ const v=q[i]*a; tot[j]+=v; s.put(`P${i}_${j}`,cx(j),1+i,Math.abs(v),'dev',{bar:v<0,from:'T'+i}); made.push(`P${i}_${j}`); } });
    s.hl('T'+i,...made,...adj.map((_,t)=>'A'+t));
    s.snap(`Multiply ${q[i]} by the adjustment digits ${adj.map(v=>fmt(v)).join(', ')} and set the products under the next ${k} column${k>1?'s':''}: ${made.map(k=>{const v=s.get(k);return (v.bar?M:'')+v.t;}).join(', ')}.`);
  }
  const rk=[];
  for(let j=qn;j<n;j++){ s.put('T'+j,cx(j),yT,Math.abs(tot[j]),'res',{bar:tot[j]<0,from:'D'+j}); rk.push('T'+j); }
  s.hl(...rk);
  s.snap(`Add up the remainder column${k>1?'s':''} the same way: ${rk.map(k=>{const v=s.get(k);return (v.bar?M:'')+v.t;}).join(' , ')}.`);
  let Q=0; for(let i=0;i<qn;i++) Q=Q*10+q[i];
  let R=0; for(let j=qn;j<n;j++) R=R*10+tot[j];
  const yR=yT+1.4;
  const tidy = q.some(v=>v<0||v>9) || tot.slice(qn).some(v=>v<0||v>9);
  s.put('QR',X0-1,yR,`Q = ${Q} · R = ${R}`,'work').hl('QR');
  s.snap(tidy ? `Read the figures as place values (carrying or borrowing between columns as usual): quotient <b>${Q}</b>, remainder <b>${R}</b>.` : `Read them off: quotient <b>${Q}</b>, remainder <b>${R}</b>.`);
  let adjN=0;
  while(R>=d){ R-=d; Q++; adjN++; }
  while(R<0){ R+=d; Q--; adjN--; }
  if(adjN!==0){
    s.put('QR',X0-1,yR,`Q = ${Q} · R = ${R}`,'work').hl('QR');
    s.snap(adjN>0 ? `But the remainder is not smaller than ${d}: take ${d} out of it ${adjN>1?adjN+' times':'once more'}, adding ${adjN} to the quotient → Q = <b>${Q}</b>, R = <b>${R}</b>.` : `The remainder came out negative: borrow ${d} from the quotient${adjN<-1?' '+(-adjN)+' times':''} → Q = <b>${Q}</b>, R = <b>${R}</b>.`);
  }
  const ok=Q===Math.floor(N/d)&&R===N%d;
  s.put('QR',X0-1,yR,`${N} ÷ ${d} = ${Q} r ${R}`,ok?'ans':'bad');
  s.snap(ok ? `<span class="ok">${N} ÷ ${d} = ${Q} remainder ${R}</span>. Check: ${d} × ${Q} + ${R} = ${d*Q+R}.` : `<span class="no">Something went wrong: expected ${Math.floor(N/d)} r ${N%d}</span>`);
  return s.fr;
}
const divQ = p=>`${p.N} ÷ ${p.d}<small>answer as quotient r remainder, e.g. 13 r 77</small>`;
const divAns = p=>`${Math.floor(p.N/p.d)} r ${p.N%p.d}`;
const divCheck = (p,v)=>{ const m=(String(v).match(/\d+/g)||[]).map(Number); if(!m.length) return false; const r=m[1]??0; return m[0]===Math.floor(p.N/p.d) && r===p.N%p.d; };
def({
  id:'nikdiv', chn:4, o:10, su:[2], group:'Sūtra 2 · Nikhilaṁ Navataścaramaṁ Daśataḥ', name:'Division by numbers just below a base',
  sutra:{kind:'SŪTRA 2 OF 16', dev:'निखिलं नवतश्चरमं दशतः', iast:'Nikhilaṁ Navataścaramaṁ Daśataḥ', en:'“All from nine and the last from ten”'},
  short:'1234 ÷ 89: divide using only the small complement 11 — no trial division.',
  brief:`<p>When the divisor is just under 10, 100, 1000 …, divide using its <b>complement</b> instead.</p>
    <ol><li>Complement of the divisor (89 → 11). Split off as many dividend digits on the right as the base has zeros.</li><li>Bring the first digit down: it’s the first quotient figure.</li><li>Multiply it by the complement digits; write them under the next columns.</li><li>Add the next column → next quotient figure; repeat.</li><li>Sum the remainder columns. If the remainder ≥ divisor, take the divisor out once more.</li></ol>`,
  why:`<p>Dividing by d = B − c is dividing by B with a correction. Each quotient figure q “owes back” q·c, because q·d = q·B − q·c: we’ve removed q·B by placing q one column left, and now add back q·c in the following columns.</p><div class="eqn">N = Q·(B − c) + R  ⇔  N = Q·B − Q·c + R</div><p>Column by column, that’s exactly what the table builds.</p>`,
  hist:`<p>Tīrtha shows this for divisors like 9, 89, 998 and contrasts it with the “cumbrous” trial division of school arithmetic. Its limit is the same as Nikhilam multiplication: it shines only when the complement is small. For general divisors he gives <i>Dhvajāṅka</i> “straight division” (Ch. XXVII).</p>`,
  ex:{N:1234,d:89}, ph:'1234 ÷ 89',
  rand(){ const r=Math.random(); if(r<.35){ const d=pick([7,8,9]); return {N:ri(100,9999),d}; } if(r<.85){ const d=ri(86,99); return {N:ri(1000,99999),d}; } return {N:ri(10000,999999),d:ri(987,999)}; },
  parse(str){ const b=binop(str,DIV); if(!b) throw 'Type it like 1234 ÷ 89.'; const [N,d]=b; const k=len(d), B=10**k; if(B-d>B/2) throw `${d} isn’t close below ${B}. Try a divisor like 9, 89 or 997 — or use Parāvartya for divisors just above a base.`; if(len(N)<=k) throw 'The dividend needs more digits than the divisor.'; if(N>9999999) throw 'Keep the dividend under 10 million.'; return {N,d}; },
  q:divQ, ans:divAns, check:divCheck,
  gen:({N,d})=>divGen(N,d,'nik')
});

/* ---------- 3a. Ūrdhva-Tiryagbhyām ---------- */
def({
  id:'urdhva', chn:3, o:10, su:[3], group:'Sūtra 3 · Ūrdhva-Tiryagbhyām', name:'Multiplying any two numbers',
  sutra:{kind:'SŪTRA 3 OF 16', dev:'ऊर्ध्वतिर्यग्भ्याम्', iast:'Ūrdhva-Tiryagbhyām', en:'“Vertically and crosswise”'},
  short:'The general method: every column of the answer is a pattern of vertical and crosswise products.',
  brief:`<p>Write the numbers one above the other. Each answer digit, from the right, is a sum of products:</p>
    <ul><li><b>units</b>: vertical product of the units</li><li><b>tens</b>: the two crosswise products</li><li><b>hundreds</b> (3-digit): the two outer crosswise + the middle vertical</li><li>… then the pattern shrinks back</li></ul>
    <p>Write the units digit of each column sum and carry the rest left.</p>`,
  why:`<p>Treat each number as a polynomial in x = 10:</p><div class="eqn">(a₁x + a₀)(b₁x + b₀)
  = a₁b₁·x² + (a₁b₀ + a₀b₁)·x + a₀b₀</div><p>The coefficient of xᵏ collects every pair of digits whose places add to k — vertical when both come from the same place, crosswise otherwise. That is a <b>convolution</b> of the digit sequences; carrying just converts coefficients back into base-10 digits.</p>`,
  hist:`<p>Tīrtha calls this the general formula, valid for all cases, with Nikhilam as the shortcut for special ones. Crosswise multiplication was known to medieval Indian arithmeticians, and the same column-by-column scheme was popularised in the 20th century as part of the <b>Trachtenberg system</b>.</p><p>Because it works left-to-right too, the book uses it for one-line mental products, and later for polynomial products, squaring (Dvandva) and even square roots.</p>`,
  ex:{a:47,b:23}, ph:'47 × 23 or 312 × 214',
  rand(){ return Math.random()<.65 ? {a:ri(12,99),b:ri(12,99)} : {a:ri(101,999),b:ri(101,999)}; },
  parse(str){ const b=binop(str,MUL); if(!b) throw 'Type it like 47 × 23.'; if(Math.max(len(b[0]),len(b[1]))>5) throw 'Up to 5 digits each.'; return {a:b[0],b:b[1]}; },
  q:p=>`${p.a} × ${p.b}`, ans:p=>String(p.a*p.b),
  gen({a,b}){
    const s=new Sc(), n=Math.max(len(a),len(b)), A=[...pad(a,n)].map(Number).reverse(), Bd=[...pad(b,n)].map(Number).reverse();
    const SP=1.8, X0=(2*n-1)*SP, cx=c=>X0-c*SP;
    A.forEach((v,i)=>s.put('a'+i,cx(i),0,v, i>=len(a)?'dim':'n'));
    Bd.forEach((v,i)=>s.put('b'+i,cx(i),1.25,v, i>=len(b)?'dim':'n'));
    s.put('x',cx(n-1)-2,1.25,'×','op');
    s.seg('rule',cx(2*n-2)-0.8,1.95,X0+1.6,1.95);
    s.snap(`Write ${a} over ${b}${len(a)!==len(b)?' (padding the shorter one with 0)':''}. We’ll fill the answer column by column from the right; column <i>k</i> collects every pair of digits whose places add up to <i>k</i>.`);
    let carry=0; const out=[];
    const yR=2.75, yC=2.22;
    for(let c=0;c<=2*n-2;c++){
      const pairs=[]; for(let i=0;i<n;i++){ const j=c-i; if(j>=0&&j<n) pairs.push([i,j]); }
      let sum=carry; const parts=[];
      pairs.forEach(([i,j])=>{ sum+=A[i]*Bd[j]; parts.push(`${A[i]}×${Bd[j]}`); s.link('a'+i,'b'+j, i===j?'v':'x').hl('a'+i,'b'+j); });
      const last=c===2*n-2, dg= last? sum : sum%10, cOut= last?0:Math.floor(sum/10);
      if(s.has('cy'+c)) s.hl('cy'+c);
      s.put('r'+c, last? cx(c)-(len(dg)-1)*0.5 : cx(c), yR, dg,'res').hl('r'+c);
      if(cOut) s.put('cy'+(c+1),cx(c+1)+0.15,yC,cOut,'carry');
      s.put('w',0,yR+1.25,parts.join(' + ')+(carry?` + ${carry}`:'')+` = ${sum}`,'work');
      const kind = pairs.length===1 ? (c===0?'vertical (units × units)':'vertical (leftmost × leftmost)') : pairs.length+' products — '+(pairs.some(([i,j])=>i===j)?'crosswise and vertical':'crosswise');
      s.snap(`Column ${c+1}: ${kind}: ${parts.join(' + ')}${carry?` + carry ${carry}`:''} = <b>${sum}</b>. ${last?`Write all of it — it’s the last column.`:`Write <b>${dg}</b>${cOut?`, carry ${cOut}`:''}.`}`);
      if(s.has('cy'+c)) s.set('cy'+c,{c:'carry dim'});
      out.push(dg); carry=cOut;
    }
    const res=Number(out.slice().reverse().join(''));
    for(let c=1;c<=2*n-1;c++) s.del('cy'+c);
    for(let c=0;c<=2*n-2;c++) s.set('r'+c,{c:'ans'});
    s.put('w',0,yR+1.25,`${a} × ${b} = ${res}`,'work');
    s.snap(`<span class="ok">${a} × ${b} = ${res}</span>` + (res!==a*b?` <span class="no">mismatch: ${a*b}</span>`:''));
    return s.fr;
  }
});

/* ---------- 3b. Dvandva-yoga straight squaring ---------- */
def({
  id:'dvandva', chn:33, o:10, su:[3], group:'Sūtra 3 · Ūrdhva-Tiryagbhyām', name:'Squaring any number (duplex)',
  sutra:{kind:'SŪTRA 3 · DVANDVA-YOGA', dev:'द्वन्द्वयोग', iast:'Dvandva-yoga', en:'“Duplex combination” — Ūrdhva applied to a number and itself'},
  short:'The square of any number column by column using “duplexes”: a², 2ab, 2ac + b² …',
  brief:`<p>The <b>duplex</b> D of a group of digits:</p>
    <ul><li>one digit <span class="mono">a</span> → a²</li><li>two <span class="mono">ab</span> → 2ab</li><li>three <span class="mono">abc</span> → 2ac + b²</li><li>four <span class="mono">abcd</span> → 2ad + 2bc</li></ul>
    <p>Each answer column is the duplex of a window of digits, sliding across the number. Write the units digit, carry the rest.</p>`,
  why:`<p>Squaring is Ūrdhva-Tiryagbhyām with both numbers equal. Every crosswise product then appears <i>twice</i> (aᵢaⱼ and aⱼaᵢ), and the vertical one once:</p><div class="eqn">(a₂x² + a₁x + a₀)²  →  column x²:  2·a₂a₀ + a₁²</div><p>So the duplex halves the work — pair the digits from the outside in, double each product, and square the middle digit if there is one.</p>`,
  hist:`<p>Tīrtha builds his square-root method (Ch. XXXIV) directly on duplexes: square-rooting becomes “un-squaring” column by column. Duplexes are the same symmetric sums that appear in the expansion of (a + b + c + …)².</p>`,
  ex:{a:347}, ph:'e.g. 347 or 2468',
  rand(){ return {a: Math.random()<.5 ? ri(13,99) : ri(101,999)}; },
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/(\^2|²)$/,''); if(!/^\d+$/.test(t)) throw 'Enter a whole number, like 347.'; if(t.length>5) throw 'Up to 5 digits.'; return {a:+t}; },
  q:p=>`${p.a}²`, ans:p=>String(p.a*p.a),
  gen({a}){
    const s=new Sc(), n=len(a), A=digits(a).reverse(), SP=1.8, X0=(2*n-1)*SP, cx=c=>X0-c*SP;
    A.forEach((v,i)=>s.put('a'+i,cx(i),0,v));
    s.put('sq',cx(0)+0.9,-0.35,'2','sup');
    s.seg('rule',cx(2*n-2)-0.8,0.75,X0+1.6,0.75);
    s.snap(`Square <b>${a}</b>. Each column of the answer is the <i>duplex</i> of a group of digits — we slide from the right.`);
    let carry=0; const out=[]; const yR=2.2, yC=1.55;
    for(let c=0;c<=2*n-2;c++){
      let sum=carry; const parts=[]; const keys=[];
      for(let i=0;i<n;i++){ const j=c-i; if(j>i&&j<n){ sum+=2*A[i]*A[j]; parts.push(`2×${A[j]}×${A[i]}`); s.link('a'+i,'a'+j,'pair',-0.9-0.25*(j-i)); keys.push('a'+i,'a'+j); } }
      if(c%2===0 && c/2<n){ const m=c/2; sum+=A[m]*A[m]; parts.push(`${A[m]}²`); keys.push('a'+m); s.tcls('a'+m,'key'); }
      s.hl(...keys);
      const last=c===2*n-2, dg= last? sum : sum%10, cOut= last?0:Math.floor(sum/10);
      s.put('r'+c, last? cx(c)-(len(dg)-1)*0.5 : cx(c), yR, dg,'res').hl('r'+c);
      if(cOut) s.put('cy'+(c+1),cx(c+1)+0.15,yC,cOut,'carry');
      s.put('w',0,yR+1.25,`D = ${parts.join(' + ')}${carry?` + ${carry}`:''} = ${sum}`,'work');
      s.snap(`Column ${c+1}: duplex = ${parts.join(' + ')}${carry?` + carry ${carry}`:''} = <b>${sum}</b>. ${last?'Write it all.':`Write <b>${dg}</b>${cOut?`, carry ${cOut}`:''}.`}`);
      if(s.has('cy'+c)) s.set('cy'+c,{c:'carry dim'});
      out.push(dg); carry=cOut;
    }
    const res=Number(out.slice().reverse().join(''));
    for(let c=1;c<=2*n-1;c++) s.del('cy'+c);
    for(let c=0;c<=2*n-2;c++) s.set('r'+c,{c:'ans'});
    s.put('w',0,yR+1.25,`${a}² = ${res}`,'work');
    s.snap(`<span class="ok">${a}² = ${res}</span>` + (res!==a*a?` <span class="no">mismatch</span>`:''));
    return s.fr;
  }
});

/* ---------- 4a. Parāvartya division ---------- */
def({
  id:'pardiv', chn:5, o:10, su:[4], group:'Sūtra 4 · Parāvartya Yojayet', name:'Division by numbers just above a base',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”'},
  short:'1234 ÷ 112: transpose the excess 12 into −1 −2 and divide with tiny negative corrections.',
  brief:`<p>When the divisor is just above a base (12, 112, 1013 …):</p>
    <ol><li>Drop the leading 1; the remaining digits are the excess over the base.</li><li><b>Transpose</b> them — change their signs (12 → <span class="vinc">1</span> <span class="vinc">2</span>).</li><li>Proceed exactly as in Nikhilam division: bring down, multiply by the transposed digits, add columns.</li><li>If the remainder comes out negative, borrow one divisor from the quotient.</li></ol>`,
  why:`<p>This is <b>synthetic division</b> (Ruffini–Horner) with x = 10. Dividing by x + 2 means substituting x = −2: the “transposed” −2 is the root of the divisor.</p><div class="eqn">N = Q·(B + e) + R  ⇔  N − Q·B = −Q·e + R</div><p>Each quotient figure is placed one base-step left (Q·B), and its contribution −Q·e is applied in the following columns.</p>`,
  hist:`<p>Tīrtha stresses that the same procedure divides polynomials — his examples run straight from 1234 ÷ 112 to (x³ + 7x² + 6x + 5) ÷ (x − 2). In Europe the polynomial form was published by Paolo Ruffini (1804) and William Horner (1819). Negative digits are written with the <b>vinculum</b> bar, a notation he uses throughout.</p>`,
  ex:{N:1234,d:112}, ph:'1234 ÷ 112',
  rand(){ const r=Math.random(); if(r<.45){ return {N:ri(100,9999),d:ri(11,14)}; } return {N:ri(1000,99999),d:ri(101,113)}; },
  parse(str){ const b=binop(str,DIV); if(!b) throw 'Type it like 1234 ÷ 112.'; const [N,d]=b; const k=len(d)-1, B=10**k; if(k<1||d<B||d>=2*B) throw 'The divisor should start with 1 and be just above 10, 100, 1000 … (like 12 or 112).'; if(len(N)<=k) throw 'The dividend needs more digits.'; if(N>9999999) throw 'Keep the dividend under 10 million.'; return {N,d}; },
  q:divQ, ans:divAns, check:divCheck,
  gen:({N,d})=>divGen(N,d,'par')
});

/* ---------- 4b. Parāvartya: simple equations ---------- */
def({
  id:'pareq', chn:11, o:10, su:[4], group:'Sūtra 4 · Parāvartya Yojayet', name:'Solving simple equations',
  sutra:{kind:'SŪTRA 4 OF 16', dev:'परावर्त्य योजयेत्', iast:'Parāvartya Yojayet', en:'“Transpose and apply”'},
  short:'ax + b = cx + d ⇒ x = (d − b)/(a − c), and (x+a)(x+b) = (x+c)(x+d) in one line.',
  brief:`<p>A term that crosses the = sign <b>transposes</b>: + becomes −, × becomes ÷.</p>
    <ul><li><span class="mono">ax + b = cx + d</span> → x = (d − b) / (a − c)</li><li><span class="mono">(x+a)(x+b) = (x+c)(x+d)</span> → x = (cd − ab) / (a + b − c − d)</li></ul>
    <p>Tīrtha treats these as ready formulae to apply at sight.</p>`,
  why:`<p>Moving cx left and b right keeps both sides balanced (we subtract the same thing from each side):</p><div class="eqn">ax + b = cx + d
ax − cx = d − b
(a − c)·x = d − b</div><p>For the product form, the x² terms cancel on expansion, leaving (a+b)x + ab = (c+d)x + cd — a simple equation of the first kind.</p>`,
  hist:`<p>“Transposing” is the oldest move in algebra: the Arabic <i>al-jabr</i> (“restoration”) of al-Khwārizmī (c. 820) — the word that became <i>algebra</i> — is exactly moving a subtracted term to the other side. Brahmagupta (628 CE) states the rule for solving linear equations in the same spirit.</p>`,
  ex:{v:'lin',a:3,b:5,c:1,d:13}, ph:'3x + 5 = x + 13',
  rand(){
    if(Math.random()<.6){ let a,c,b,d; do{ a=ri(2,9); c=ri(-4,a-1); b=ri(-12,12); d=ri(-12,20); }while(c===a||b===0||d===0||c===0||(Math.random()<.7&&(d-b)%(a-c)!==0)); return {v:'lin',a,b,c,d}; }
    let a,b,c,d; do{ a=ri(-6,6); b=ri(-6,6); c=ri(-6,6); d=ri(-6,6); }while(!a||!b||!c||!d||a+b===c+d||a*b===c*d||(Math.random()<.7&&(c*d-a*b)%(a+b-c-d)!==0)); return {v:'prod',a,b,c,d};
  },
  parse(str){
    const s=String(str).replace(/\s/g,'').replace(/[−–—]/g,'-');
    let m=s.match(/^\(x([+-]\d+)\)\(x([+-]\d+)\)=\(x([+-]\d+)\)\(x([+-]\d+)\)$/);
    if(m){ const [a,b,c,d]=m.slice(1).map(Number); if(a+b===c+d) throw 'With a + b = c + d there is no unique solution.'; return {v:'prod',a,b,c,d}; }
    m=s.match(/^(-?\d*)x([+-]\d+)?=(-?\d*)x([+-]\d+)?$/);
    if(m){ const co=t=>t===''?1:t==='-'?-1:+t; const a=co(m[1]), c=co(m[3]), b=+(m[2]||0), d=+(m[4]||0); if(a===c) throw 'The x-coefficients must differ.'; return {v:'lin',a,b,c,d}; }
    throw 'Type 3x + 5 = x + 13, or (x+1)(x+2) = (x-3)(x-4).';
  },
  sol(p){ return p.v==='lin' ? frac(p.d-p.b,p.a-p.c) : frac(p.c*p.d-p.a*p.b, p.a+p.b-p.c-p.d); },
  q(p){ const xs=(k)=>k===1?'x':k===-1?M+'x':k+'x'; return p.v==='lin' ? `${xs(p.a)} ${sp(p.b)} = ${xs(p.c)} ${sp(p.d)}<small>x = ? (fractions like 7/2 are fine)</small>` : `(x ${sp(p.a)})(x ${sp(p.b)}) = (x ${sp(p.c)})(x ${sp(p.d)})<small>x = ?</small>`; },
  ans(p){ return fracStr(this.sol(p)); },
  check(p,v){ const f=this.sol(p), x=parseNum(String(v).replace(/^x=/i,'')); return Math.abs(x-f.n/f.d)<1e-9; },
  gen(p){
    const s=new Sc(), f=this.sol(p), xs=(k)=>k===1?'x':k===-1?M+'x':fmt(k)+'x';
    if(p.v==='lin'){
      const {a,b,c,d}=p;
      lay(s,0,[['ax',xs(a)],['b',sp(b)],['eq','=','op'],['cx',xs(c)],['d',sp(d)]]);
      s.snap(`A simple equation of the form <b>ax + b = cx + d</b>, with a = ${a}, b = ${b}, c = ${c}, d = ${d}.`);
      s.hl('cx','b');
      s.snap(`<b>Parāvartya Yojayet</b> — transpose and apply. Gather the x-terms on the left and the numbers on the right. Whatever crosses the = sign changes its sign.`);
      lay(s,0,[['ax',xs(a)],['cx',sp(-c)+'x','dev'],['eq','=','op'],['d',fmt(d)],['b',sp(-b),'dev']]);
      s.hl('cx','b');
      s.snap(`${xs(c)} crosses over as <b>${sp(-c)}x</b>; ${sp(b)} crosses over as <b>${sp(-b)}</b>.`);
      lay(s,1.4,[['L',`${fmt(a-c)}x`,'res',{from:'ax'}],['eq2','=','op'],['R',fmt(d-b),'res',{from:'d'}]]);
      s.hl('L','R');
      s.snap(`Combine: ${a} ${sp(-c)} = <b>${a-c}</b> on the left, ${d} ${sp(-b)} = <b>${d-b}</b> on the right.`);
      lay(s,2.8,[['X','x','ans'],['eq3','=','op'],['F',`${fmt(d-b)} / ${fmt(a-c)}`,'res',{from:'L'}]]);
      s.hl('F');
      s.snap(`The multiplier ${a-c} transposes too — multiplication on one side becomes <b>division</b> on the other: x = ${d-b} / ${a-c}.`);
      lay(s,2.8,[['X','x','ans'],['eq3','=','op'],['F',fracStr(f),'ans']]);
      s.snap(`<span class="ok">x = ${fracStr(f)}</span>. Check: ${a}·(${fracStr(f)}) ${sp(b)} = ${c}·(${fracStr(f)}) ${sp(d)} = ${fracStr(frac(a*f.n+b*f.d,f.d))}.`);
    } else {
      const {a,b,c,d}=p;
      lay(s,0,[['l1',`(x ${sp(a)})`],['l2',`(x ${sp(b)})`],['eq','=','op'],['r1',`(x ${sp(c)})`],['r2',`(x ${sp(d)})`]]);
      s.snap(`Equation of the form (x + a)(x + b) = (x + c)(x + d).`);
      lay(s,1.4,[['L2','x²',''],['L1',`${sp(a+b)}x`,'res'],['L0',sp(a*b),'res'],['eq2','=','op'],['R2','x²',''],['R1',`${sp(c+d)}x`,'res'],['R0',sp(c*d),'res']]);
      s.hl('L1','L0','R1','R0').link('l1','l2','pair',-0.6).link('r1','r2','pair',-0.6);
      s.snap(`Expanded mentally: x² + (a+b)x + ab on the left, x² + (c+d)x + cd on the right.`);
      s.set('L2',{c:'gone'}).set('R2',{c:'gone'});
      s.snap(`The x² terms are the same on both sides — they cancel.`);
      lay(s,2.8,[['X','x','ans'],['eq3','=','op'],['F',`(${fmt(c*d)} ${sp(-a*b)}) / (${fmt(a+b)} ${sp(-(c+d))})`,'res']]);
      s.hl('F','L1','L0','R1','R0');
      s.snap(`Transpose: x terms left, numbers right. x = (cd − ab) / (a + b − c − d) = (${c*d} − ${a*b}) / (${a+b} − ${c+d}).`);
      lay(s,2.8,[['X','x','ans'],['eq3','=','op'],['F',fracStr(f),'ans']]);
      s.snap(`<span class="ok">x = ${fracStr(f)}</span>.`);
    }
    return s.fr;
  }
});

/* ---------- 5. Śūnyaṁ Sāmyasamuccaye ---------- */
def({
  id:'sunyam', chn:12, o:10, su:[5], group:'Sūtra 5 · Śūnyaṁ Sāmyasamuccaye', name:'Equations solved by “same total ⇒ zero”',
  sutra:{kind:'SŪTRA 5 OF 16', dev:'शून्यं साम्यसमुच्चये', iast:'Śūnyaṁ Sāmyasamuccaye', en:'“When the samuccaya is the same, that samuccaya is zero”'},
  short:'1/(x−7) + 1/(x−9) = 1/(x−6) + 1/(x−10): the denominators total the same, so that total is 0.',
  brief:`<p><i>Samuccaya</i> means “combination / total”. Recognise when the same total appears on both sides — then set it to zero.</p>
    <ul><li><b>Sum of denominators</b>: 1/(x+a) + 1/(x+b) = 1/(x+c) + 1/(x+d) with a + b = c + d → 2x + (a + b) = 0.</li><li><b>Numerators vs denominators</b>: N₁/D₁ = N₂/D₂ where N₁ + N₂ and D₁ + D₂ are the same (up to a factor) → N₁ + N₂ = 0.</li></ul>`,
  why:`<p><b>Sum-of-denominators case</b>. Move terms: 1/(x+a) − 1/(x+c) = 1/(x+d) − 1/(x+b), i.e.</p><div class="eqn">(c−a)/((x+a)(x+c)) = (b−d)/((x+b)(x+d))</div><p>Since a + b = c + d, c − a = b − d, so (x+a)(x+c) = (x+b)(x+d). Expanding and using d = a + b − c gives x = −(a + b)/2 — the same as setting 2x + a + b = 0.</p><p><b>Ratio case</b>. If D₁ = mN₁ + e and D₂ = mN₂ − e, cross-multiplying gives −e·(N₁ + N₂) = 0, so N₁ + N₂ = 0.</p>`,
  hist:`<p>Tīrtha devotes three chapters to the many readings of this one sūtra (common factors, equal products of constants, equal sums …). It works as <i>pattern recognition</i>: spot the structure and the answer is immediate. The book itself warns that each reading needs its condition checked first — the reason the proof is shown alongside.</p>`,
  ex:{v:'den',a:-7,b:-9,c:-6,d:-10}, ph:'Random only — press Random',
  rand(){
    if(Math.random()<.55){ let a,b,c,d; do{ a=ri(-9,9); b=ri(-9,9); c=ri(-9,9); d=a+b-c; }while(!a||!b||!c||!d||new Set([a,b,c,d]).size<4||Math.abs(d)>12); return {v:'den',a,b,c,d}; }
    let p1,q1,p2,q2,m,e,x; do{ p1=ri(1,4); p2=ri(1,4); q1=ri(-7,7); q2=ri(-7,7); m=ri(1,3); e=pick([-3,-2,-1,1,2,3]); x=-(q1+q2)/(p1+p2); }while(q1+q2===0||m*p1*x+m*q1+e===0||m*p2*x+m*q2-e===0||!q1||!q2);
    return {v:'rat',p1,q1,p2,q2,m,e};
  },
  parse(){ throw 'This one uses generated examples — press Random for a new equation.'; },
  sol(p){ return p.v==='den' ? frac(-(p.a+p.b),2) : frac(-(p.q1+p.q2), p.p1+p.p2); },
  lin(k,c){ return `${k===1?'':k}x ${sp(c)}`; },
  q(p){ return this.qtext(p)+'<small>x = ?</small>'; },
  qtext(p){ return p.v==='den' ? `1/(x ${sp(p.a)}) + 1/(x ${sp(p.b)}) = 1/(x ${sp(p.c)}) + 1/(x ${sp(p.d)})` : `(${this.lin(p.p1,p.q1)})/(${this.lin(p.m*p.p1,p.m*p.q1+p.e)}) = (${this.lin(p.p2,p.q2)})/(${this.lin(p.m*p.p2,p.m*p.q2-p.e)})`; },
  ans(p){ return fracStr(this.sol(p)); },
  check(p,v){ const f=this.sol(p), x=parseNum(String(v).replace(/^x=/i,'')); return Math.abs(x-f.n/f.d)<1e-9; },
  gen(p){
    const s=new Sc(), f=this.sol(p);
    if(p.v==='den'){
      const {a,b,c,d}=p;
      lay(s,0,[['f1',`1/(x ${sp(a)})`],['p1','+','op'],['f2',`1/(x ${sp(b)})`],['eq','=','op'],['f3',`1/(x ${sp(c)})`],['p2','+','op'],['f4',`1/(x ${sp(d)})`]]);
      s.snap(`Four fractions, all with numerator 1. Look at the denominators.`);
      s.hl('f1','f2','f3','f4');
      lay(s,1.5,[['sl',`(x ${sp(a)}) + (x ${sp(b)}) = 2x ${sp(a+b)}`,'res',{from:'f1'}]]);
      lay(s,2.7,[['sr',`(x ${sp(c)}) + (x ${sp(d)}) = 2x ${sp(c+d)}`,'res',{from:'f3'}]]);
      s.snap(`Total the denominators on each side: left gives <b>2x ${sp(a+b)}</b>, right gives <b>2x ${sp(c+d)}</b>.`);
      s.hl('sl','sr');
      s.snap(`The <i>samuccaya</i> is the <b>same</b> on both sides. <b>Śūnyaṁ Sāmyasamuccaye</b>: when the total is the same, that total is zero.`);
      lay(s,4.1,[['z',`2x ${sp(a+b)} = 0`,'key']]);
      s.snap(`So 2x ${sp(a+b)} = 0.`);
      lay(s,5.3,[['X',`x = ${fracStr(f)}`,'ans']]);
      s.snap(`<span class="ok">x = ${fracStr(f)}</span>. (Check by substitution: both sides equal ${(()=>{const xv=f.n/f.d;const L=1/(xv+a)+1/(xv+b);return Math.round(L*1e6)/1e6;})()}.)`);
    } else {
      const {p1,q1,p2,q2,m,e}=p, N1=this.lin(p1,q1), N2=this.lin(p2,q2), D1=this.lin(m*p1,m*q1+e), D2=this.lin(m*p2,m*q2-e);
      lay(s,0,[['n1',`(${N1})`],['sl1','/','op'],['d1',`(${D1})`],['eq','=','op'],['n2',`(${N2})`],['sl2','/','op'],['d2',`(${D2})`]]);
      s.snap(`Two fractions set equal. Total the numerators, then the denominators.`);
      s.hl('n1','n2');
      lay(s,1.5,[['sn',`N₁ + N₂ = ${this.lin(p1+p2,q1+q2)}`,'res',{from:'n1'}]]);
      s.snap(`Numerators: (${N1}) + (${N2}) = <b>${this.lin(p1+p2,q1+q2)}</b>.`);
      s.hl('d1','d2');
      lay(s,2.7,[['sd',`D₁ + D₂ = ${this.lin(m*(p1+p2),m*(q1+q2))}`+(m>1?`  = ${m} × (${this.lin(p1+p2,q1+q2)})`:''),'res',{from:'d1'}]]);
      s.snap(`Denominators: <b>${this.lin(m*(p1+p2),m*(q1+q2))}</b>${m>1?` — that is ${m} × the same total`:' — the same total'}.`);
      s.hl('sn','sd');
      lay(s,4.1,[['z',`${this.lin(p1+p2,q1+q2)} = 0`,'key']]);
      s.snap(`The same samuccaya on top and bottom: <b>Śūnyaṁ Sāmyasamuccaye</b> — set it to zero.`);
      lay(s,5.3,[['X',`x = ${fracStr(f)}`,'ans']]);
      s.snap(`<span class="ok">x = ${fracStr(f)}</span>.`);
    }
    return s.fr;
  }
});

/* ---------- 10. Yāvadūnam squaring ---------- */
def({
  id:'yavad', ch:'also Ch. XXXII', chn:2, o:30, su:[10], sub:[7], group:'Sūtra 10 · Yāvadūnam', name:'Squaring numbers near a base',
  sutra:{kind:'SŪTRA 10 · SUB-SŪTRA 7', dev:'यावदूनं तावदूनीकृत्य वर्गं च योजयेत्', iast:'Yāvadūnaṁ Tāvadūnīkṛtya Vargañca Yojayet', en:'“Whatever the deficiency, lessen by that much, and set up the square of the deficiency”'},
  short:'97² → 97 − 3 = 94 | 3² = 09 → 9409.',
  brief:`<p>For a number near 10, 100, 1000 …</p>
    <ol><li>Find the deficiency (or surplus) from the base: 97 is 3 short.</li><li><b>Lessen by that much</b>: 97 − 3 = 94 (a surplus is added: 104 + 4 = 108).</li><li><b>Set up the square</b> of the deficiency: 3² = 09 (as many digits as the base has zeros).</li></ol>`,
  why:`<p>It’s Nikhilam multiplication with both numbers equal. For a = B + d:</p><div class="eqn">a² = B·(a + d) + d²</div><p>a + d is “lessen by the deficiency” when d is negative and “increase by the surplus” when it is positive.</p>`,
  hist:`<p>The full phrase is one of the book’s longest sub-sūtras. In Ch. XXXII Tīrtha combines it with <i>Ānurūpyeṇa</i> (working bases such as 50) to square numbers that aren’t near a power of ten.</p>`,
  ex:{a:97}, ph:'e.g. 97, 104, 993',
  rand(){ const r=Math.random(); return {a: r<.2? ri(6,14) : r<.8? ri(85,115) : ri(985,1015)}; },
  parse(str){ const t=String(str).replace(/\s/g,'').replace(/(\^2|²)$/,''); if(!/^\d+$/.test(t)) throw 'Enter a number near a base, like 97.'; const a=+t, B=nearestBase(a,a); if(Math.abs(a-B)>=B/2) throw `${a} isn’t near 10, 100, 1000 … Try Dvandva squaring instead.`; return {a}; },
  q:p=>`${p.a}²`, ans:p=>String(p.a*p.a),
  gen({a}){
    const s=new Sc(), B=nearestBase(a,a), k=Math.round(Math.log10(B)), d=a-B, W=len(a), y=1.4;
    s.put('lbl',0,-1.1,`base ${B}`,'lbl');
    s.put('a',0,0,a).put('sq',W,-0.32,'2','sup').put('bar0',W+0.5,0,'|','bar');
    s.snap(`Square <b>${a}</b>, which is close to the base ${B}.`);
    s.put('da',W+2,0,sgn(d),'dev',{from:'a'}).hl('da');
    s.snap(d<0 ? `<b>Yāvadūnam</b> — the deficiency: ${a} is <b>${-d}</b> short of ${B}.` : d>0 ? `${a} has a surplus of <b>${d}</b> over ${B}.` : `${a} is exactly the base.`);
    const left=a+d;
    s.seg('rule',-0.4,0.62,W+3+k,0.62);
    s.put('lt',W-len(left),y,left,'res',{from:'a'}).put('bar2',W+0.5,y,'|','bar').link('a','da','x1').hl('a','da','lt');
    s.snap(d<=0 ? `<b>Tāvadūnīkṛtya</b> — lessen it by that much: ${a} − ${-d} = <b>${left}</b>.` : `Increase it by the surplus: ${a} + ${d} = <b>${left}</b>.`);
    const right=d*d, rp=rightPart(right,k);
    s.put('rt',W+2,y,rp.t,'res',{from:'da'}).hl('da','rt');
    s.snap(`<b>Vargañca yojayet</b> — and set up the square: ${fmt(d)}² = <b>${right}</b>${right<10**(k-1)||right<10&&k>1?` → ${rp.t} (${k} digits)`:''}.`);
    baseFinish(s,{left,right,B,k,W,y,label:`${a}²`,expect:a*a});
    return s.fr;
  }
});

/* ---------- sub-sūtra 1. Ānurūpyeṇa: working bases ---------- */
def({
  id:'anurupya', chn:2, o:20, sub:[1], group:'Corollaries (Upa-sūtras)', name:'Ānurūpyeṇa — working bases (50, 60, 400 …)',
  sutra:{kind:'SUB-SŪTRA 1', dev:'आनुरूप्येण', iast:'Ānurūpyeṇa', en:'“Proportionately”'},
  short:'48 × 47 with working base 50 = 100 ÷ 2 → (45 ÷ 2) | 06 → 2256.',
  brief:`<p>When numbers are near 50, 60, 300 … rather than a power of ten, use that as a <b>working base</b> and adjust <b>proportionately</b>.</p>
    <ol><li>Deviations from the working base W.</li><li>Cross-add as in Nikhilam.</li><li>Scale the left part by W’s ratio to the theoretical base (× 6 for 60 = 6 × 10; ÷ 2 for 50 = 100 ÷ 2).</li><li>Right part = product of deviations, as before.</li></ol>`,
  why:`<p>For W = m·B (or B/2) and deviations p, q:</p><div class="eqn">a·b = W·(a + q) + p·q
    = B·[m·(a + q)] + p·q</div><p>Only the left part changes: it is multiplied by m (or halved). An odd number halved leaves ½·B, which moves into the right part.</p>`,
  hist:`<p>Tīrtha introduces this as the very first sub-sūtra, a corollary to Nikhilam. It extends “near a base” to “near any convenient round number” — the same idea as choosing a convenient reference point in mental arithmetic.</p>`,
  ex:{a:48,b:47,mode:'half',k:2}, ph:'62 × 63 or 48 × 47',
  rand(){
    const r=Math.random();
    if(r<.3){ return {a:ri(44,56),b:ri(44,56),mode:'half',k:2}; }
    if(r<.75){ const m=ri(2,9), W=m*10; return {a:W+ri(-4,4),b:W+ri(-4,4),mode:'mul',k:1,m}; }
    const m=ri(2,9), W=m*100; return {a:W+ri(-12,12),b:W+ri(-12,12),mode:'mul',k:2,m};
  },
  parse(str){
    const b=binop(str,MUL); if(!b) throw 'Type it like 62 × 63.'; const [a,c]=b;
    const avg=(a+c)/2;
    if(len(a)!==len(c)) throw 'Use two numbers with the same number of digits.';
    if(len(a)===2 && Math.abs(avg-50)<=6 && Math.abs(a-50)<10 && Math.abs(c-50)<10) return {a,b:c,mode:'half',k:2};
    if(len(a)===3 && Math.abs(avg-500)<=20 && Math.abs(a-500)<40 && Math.abs(c-500)<40) return {a,b:c,mode:'half',k:3};
    const k=len(a)-1, B0=10**k, m=Math.round(avg/B0);
    if(m<2||m>9) throw 'Pick numbers near 20, 30 … 90 (or 200 … 900).';
    if(Math.abs(a-m*B0)>B0/2||Math.abs(c-m*B0)>B0/2) throw `Both numbers should be near the same round number ${m*B0}.`;
    return {a,b:c,mode:'mul',k,m};
  },
  q:p=>`${p.a} × ${p.b}`, ans:p=>String(p.a*p.b),
  gen(p){
    const {a,b,mode,k}=p, s=new Sc(), B0=10**k, half=mode==='half', W0=half?B0/2:p.m*B0, da=a-W0, db=b-W0, W=Math.max(len(a),len(b)), y=2.5;
    s.put('lbl',0,-1.1, half?`working base ${W0} = ${B0} ÷ 2`:`working base ${W0} = ${p.m} × ${B0}`,'lbl');
    s.put('a',W-len(a),0,a).put('b',W-len(b),1,b).put('x',-1.4,1,'×','op').put('bar0',W+0.5,0,'|','bar').put('bar1',W+0.5,1,'|','bar');
    s.snap(`${a} and ${b} aren’t near a power of ten, but they are near <b>${W0}</b>. Use it as a working base — ${half?`${B0} ÷ 2`:`${p.m} × ${B0}`} — and adjust <b>proportionately</b>.`);
    s.put('da',W+2,0,sgn(da),'dev',{from:'a'}).put('db',W+2,1,sgn(db),'dev',{from:'b'}).hl('da','db');
    s.snap(`Deviations from ${W0}: <b>${fmt(da)}</b> and <b>${fmt(db)}</b>.`);
    const cross=a+db;
    s.seg('rule',-1.8,1.62,W+3+k,1.62);
    s.put('lt',W-len(cross),y,cross,'res',{from:'a'}).put('bar2',W+0.5,y,'|','bar').link('a','db','x1').link('b','da','x2').hl('lt','a','db');
    s.snap(`Cross-wise as usual: ${a} ${sp(db)} = <b>${cross}</b>.`);
    let left, extra=0;
    if(half){ left=Math.floor(cross/2); extra=cross%2 ? B0/2 : 0; }
    else left=cross*p.m;
    s.put('mf',W-len(cross)-2.6,y,half?'÷2':'×'+p.m,'key').hl('mf','lt');
    s.snap(half ? `<b>Ānurūpyeṇa</b>: the working base is half of ${B0}, so halve the left part: ${cross} ÷ 2 = <b>${cross/2}</b>${extra?` — the ½ is half of ${B0}, i.e. ${extra}, and it will move into the right part`:''}.` : `<b>Ānurūpyeṇa</b>: the working base is ${p.m} × ${B0}, so multiply the left part by ${p.m}: ${cross} × ${p.m} = <b>${left}</b>.`);
    s.del('mf').put('lt',W-len(left),y,left,'res');
    const prod=da*db, right=prod+extra, rp=rightPart(prod,k);
    s.put('rt',W+2,y,rp.t,'res',{from:'da',bar:rp.bar}).link('da','db','v').hl('da','db','rt');
    s.snap(`Vertically: (${fmt(da)}) × (${fmt(db)}) = <b>${prod}</b> — the right part, ${k} digit${k>1?'s':''} wide.`);
    if(extra){ s.put('rt',W+2,y,pad(right,k),'res').hl('rt'); s.snap(`Add the carried-over half: ${prod} + ${extra} = <b>${right}</b>.`); }
    baseFinish(s,{left,right,B:B0,k,W,y,label:`${a} × ${b}`,expect:a*b});
    return s.fr;
  }
});

/* ---------- sub-sūtra 8. Antyayor Daśake'pi ---------- */
def({
  id:'antya', chn:2, o:50, sub:[8], group:'Corollaries (Upa-sūtras)', name:'Antyayor Daśake’pi — last digits adding to 10 (or 100)',
  sutra:{kind:'SUB-SŪTRA 8', dev:'अन्त्ययोर्दशकेऽपि', iast:'Antyayor Daśake’pi', en:'“Also when the last digits add up to ten”'},
  short:'47 × 43: same first part, last digits 7 + 3 = 10 → 4 × 5 | 7 × 3 → 2021. Also 191 × 109 → 1 × 2 | 91 × 09.',
  brief:`<p>When two numbers share everything except the last digit, and the last digits add to 10:</p>
    <ol><li>Left part: the shared part × its ekādhika (one more).</li><li>Right part: product of the last digits, always written with two digits.</li></ol>
    <p>The same works when the last <b>two</b> digits add to 100 (then the right part gets four digits), and so on.</p>
    <p class="note">Squaring numbers ending in 5 is the special case 5 + 5 = 10.</p>`,
  why:`<p>Let the numbers be 10ᵏp + u and 10ᵏp + v with u + v = 10ᵏ:</p><div class="eqn">(10ᵏp+u)(10ᵏp+v) = 10²ᵏp² + 10ᵏp(u+v) + uv
                     = 10²ᵏ·p(p+1) + uv</div><p>With k = 1 that is “× 100, plus uv in two digits”; with k = 2, “× 10 000, plus uv in four digits”.</p>`,
  hist:`<p>In Ch. II Tīrtha presents this right after the squares ending in 5 (its special case) and immediately extends it: “the last digits (in sets of 2, 3 and so on) together total 100, 1000 etc.”, e.g. 191 × 109 = 2/0819. It is one of the most-quoted “Vedic tricks” in popular books.</p>`,
  ex:{p:4,u:7,k:1}, ph:'47 × 43, 112 × 118 or 191 × 109',
  rand(){ return Math.random()<.8 ? {p: Math.random()<.75? ri(1,9) : ri(10,25), u: ri(1,9), k:1} : {p:ri(1,9), u:ri(1,99), k:2}; },
  parse(str){ const b=binop(str,MUL); if(!b) throw 'Type it like 47 × 43.'; const [a,c]=b;
    for(const k of [1,2,3]){ const B=10**k; if(Math.floor(a/B)===Math.floor(c/B) && a%B+c%B===B && Math.floor(a/B)>0) return {p:Math.floor(a/B),u:a%B,k}; }
    throw 'Both numbers need the same leading part, with the endings adding to 10 (or 100, 1000).'; },
  q:p=>{ const B=10**(p.k||1); return `${B*p.p+p.u} × ${B*p.p+B-p.u}`; }, ans:p=>{ const B=10**(p.k||1); return String((B*p.p+p.u)*(B*p.p+B-p.u)); },
  gen({p,u,k=1}){
    const s=new Sc(), B=10**k, v=B-u, a=B*p+u, b=B*p+v, P=String(p), lp=len(P), E=p+1, L1=p*E, R=u*v, U=pad(u,k), V=pad(v,k);
    s.put('pa',0,0,P).put('ua',lp,0,U).put('x',lp+k+0.6,0,'×','op').put('pb',lp+k+2.2,0,P).put('ub',2*lp+k+2.2,0,V);
    s.snap(`<b>${a} × ${b}</b>: both start with <b>${P}</b>.`);
    s.hl('ua','ub').plink('lk','ua','ub','pair',-1.0);
    s.snap(`And the endings add up to ${B}: ${U} + ${V} = ${B}. <b>Antyayor Daśake’pi</b> applies${k>1?` (with ${k}-digit endings)`:''}.`);
    s.unseg('lk');
    const y1=1.5;
    s.put('p2',0,y1,P,'n',{from:'pa'}).put('x1',lp+0.6,y1,'×','op').put('e',lp+2.2,y1,E,'key',{from:'pb'});
    s.put('eq1',lp+2.2+len(E)+0.6,y1,'=','op').put('l',lp+2.2+len(E)+2.2,y1,L1,'res').hl('p2','e','l');
    s.snap(`Left part: ${P} × its ekādhika ${E} = <b>${L1}</b>.`);
    const y2=2.7, W=2*k;
    s.put('u2',0,y2,U,'n',{from:'ua'}).put('x2',k+0.6,y2,'×','op').put('v2',k+2.2,y2,V,'n',{from:'ub'}).put('eq2',2*k+2.8,y2,'=','op').put('r',2*k+4.4,y2,pad(R,W),'res').hl('u2','v2','r');
    s.snap(`Right part: ${U} × ${V} = <b>${R}</b>${len(R)<W?` → written <b>${pad(R,W)}</b> (always ${W} digits)`:''}.`);
    const y3=4.1, ll=len(L1);
    s.put('lA',0,y3,L1,'ans',{from:'l'}).put('rA',ll,y3,pad(R,W),'ans',{from:'r'});
    s.snap(`<span class="ok">${a} × ${b} = ${a*b}</span>` + (Number(String(L1)+pad(R,W))!==a*b?` <span class="no">mismatch</span>`:''));
    return s.fr;
  }
});

/* ---------- 14. Ekanyūnena Pūrveṇa ---------- */
def({
  id:'ekanyuna', chn:2, o:60, su:[14], group:'Sūtra 14 · Ekanyūnena Pūrveṇa', name:'Multiplying by 9, 99, 999 …',
  sutra:{kind:'SŪTRA 14 OF 16', dev:'एकन्यूनेन पूर्वेण', iast:'Ekanyūnena Pūrveṇa', en:'“By one less than the previous one”'},
  short:'457 × 999 → one less: 456 | all-from-9 of 456: 543 → 456543.',
  brief:`<p>To multiply by a row of nines (with at least as many nines as the number has digits):</p>
    <ol><li>Left part: <b>one less</b> than the number (457 → 456).</li><li>Right part: subtract each digit of that from 9 (456 → 543). Pad to the number of nines.</li></ol>`,
  why:`<div class="eqn">n × (10ᵏ − 1) = n·10ᵏ − n
              = (n − 1)·10ᵏ + (10ᵏ − n)</div><p>10ᵏ − n is Nikhilam’s complement of n — equivalently, “all from 9” applied to n − 1.</p>`,
  hist:`<p>Ekanyūnena is the mirror of Ekādhikena (“one more”). Tīrtha also uses it to explain why 1/19’s two halves are 9-complements, and in Ch. XXVI for multiplying recurring decimals.</p>`,
  ex:{n:457,k:3}, ph:'457 × 999',
  rand(){ const k=ri(2,5); return {n:ri(Math.max(2,10**(k-2)), 10**k-1), k}; },
  parse(str){ const b=binop(str,MUL); if(!b) throw 'Type it like 457 × 999.'; let [n,c]=b; if(!/^9+$/.test(String(c))) [n,c]=[c,n]; if(!/^9+$/.test(String(c))) throw 'One of the numbers must be all nines (9, 99, 999 …).'; const k=len(c); if(len(n)>k) throw `Use at most ${k} digits with ${c} (the number can’t have more digits than there are nines).`; if(n<1) throw 'Use a positive number.'; return {n,k}; },
  q:p=>`${p.n} × ${'9'.repeat(p.k)}`, ans:p=>String(p.n*(10**p.k-1)),
  gen({n,k}){
    const s=new Sc(), N9='9'.repeat(k), m=n-1, ms=pad(m,k);
    const xN=lay(s,0,[['n',String(n)],['x','×','op'],['nn',N9,'dim']]);
    s.snap(`Multiply <b>${n}</b> by <b>${N9}</b>${len(n)<k?` (treat ${n} as ${pad(n,k)} — ${k} digits to match the nines)`:''}.`);
    const y1=1.5;
    s.put('m',0,y1,String(m),'res',{from:'n'}).hl('n','m');
    s.snap(`<b>Ekanyūnena Pūrveṇa</b> — one less than the number: ${n} − 1 = <b>${m}</b>. That’s the left part.`);
    const X=len(m)+1.5;
    s.put('bar',len(m)+0.3,y1,'|','bar');
    [...ms].forEach((ch,i)=>{ s.put('c'+i,X+i,y1,9-Number(ch),'dev'); });
    s.snap(`Right part: <b>all from 9</b> applied to ${ms}: ${[...ms].map(ch=>`9−${ch}`).join(', ')} → <b>${[...ms].map(ch=>9-Number(ch)).join('')}</b>.`);
    const R=[...ms].map(ch=>9-Number(ch)).join(''), y2=3;
    s.put('A',0,y2,String(m)+R,'ans',{from:'m'});
    s.snap(`<span class="ok">${n} × ${N9} = ${Number(String(m)+R)}</span>` + (Number(String(m)+R)!==n*(10**k-1)?` <span class="no">mismatch</span>`:''));
    return s.fr;
  }
});

/* ---------- 15. Guṇitasamuccayaḥ: digit-sum check ---------- */
def({
  id:'beejank', ch:'arithmetic companion to the Ch. VII check', verdict:true, chn:7, o:90, su:[15], sub:[13], group:'Sūtra 15 · Guṇitasamuccayaḥ', name:'Guṇita-samuccaya for numbers — digit-sum check',
  sutra:{kind:'SŪTRA 15 OF 16', dev:'गुणितसमुच्चयः', iast:'Guṇitasamuccayaḥ', en:'“The product of the sum is the sum of the product”'},
  short:'Is 4567 × 89 = 406463 right? Compare digit sums: 4 × 8 → 32 → 5 vs 4+0+6+4+6+3 → 23 → 5.',
  brief:`<p>Reduce every number to its <b>digit sum</b> (keep adding digits until one is left; 9 counts as 0 — “casting out nines”).</p>
    <ol><li>Digit sum of each factor.</li><li>Multiply them, reduce again.</li><li>Compare with the digit sum of the claimed product.</li></ol>
    <p class="note">Different ⇒ certainly wrong. Same ⇒ <i>probably</i> right — swapped digits or an error of a multiple of 9 slip through.</p>`,
  why:`<p>10 ≡ 1 (mod 9), so every power of ten is ≡ 1, and a number is ≡ the sum of its digits (mod 9). Remainders respect multiplication:</p><div class="eqn">a ≡ s(a),  b ≡ s(b)  ⇒  a·b ≡ s(a)·s(b)   (mod 9)</div><p>So s(a·b) must equal s(s(a)·s(b)) — the “sum of the product” equals the “product of the sums”.</p>`,
  hist:`<p>In the book this sūtra appears at the end of Ch. VII as a check on <i>algebra</i>: the sum of the coefficients of a product equals the product of the coefficient-sums (put x = 1). Tīrtha does not spell out the arithmetic version, but it is the same idea with x = 10: digits are coefficients, and because 10 ≡ 1 (mod 9), carrying between columns changes a digit sum only by multiples of 9 — so the check holds <i>mod 9</i>.</p><p>That mod-9 form is the ancient “casting out nines”, used by Indian and Arab arithmeticians and in Fibonacci’s <i>Liber Abaci</i> (1202).</p>`,
  ex:{a:4567,b:89,c:406463}, ph:'4567 × 89 = 406463',
  rand(){ const a=ri(102,9999), b=ri(12,999); let c=a*b; const r=Math.random(); if(r<.25){ const s=String(c).split(''); const i=ri(0,s.length-2); if(s[i]!==s[i+1]){ [s[i],s[i+1]]=[s[i+1],s[i]]; c=+s.join(''); } } else if(r<.55){ const p=10**ri(0,len(c)-2); c+= pick([-1,1])*ri(1,8)*p; } return {a,b,c}; },
  parse(str){ const m=String(str).replace(/[−–—]/g,'-').match(/^\s*(\d+)\s*(?:×|x|\*)\s*(\d+)\s*=\s*(\d+)\s*$/i); if(!m) throw 'Type it like 4567 × 89 = 406463.'; return {a:+m[1],b:+m[2],c:+m[3]}; },
  q:p=>`${p.a} × ${p.b} = ${p.c}<small>does the digit-sum check pass? (yes / no)</small>`,
  ans:p=>dr(dr(p.a)*dr(p.b))===dr(p.c)?'yes':'no',
  check(p,v){ return yesNo(v)===this.ans(p); },
  after(p){ const pass=this.ans(p)==='yes', right=p.a*p.b===p.c; return pass&&!right ? ` But note: ${p.a} × ${p.b} is really ${p.a*p.b} — the check passed anyway (a swap or a multiple-of-9 error slips through).` : !pass ? ` (The true product is ${p.a*p.b}.)` : ''; },
  gen({a,b,c}){
    const s=new Sc();
    const chain=n=>{ const out=[]; let x=n; while(x>9){ const d=digits(x); const nx=d.reduce((p,q)=>p+q,0); out.push(d.join('+')+' = '+nx); x=nx; } return {steps:out, r:x===9?9:x}; };
    lay(s,0,[['a',String(a)],['x','×','op'],['b',String(b)],['eq','=','op'],['c',String(c)]]);
    s.snap(`Is <b>${a} × ${b} = ${c}</b> right? Check it with digit sums (<i>bījāṅka</i>).`);
    const ca=chain(a), cb=chain(b), cc=chain(c);
    const row=(k,y,label,ch,src)=>{ s.put(k,0,y,`${label}: ${ch.steps.join(' → ')||label}${ch.steps.length?'':''}  ⇒  ${ch.r}`,'work',{from:src}); };
    row('sa',1.4,a,ca,'a'); s.hl('a','sa');
    s.snap(`Digit sum of ${a}: ${ca.steps.join(', then ')||a} → <b>${ca.r}</b>.`);
    row('sb',2.4,b,cb,'b'); s.hl('b','sb');
    s.snap(`Digit sum of ${b}: ${cb.steps.join(', then ')||b} → <b>${cb.r}</b>.`);
    const pr=ca.r*cb.r, cp=chain(pr);
    s.put('sp',0,3.4,`${ca.r} × ${cb.r} = ${pr}${cp.steps.length?'  →  '+cp.steps.join(' → '):''}  ⇒  ${cp.r}`,'work').hl('sp');
    s.snap(`Product of the digit sums: ${ca.r} × ${cb.r} = ${pr}${cp.steps.length?`, reduced to <b>${cp.r}</b>`:''}. This is what the answer’s digit sum <i>must</i> be.`);
    row('sc',4.4,c,cc,'c'); s.hl('c','sc');
    s.snap(`Digit sum of the claimed answer ${c}: → <b>${cc.r}</b>.`);
    const ok=(cp.r%9)===(cc.r%9);
    s.put('v',0,5.6, ok?`${cp.r} = ${cc.r}  ✓ check passes`:`${cp.r} ≠ ${cc.r}  ✗ wrong`, ok?'ans':'bad');
    s.snap(ok ? `<span class="ok">The check passes.</span> ${a*b===c?`(And indeed ${a} × ${b} = ${c}.)`:`<span class="no">But ${a} × ${b} is actually ${a*b}!</span> Swapped digits and errors that are multiples of 9 don’t change digit sums — the check catches most slips, not all.`}` : `<span class="no">Digit sums disagree, so ${c} is definitely wrong.</span> (${a} × ${b} = ${a*b}.)`);
    return s.fr;
  }
});

/* ---------- sub-sūtra 12. Vilokanam: square roots ---------- */
const sqEnd={0:[0],1:[1,9],4:[2,8],5:[5],6:[4,6],9:[3,7]};
def({
  id:'sqrt', chn:34, o:20, sub:[12], group:'Corollaries (Upa-sūtras)', name:'Vilokanam — square roots of perfect squares',
  sutra:{kind:'SUB-SŪTRA 12', dev:'विलोकनम्', iast:'Vilokanam', en:'“By mere observation”'},
  short:'√15129: ends in 9 → root ends in 3 or 7; 151 sits between 12² and 13² → 123 or 127; 151 < 12×13 → 123.',
  brief:`<p>For a <b>perfect</b> square:</p>
    <ol><li>Mark off pairs of digits from the right — one root digit per pair.</li><li>The last digit fixes the root’s last digit up to two choices (1↔1/9, 4↔2/8, 9↔3/7, 6↔4/6, 5↔5, 0↔0).</li><li>Drop the last pair. The largest a with a² ≤ what’s left gives the leading digits.</li><li>Choose between a·10 + small and a·10 + large: compare with a × (a+1) — that’s (a5)² without its 25.</li></ol>`,
  why:`<p>Last digits of squares depend only on the last digit of the root, and each possible ending comes from two digits that add to 10 (except 0 and 5). The middle point between the two candidates is a5, and</p><div class="eqn">(10a + 5)² = 100·a(a+1) + 25</div><p>so if the number (without its last two digits) is at least a(a+1), the root is past a5 — take the larger candidate.</p>`,
  hist:`<p>Tīrtha’s general square-root method (Ch. XXXIV) works for any number using duplexes, but for exact squares he points out that observation (<i>Vilokanam</i>) does most of the work — the same strategy he uses for exact cube roots in Ch. XXXV.</p>`,
  ex:{r:123}, ph:'√15129 or 15129',
  rand(){ return {r: Math.random()<.6 ? ri(11,99) : ri(101,999)}; },
  parse(str){ const t=String(str).replace(/[√\s]/g,''); if(!/^\d+$/.test(t)) throw 'Enter a perfect square, like 15129.'; const n=+t, r=Math.round(Math.sqrt(n)); if(r*r!==n) throw `${n} isn’t a perfect square (nearest: ${r*r}).`; if(r<4) throw 'Something bigger, please.'; if(r>9999) throw 'Up to 8 digits.'; return {r}; },
  q:p=>`√${p.r*p.r}`, ans:p=>String(p.r),
  gen({r}){
    const s=new Sc(), n=r*r, ns=String(n), L=ns.length;
    [...ns].forEach((ch,i)=>s.put('d'+i,i*1.25,0,ch));
    s.snap(`Find √<b>${n}</b>. It’s a perfect square, so observation will do.`);
    let g=0; for(let e=L;e>0;e-=2){ const st=Math.max(0,e-2); s.seg('g'+g,st*1.25+0.05,-0.62,(e-1)*1.25+0.95,-0.62,'group'); g++; }
    s.snap(`Mark off pairs from the right: <b>${g}</b> group${g>1?'s':''}, so the root has <b>${g}</b> digit${g>1?'s':''}.`);
    const last=n%10, ends=sqEnd[last];
    s.hl('d'+(L-1)).put('w1',0,1.5,`ends in ${last} → root ends in ${ends.join(' or ')}`,'work').hl('w1');
    s.snap(`The square ends in <b>${last}</b>. Only roots ending in ${ends.map(e=>`<b>${e}</b>`).join(' or ')} give that (${ends.map(e=>`${e}² = ${e*e}`).join(', ')}).`);
    const P=Math.floor(n/100); let a=Math.floor(Math.sqrt(P)); while((a+1)*(a+1)<=P) a++; while(a*a>P) a--;
    const pk=[]; for(let i=0;i<L-2;i++) pk.push('d'+i);
    s.hl(...pk).put('w2',0,2.6, P? `${a}² = ${a*a} ≤ ${P} < ${(a+1)**2} = ${a+1}²` : `nothing left → leading part 0`,'work').hl('w2');
    s.snap(P? `Drop the last pair and look at what’s left: <b>${P}</b>. The biggest square not above it is ${a}² = ${a*a}, so the root begins with <b>${a}</b>.` : `Nothing is left after the last pair, so the root is a single digit.`);
    let u;
    if(ends.length===1){ u=ends[0]; }
    else {
      const big=P>=a*(a+1); u= big? ends[1] : ends[0];
      s.put('w3',0,3.7,`${a} × ${a+1} = ${a*(a+1)};  ${P} ${big?'≥':'<'} ${a*(a+1)}  →  ${a}${u}`,'work').hl('w3');
      s.snap(`Two candidates: <b>${a}${ends[0]}</b> or <b>${a}${ends[1]}</b>. The midpoint is ${a}5, and ${a}5² = ${a} × ${a+1} | 25 = ${a*(a+1)}25. Since ${P} ${big?'≥':'<'} ${a*(a+1)}, the root is ${big?'above':'below'} ${a}5 — it’s <b>${a}${u}</b>.`);
    }
    const root=a*10+u;
    s.put('A',0,4.9,`√${n} = ${root}`,'ans');
    s.snap(`<span class="ok">√${n} = ${root}</span>` + (root!==r?` <span class="no">mismatch: ${r}</span>`:''));
    return s.fr;
  }
});

/* ---------- Vilokanam: cube roots of exact cubes ---------- */
const cubeEnd={0:0,1:1,2:8,3:7,4:4,5:5,6:6,7:3,8:2,9:9};
def({
  id:'cbrt', chn:35, o:10, sub:[12], group:'Corollaries (Upa-sūtras)', name:'Vilokanam — cube roots of exact cubes',
  sutra:{kind:'SUB-SŪTRA 12', dev:'विलोकनम्', iast:'Vilokanam', en:'“By mere observation”'},
  short:'∛438976: last digit 6 → 6; first group 438 lies between 7³ and 8³ → 76.',
  brief:`<p>For an <b>exact</b> cube (up to 6 digits → a 2-digit root):</p>
    <ol><li>Mark off groups of three digits from the right.</li><li>The last digit of the cube fixes the root’s last digit <i>uniquely</i>: 1→1, 8→2, 7→3, 4→4, 5→5, 6→6, 3→7, 2→8, 9→9, 0→0.</li><li>The largest a with a³ ≤ the first group gives the first digit.</li></ol>`,
  why:`<p>Cubing permutes the last digits: x³ mod 10 takes every value 0–9 exactly once, so the last digit of a cube identifies its root’s last digit. (2↔8 and 3↔7 swap; the rest stay put.) The leading digits follow from bounding: (10a)³ ≤ n < (10a+10)³ ⇔ a³ ≤ n/1000 < (a+1)³.</p>`,
  hist:`<p>Tīrtha’s Ch. XXXV opens with this as the classic stage demonstration — a 2-digit cube root from a 6-digit cube “at sight”. He then extends it to larger exact cubes (Ch. XXXV) and to general cube roots (Ch. XXXVI), which need far more machinery.</p>`,
  ex:{r:76}, ph:'∛438976 or 438976',
  rand(){ return {r: Math.random()<.8 ? ri(11,99) : ri(101,999)}; },
  parse(str){ const t=String(str).replace(/[∛\s]/g,''); if(!/^\d+$/.test(t)) throw 'Enter an exact cube, like 438976.'; const n=+t, r=Math.round(Math.cbrt(n)); if(r*r*r!==n) throw `${n} isn’t an exact cube (nearest: ${r**3}).`; if(r<3) throw 'Something bigger, please.'; if(r>999) throw 'Up to 9 digits.'; return {r}; },
  q:p=>`∛${p.r**3}`, ans:p=>String(p.r),
  gen({r}){
    const s=new Sc(), n=r**3, ns=String(n), L=ns.length;
    [...ns].forEach((ch,i)=>s.put('d'+i,i*1.25,0,ch));
    s.snap(`Find the cube root of <b>${n}</b> — an exact cube.`);
    let g=0; for(let e=L;e>0;e-=3){ const st=Math.max(0,e-3); s.seg('g'+g,st*1.25+0.05,-0.62,(e-1)*1.25+0.95,-0.62,'group'); g++; }
    s.snap(`Mark off groups of three from the right: <b>${g}</b> group${g>1?'s':''} → a <b>${g}</b>-digit root.`);
    const last=n%10, u=cubeEnd[last];
    s.hl('d'+(L-1)).put('w1',0,1.5,`ends in ${last} → root ends in ${u}   (${u}³ = ${u**3})`,'work').hl('w1');
    s.snap(`The cube ends in <b>${last}</b>, and only ${u}³ = ${u**3} ends that way. The root ends in <b>${u}</b>.`);
    const P=Math.floor(n/1000); let a=Math.floor(Math.cbrt(P)); while((a+1)**3<=P) a++; while(a**3>P) a--;
    const pk=[]; for(let i=0;i<L-3;i++) pk.push('d'+i);
    s.hl(...pk).put('w2',0,2.6, P?`${a}³ = ${a**3} ≤ ${P} < ${(a+1)**3} = ${a+1}³`:'nothing left → single digit','work').hl('w2');
    s.snap(P? `What’s left after the last group: <b>${P}</b>. The biggest cube not above it is ${a}³ = ${a**3}, so the root starts with <b>${a}</b>.` : `Nothing left — the root is a single digit.`);
    const root=a*10+u;
    s.put('A',0,3.8,`∛${n} = ${root}`,'ans');
    s.snap(`<span class="ok">∛${n} = ${root}</span>` + (root!==r?` <span class="no">mismatch: ${r}</span>`:''));
    return s.fr;
  }
});

