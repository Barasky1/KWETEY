type PagesFunction<E> = (context: { request: Request; env: E }) => Promise<Response>;
interface Env { IMAGE_ENGINE: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> } }
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Send a valid JSON request." }, 400); }
  try {
    const upstream = await env.IMAGE_ENGINE.fetch("https://image-engine/script", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
    });
    const payload = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.includes("application/json") || payload.trimStart().startsWith("<!DOCTYPE html") || payload.trimStart().startsWith("<html")) {
      const preview = payload.replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ").trim().slice(0, 180);
      return json({ error: "The AI Worker did not return JSON. Upstream HTTP " + upstream.status + "; content type: " + (contentType || "missing") + "; response: " + (preview || "empty response"), upstreamStatus: upstream.status, upstreamContentType: contentType || "missing" }, 502);
    }
    return new Response(payload, { status: upstream.status, headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }});
  } catch {
    return json({ error: "The AI script service is unavailable. Please try again shortly." }, 502);
  }
};
