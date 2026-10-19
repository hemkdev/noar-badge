import { guard } from "./guard";
import { measure } from "./measure";
import { renderBadge, type Lang, type Status, type Theme } from "./svg";

export const CACHE_TTL = 60;

// The landing page in public/ is served as a static asset before this handler runs.
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { pathname, searchParams } = new URL(request.url);
		if (pathname !== "/badge") return new Response("Not found", { status: 404 });

		const lang: Lang = searchParams.get("lang") === "en" ? "en" : "pt";
		const t = searchParams.get("theme");
		const theme: Theme = t === "light" || t === "dark" ? t : "auto";
		const url = guard(searchParams.get("url") ?? "");
		const status: Status = url ? await cachedMeasure(url, ctx) : { up: false };

		return new Response(renderBadge(status, lang, theme), {
			headers: {
				"content-type": "image/svg+xml; charset=utf-8",
				// GitHub's camo proxy caches README images; without this the badge freezes.
				"cache-control": "no-cache",
			},
		});
	},
} satisfies ExportedHandler<Env>;

async function cachedMeasure(url: URL, ctx: ExecutionContext): Promise<Status> {
	// Keyed by host, not full URL: varying path or query must not buy extra hits on someone's site.
	const key = `https://noar-badge.internal/${url.host}`;
	const hit = await caches.default.match(key);
	if (hit) return hit.json();
	const status = await measure(url);
	const entry = Response.json(status, { headers: { "cache-control": `max-age=${CACHE_TTL}` } });
	ctx.waitUntil(caches.default.put(key, entry));
	return status;
}
