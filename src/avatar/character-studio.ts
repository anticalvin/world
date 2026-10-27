import * as THREE from "three";
import { builtIn, sanitizeAvatar, type AvatarConfig } from "./avatar";

export const SKIN = [["LIGHT","#f0c8a4"],["TAN","#d29c6c"],["BROWN","#9a6038"],["DEEP","#6e3f25"],["DARK","#46281a"],["EBONY","#2e1a11"]] as const;
export const HAIR_COLORS = [["BLACK","#17110e"],["BROWN","#4a2c1a"],["BLONDE","#d9b45c"],["RED","#b33a22"],["BLUE","#2f4dff"],["WHITE","#ececec"]] as const;
export const TOP_COLORS = [["WHITE","#f0f0f0"],["BLACK","#1a1a1a"],["RED","#d02222"],["BLUE","#3552ff"],["OLIVE","#6b7a3a"],["YELLOW","#f2d84a"]] as const;
const ROWS = [
  {label:"SKIN", key:"skin", values:SKIN.map(x=>x[1]), names:SKIN.map(x=>x[0])},
  {label:"HAIR", key:"hair", values:["twists","buzz","afro","braids","bald"], names:["TWISTS","BUZZ","AFRO","BRAIDS","BALD"]},
  {label:"HAIR COLOR", key:"hairColor", values:HAIR_COLORS.map(x=>x[1]), names:HAIR_COLORS.map(x=>x[0])},
  {label:"TOP", key:"top", values:["tee","tank","hoodie"], names:["TEE","TANK","HOODIE"]},
  {label:"TOP COLOR", key:"outfit", values:TOP_COLORS.map(x=>x[1]), names:TOP_COLORS.map(x=>x[0])},
  {label:"PANTS", key:"pants", values:["cargo","jeans","shorts"], names:["CARGO","JEANS","SHORTS"]},
  {label:"SHOES", key:"shoes", values:["sneakers","boots","sandals"], names:["SNEAKERS","BOOTS","SANDALS"]},
] as const;

const css = `
.character-stage{position:relative;width:min(94vw,640px);aspect-ratio:1;background:#1022d6;color:#e9ecff;font-family:"Arial Narrow",Arial,sans-serif;overflow:hidden;box-shadow:0 12px 55px #03021c}
.character-stage *{box-sizing:border-box}
.character-stage .character-frame{position:absolute;inset:7.6% 3.4% 3.6%;border-top:2px solid #ffffff50;border-right:2px solid #ffffffaa;background:linear-gradient(115deg,#ffffff14,transparent 38%,#ffffff09 70%,#00000022)}
.character-stage .character-preview{position:absolute;left:4%;top:16%;width:48%;height:70%;touch-action:none;cursor:grab}
.character-stage .character-name{position:absolute;left:10%;top:86%;width:37%;background:transparent;border:0;border-bottom:2px solid #ffffff70;color:#fff;text-align:center;font-size:clamp(12px,2.8vw,21px);text-transform:uppercase}
.character-stage .character-hint{position:absolute;left:6%;top:92%;width:46%;font-size:clamp(9px,1.8vw,13px);text-align:center;color:#aab3ff}
.character-stage .character-menu{position:absolute;left:54%;top:19%;width:43%;display:flex;flex-direction:column;gap:clamp(3px,.8vw,8px)}
.character-stage .character-row{display:grid;grid-template-columns:36% 12% 40% 12%;align-items:center;min-height:clamp(30px,6vw,49px);font-size:clamp(11px,2.7vw,19px);color:#e9ecff}
.character-stage .character-row.active{color:#f2d84a}
.character-stage .character-label{font-size:clamp(9px,1.9vw,14px);color:#aab3ff}
.character-stage .character-row.active .character-label{color:#f2d84a}
.character-stage .character-value{text-align:center;font-size:clamp(10px,2.1vw,16px);overflow:hidden}
.character-stage .character-arrow{color:inherit;background:transparent;border:0;font:inherit;cursor:pointer;min-height:32px;padding:0}
.character-stage .character-confirm{border:0;background:transparent;color:#f2d84a;text-align:left;font-size:clamp(17px,3.8vw,27px);cursor:pointer;padding:12px 0}
.character-stage .character-cancel{border:0;background:transparent;color:#aab3ff;text-align:left;cursor:pointer;padding:6px 0}
.character-stage .character-hp{position:absolute;top:13%;left:10%;color:#22d36a;font-size:clamp(9px,1.7vw,13px)}
.character-stage .character-footer{position:absolute;right:5%;bottom:4%;font-size:clamp(8px,1.7vw,12px);color:#f2d84a}
.character-stage .character-title{position:absolute;top:3%;left:7%;font-size:clamp(11px,2.5vw,18px);letter-spacing:.2em}
@media(max-width:480px){.character-stage .character-menu{top:21%}.character-stage .character-row{min-height:30px}}
`;

