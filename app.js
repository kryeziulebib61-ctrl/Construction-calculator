/* BETA GROUP-cal ATAN FIX v5 */
const F=[
["Diagonala","d=√(a²+b²)",["Stran a (m)","Stran b (m)"],v=>`d = ${Math.hypot(v[0],v[1]).toFixed(3)} m`],
["Površina","A=a×b",["Dolžina (m)","Širina (m)"],v=>`A = ${(v[0]*v[1]).toFixed(2)} m²`],
["Prostornina betona","V=L×W×H",["Dolžina (m)","Širina (m)","Višina (m)"],v=>{let x=v[0]*v[1]*v[2];return`V = ${x.toFixed(3)} m³ • masa ≈ ${(x*2400).toFixed(0)} kg`}],
["Višina strehe (atan)","h=b×tan(α)",["Polovica širine objekta (m)","Koti α (°)"],v=>`Višina = ${(v[0]*Math.tan(v[1]*Math.PI/180)).toFixed(2)} m`],
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
let rows=JSON.parse(localStorage.getItem("bg_slo_rows")||"[]"),active=0,$=s=>document.querySelector(s);
function render(){list.innerHTML=F.map((f,i)=>`<article class=card><h3>${i+1}. ${f[0]}</h3><div class=eq>${f[1]}</div><div class=inputs>${f[2].map((x,j)=>`<div class=field><label>${x}</label><input id=a${i}-${j} type=number step=.01 value=0></div>`).join("")}</div><button class=calc data-i=${i}>IZRAČUNAJ</button><div class=result id=r${i}></div></article>`).join("");document.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{let f=F[+b.dataset.i],v=f[2].map((_,j)=>+($(`#a${b.dataset.i}-${j}`).value)||0);$(`#r${b.dataset.i}`).innerHTML="<strong>"+f[3](v)+"</strong>"})}
function save(){localStorage.setItem("bg_slo_rows",JSON.stringify(rows))}
function parseNum(v){const n=parseFloat(String(v).replace(/\s/g,"").replace(",","."));return Number.isFinite(n)?n:0}
function updateTotal(){let t=rows.reduce((s,r)=>s+parseNum(r.qty)*parseNum(r.price),0);total.textContent=t.toLocaleString("sl-SI",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"}
function renderRows(){rowsBox.innerHTML=rows.map((r,i)=>`<div class=estimate-row><input data-e=${i} data-k=name value="${String(r.name).replace(/&/g,"&amp;").replace(/\"/g,"&quot;")}"><input data-e=${i} data-k=unit value="${String(r.unit).replace(/&/g,"&amp;").replace(/\"/g,"&quot;")}"><input data-e=${i} data-k=qty type="text" inputmode="decimal" autocomplete="off" value="${r.qty}"><input data-e=${i} data-k=price type="text" inputmode="decimal" autocomplete="off" value="${r.price}"><button data-d=${i}>×</button></div>`).join("")||"<p>Ni postavk.</p>";updateTotal();document.querySelectorAll("[data-e]").forEach(x=>x.oninput=()=>{const i=+x.dataset.e,k=x.dataset.k;rows[i][k]=["qty","price"].includes(k)?x.value:x.value;save();updateTotal()});document.querySelectorAll("[data-d]").forEach(x=>x.onclick=()=>{rows.splice(+x.dataset.d,1);save();renderRows()})}
const list=$("#list"),sheet=$("#sheet"),estimate=$("#estimate"),rowsBox=$("#rows");
$("#pred").onclick=()=>{renderRows();estimate.classList.remove("hide")};$("#back").onclick=()=>estimate.classList.add("hide");$("#add").onclick=()=>{rows.push({name:"Nova postavka",unit:"m²",qty:1,price:0});save();renderRows()};$("#print").onclick=()=>print();$("#about").onclick=()=>alert("BETA GROUP-cal • 20 gradbenih formul");render();