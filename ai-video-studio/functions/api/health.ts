type PagesFunction<E> = (context: { request: Request; env: E }) => Promise<Response>;
interface Env { IMAGE_ENGINE?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> } }
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const base = { route: "pages-function", imageEngineBinding: Boolean(env.IMAGE_ENGINE), checkedAt: new Date().toISOString() };
  if (!env.IMAGE_ENGINE) return reply({ ok: false, ...base, workerReachable: false, error: "IMAGE_ENGINE service binding is missing." }, 503);
  try {
    const upstream = await env.IMAGE_ENGINE.fetch("https://image-engine/health");
    const worker = await upstream.json().catch(() => null);
    if (!upstream.ok) return reply({ ok: false, ...base, workerReachable: false, worker, upstreamStatus: upstream.status }, 502);
    const url = new URL(request.url);
    if (url.searchParams.get("probe") !== "script") return reply({ ok: Boolean(worker?.ok), ...base, workerReachable: true, worker, upstreamStatus: upstream.status });
    const probe = await env.IMAGE_ENGINE.fetch("https://image-engine/script", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic: "A simple test of how rainbows form", duration: 30, format: "9:16", tone: "educational" }) });
    const raw = await probe.text();
    const contentType = probe.headers.get("content-type") || "missing";
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch {}
    return reply({ ok: probe.ok && Boolean(parsed?.scenes?.length), ...base, workerReachable: true, worker, scriptProbe: { httpStatus: probe.status, contentType, isJson: parsed !== null, hasScenes: Boolean(parsed?.scenes?.length), sceneCount: Array.isArray(parsed?.scenes) ? parsed.scenes.length : 0, error: parsed?.error || null, responsePreview: raw.slice(0, 500) } }, probe.ok && parsed?.scenes?.length ? 200 : 502);
  } catch (error) {
    return reply({ ok: false, ...base, workerReachable: false, error: error instanceof Error ? error.message : "Worker connection failed." }, 502);
  }
};
