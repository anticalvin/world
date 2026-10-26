export const TICK=1/60;
export type Input={forward:number;right:number;yaw:number;sprint?:boolean;jump?:boolean;slide?:boolean}; export type MotorState={position:{x:number;y:number;z:number};velocity:{x:number;y:number;z:number};grounded:boolean;coyote:number;buffer:number;slide:number;slideDirection:{x:number;z:number}};
export const tuning={walk:4.5,sprint:7.7,accel:29,brake:24,airAccel:8,gravity:21,jump:7.8,coyote:.12,buffer:.14,slideSpeed:10.2,slideDuration:.72};
export const createMotor=(p={x:0,y:1,z:9}):MotorState=>({position:{...p},velocity:{x:0,y:0,z:0},grounded:false,coyote:0,buffer:0,slide:0,slideDirection:{x:0,z:-1}}); const approach=(v:number,target:number,delta:number)=>v+Math.max(-delta,Math.min(delta,target-v));
export function simulate(s:MotorState,i:Input,dt:number,onGround:boolean){const t=tuning;s.buffer=Math.max(0,s.buffer-dt);if(i.jump)s.buffer=t.buffer;s.coyote=onGround?t.coyote:Math.max(0,s.coyote-dt);s.grounded=onGround;if(s.buffer&&s.coyote){s.velocity.y=t.jump;s.buffer=s.coyote=0;s.grounded=false}const n=Math.max(1,Math.hypot(i.forward,i.right)),dx=(-Math.sin(i.yaw)*i.forward+Math.cos(i.yaw)*i.right)/n,dz=(-Math.cos(i.yaw)*i.forward-Math.sin(i.yaw)*i.right)/n;
if(i.slide&&onGround&&s.slide<=0&&Math.hypot(s.velocity.x,s.velocity.z)>t.walk*.75){
  s.slide=t.slideDuration;
  const magnitude=Math.hypot(s.velocity.x,s.velocity.z);
  s.slideDirection={x:s.velocity.x/magnitude,z:s.velocity.z/magnitude};
}
if(s.slide>0){
  s.slide=Math.max(0,s.slide-dt);
  // Fixed initial burst, smooth deceleration, no steering during the slide.
  const progress=s.slide/t.slideDuration;
  const speed=t.slideSpeed*(0.25+0.75*progress);
  s.velocity.x=s.slideDirection.x*speed;
  s.velocity.z=s.slideDirection.z*speed;
}else{
  const speed=i.sprint?t.sprint:t.walk,a=onGround?t.accel:t.airAccel;
  s.velocity.x=approach(s.velocity.x,dx*speed,a*dt);
  s.velocity.z=approach(s.velocity.z,dz*speed,a*dt);
  if(!i.forward&&!i.right&&onGround){
    s.velocity.x=approach(s.velocity.x,0,t.brake*dt);
    s.velocity.z=approach(s.velocity.z,0,t.brake*dt);
  }
}
if(!onGround)s.velocity.y-=t.gravity*dt;}
