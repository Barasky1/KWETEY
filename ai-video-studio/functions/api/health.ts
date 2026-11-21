type PagesFunction<E> = (context: { env: E }) => Response;
interface Env { IMAGE_ENGINE?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> } }
export const onRequestGet: PagesFunction<Env> = ({ env }) => new Response(JSON.stringify({
  ok: true,
  route: "pages-function",
  imageEngineBinding: Boolean(env.IMAGE_ENGINE),
  checkedAt: new Date().toISOString()
}), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
