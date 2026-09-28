
const KEY = "cc_v5_state";

const defaultMaterials = [
  ["Beton C25/30","m³",95],["Çimento","kg",0.18],["Rërë","m³",22],["Zhavorr","m³",28],
  ["Blloqe betoni","copë",0.65],["Tulla","copë",0.32],["Hekur Ø8","kg",1.15],
  ["Hekur Ø10","kg",1.20],["Hekur Ø12","kg",1.25],["Hekur Ø16","kg",1.30],
  ["Dru konstruktiv","m³",260],["Pllaka çatie","m²",12],["Izolim","m²",8],
  ["Suva","m²",4.5],["Bojë","L",5.5],["Pllaka qeramike","m²",11],
  ["Ngjitës pllakash","kg",0.55],["Gërmim dheu","m³",7]
].map((x,i)=>({id:"m"+i,name:x[0],unit:x[1],price:x[2]}));

const moduleDefs = [
  ["Beton","beton","Beton","Llogarit vëllimin dhe koston e betonit."],
  ["Themele","themele","Themele","Llogarit betonin, armaturën dhe koston orientuese të themeleve."],
  ["Mure","mure","Mure","Llogarit sipërfaqen dhe numrin e blloqeve/tullave."],
  ["Çati","cati","Çati","Llogarit sipërfaqen e çatisë me pjerrësi."],
  ["Pjerrësi","pjerresi","Pjerrësi","Llogarit këndin dhe gjatësinë e pjerrësisë."],
  ["Strehë","strehe","Strehë","Llogarit materialin për një strehë."],
  ["Shkallë","shkalle","Shkallë","Llogarit betonin e shkallëve."],
  ["Armaturë","armature","Armaturë","Llogarit peshën orientuese të armaturës."],
  ["Suvatim","suvatim","Suvatim","Llogarit sipërfaqen dhe materialin e suvatimit."],
  ["Bojë","boje","Bojë","Llogarit litrat e bojës."],
  ["Pllaka","pllaka","Pllaka","Llogarit pllakat dhe ngjitësin."],
  ["Gërmime","germime","Gërmime","Llogarit vëllimin e gërmimit."],
];

const emptyProject = (name="Projekt i ri") => ({
  id: "p"+Date.now(), name, client:"", location:"", notes:"",
  vat:20, laborRate:0, items:[], created:new Date().toISOString()
});

let state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  projects:[emptyProject("Projekti 1")],
  activeId:null, materials:defaultMaterials
};
if (!state.activeId) state.activeId = state.projects[0].id;
state.materials ||= defaultMaterials;

