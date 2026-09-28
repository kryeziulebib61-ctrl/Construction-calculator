const F=[
["1. Diagonalja","d = √(a² + b²)",["a (m)","b (m)"],v=>`d = ${Math.hypot(v[0],v[1]).toFixed(3)} m`],
["2. Sipërfaqja","A = a × b",["Gjatësia (m)","Gjerësia (m)"],v=>`A = ${(v[0]*v[1]).toFixed(2)} m²`],
["3. Beton","V = L × W × H",["Gjatësia (m)","Gjerësia (m)","Lartësia (m)"],v=>{let x=v[0]*v[1]*v[2];return `V = ${x.toFixed(3)} m³ • Pesha ≈ ${(x*2400).toFixed(0)} kg`}],
["4. Këndi (atan)","α = atan(n / b)",["Ngritja (m)","Baza (m)"],v=>`α = ${(Math.atan2(v[0],v[1])*180/Math.PI).toFixed(2)}°`],
["5. Pjerrësia","i = ngritja / baza × 100",["Ngritja (m)","Baza (m)"],v=>`Pjerrësia = ${(v[1]?v[0]/v[1]*100:0).toFixed(2)}% • ${(Math.atan2(v[0],v[1])*180/Math.PI).toFixed(2)}°`],
["6. Pesha e hekurit","kg = d² / 162 × L × n",["Diametri d (mm)","Gjatësia L (m)","Nr. shufrave"],v=>`Pesha = ${(v[0]**2/162*v[1]*v[2]).toFixed(2)} kg`],
["7. Pesha e betonit","P = V × 2400 kg/m³",["Vëllimi (m³)"],v=>`Pesha ≈ ${(v[0]*2400).toFixed(0)} kg`],
["8. Presioni","p = F / A",["Forca F (kN)","Sipërfaqja A (m²)"],v=>`p = ${(v[1]?v[0]/v[1]:0).toFixed(3)} kN/m²`],
["9. Shkallët","2R + T",["Nr. hapash","Ngritja R (m)","Shkelja T (m)","Gjerësia (m)"],v=>`2R+T = ${(2*v[1]+v[2]).toFixed(3)} m • Ngritje totale ${(v[0]*v[1]).toFixed(2)} m`],
["10. Trekëndëshi","A = b × h / 2",["Baza (m)","Lartësia (m)"],v=>`A = ${(v[0]*v[1]/2).toFixed(2)} m²`],
["11. Rrethi","A = πr²",["Rrezja r (m)"],v=>`A = ${(Math.PI*v[0]**2).toFixed(2)} m² • C = ${(2*Math.PI*v[0]).toFixed(2)} m`],
["12. Cilindri","V = πr²h",["Rrezja r (m)","Lartësia h (m)"],v=>`V = ${(Math.PI*v[0]**2*v[1]).toFixed(3)} m³`],
["13. Prizmi","V = Aᵦ × h",["Baza a (m)","Baza b (m)","Lartësia h (m)"],v=>`V = ${(v[0]*v[1]*v[2]).toFixed(3)} m³`],
["14. Çatia","A = Aplan / cos(α)",["Gjatësia (m)","Gjerësia (m)","Këndi α (°)"],v=>`A pjerrët = ${(v[0]*v[1]/Math.cos(v[2]*Math.PI/180)).toFixed(2)} m²`],
["15. Gërmimi","V = L × W × H",["Gjatësia (m)","Gjerësia (m)","Thellësia (m)"],v=>`V = ${(v[0]*v[1]*v[2]).toFixed(2)} m³`],
["16. Blloqe / tulla","N = A × copë/m²",["Sipërfaqja (m²)","Copë / m²"],v=>`N ≈ ${Math.ceil(v[0]*v[1])} copë`],
["17. Suvatim","V = A × trashësi",["Sipërfaqja (m²)","Trashësia (mm)"],v=>`V ≈ ${(v[0]*v[1]/1000).toFixed(3)} m³`],
["18. Bojë","L = A × duar / mbulim",["Sipërfaqja (m²)","Duar","Mbulimi (m²/L)"],v=>`Bojë ≈ ${(v[0]*v[1]/(v[2]||10)).toFixed(2)} L`],
["19. Pllaka","A × (1 + humbja%)",["Gjatësia (m)","Gjerësia (m)","Humbje (%)"],v=>`A me humbje = ${(v[0]*v[1]*(1+v[2]/100)).toFixed(2)} m²`],
["20. Perimetri","P = 2(a+b)",["Gjatësia a (m)","Gjerësia b (m)"],v=>`P = ${(2*(v[0]+v[1])).toFixed(2)} m`],
["21. Ton → kg","kg = ton × 1000",["Ton"],v=>`${(v[0]*1000).toFixed(2)} kg`],
["22. Shufra hekuri","Ltot = L × n",["Gjatësia/shufër (m)","Nr. shufrave"],v=>`L totale = ${(v[0]*v[1]).toFixed(2)} m`],
["23. Masa e tokës","m = V × ρ",["Vëllimi (m³)","Dendësia (kg/m³)"],v=>`Masa = ${(v[0]*v[1]).toFixed(0)} kg`],
["24. Sipërfaqe muri","A = L × H",["Gjatësia (m)","Lartësia (m)"],v=>`A = ${(v[0]*v[1]).toFixed(2)} m²`]
];
let estimate=JSON.parse(localStorage.getItem("bg_estimate")||"[]"), active=null;
const $=s=>document.querySelector(s);
function money(n){return Number(n||0).toLocaleString("sq-AL",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"}
function render(){const box=$("#formulaList");box.innerHTML=F.map((f,i)=>`<article class="formula-card"><h3>${f[0]}</h3><div class="eq">${f[1]}</div><div class="inputs">${f[2].map((x,j)=>`<div class="field"><label>${x}</label><input id="quick-${i}-${j}" type="number" step=".01" value="0"></div>`).join("")}</div><button class="run" data-run="${i}">LLOGARIT</button><div class="result" id="res-${i}"></div></article>`).join("");document.querySelectorAll("[data-run]").forEach(b=>b.onclick=()=>calc(+b.dataset.run))}
function calc(i){let f=F[i],v=f[2].map((_,j)=>Number($("#quick-"+i+"-"+j).value)||0);$("#res-"+i).innerHTML="<strong>"+f[3](v)+"</strong>"}
function openCalc(i){active=i;let f=F[i];$("#drawerTitle").textContent=f[0];$("#drawerFormula").textContent=f[1];$("#fields").innerHTML=f[2].map((x,j)=>`<div class="field"><label>${x}</label><input id="d-${j}" type="number" step=".01" value="0"></div>`).join("");$("#result").innerHTML="";$("#addEstimate").classList.add("hidden");$("#drawer").classList.remove("hidden")}
function renderEstimate(){let b=$("#estimateRows");b.innerHTML=estimate.map((r,i)=>`<div class="estimate-row"><input data-e="${i}" data-k="name" value="${r.name}"><input data-e="${i}" data-k="unit" value="${r.unit}"><input type="number" data-e="${i}" data-k="qty" value="${r.qty}"><input type="number" data-e="${i}" data-k="price" value="${r.price}"><button class="danger" data-del="${i}">Fshi</button></div>`).join("")||"<p>Nuk ka zëra.</p>";let t=estimate.reduce((s,r)=>s+(+r.qty||0)*(+r.price||0),0);$("#grandTotal").textContent=money(t);document.querySelectorAll("[data-e]").forEach(x=>x.oninput=()=>{let r=estimate[+x.dataset.e];r[x.dataset.k]=["qty","price"].includes(x.dataset.k)?Number(x.value)||0:x.value;save()});document.querySelectorAll("[data-del]").forEach(x=>x.onclick=()=>{estimate.splice(+x.dataset.del,1);save();renderEstimate()})}
function save(){localStorage.setItem("bg_estimate",JSON.stringify(estimate))}
document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>{if(b.dataset.nav==="estimate"){renderEstimate();$("#estimate").classList.remove("hidden")}else{document.querySelectorAll("[data-nav]").forEach(x=>x.classList.remove("active"));b.classList.add("active");scrollTo(0,0)}})
document.addEventListener("click",e=>{if(e.target.dataset.run!==undefined){}});
$("#calculate").onclick=()=>{let f=F[active],v=f[2].map((_,j)=>Number($("#d-"+j).value)||0);$("#result").innerHTML="<div class='resultbox'><strong>"+f[3](v)+"</strong></div>";$("#addEstimate").classList.remove("hidden")};
$("#addEstimate").onclick=()=>{estimate.push({name:F[active][0],unit:"llogaritje",qty:1,price:0});save();$("#drawer").classList.add("hidden");renderEstimate();$("#estimate").classList.remove("hidden")};
$("#closeDrawer").onclick=()=>$("#drawer").classList.add("hidden");
$("#closeEstimate").onclick=()=>$("#estimate").classList.add("hidden");
$("#newRow").onclick=()=>{estimate.push({name:"Zë i ri",unit:"m²",qty:1,price:0});save();renderEstimate()};
$("#print").onclick=()=>print();
render();document.querySelectorAll(".formula-card .run").forEach(b=>b.addEventListener("dblclick",()=>openCalc(+b.dataset.run)));
