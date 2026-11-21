type PagesFunction<E> = (context: { request: Request; env: E }) => Promise<Response>;
interface Env { IMAGE_ENGINE?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> } }
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
export const onRequestPost:PagesFunction<Env>=async({request,env})=>{
 let body:{text?:string;speaker?:string};
 try{body=await request.json() as typeof body}catch{return json({error:"Send a valid JSON request."},400)}
 const text=String(body.text||"").trim().slice(0,5000),speaker=String(body.speaker||"asteria");
 if(text.length<2)return json({error:"Narration text is required."},400);
 if(!env.IMAGE_ENGINE)return json({error:"The AI voice service is not connected.",code:"IMAGE_ENGINE_MISSING"},503);
 try{return await env.IMAGE_ENGINE.fetch("https://image-engine/tts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,speaker})})}
 catch(e){return json({error:e instanceof Error?e.message:"Voice generation failed."},502)}
};
