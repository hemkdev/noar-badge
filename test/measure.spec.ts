import { afterEach, describe, it, expect, vi } from "vitest";
import { MAX_HOPS, measure } from "../src/measure";

const url = new URL("https://racha.hemk.dev/health/");

function mockFetch(...responses: (Response | Error)[]) {
	const spy = vi.spyOn(globalThis, "fetch");
	for (const r of responses) {
		if (r instanceof Error) spy.mockRejectedValueOnce(r);
		else spy.mockResolvedValueOnce(r);
	}
	return spy;
}

const redirect = (to: string) => new Response(null, { status: 302, headers: { location: to } });

afterEach(() => vi.restoreAllMocks());

describe("measure", () => {
	it("is up on 2xx", async () => {
		mockFetch(new Response("ok"));
		const status = await measure(url);
		expect(status.up).toBe(true);
	});

	it.each([404, 500, 503])("is down on %i", async (code) => {
		mockFetch(new Response(null, { status: code }));
		expect(await measure(url)).toEqual({ up: false });
	});

	it("is down on network error or timeout", async () => {
		mockFetch(new DOMException("timed out", "TimeoutError"));
		expect(await measure(url)).toEqual({ up: false });
	});

	it("follows a relative redirect", async () => {
		const spy = mockFetch(redirect("/health"), new Response("ok"));
		expect((await measure(url)).up).toBe(true);
		expect(String(spy.mock.calls[1][0])).toBe("https://racha.hemk.dev/health");
	});

	it("stops after the hop limit", async () => {
		const spy = mockFetch(...Array.from({ length: MAX_HOPS + 2 }, () => redirect("/again")));
		expect(await measure(url)).toEqual({ up: false });
		expect(spy).toHaveBeenCalledTimes(MAX_HOPS + 1);
	});

	it.each(["http://racha.hemk.dev/", "https://localhost/", "https://10.0.0.1/"])(
		"refuses a redirect to %s",
		async (to) => {
			const spy = mockFetch(redirect(to), new Response("ok"));
			expect(await measure(url)).toEqual({ up: false });
			expect(spy).toHaveBeenCalledTimes(1);
		},
	);

	it("is down on a redirect without location", async () => {
		mockFetch(new Response(null, { status: 302 }));
		expect(await measure(url)).toEqual({ up: false });
	});
});
