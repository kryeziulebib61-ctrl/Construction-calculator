const KEY="cc_v4_state";
const uid=()=>Math.random().toString(36).slice(2,9);
const money=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const num=id=>Number(document.getElementById(id)?.value)||0;
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

const defaults={
  materials:[
    {id:uid(),name:"Beton",unit:"m³",price:110},{id:uid(),name:"Çimento",unit:"thes",price:7},
    {id:uid(),name:"Rërë",unit:"m³",price:25},{id:uid(),name:"Zhavorr",unit:"m³",price:30},
    {id:uid(),name:"Armaturë",unit:"kg",price:1.2},{id:uid(),name:"Bllok",unit:"copë",price:1.5},
    {id:uid(),name:"Tjegull",unit:"copë",price:1.8},{id:uid(),name:"Bojë",unit:"L",price:6},
    {id:uid(),name:"Pllakë",unit:"m²",price:15},{id:uid(),name:"Gërmim",unit:"m³",price:12}
  ],
  projects:[{id:uid(),name:"Projekti im",description:"Projekt i ri",created:Date.now(),items:[],discount:0,vat:20}],
  activeProject:null
};
let state=loadState();
if(!state.activeProject) state.activeProject=state.projects[0].id;

function loadState(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaults)}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function project(){return state.projects.find(p=>p.id===state.activeProject)||state.projects[0]}
function setProject(id){state.activeProject=id;save();showSection("dashboard")}
function totals(p=project()){
 const sub=(p.items||[]).reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0);
 const disc=sub*(Number(p.discount)||0)/100, after=sub-disc, vat=after*(Number(p.vat)||0)/100;
 return {sub,disc,after,vat,total:after+vat};
}
function renderAll(){renderHeader();renderProjects();renderMaterials();renderEstimate();renderStats()}
function renderHeader(){const p=project();document.getElementById("projectTitle").textContent=p.name;document.getElementById("projectMeta").textContent=p.description||"Pa përshkrim"}
function renderStats(){const p=project(),t=totals(p);document.getElementById("dashTotal").textContent=money(t.total);document.getElementById("dashItems").textContent=p.items.length;document.getElementById("dashMaterials").textContent=state.materials.length;document.getElementById("dashProjects").textContent=state.projects.length}
function renderProjects(){
 const el=document.getElementById("projectList");
 el.innerHTML=state.projects.map(p=>`<div class="project-row ${p.id===state.activeProject?"active":""}">
   <div><strong>${esc(p.name)}</strong><small>${esc(p.description||"")}</small></div>
   <div class="project-actions"><button class="btn small secondary" onclick="setProject('${p.id}')">Hap</button>${state.projects.length>1?`<button class="delete-btn" onclick="deleteProject('${p.id}')">×</button>`:""}</div>
 </div>`).join("");
}
function renderMaterials(){
 const el=document.getElementById("materialsTable");
 el.innerHTML=state.materials.map(m=>`<tr><td><input value="${esc(m.name)}" onchange="updateMaterial('${m.id}','name',this.value)"></td>
 <td><input value="${esc(m.unit)}" onchange="updateMaterial('${m.id}','unit',this.value)"></td>
 <td><input type="number" step="0.01" value="${m.price}" onchange="updateMaterial('${m.id}','price',this.value)"></td>
 <td><button class="delete-btn" onclick="deleteMaterial('${m.id}')">Fshi</button></td></tr>`).join("");
}
function renderEstimate(){
 const p=project(),el=document.getElementById("estimateTable");
 el.innerHTML=p.items.map(i=>`<tr>
 <td><input value="${esc(i.desc)}" onchange="updateItem('${i.id}','desc',this.value)"></td>
 <td><input value="${esc(i.unit)}" onchange="updateItem('${i.id}','unit',this.value)"></td>
 <td><input type="number" step="0.01" value="${i.qty}" onchange="updateItem('${i.id}','qty',this.value)"></td>
 <td><input type="number" step="0.01" value="${i.price}" onchange="updateItem('${i.id}','price',this.value)"></td>
 <td>${money((Number(i.qty)||0)*(Number(i.price)||0))}</td>
 <td><button class="delete-btn" onclick="deleteItem('${i.id}')">Fshi</button></td></tr>`).join("");
 document.getElementById("discount").value=p.discount||0;document.getElementById("vat").value=p.vat??20;
 const t=totals(p);document.getElementById("estimateSummary").innerHTML=`
 <div class="sum-row"><span>Nëntotali</span><strong>${money(t.sub)}</strong></div>
 <div class="sum-row"><span>Zbritje</span><strong>- ${money(t.disc)}</strong></div>
 <div class="sum-row"><span>Pas zbritjes</span><strong>${money(t.after)}</strong></div>
 <div class="sum-row"><span>TVSH ${p.vat}%</span><strong>${money(t.vat)}</strong></div>
 <div class="sum-row total"><span>TOTAL</span><strong>${money(t.total)}</strong></div>`;
}
function updateMaterial(id,key,val){const m=state.materials.find(x=>x.id===id);if(m){m[key]=key==="price"?Number(val)||0:val;save()}}
function deleteMaterial(id){state.materials=state.materials.filter(m=>m.id!==id);save()}
function addMaterial(){state.materials.push({id:uid(),name:"Material i ri",unit:"copë",price:0});save()}
function updateItem(id,key,val){const i=project().items.find(x=>x.id===id);if(i){i[key]=(key==="qty"||key==="price")?Number(val)||0:val;save()}}
function deleteItem(id){project().items=project().items.filter(i=>i.id!==id);save()}
function addEstimate(){project().items.push({id:uid(),desc:"Punë / material",unit:"copë",qty:1,price:0});save()}
function deleteProject(id){if(state.projects.length<=1)return alert("Duhet të mbetet të paktën një projekt.");state.projects=state.projects.filter(p=>p.id!==id);if(state.activeProject===id)state.activeProject=state.projects[0].id;save()}
function openProjectModal(){document.getElementById("projectName").value=project().name;document.getElementById("projectDescription").value=project().description||"";document.getElementById("projectModal").classList.remove("hidden")}
function newProject(){document.getElementById("projectName").value="Projekt i ri";document.getElementById("projectDescription").value="";document.getElementById("projectModal").classList.remove("hidden");document.getElementById("projectModal").dataset.new="1"}
function closeModal(){document.getElementById("projectModal").classList.add("hidden");delete document.getElementById("projectModal").dataset.new}
function saveProject(){
 const modal=document.getElementById("projectModal"),name=document.getElementById("projectName").value.trim()||"Projekt pa emër",desc=document.getElementById("projectDescription").value.trim();
 if(modal.dataset.new){const p={id:uid(),name,description:desc,created:Date.now(),items:[],discount:0,vat:20};state.projects.push(p);state.activeProject=p.id}
 else{project().name=name;project().description=desc}
 closeModal();save();
}
function showSection(id){document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===id));window.scrollTo({top:0,behavior:"smooth"})}
function addResult(id,items){document.getElementById(id).innerHTML=`<div class="result-grid">${items.map(([a,b])=>`<div class="result-item"><span>${a}</span><strong>${b}</strong></div>`).join("")}</div>`}
function calcConcrete(){let v=num("cL")*num("cW")*num("cH"),q=v*(1+num("cWaste")/100);addResult("cResult",[["Vëllimi",q.toFixed(3)+" m³"],["Kosto",money(q*num("cPrice"))],["Pa humbje",v.toFixed(3)+" m³"]])}
function calcFoundation(){let v=num("fL")*num("fW")*num("fH"),q=v*(1+num("fWaste")/100);addResult("fResult",[["Beton",q.toFixed(3)+" m³"],["Kosto",money(q*num("fPrice"))],["Pa humbje",v.toFixed(3)+" m³"]])}
function calcWalls(){let a=Math.max(0,num("wL")*num("wH")-num("wOpen")),b=Math.ceil(a*num("wBlocks")),m=a*num("wMortar");addResult("wResult",[["Sipërfaqe",a.toFixed(2)+" m²"],["Blloqe",b+" copë"],["Llaç",m.toFixed(3)+" m³"],["Kosto blloqesh",money(b*num("wBlockPrice"))]])}
function calcRoof(){let a=num("rL")*num("rW"),factor=Math.sqrt(1+Math.pow(num("rSlope")/100,2)),q=a*factor*(1+num("rWaste")/100);addResult("rResult",[["Sipërfaqe",q.toFixed(2)+" m²"],["Faktori pjerrësisë",factor.toFixed(3)],["Kosto",money(q*num("rPrice"))]])}
function calcSlope(){let p=num("sPercent"),deg=Math.atan(p/100)*180/Math.PI,rise=num("sRun")*p/100,slant=num("sRun")/Math.cos(Math.atan(p/100));addResult("sResult",[["Gradë",deg.toFixed(2)+"°"],["Ngritja",rise.toFixed(2)+" m"],["Gjatësia e pjerrët",slant.toFixed(2)+" m"]])}
function calcEaves(){let a=num("eL")*num("eW");addResult("eResult",[["Sipërfaqe",a.toFixed(2)+" m²"],["Kosto",money(a*num("ePrice"))],["Perimetër linear",num("eL").toFixed(2)+" m"]])}
function calcStairs(){let n=Math.max(1,Math.round(num("stN"))),r=num("stH")/n,t=num("stT"),angle=Math.atan(r/t)*180/Math.PI;addResult("stResult",[["Riser",r.toFixed(3)+" m"],["Shkelje",t.toFixed(2)+" m"],["Këndi",angle.toFixed(2)+"°"]])}
function calcRebar(){let d=num("rbD"),l=num("rbL"),kg=d*d/162*l*(1+num("rbWaste")/100);addResult("rbResult",[["Peshë",kg.toFixed(2)+" kg"],["Kosto",money(kg*num("rbPrice"))],["Pa humbje",(d*d/162*l).toFixed(2)+" kg"]])}
function calcPlaster(){let a=Math.max(0,num("pL")*num("pH")-num("pOpen")),v=a*(num("pT")/1000)*(1+num("pWaste")/100);addResult("pResult",[["Sipërfaqe",a.toFixed(2)+" m²"],["Volum",v.toFixed(3)+" m³"],["Trashësi",num("pT").toFixed(0)+" mm"]])}
function calcPaint(){let liters=num("ptArea")*num("ptCoats")/Math.max(.01,num("ptCov"))*(1+num("ptWaste")/100);addResult("ptResult",[["Bojë",liters.toFixed(2)+" L"],["Kosto",money(liters*num("ptPrice"))],["Shtresa",num("ptCoats")]])}
function calcTiles(){let piece=Math.max(.0001,num("tL")*num("tW")),q=Math.ceil(num("tArea")/piece*(1+num("tWaste")/100));addResult("tResult",[["Pllaka",q+" copë"],["Sipërfaqe neto",num("tArea").toFixed(2)+" m²"],["Kosto",money(q*num("tPrice"))]])}
function calcExcavation(){let v=num("xL")*num("xW")*num("xH");addResult("xResult",[["Vëllim",v.toFixed(3)+" m³"],["Kosto",money(v*num("xPrice"))],["Thellësi",num("xH").toFixed(2)+" m"]])}