export function mountCharacterStudio(host: HTMLElement, initial: AvatarConfig, handlers: {
  save: (draft:AvatarConfig)=>void;
  cancel: ()=>void;
  change?: (draft:AvatarConfig)=>void;
}): ()=>void {
  const draft = sanitizeAvatar(initial);
  const style = document.createElement("style"); style.textContent=css; document.head.append(style);
  const stage = document.createElement("section"); stage.className="character-stage";
  stage.setAttribute("aria-label","Character Select Avatar Studio");
  stage.innerHTML = '<div class="character-frame"></div><div class="character-title">NEW GAME · CHARACTER SELECT</div><div class="character-hp">HP ▮▮▮▮▮▮▮▮▮▮ LV01</div><canvas class="character-preview" aria-label="3D character preview, drag to rotate"></canvas><div class="character-hint">DRAG TO ROTATE</div><div class="character-menu"></div><div class="character-footer">MEMORY CARD SLOT 1 · SYSTEM READY</div>';
  const canvas=stage.querySelector("canvas")!, menu=stage.querySelector<HTMLElement>(".character-menu")!;
  const name=document.createElement("input"); name.className="character-name";name.maxLength=14;name.value=draft.name;name.setAttribute("aria-label","Display name");name.oninput=()=>{draft.name=name.value.toUpperCase();handlers.change?.(draft);};stage.append(name);
  host.replaceChildren(stage);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});
  renderer.setPixelRatio(1);renderer.setSize(280,420,false);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,280/420,0.1,50);
  camera.position.set(0,1,4.9);camera.lookAt(0,0.95,0);
  scene.add(new THREE.HemisphereLight(0xdde4ff,0x1a2a7a,1.5));
  const light=new THREE.DirectionalLight(0xffffff,1.4);light.position.set(2,4,3);scene.add(light);
  let model=builtIn(draft);scene.add(model);
  let yaw=0,drag=false,lastX=0,frame=0,disposed=false,active=0;
  function refresh(){scene.remove(model);model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;for(const item of Array.isArray(m)?m:[m])item.dispose();}});model=builtIn(draft);scene.add(model);handlers.change?.(draft);paint();}
  const elements:HTMLElement[]=[];
  function paint(){elements.forEach((el,i)=>{const row=ROWS[i];const index=row.values.indexOf(String(draft[row.key]));el.classList.toggle("active",i===active);el.querySelector(".character-value")!.textContent=row.names[Math.max(0,index)];});}
  ROWS.forEach((row,i)=>{
    const item=document.createElement("div");item.className="character-row";
    const label=document.createElement("span");label.className="character-label";label.textContent=row.label;
    const prev=document.createElement("button");prev.className="character-arrow";prev.textContent="‹";prev.setAttribute("aria-label","Previous "+row.label);
    const value=document.createElement("span");value.className="character-value";
    const next=document.createElement("button");next.className="character-arrow";next.textContent="›";next.setAttribute("aria-label","Next "+row.label);
    function change(delta:number){active=i;const index=row.values.indexOf(String(draft[row.key]));(draft as unknown as Record<string,string>)[row.key]=row.values[(index+delta+row.values.length)%row.values.length];refresh();}
    prev.onclick=()=>change(-1);next.onclick=()=>change(1);
    item.append(label,prev,value,next);menu.append(item);elements.push(item);
  });
  const confirm=document.createElement("button");confirm.className="character-confirm";confirm.textContent="› CONFIRM";confirm.onclick=()=>handlers.save(sanitizeAvatar(draft));
  const cancel=document.createElement("button");cancel.className="character-cancel";cancel.textContent="CANCEL · RETURN";cancel.onclick=handlers.cancel;menu.append(confirm,cancel);paint();
  canvas.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(drag){yaw+=(e.clientX-lastX)*0.014;lastX=e.clientX;}});
  canvas.addEventListener("pointerup",()=>{drag=false;});
  canvas.addEventListener("pointercancel",()=>{drag=false;});
  const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
  function draw(){if(disposed)return;if(!drag&&!reduce)yaw+=0.006;model.rotation.y=yaw;renderer.render(scene,camera);frame=requestAnimationFrame(draw);}draw();
  return ()=>{disposed=true;cancelAnimationFrame(frame);scene.remove(model);model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();style.remove();};
}