const $ = s => document.querySelector(s);
const money = n => (Number(n)||0).toLocaleString("sq-AL",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
const num = v => Math.max(0, Number(v)||0);
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const active = () => state.projects.find(p=>p.id===state.activeId) || state.projects[0];

function projectTotals(p=active()){
  const net = p.items.reduce((s,i)=>s + num(i.qty)*num(i.price)*(1-num(i.discount||0)/100),0);
  const labor = p.items.reduce((s,i)=>s + num(i.labor||0)*num(i.qty),0);
  const subtotal = net + labor;
  const vat = subtotal * num(p.vat)/100;
  return {net,labor,subtotal,vat,total:subtotal+vat,count:p.items.length};
}
function persistAndRender(){ save(); render(); }

function render(){
  renderProjects(); renderDashboard(); renderEstimate(); renderMaterials(); renderModuleSelect();
  const p=active();
  const title=$("#projectTitle"); if(title) title.textContent=p.name;
  const client=$("#projectClient"); if(client) client.value=p.client||"";
  const location=$("#projectLocation"); if(location) location.value=p.location||"";
  const vat=$("#projectVat"); if(vat) vat.value=p.vat ?? 20;
  const notes=$("#projectNotes"); if(notes) notes.value=p.notes||"";
}

function renderProjects(){
  const box=$("#projectList"); if(!box) return;
  box.innerHTML=state.projects.map(p=>`<button class="project-row ${p.id===state.activeId?"active":""}" data-project="${p.id}">
    <span>${esc(p.name)}</span><small>${p.items.length} zëra</small></button>`).join("");
  box.querySelectorAll("[data-project]").forEach(b=>b.onclick=()=>{state.activeId=b.dataset.project;save();render();});
}
function renderDashboard(){
  const t=projectTotals();
  [["statProjects",state.projects.length],["statItems",t.count],["statSubtotal",money(t.subtotal)],["statTotal",money(t.total)]]
    .forEach(([id,v])=>{const e=$("#"+id);if(e)e.textContent=v});
  const p=active(), list=$("#recentItems"); if(!list)return;
  list.innerHTML=p.items.slice(-6).reverse().map(i=>`<tr><td>${esc(i.name)}</td><td>${i.unit}</td><td>${i.qty}</td><td>${money(i.qty*i.price)}</td></tr>`).join("") ||
    `<tr><td colspan="4" class="muted">Ende nuk ka zëra.</td></tr>`;
}
function renderEstimate(){
  const p=active(), body=$("#estimateBody"); if(!body)return;
  body.innerHTML=p.items.map((i,idx)=>`<tr>
    <td><input data-i="${idx}" data-k="name" value="${escAttr(i.name)}"></td>
    <td><input data-i="${idx}" data-k="unit" value="${escAttr(i.unit)}"></td>
    <td><input type="number" step="0.01" data-i="${idx}" data-k="qty" value="${i.qty}"></td>
    <td><input type="number" step="0.01" data-i="${idx}" data-k="price" value="${i.price}"></td>
    <td><input type="number" step="0.1" data-i="${idx}" data-k="discount" value="${i.discount||0}"></td>
    <td><input type="number" step="0.01" data-i="${idx}" data-k="labor" value="${i.labor||0}"></td>
    <td>${money(num(i.qty)*num(i.price)*(1-num(i.discount||0)/100)+num(i.qty)*num(i.labor||0))}</td>
    <td><button class="icon-btn danger" data-del="${idx}">×</button></td>
  </tr>`).join("") || `<tr><td colspan="8" class="muted">Shto zërin e parë të preventivit.</td></tr>`;
  body.querySelectorAll("input[data-i]").forEach(el=>el.oninput=()=>{
    const i=p.items[+el.dataset.i]; let v=el.value;
    i[el.dataset.k]=["qty","price","discount","labor"].includes(el.dataset.k)?num(v):v;
    save(); renderEstimate(); renderDashboard(); updateTotals();
  });
  body.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{p.items.splice(+b.dataset.del,1);persistAndRender();});
  updateTotals();
}
function updateTotals(){
  const t=projectTotals();
  [["sumNet",money(t.net)],["sumLabor",money(t.labor)],["sumVat",money(t.vat)],["sumTotal",money(t.total)]]
    .forEach(([id,v])=>{const e=$("#"+id);if(e)e.textContent=v});
}
function renderMaterials(){
  const body=$("#materialsBody"); if(!body)return;
  body.innerHTML=state.materials.map((m,i)=>`<tr>
    <td><input data-m="${i}" data-k="name" value="${escAttr(m.name)}"></td>
    <td><input data-m="${i}" data-k="unit" value="${escAttr(m.unit)}"></td>
    <td><input type="number" step="0.01" data-m="${i}" data-k="price" value="${m.price}"></td>
    <td><button class="icon-btn danger" data-md="${i}">×</button></td>
  </tr>`).join("");
  body.querySelectorAll("input[data-m]").forEach(el=>el.oninput=()=>{
    const m=state.materials[+el.dataset.m]; m[el.dataset.k]=el.dataset.k==="price"?num(el.value):el.value; save();
  });
  body.querySelectorAll("[data-md]").forEach(b=>b.onclick=()=>{state.materials.splice(+b.dataset.md,1);persistAndRender();});
}
function renderModuleSelect(){
  const s=$("#materialSelect"); if(!s)return;
  s.innerHTML=state.materials.map(m=>`<option value="${m.id}">${esc(m.name)} — ${money(m.price)}/${m.unit}</option>`).join("");
}
function addItem(item={name:"Zë i ri",unit:"m²",qty:1,price:0,discount:0,labor:0}){
  active().items.push({...item,id:"i"+Date.now()+Math.random()}); persistAndRender();
}
function addMaterialToEstimate(){
  const m=state.materials.find(x=>x.id===$("#materialSelect").value); if(m)addItem({name:m.name,unit:m.unit,qty:1,price:m.price,discount:0,labor:0});
}

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const escAttr=esc;

