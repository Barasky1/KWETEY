type PagesFunction<E> = (context: { request: Request; env: E }) => Promise<Response>;
interface Env { AI?: { run(model: string, input: Record<string, unknown>): Promise<unknown> }; }
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
export const onRequestPost:PagesFunction<Env>=async({request,env})=>{
 let body:{prompt?:string;format?:string};
 try{body=await request.json() as typeof body;}catch{return json({error:"Send a valid JSON request."},400);}
 const prompt=String(body.prompt||"").trim().slice(0,900);
 if(prompt.length<8)return json({error:"Add more detail to the scene prompt."},400);
 if(!env.AI)return json({error:"Cloudflare AI binding is not configured for this Pages project yet.",code:"AI_BINDING_MISSING"},503);
 try{
  const result=await env.AI.run("@cf/black-forest-labs/flux-1-schnell",{prompt});
  const image=(result as {image?:unknown})?.image ?? result;
  if(image instanceof ArrayBuffer)return new Response(image,{headers:{"content-type":"image/jpeg","cache-control":"no-store"}});
  if(image instanceof Uint8Array)return new Response(image as unknown as BodyInit,{headers:{"content-type":"image/jpeg","cache-control":"no-store"}});
  if(typeof image==="string"){
   const bytes=Uint8Array.from(atob(image),c=>c.charCodeAt(0));
   return new Response(bytes,{headers:{"content-type":"image/jpeg","cache-control":"no-store"}});
  }
  return json({error:"The image model returned an unsupported response format."},502);
 }catch(e){return json({error:e instanceof Error?e.message:"Image generation failed."},502);}
};
