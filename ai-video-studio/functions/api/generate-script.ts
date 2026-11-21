interface Env {
  AI?: { run(model: string, input: Record<string, unknown>): Promise<unknown> };
}
interface ScriptRequest {
  topic?: string;
  duration?: number;
  format?: string;
  tone?: string;
}
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: ScriptRequest;
  try { body = await request.json() as ScriptRequest; } catch { return json({ error: "Send a valid JSON request." }, 400); }
  const topic = String(body.topic || "").trim().slice(0, 240);
  const duration = Math.min(90, Math.max(15, Number(body.duration) || 30));
  const format = ["9:16", "16:9", "1:1"].includes(String(body.format)) ? String(body.format) : "9:16";
  const tone = String(body.tone || "engaging").slice(0, 40);
  if (topic.length < 4) return json({ error: "Enter a topic with at least 4 characters." }, 400);

  if (env.AI) {
    try {
      const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { role: "system", content: "You are a professional short-form video scriptwriter. Return ONLY valid JSON with keys title, hook, narration, scenes. scenes must be an array of objects with seconds, visual, voiceover, on_screen_text. Keep the narration suitable for the requested duration, factual, engaging, and avoid unsupported claims." },
          { role: "user", content: `Create a ${duration}-second ${format} video script about: ${topic}. Tone: ${tone}. Use 4 to 8 scenes. Include concise visual prompts suitable for AI image generation. Return JSON only.` }
        ],
        max_tokens: 1400,
        temperature: 0.7
      });
      const raw = (result as { response?: string })?.response || "";
      const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));
      return json({ ...parsed, topic, duration, format, generatedBy: "Workers AI" });
    } catch {
      // A template fallback keeps the workflow usable if the model is temporarily unavailable.
    }
  }

  const count = Math.max(3, Math.min(8, Math.round(duration / 6)));
  const beats = [
    { label: "The hook", visual: `A striking cinematic opening image that immediately represents ${topic}`, overlay: "You need to know this" },
    { label: "The setup", visual: `A clear, visually interesting introduction to ${topic}, documentary style`, overlay: `Let's explore ${topic}` },
    { label: "The key idea", visual: `A detailed illustrative scene showing the most important aspect of ${topic}`, overlay: "Here's the key idea" },
    { label: "The payoff", visual: `A memorable, uplifting visual that illustrates why ${topic} matters`, overlay: "Why it matters" },
    { label: "The close", visual: `A polished final hero shot connected to ${topic}, space for a call to action`, overlay: "Follow for more" },
    { label: "One more insight", visual: `An additional compelling visual detail about ${topic}`, overlay: "One more thing" },
    { label: "The takeaway", visual: `A clean visual summary of ${topic}`, overlay: "Remember this" },
    { label: "Call to action", visual: `A beautiful end card background inspired by ${topic}`, overlay: "Like • Share • Follow" }
  ].slice(0, count);
  const perScene = Math.round(duration / count);
  const scenes = beats.map((b, i) => ({
    seconds: i === count - 1 ? duration - perScene * (count - 1) : perScene,
    label: b.label,
    visual: b.visual,
    voiceover: i === 0 ? `Have you ever wondered about ${topic}? Stay with me.` :
      i === count - 1 ? `That's the story of ${topic}. Follow for more.` :
      `Let's look closer at ${topic}. This is an important part of the story, and it helps explain the bigger picture.`,
    on_screen_text: b.overlay
  }));
  return json({
    title: `A quick guide to ${topic}`,
    hook: `What should everyone know about ${topic}?`,
    narration: scenes.map(s => s.voiceover).join(" "),
    scenes, topic, duration, format, tone, generatedBy: "Studio script template",
    notice: "Template draft: connect Workers AI to generate original AI-written scripts."
  });
};
