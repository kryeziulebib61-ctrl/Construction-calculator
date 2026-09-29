(() => {
"use strict";
const formulas=[
["Diagonala","d=√(a²+b²)",["Stran a (m)","Stran b (m)"],v=>`d = ${Math.hypot(v[0],v[1]).toFixed(3)} m`],
["Površina","A=a×b",["Dolžina (m)","Širina (m)"],v=>`A = ${(v[0]*v[1]).toFixed(2)} m²`],
["Prostornina betona","V=L×W×H",["Dolžina (m)","Širina (m)","Višina (m)"],v=>{const x=v[0]*v[1]*v[2];return `V = ${x.toFixed(3)} m³ • masa ≈ ${(x*2400).toFixed(0)} kg`}],
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
["Obseg","P=2(a+b)",["Dolžina a (m)","Širina b (m)"],v=>`P = ${(2*(v[0]+v[1])).toFixed(2)} m`] ];
const $=id=>document.getElementById(id); const formulaList=$("formulaList");
let rows=[]; try{const x=localStorage.getItem("bg_slo_rows"); const y=x?JSON.parse(x):[]; if(Array.isArray(y)) rows=y;}catch(e){rows=[]; try{localStorage.removeItem("bg_slo_rows")}catch(_){} }
const num=x=>{const n=parseFloat(String(x??"").trim().replace(/\s/g,"").replace(",",".")); return Number.isFinite(n)?n:0};
const esc=x=>String(x??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
function renderFormulas(){formulaList.innerHTML=formulas.map((f,i)=>`<article class="card"><h3>${i+1}. ${f[0]}</h3><div class="eq">${f[1]}</div><div class="inputs">${f[2].map((label,j)=>`<div class="field"><label>${label}</label><input id="f-${i}-${j}" type="number" step="any" inputmode="decimal" value="0"></div>`).join("")}</div><button class="calc" type="button" data-formula="${i}">IZRAČUNAJ</button><div class="result" id="res-${i}"></div></article>`).join(""); formulaList.querySelectorAll("[data-formula]").forEach(btn=>btn.addEventListener("click",()=>{const i=+btn.dataset.formula;const v=formulas[i][2].map((_,j)=>num($("f-"+i+"-"+j).value));$("res-"+i).innerHTML="<strong>"+formulas[i][3](v)+"</strong>";}));}
function save(){try{localStorage.setItem("bg_slo_rows",JSON.stringify(rows))}catch(e){}}
function total(){const t=rows.reduce((s,r)=>s+num(r.qty)*num(r.price),0);$("grandTotal").textContent=t.toLocaleString("sl-SI",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";}
function renderRows(){const box=$("estimateRows"); box.innerHTML=rows.length?rows.map((r,i)=>`<div class="estimate-row"><input data-i="${i}" data-k="name" value="${esc(r.name)}" placeholder="Postavka"><input data-i="${i}" data-k="unit" value="${esc(r.unit)}" placeholder="Enota"><input data-i="${i}" data-k="qty" value="${esc(r.qty)}" inputmode="decimal" autocomplete="off" placeholder="Količina"><input data-i="${i}" data-k="price" value="${esc(r.price)}" inputmode="decimal" autocomplete="off" placeholder="Cena"><button type="button" data-delete="${i}">×</button></div>`).join(""):"<p>Ni postavk.</p>"; box.querySelectorAll("input[data-i]").forEach(input=>input.addEventListener("input",()=>{const i=+input.dataset.i;if(rows[i]){rows[i][input.dataset.k]=input.value;save();total();}})); box.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{rows.splice(+btn.dataset.delete,1);save();renderRows();})); total();}
function openEstimate(){renderRows();$("estimate").classList.remove("hidden");$("calcNav").classList.remove("active");$("estimateNav").classList.add("active");window.scrollTo(0,0);}
function closeEstimate(){$("estimate").classList.add("hidden");$("estimateNav").classList.remove("active");$("calcNav").classList.add("active");}
window.addEventListener("DOMContentLoaded",()=>{renderFormulas();$("estimateNav").addEventListener("click",openEstimate);$("backBtn").addEventListener("click",closeEstimate);$("calcNav").addEventListener("click",closeEstimate);$("addRow").addEventListener("click",()=>{rows.push({name:"Nova postavka",unit:"m²",qty:"1",price:"0"});save();renderRows();const i=rows.length-1;const el=document.querySelector(`[data-i="${i}"][data-k="name"]`);if(el){el.focus();el.select();}});$("printBtn").addEventListener("click",()=>window.print());$("aboutNav").addEventListener("click",()=>alert("BETA GROUP-cal • 20 gradbenih formul"));const d=$("estimateDate");try{d.value=localStorage.getItem("bg_slo_date")||new Date().toISOString().slice(0,10);}catch(e){d.value=new Date().toISOString().slice(0,10)}d.addEventListener("change",()=>{try{localStorage.setItem("bg_slo_date",d.value)}catch(e){}});});
})();
