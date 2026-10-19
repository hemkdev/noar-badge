import { describe, it, expect } from "vitest";
import { guard } from "../src/guard";

describe("guard", () => {
	it("accepts a public https url", () => {
		expect(guard("https://racha.hemk.dev/health/")?.hostname).toBe("racha.hemk.dev");
	});

	it.each([
		["garbage", "not a url"],
		["http", "http://racha.hemk.dev/health/"],
		["other scheme", "ftp://racha.hemk.dev/"],
		["localhost", "https://localhost/"],
		["localhost with port", "https://localhost:8787/"],
		["localhost trailing dot", "https://localhost./"],
		["localhost subdomain", "https://api.localhost/"],
		["uppercase localhost", "https://LOCALHOST/"],
		["ipv4", "https://127.0.0.1/"],
		["ipv4 public", "https://1.1.1.1/"],
		["ipv4 shorthand", "https://127.1/"],
		["ipv4 integer", "https://2130706433/"],
		["ipv4 hex", "https://0x7f000001/"],
		["ipv6", "https://[::1]/"],
		["ipv6 mapped", "https://[::ffff:127.0.0.1]/"],
	])("blocks %s", (_, url) => {
		expect(guard(url)).toBeNull();
	});
});