function moduleCalc(type){
  const vals=[...document.querySelectorAll("#moduleForm input")].map(x=>num(x.value));
  let result=[], cost=0;
  if(type==="beton"){let [l,w,h]=vals;let v=l*w*h;result=[`Vëllimi: ${v.toFixed(2)} m³`];cost=v*(state.materials.find(m=>m.name.includes("Beton"))?.price||0);}
  if(type==="themele"){let [l,w,h]=vals;let v=l*w*h;let steel=v*80;result=[`Beton: ${v.toFixed(2)} m³`,`Armaturë orientuese: ${steel.toFixed(0)} kg`];cost=v*95+steel*1.25;}
  if(type==="mure"){let [l,h,open]=vals;let a=Math.max(0,l*h-open);let blocks=a*12.5;result=[`Sipërfaqe: ${a.toFixed(2)} m²`,`Blloqe/tulla orientuese: ${Math.ceil(blocks)} copë`];cost=blocks*0.65;}
  if(type==="cati"){let [l,w,slope]=vals;let r=1/Math.cos(Math.atan(slope/100));let a=l*w*r;result=[`Sipërfaqe çatie: ${a.toFixed(2)} m²`];cost=a*12;}
  if(type==="pjerresi"){let [rise,run]=vals;let hyp=Math.hypot(rise,run), angle=Math.atan2(rise,run)*180/Math.PI;result=[`Gjatësia: ${hyp.toFixed(2)} m`,`Këndi: ${angle.toFixed(2)}°`,`Pjerrësia: ${(rise/run*100||0).toFixed(2)}%`];}
  if(type==="strehe"){let [l,w]=vals;let a=l*w;result=[`Sipërfaqe: ${a.toFixed(2)} m²`,`Material çatie orientues: ${a.toFixed(2)} m²`];cost=a*12;}
  if(type==="shkalle"){let [n,rise,run,w]=vals;let v=n*rise*run*w/2;result=[`Numër hapash: ${n}`,`Beton orientues: ${v.toFixed(2)} m³`];cost=v*95;}
  if(type==="armature"){let [d,len,n]=vals;let kgm=(d*d/162);let kg=kgm*len*n;result=[`Peshë orientuese: ${kg.toFixed(2)} kg`];cost=kg*1.25;}
  if(type==="suvatim"){let [l,h,open,thick]=vals;let a=Math.max(0,l*h-open), v=a*(thick/1000);result=[`Sipërfaqe: ${a.toFixed(2)} m²`,`Vëllim suvatimi: ${v.toFixed(3)} m³`];cost=a*4.5;}
  if(type==="boje"){let [a,coats,coverage]=vals;let liters=a*coats/(coverage||10);result=[`Bojë: ${liters.toFixed(2)} L`];cost=liters*5.5;}
  if(type==="pllaka"){let [l,w,waste]=vals;let a=l*w*(1+waste/100);result=[`Sipërfaqe me humbje: ${a.toFixed(2)} m²`,`Pllaka: ${a.toFixed(2)} m²`];cost=a*11;}
  if(type==="germime"){let [l,w,h]=vals;let v=l*w*h;result=[`Vëllim gërmimi: ${v.toFixed(2)} m³`];cost=v*7;}
  const out=$("#moduleResult"); out.innerHTML=`<div class="result-box">${result.map(x=>`<div>${x}</div>`).join("")}<strong>Kosto orientuese: ${money(cost)}</strong></div>`;
  if(cost){$("#addCalc").onclick=()=>addItem({name:moduleDefs.find(x=>x[1]===type)?.[2]||type,unit:"shërbim",qty:1,price:cost,labor:0});$("#addCalc").hidden=false;}
}

