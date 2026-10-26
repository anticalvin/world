const ticks = 60 * 60;
const started = performance.now();
let x=0,z=0,vx=0,vz=0;
for(let i=0;i<ticks;i++){vx+=(7.7-vx)*.14;vz+=(-7.7-vz)*.14;x+=vx/60;z+=vz/60}
const ms=performance.now()-started;
console.log(JSON.stringify({workload:'60Hz movement integration / 60 simulated seconds',ticks,elapsedMs:+ms.toFixed(3),finalPosition:[+x.toFixed(2),+z.toFixed(2)]}));
