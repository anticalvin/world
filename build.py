from pathlib import Path
p=Path(__file__).parent
h=(p/'index.html').read_text(); m=(p/'engine/movement.js').read_text()
h=h.replace('<script>\n\'use strict\';','<script>\n'+m+'\n</script>\n<script>\n\'use strict\';',1)
h=h.replace('<button class="btn" id="view">View</button>','<button class="btn" id="view">View</button><button class="btn" id="creator">Build</button>')
h=h.replace('<div id="stick"><div id="nub"></div></div>','<div id="creatorPanel" class="panel" style="display:none;position:absolute;right:12px;top:135px;max-width:min(310px,92vw);pointer-events:auto;max-height:65vh;overflow:auto"><b style="color:var(--mag)">WORLD BUILDER / LOCAL</b><p style="font-size:12px">Add structures to a personal copy of this world. Official Lounge is read-only.</p><button class="btn" id="addBlock">+ NEON BLOCK</button><button class="btn" id="addPillar">+ PILLAR</button><button class="btn" id="undoBlock">UNDO LAST</button><button class="btn" id="exportWorld">EXPORT BLUEPRINT</button><label>IMPORT BLUEPRINT</label><input id="importWorld" type="file" accept=".json,application/json" style="font-size:12px"><button class="btn" id="closeCreator">CLOSE</button><p id="builderStatus" style="font-size:12px;color:var(--cyan)"></p></div><div id="stick"><div id="nub"></div></div>')
h=h.replace("let yaw=0,pitch=0,px=0,pz=9,py=0,vy=0,grounded=true,slideTime=0,slideVX=0,slideVZ=0,keys={}","let motor=AwakenMovement.createState(),jumpRequest=false,slideRequest=false,accumulator=0;let yaw=0,pitch=0,px=0,pz=9,py=0,vy=0,grounded=true,slideTime=0,slideVX=0,slideVZ=0,keys={}")
start=h.index("addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;")
end=h.index("addEventListener('keyup',e=>keys[e.code]=0);",start)
h=h[:start]+"addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='KeyV'&&live)toggleView();if(e.code==='Space'&&live&&!talking){jumpRequest=true;e.preventDefault()}if(e.code==='KeyC'&&live)slideRequest=true;if(e.code==='KeyE'&&live&&sel.id==='lounge'&&!talking&&near())startTalk();keys[e.code]=1});\n"+h[end:]
start=h.index("$('jumpMobile').onclick=")
end=h.index("const st=$('stick')",start)
h=h[:start]+"$('jumpMobile').onclick=()=>{jumpRequest=true};$('slideMobile').onclick=()=>{slideRequest=true};let mobileRun=false;$('runMobile').onclick=()=>{mobileRun=!mobileRun;$('runMobile').style.background=mobileRun?'#ff2e9a':'#0d0614cf'};"+h[end:]
h=h.replace('function enter(){px=0;pz=9;py=0;vy=0;grounded=true;slideTime=0;', 'function enter(){motor=AwakenMovement.createState();accumulator=0;jumpRequest=slideRequest=false;px=0;pz=9;py=0;vy=0;grounded=true;slideTime=0;')
start=h.index('    const f=(keys.KeyW||keys.ArrowUp?1:0)')
end=h.index("    $('talk').style.display",start)
h=h[:start]+'''    const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-sy,r=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+sx;
    const input={forward:f,right:r,yaw,sprint:!!(keys.ShiftLeft||keys.ShiftRight||mobileRun),jump:jumpRequest,slide:slideRequest};
    accumulator=Math.min(accumulator+dt,.12);while(accumulator>=1/60){AwakenMovement.step(motor,input,1/60);input.jump=false;input.slide=false;accumulator-=1/60}
    jumpRequest=slideRequest=false;px=motor.x;pz=motor.z;py=motor.y;grounded=motor.grounded;slideTime=motor.slide;mv=Math.hypot(motor.vx,motor.vz)>.2;
'''+h[end:]
# avoid untrusted HTML in world directory
h=h.replace("d.innerHTML=`<b>${w.name}</b>${w.official?' <small>OFFICIAL</small>':''}<br><small>by ${w.by} · LOCAL DEMO</small><div style=\"font-size:13px;margin-top:4px\">${w.desc}</div>`;", "const title=document.createElement('b');title.textContent=w.name;const meta=document.createElement('small');meta.textContent=(w.official?' OFFICIAL · ':'')+'by '+w.by+' · LOCAL DEMO';const desc=document.createElement('div');desc.style.cssText='font-size:13px;margin-top:4px';desc.textContent=w.desc;d.append(title,document.createElement('br'),meta,desc);")
# builder code
builder='''
/* ---------- world blueprint lab (local, creator-only) ---------- */
const BUILDER_KEY='awaken-blueprints-v10';let blueprints={};try{blueprints=JSON.parse(localStorage.getItem(BUILDER_KEY))||{}}catch(e){}
const placed=new THREE.Group();S.add(placed);
function builderStatus(t){$('builderStatus').textContent=t}
function validPart(o){return o&&['block','pillar'].includes(o.kind)&&[o.x,o.z].every(v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=22)}
function currentParts(){return Array.isArray(blueprints[sel.id])?blueprints[sel.id]:[]}
function drawParts(){while(placed.children.length){const o=placed.children[0];placed.remove(o);o.geometry.dispose();o.material.dispose()}for(const p of currentParts().filter(validPart).slice(0,150)){if(p.kind==='block')block(placed,p.x,.75,p.z,1.8,1.5,1.8,0x35f0ff);else add(new THREE.CylinderGeometry(.32,.4,3,8),M(0xff2e9a),p.x,1.5,p.z,placed)}placed.visible=sel.id!=='lounge'}
function saveParts(){try{localStorage.setItem(BUILDER_KEY,JSON.stringify(blueprints));builderStatus('Saved locally · '+currentParts().length+' objects')}catch(e){builderStatus('Storage unavailable: '+e.message)}drawParts()}
function addPart(kind){if(sel.id==='lounge'){builderStatus('Official Lounge is protected');return}const parts=currentParts();if(parts.length>=150){builderStatus('150 object limit');return}const x=Math.max(-22,Math.min(22,px-Math.sin(yaw)*3)),z=Math.max(-22,Math.min(22,pz-Math.cos(yaw)*3));blueprints[sel.id]=[...parts,{kind,x:Math.round(x*10)/10,z:Math.round(z*10)/10}];saveParts()}
$('creator').onclick=()=>{$('creatorPanel').style.display=$('creatorPanel').style.display==='none'?'block':'none';builderStatus(sel.id==='lounge'?'Official Lounge: read-only':'Build mode · '+currentParts().length+' objects')};
$('closeCreator').onclick=()=>$('creatorPanel').style.display='none';$('addBlock').onclick=()=>addPart('block');$('addPillar').onclick=()=>addPart('pillar');
$('undoBlock').onclick=()=>{if(sel.id==='lounge')return;blueprints[sel.id]=currentParts().slice(0,-1);saveParts()};
$('exportWorld').onclick=()=>{if(sel.id==='lounge'){builderStatus('Official world is read-only');return}const payload={format:'awaken-blueprint',version:1,world:sel.id,objects:currentParts()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='awaken-'+sel.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
$('importWorld').onchange=async e=>{if(sel.id==='lounge'){builderStatus('Official world is read-only');return}try{const f=e.target.files[0];if(!f)return;if(f.size>100000)throw Error('Blueprint exceeds 100 KB');const p=JSON.parse(await f.text());if(p.format!=='awaken-blueprint'||p.version!==1||!Array.isArray(p.objects)||p.objects.length>150||!p.objects.every(validPart))throw Error('Invalid blueprint schema');blueprints[sel.id]=p.objects.map(({kind,x,z})=>({kind,x,z}));saveParts()}catch(err){builderStatus('Import error: '+err.message)}e.target.value=''};
'''
h=h.replace('/* ---------- state ---------- */',builder+'\n/* ---------- state ---------- */')
h=h.replace('function choose(w){sel=w;theme(w);Net.join(w);pane()}',"function choose(w){sel=w;theme(w);Net.join(w);drawParts();pane()}")
h=h.replace("$('boot').style.display='block';prev.visible=ped.visible=true;", "$('boot').style.display='block';$('creatorPanel').style.display='none';prev.visible=ped.visible=true;")
(p/'index.html').write_text(h)
