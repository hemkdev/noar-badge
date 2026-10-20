import { guard } from "./guard";
import type { Status } from "./svg";

const TIMEOUT_MS = 5000;
export const MAX_HOPS = 3;
// WAFs often 403 a Worker subrequest with no User-Agent, which would read as a false "unavailable".
const USER_AGENT = { "user-agent": "noar-badge (+https://status.hemk.dev)" };

// Workers clocks only advance across I/O, which is exactly what is being timed here.
export async function measure(url: URL): Promise<Status> {
	const signal = AbortSignal.timeout(TIMEOUT_MS);
	const start = Date.now();
	let target: URL | null = url;
	try {
		for (let hop = 0; hop <= MAX_HOPS && target; hop++) {
			const res = await fetch(target, { redirect: "manual", cache: "no-store", signal, headers: USER_AGENT });
			await res.body?.cancel();
			if (res.status >= 200 && res.status < 300) return { up: true, ms: Date.now() - start };
			const location = res.headers.get("location");
			if (res.status < 300 || res.status >= 400 || !location) break;
			// Each hop is re-guarded: a redirect must not reach what the original URL couldn't.
			target = guard(new URL(location, target).href);
		}
	} catch {}
	return { up: false };
}
