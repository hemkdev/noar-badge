import { guard } from "./guard";
import { measure } from "./measure";
import { renderBadge, type Lang, type Look, type Status, type Theme } from "./svg";

const FRESH_MS = 60_000;
// Kept past freshness so a host whose measure budget is spent still shows its last real result.
const STALE_TTL = 600;

// The landing page in public/ is served as a static asset before this handler runs.
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { pathname, searchParams } = new URL(request.url);
		if (pathname !== "/badge") return new Response("Not found", { status: 404 });

		const lang: Lang = searchParams.get("lang") === "en" ? "en" : "pt";
		const t = searchParams.get("theme");
		const theme: Theme = t === "light" || t === "dark" ? t : "auto";
		const s = searchParams.get("size");
		const look: Partial<Look> = {
			style: searchParams.get("style") === "flat" ? "flat" : "pill",
			size: s === "sm" || s === "lg" ? s : "md",
			label: searchParams.get("label") ?? "",
			ms: searchParams.get("ms") !== "0",
			color: searchParams.get("color") ?? undefined,
			font: searchParams.get("font") === "sans" ? "sans" : "mono",
		};
		const url = guard(searchParams.get("url") ?? "");
		const status: Status = url ? await cachedMeasure(url, env, ctx) : { up: false, invalid: true };

		return new Response(renderBadge(status, lang, theme, look), {
			headers: {
				"content-type": "image/svg+xml; charset=utf-8",
				// GitHub's camo proxy caches README images; without this the badge freezes.
				"cache-control": "no-cache",
			},
		});
	},
} satisfies ExportedHandler<Env>;

async function cachedMeasure(url: URL, env: Env, ctx: ExecutionContext): Promise<Status> {
	// Keyed by full URL so a 404 path can't overwrite the health check on the same host.
	url.hostname = url.hostname.replace(/\.$/, "");
	const key = `https://noar-badge.internal/${encodeURIComponent(url.href)}`;
	const hit = await caches.default.match(key);
	const cached: { status: Status; at: number } | undefined = hit && (await hit.json());
	if (cached && Date.now() - cached.at < FRESH_MS) return cached.status;
	// Path and query variations must not buy extra hits on someone's site, so the budget is per host.
	const { success } = await env.MEASURES.limit({ key: url.host });
	if (!success) return cached?.status ?? { up: false };
	const status = await measure(url);
	const entry = Response.json({ status, at: Date.now() }, { headers: { "cache-control": `max-age=${STALE_TTL}` } });
	ctx.waitUntil(caches.default.put(key, entry));
	return status;
}
