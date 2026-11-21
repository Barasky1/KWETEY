type PagesFunction<E> = (context: { request: Request; env: E }) => Promise<Response>;
interface Env { IMAGE_ENGINE?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> } }
export const onRequestGet:PagesFunction<Env>=async({request,env})=>{
 const key=new URL(request.url).searchParams.get("key")||"";
 if(!/^images\/[a-f0-9-]{36}\.png$/.test(key))return new Response("Invalid media key.",{status:400});
 if(!env.IMAGE_ENGINE)return new Response("Media service unavailable.",{status:503});
 try{return await env.IMAGE_ENGINE.fetch("https://image-engine/media?key="+encodeURIComponent(key),{method:"GET"});}
 catch{return new Response("Could not retrieve saved media.",{status:502})}
};