function exportJSON(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="construction-calculator-v4.json";a.click();URL.revokeObjectURL(a.href)}
function importJSON(file){const r=new FileReader();r.onload=e=>{try{const x=JSON.parse(e.target.result);if(!x.projects||!x.materials)throw Error();state=x;save();alert("Të dhënat u importuan.")}catch{alert("Skedari JSON nuk është i vlefshëm.")}};r.readAsText(file)}
function printEstimate(){showSection("estimate");setTimeout(()=>window.print(),100)}

document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.go)));
document.getElementById("newProjectBtn").onclick=newProject;document.getElementById("dashboardNewProject").onclick=newProject;
document.getElementById("editProjectBtn").onclick=openProjectModal;document.getElementById("closeModal").onclick=closeModal;document.getElementById("cancelModal").onclick=closeModal;document.getElementById("saveProjectBtn").onclick=saveProject;
document.getElementById("addMaterialBtn").onclick=addMaterial;document.getElementById("addEstimateBtn").onclick=addEstimate;document.getElementById("printBtn").onclick=printEstimate;document.getElementById("printEstimateBtn").onclick=printEstimate;
document.getElementById("exportJsonBtn").onclick=exportJSON;document.getElementById("importJsonBtn").onclick=()=>document.getElementById("importFile").click();document.getElementById("importFile").onchange=e=>e.target.files[0]&&importJSON(e.target.files[0]);
document.getElementById("discount").onchange=e=>{project().discount=Number(e.target.value)||0;save()};document.getElementById("vat").onchange=e=>{project().vat=Number(e.target.value)||0;save()};
document.getElementById("clearAllBtn").onclick=()=>{if(confirm("Të fshihen të gjitha të dhënat lokale?")){localStorage.removeItem(KEY);state=loadState();state.activeProject=state.projects[0].id;save()}};
renderAll();
