export type CourseState={startedAt:number|null;elapsed:number;checkpoint:number;finished:boolean;best:number|null};
export const createCourse=():CourseState=>({startedAt:null,elapsed:0,checkpoint:0,finished:false,best:null});
export function courseEnter(s:CourseState,now:number){if(s.startedAt===null&&!s.finished)s.startedAt=now;return s}
export function checkpoint(s:CourseState,index:number){if(!s.finished&&index===s.checkpoint+1)s.checkpoint=index;return s}
export function finish(s:CourseState,now:number){if(s.startedAt!==null&&s.checkpoint>=2&&!s.finished){s.elapsed=now-s.startedAt;s.finished=true;s.best=s.best===null? s.elapsed:Math.min(s.best,s.elapsed)}return s}
export function restart(s:CourseState){return {...s,startedAt:null,elapsed:0,checkpoint:0,finished:false}}
