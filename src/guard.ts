// Cheap checks only: the Worker runs on Cloudflare's edge, so DNS pointing at 10.x isn't ours to stop.
export function guard(raw: string): URL | null {
	const url = URL.parse(raw);
	if (!url || url.protocol !== "https:") return null;
	// WHATWG parsing already normalizes "127.1", "0x7f000001" etc. to dotted IPv4.
	const host = url.hostname.replace(/\.$/, "");
	if (host === "localhost" || host.endsWith(".localhost")) return null;
	if (host.startsWith("[") || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
	return url;
}
