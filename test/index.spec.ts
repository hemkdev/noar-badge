import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, it, expect, vi } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

async function get(path: string) {
	const ctx = createExecutionContext();
	const res = await worker.fetch(new IncomingRequest(`https://status.hemk.dev${path}`), env, ctx);
	await waitOnExecutionContext(ctx);
	return res;
}

const badge = (target: string, extra = "") => `/badge?url=${encodeURIComponent(target)}${extra}`;

afterEach(() => vi.restoreAllMocks());

describe("worker", () => {
	it("404s outside /badge", async () => {
		expect((await get("/nope")).status).toBe(404);
	});

	it("renders an up badge as uncached svg", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("ok"));
		const res = await get(badge("https://up.example/health"));
		expect(res.headers.get("content-type")).toBe("image/svg+xml; charset=utf-8");
		expect(res.headers.get("cache-control")).toBe("no-cache");
		expect(await res.text()).toContain("no ar ·");
	});

	it("honors lang and theme", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("ok"));
		const svg = await (await get(badge("https://lang.example/", "&lang=en&theme=dark"))).text();
		expect(svg).toContain("online ·");
		expect(svg).not.toContain("prefers-color-scheme");
	});

	it.each(["", "?url=http://plain.example/", "?url=https://localhost/"])(
		"shows unavailable without fetching for /badge%s",
		async (query) => {
			const spy = vi.spyOn(globalThis, "fetch");
			expect(await (await get(`/badge${query}`)).text()).toContain("indisponível");
			expect(spy).not.toHaveBeenCalled();
		},
	);

	it("caches by host, ignoring path and query", async () => {
		const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));
		await get(badge("https://cached.example/a?x=1"));
		await get(badge("https://cached.example/b?x=2"));
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
