type PagesFunction<E> = (context: { request: Request; env: E }) => Promise<Response>;
interface Env { IMAGE_ENGINE?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> } }
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
export const onRequestPost:PagesFunction<Env>=async({request,env})=>{
 let body:{prompt?:string};
 try{body=await request.json() as typeof body}catch{return json({error:"Send a valid JSON request."},400)}
 const prompt=String(body.prompt||"").trim().slice(0,900);
 if(prompt.length<8)return json({error:"Add more detail to the scene prompt."},400);
 if(!env.IMAGE_ENGINE)return json({error:"The image-generation service is not connected yet.",code:"IMAGE_ENGINE_MISSING"},503);
 try{
  const response=await env.IMAGE_ENGINE.fetch("https://image-engine/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({prompt})});
  const data=await response.json().catch(()=>({error:"Invalid response from image service."}));
  return json(data,response.status);
 }catch(e){return json({error:e instanceof Error?e.message:"Image generation failed."},502)}
};
