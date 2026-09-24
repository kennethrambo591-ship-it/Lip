const $=id=>document.getElementById(id);
const tc=$("tc"),hdl=$("hdl"),tg=$("tg"),vldl=$("vldl"),ldl=$("ldl");
const results=$("results"),message=$("message");

function get(el){return el.value.trim()===""?null:Number(el.value)}
function fmt(x){return Number(x).toFixed(2)}
function put(el,x){el.value=fmt(x)}
function error(text){message.textContent=text;message.classList.add("show");results.classList.add("hidden")}
function clearError(){message.textContent="";message.classList.remove("show")}

function calculate(){
 clearError();
 let TC=get(tc),HDL=get(hdl),TG=get(tg),VLDL=get(vldl),LDL=get(ldl);

 for(const [name,x] of [["TC",TC],["HDL",HDL],["TG",TG],["VLDL",VLDL],["LDL",LDL]]){
   if(x!==null&&(!Number.isFinite(x)||x<0)){error(name+" must be a valid number greater than or equal to 0.");return}
 }
 if(TG===null){error("Please enter Triglycerides (TG).");return}
 if(HDL===null){error("Please enter HDL cholesterol.");return}

 // If VLDL is not entered, estimate it from triglycerides.
 if(VLDL===null)VLDL=TG/5;

 if(TC===null&&LDL===null){
   error("Please enter either Total Cholesterol (TC) or LDL.");return
 }

 if(LDL===null){
   LDL=TC-HDL-VLDL;
   if(LDL<0){error("Calculated LDL is below 0 mg/dL. Please check the values.");return}
   put(ldl,LDL);
 }else if(TC===null){
   TC=LDL+HDL+VLDL;
   put(tc,TC);
 }else{
   const expected=TC-HDL-VLDL;
   if(Math.abs(expected-LDL)>0.11){
     error("The entered values are not mathematically consistent. TC − HDL − VLDL gives LDL = "+fmt(expected)+" mg/dL.");
     return;
   }
 }

 put(vldl,VLDL);
 $("rTG").textContent=fmt(TG);
 $("rVLDL").textContent=fmt(VLDL);
 $("rTC").textContent=fmt(TC);
 $("rHDL").textContent=fmt(HDL);
 $("rLDL").textContent=fmt(LDL);
 results.classList.remove("hidden");
 results.scrollIntoView({behavior:"smooth",block:"start"});
}

function clearAll(){
 [tc,hdl,tg,vldl,ldl].forEach(x=>x.value="");
 clearError();results.classList.add("hidden");tc.focus();
}

$("calculate").addEventListener("click",calculate);
$("clear").addEventListener("click",clearAll);
$("print").addEventListener("click",()=>window.print());
[tc,hdl,tg,vldl,ldl].forEach(x=>x.addEventListener("keydown",e=>{if(e.key==="Enter")calculate()}));

let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{
 e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden");
});
$("installBtn").addEventListener("click",async()=>{
 if(!deferredPrompt)return;
 deferredPrompt.prompt();await deferredPrompt.userChoice;
 deferredPrompt=null;$("installBtn").classList.add("hidden");
});

if("serviceWorker" in navigator){
 window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
