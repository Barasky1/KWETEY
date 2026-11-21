type PagesFunction<E> = (context: { request: Request }) => Promise<Response>;

const xmlText = (value: string) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .trim();

export const onRequestGet: PagesFunction<unknown> = async () => {
  try {
    const response = await fetch('https://trends.google.com/trending/rss?geo=GH', {
      headers: { 'user-agent': 'AI-Video-Studio/1.0', accept: 'application/rss+xml, application/xml, text/xml' },
      cf: { cacheTtl: 900, cacheEverything: true }
    });
    if (!response.ok) throw new Error('Google Trends returned HTTP ' + response.status);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 15).map((match, index) => {
      const block = match[1];
      const get = (tag: string) => {
        const found = block.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
        return found ? xmlText(found[1]) : '';
      };
      return { id: index + 1, title: get('title'), traffic: get('ht:approx_traffic'), published: get('pubDate'), link: get('link') };
    }).filter(item => item.title);
    if (!items.length) throw new Error('The trends feed returned no topics. Please try again later.');
    return Response.json({ region: 'Ghana', source: 'Google Trends', updatedAt: new Date().toISOString(), topics: items });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Could not load trending topics.' }, { status: 502 });
  }
};
