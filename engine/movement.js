/* AWAKEN Movement 1.0: dependency-free, deterministic fixed-step kinematic prototype.
   Ground plane and circular world boundary only. Integrate Rapier for actual geometry collision. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.AwakenMovement=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const SETTINGS=Object.freeze({walk:4.4,sprint:7.6,accel:27,airAccel:8,friction:22,gravity:21,jump:7.8,slideSpeed:10.4,slideDuration:.8,slideDrag:7.5,coyote:.11,buffer:.14,radius:24});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function createState(x=0,z=9){return {x,z,y:0,vx:0,vz:0,vy:0,grounded:true,coyote:SETTINGS.coyote,jumpBuffer:0,slide:0,slideVX:0,slideVZ:0,slideQueued:false,jumpQueued:false}}
function step(s,input,dt,config=SETTINGS){dt=clamp(dt,0,1/30);const f=clamp(input.forward||0,-1,1),r=clamp(input.right||0,-1,1),n=Math.max(1,Math.hypot(f,r));const yaw=input.yaw||0;const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)/n,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)/n;const moving=Math.hypot(f,r)>.08;
if(input.jump||s.jumpQueued)s.jumpBuffer=config.buffer;s.jumpQueued=false;s.jumpBuffer=Math.max(0,s.jumpBuffer-dt);
if(s.grounded)s.coyote=config.coyote;else s.coyote=Math.max(0,s.coyote-dt);
if(s.jumpBuffer>0&&s.coyote>0){s.vy=config.jump;s.grounded=false;s.coyote=0;s.jumpBuffer=0}
if((input.slide||s.slideQueued)&&s.grounded&&s.slide<=0&&Math.hypot(s.vx,s.vz)>config.walk*.75){s.slide=config.slideDuration;const len=Math.hypot(s.vx,s.vz)||1;s.slideVX=s.vx/len*config.slideSpeed;s.slideVZ=s.vz/len*config.slideSpeed}s.slideQueued=false;
if(s.slide>0){s.slide=Math.max(0,s.slide-dt);const decay=Math.max(0,1-config.slideDrag*dt*.14);s.slideVX*=decay;s.slideVZ*=decay;s.vx=s.slideVX;s.vz=s.slideVZ}
else{const target=(input.sprint?config.sprint:config.walk),tx=dx*target,tz=dz*target,acc=s.grounded?config.accel:config.airAccel;const delta=acc*dt;const ax=tx-s.vx,az=tz-s.vz,dist=Math.hypot(ax,az);if(dist>delta){s.vx+=ax/dist*delta;s.vz+=az/dist*delta}else{s.vx=tx;s.vz=tz}if(!moving&&s.grounded){const v=Math.hypot(s.vx,s.vz),q=Math.max(0,v-config.friction*dt);if(v>0){s.vx*=q/v;s.vz*=q/v}}}
s.x+=s.vx*dt;s.z+=s.vz*dt;
if(!s.grounded||s.y>0){s.vy-=config.gravity*dt;s.y+=s.vy*dt;if(s.y<=0){s.y=0;s.vy=0;s.grounded=true}}
const d=Math.hypot(s.x,s.z);if(d>config.radius){s.x*=config.radius/d;s.z*=config.radius/d;const outward=(s.vx*s.x+s.vz*s.z)/config.radius;if(outward>0){s.vx-=outward*s.x/config.radius;s.vz-=outward*s.z/config.radius}}
return s}
return {SETTINGS,createState,step};
});
