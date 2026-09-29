(() => {
'use strict';
const F=[
["Diagonala","d=√(a²+b²)",["Stran a (m)","Stran b (m)"],v=>`d = ${Math.hypot(v[0],v[1]).toFixed(3)} m`],
["Površina","A=a×b",["Dolžina (m)","Širina (m)"],v=>`A = ${(v[0]*v[1]).toFixed(2)} m²`],
["Prostornina betona","V=L×W×H",["Dolžina (m)","Širina (m)","Višina (m)"],v=>{const x=v[0]*v[1]*v[2];return`V = ${x.toFixed(3)} m³ • masa ≈ ${(x*2400).toFixed(0)} kg`}],
["Višina strehe (atan)","h=b×tan(α)",["Polovica širine objekta (m)","Kot α (°)"],v=>`Višina = ${(v[0]*Math.tan(v[1]*Math.PI/180)).toFixed(2)} m`],
["Naklon","i=n/b×100",["Višina (m)","Osnova (m)"],v=>`Naklon = ${(v[1]?v[0]/v[1]*100:0).toFixed(2)} %`],
["Masa armature","kg=d²/162×L×n",["Premer d (mm)","Dolžina L (m)","Število palic"],v=>`Masa = ${(v[0]**2/162*v[1]*v[2]).toFixed(2)} kg`],
["Masa betona","m=V×2400",["Prostornina (m³)"],v=>`Masa ≈ ${(v[0]*2400).toFixed(0)} kg`],
["Tlak","p=F/A",["Sila F (kN)","Površina A (m²)"],v=>`p = ${(v[1]?v[0]/v[1]:0).toFixed(3)} kN/m²`],
["Stopnice","2R+T",["Število stopnic","Višina R (m)","Globina T (m)"],v=>`2R+T = ${(2*v[1]+v[2]).toFixed(3)} m`],
["Trikotnik","A=b×h/2",["Osnova (m)","Višina (m)"],v=>`A = ${(v[0]*v[1]/2).toFixed(2)} m²`],
["Krog","A=πr²",["Polmer r (m)"],v=>`A = ${(Math.PI*v[0]**2).toFixed(2)} m²`],
["Valj","V=πr²h",["Polmer r (m)","Višina h (m)"],v=>`V = ${(Math.PI*v[0]**2*v[1]).toFixed(3)} m³`],
["Temelj","V=L×W×H",["Dolžina (m)","Širina (m)","Višina (m)"],v=>`V = ${(v[0]*v[1]*v[2]).toFixed(3)} m³`],
["Streha","A=Ap/cos(α)",["Dolžina (m)","Širina (m)","Kot α (°)"],v=>`Površina ≈ ${(v[0]*v[1]/Math.cos(v[2]*Math.PI/180)).toFixed(2)} m²`],
["Izkop","V=L×W×H",["Dolžina (m)","Širina (m)","Globina (m)"],v=>`Izkop = ${(v[0]*v[1]*v[2]).toFixed(2)} m³`],
["Opeka / bloki","N=A×kosov/m²",["Površina (m²)","Kosov na m²"],v=>`Potrebno ≈ ${Math.ceil(v[0]*v[1])} kosov`],
["Omet","V=A×t",["Površina (m²)","Debelina (mm)"],v=>`Prostornina ≈ ${(v[0]*v[1]/1000).toFixed(3)} m³`],
["Barva","L=A×sloji/pokrivnost",["Površina (m²)","Število slojev","Pokrivnost (m²/L)"],v=>`Barva ≈ ${(v[0]*v[1]/(v[2]||10)).toFixed(2)} L`],
["Ploščice + odpad","A×(1+odpad%)",["Dolžina (m)","Širina (m)","Odpad (%)"],v=>`Potrebno ≈ ${(v[0]*v[1]*(1+v[2]/100)).toFixed(2)} m²`],
["Obseg","P=2(a+b)",["Dolžina a (m)","Širina b (m)"],v=>`P = ${(2*(v[0]+v[1])).toFixed(2)} m`]
];
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const list=$('#list'), estimate=$('#estimate'), rowsBox=$('#rows'), total=$('#total');
let rows=[];
try{ const raw=localStorage.getItem('bg_slo_rows'); rows=raw?JSON.parse(raw):[]; if(!Array.isArray(rows)) rows=[]; }catch(e){ rows=[]; localStorage.removeItem('bg_slo_rows'); }
function parseNum(x){return Number(String(x??'').replace(/\s/g,'').replace(',','.'))||0}
function esc(x){return String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function render(){list.innerHTML=F.map((f,i)=>`<article class="card"><h3>${i+1}. ${f[0]}</h3><div class="eq">${f[1]}</div><div class="inputs">${f[2].map((x,j)=>`<div class="field"><label>${x}</label><input id="a${i}-${j}" type="number" step=".01" inputmode="decimal" value="0"></div>`).join('')}</div><button class="calc" type="button" data-i="${i}">IZRAČUNAJ</button><div class="result" id="r${i}"></div></article>`).join('');
$$('[data-i]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.i),f=F[i],v=f[2].map((_,j)=>parseNum($(`#a${i}-${j}`).value));$(`#r${i}`).innerHTML='<strong>'+f[3](v)+'</strong>'}));}
function save(){localStorage.setItem('bg_slo_rows',JSON.stringify(rows))}
function updateTotal(){const sum=rows.reduce((s,r)=>s+parseNum(r.qty)*parseNum(r.price),0);total.textContent=sum.toLocaleString('sl-SI',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
function renderRows(){
 rowsBox.innerHTML=rows.length?rows.map((r,i)=>`<div class="estimate-row"><input data-e="${i}" data-k="name" aria-label="Postavka" value="${esc(r.name)}"><input data-e="${i}" data-k="unit" aria-label="Enota" value="${esc(r.unit)}"><input data-e="${i}" data-k="qty" aria-label="Količina" type="text" inputmode="decimal" autocomplete="off" value="${esc(r.qty)}"><input data-e="${i}" data-k="price" aria-label="Cena" type="text" inputmode="decimal" autocomplete="off" value="${esc(r.price)}"><button type="button" data-d="${i}" aria-label="Izbriši">×</button></div>`).join(''):'<p class="empty">Ni postavk.</p>';
 updateTotal();
 $$('[data-e]').forEach(x=>x.addEventListener('input',()=>{const i=+x.dataset.e,k=x.dataset.k; if(rows[i]){rows[i][k]=x.value;save();if(k==='qty'||k==='price')updateTotal()}}));
 $$('[data-d]').forEach(x=>x.addEventListener('click',()=>{rows.splice(+x.dataset.d,1);save();renderRows()}));
}
function openEstimate(){try{renderRows()}catch(e){rows=[];save();renderRows()} estimate.classList.remove('hide'); estimate.setAttribute('aria-hidden','false'); document.body.classList.add('estimate-open'); window.scrollTo({top:0,behavior:'smooth'});}
function closeEstimate(){estimate.classList.add('hide');estimate.setAttribute('aria-hidden','true');document.body.classList.remove('estimate-open')}
$('#pred').addEventListener('click',openEstimate);
$('#back').addEventListener('click',closeEstimate);
$('#homeNav').addEventListener('click',closeEstimate);
$('#add').addEventListener('click',()=>{rows.push({name:'Nova postavka',unit:'m²',qty:'1',price:'0'});save();renderRows();const last=rowsBox.querySelector('[data-e="'+(rows.length-1)+'"][data-k="name"]');if(last){last.focus();last.select()}});
$('#print').addEventListener('click',()=>window.print());
$('#about').addEventListener('click',()=>alert('BETA GROUP-cal • 20 gradbenih formul'));
const date=$('#estimateDate'); if(date){ date.value=localStorage.getItem('bg_slo_date')||new Date().toISOString().slice(0,10); date.addEventListener('change',()=>localStorage.setItem('bg_slo_date',date.value)); }
try{render()}catch(e){console.error(e)}
})();