function setupModules(){
  const nav=$("#moduleNav"); if(!nav)return;
  nav.innerHTML=moduleDefs.map(x=>`<button data-mod="${x[1]}">${x[0]}</button>`).join("");
  nav.querySelectorAll("[data-mod]").forEach(b=>b.onclick=()=>openModule(b.dataset.mod));
}
function openModule(type){
  const d=moduleDefs.find(x=>x[1]===type); if(!d)return;
  $("#moduleTitle").textContent=d[2]; $("#moduleDesc").textContent=d[3];
  const specs={
    beton:[["Gjatësia (m)",""],["Gjerësia (m)",""],["Lartësia (m)",""]],
    themele:[["Gjatësia (m)",""],["Gjerësia (m)",""],["Lartësia (m)",""]],
    mure:[["Gjatësia (m)",""],["Lartësia (m)",""],["Hapje (m²)",""]],
    cati:[["Gjatësia (m)",""],["Gjerësia (m)",""],["Pjerrësia (%)",""]],
    pjerresi:[["Ngritja (m)",""],["Baza (m)",""]],
    strehe:[["Gjatësia (m)",""],["Gjerësia (m)",""]],
    shkalle:[["Numër hapash",""],["Ngritja (m)",""],["Shkelja (m)",""],["Gjerësia (m)",""]],
    armature:[["Diametri Ø (mm)",""],["Gjatësia/shufër (m)",""],["Numër shufrash",""]],
    suvatim:[["Gjatësia (m)",""],["Lartësia (m)",""],["Hapje (m²)",""],["Trashësia (mm)",""]],
    boje:[["Sipërfaqja (m²)",""],["Numër duarsh",""],["Mbulimi (m²/L)",""]],
    pllaka:[["Gjatësia (m)",""],["Gjerësia (m)",""],["Humbje (%)",""]],
    germime:[["Gjatësia (m)",""],["Gjerësia (m)",""],["Thellësia (m)",""]]
  }[type];
  $("#moduleForm").innerHTML=specs.map(s=>`<label>${s[0]}<input type="number" step="0.01" value="1"></label>`).join("");
  $("#moduleResult").innerHTML=""; $("#addCalc").hidden=true;
  $("#calcModule").onclick=()=>moduleCalc(type);
  document.querySelectorAll(".page").forEach(x=>x.hidden=true); $("#modulePage").hidden=false;
}

function bind(){
  $("#newProject").onclick=()=>{const name=prompt("Emri i projektit:","Projekt i ri");if(name){const p=emptyProject(name);state.projects.push(p);state.activeId=p.id;persistAndRender();}};
  $("#deleteProject").onclick=()=>{if(state.projects.length<2)return alert("Duhet të mbetet të paktën një projekt.");if(confirm("Fshi projektin aktiv?")){state.projects=state.projects.filter(p=>p.id!==state.activeId);state.activeId=state.projects[0].id;persistAndRender();}};
  $("#addItem").onclick=()=>addItem();
  $("#addMaterial").onclick=addMaterialToEstimate;
  $("#saveProject").onclick=()=>{const p=active();p.name=$("#projectTitle").textContent;p.client=$("#projectClient").value;p.location=$("#projectLocation").value;p.vat=num($("#projectVat").value);p.notes=$("#projectNotes").value;persistAndRender();alert("Projekti u ruajt.");};
  $("#printEstimate").onclick=()=>window.print();
  $("#exportJson").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download="construction-calculator-v5.json";a.click();};
  $("#importJson").onclick=()=>$("#jsonFile").click();
  $("#jsonFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();render();alert("Projekti u importua.");}catch{alert("JSON i pavlefshëm.");}};r.readAsText(f)};
  $("#navDashboard").onclick=()=>showPage("dashboardPage");
  $("#navEstimate").onclick=()=>showPage("estimatePage");
  $("#navMaterials").onclick=()=>showPage("materialsPage");
  $("#navProject").onclick=()=>showPage("projectPage");
  $("#navModules").onclick=()=>showPage("modulesPage");
  setupModules();
  $("#moduleNav").querySelectorAll("button").forEach(b=>b.onclick=()=>openModule(b.dataset.mod));
  $("#backModules").onclick=()=>showPage("modulesPage");
  $("#projectTitle").contentEditable="true";
}
function showPage(id){document.querySelectorAll(".page").forEach(x=>x.hidden=true);$("#"+id).hidden=false;window.scrollTo(0,0);}
function start(){bind();render();showPage("dashboardPage");}
document.addEventListener("DOMContentLoaded",start);
