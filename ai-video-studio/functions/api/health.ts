type PagesFunction<E> = (context: { env: E }) => Promise<Response>;
interface Env { IMAGE_ENGINE?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> } }
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const base = { route: "pages-function", imageEngineBinding: Boolean(env.IMAGE_ENGINE), checkedAt: new Date().toISOString() };
  if (!env.IMAGE_ENGINE) return new Response(JSON.stringify({ ok: false, ...base, workerReachable: false, error: "IMAGE_ENGINE service binding is missing." }), { status: 503, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  try {
    const upstream = await env.IMAGE_ENGINE.fetch("https://image-engine/health");
    const body = await upstream.json().catch(() => null);
    return new Response(JSON.stringify({ ok: upstream.ok && Boolean(body?.ok), ...base, workerReachable: upstream.ok, worker: body, upstreamStatus: upstream.status }), { status: upstream.ok ? 200 : 502, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, ...base, workerReachable: false, error: error instanceof Error ? error.message : "Worker connection failed." }), { status: 502, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  }
};
