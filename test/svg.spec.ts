import { describe, it, expect } from "vitest";
import { CHAR_WIDTH, TEXT_X, badgeText, escapeXml, renderBadge } from "../src/svg";

describe("badgeText", () => {
	it("shows label and rounded latency when up", () => {
		expect(badgeText({ up: true, ms: 141.6 }, "pt")).toBe("no ar · 142 ms");
		expect(badgeText({ up: true, ms: 142 }, "en")).toBe("online · 142 ms");
	});

	it("shows unavailable when down", () => {
		expect(badgeText({ up: false }, "pt")).toBe("indisponível");
		expect(badgeText({ up: false }, "en")).toBe("unavailable");
	});
});

describe("escapeXml", () => {
	it("escapes markup characters", () => {
		expect(escapeXml(`<a href="x">&'`)).toBe("&#60;a href=&#34;x&#34;&#62;&#38;&#39;");
	});
});

describe("renderBadge", () => {
	it("uses green dot and halo only when up", () => {
		const up = renderBadge({ up: true, ms: 10 }, "en");
		const down = renderBadge({ up: false }, "en");
		expect(up).toContain('class="up"');
		expect(up).toContain("halo");
		expect(down).toContain('class="down"');
		expect(down).not.toContain('class="up');
	});

	it("sizes text by character count, not bytes", () => {
		// "indisponível" has 12 characters but 13 UTF-8 bytes
		const svg = renderBadge({ up: false }, "pt");
		expect(svg).toContain(`textLength="${12 * CHAR_WIDTH}"`);
		const width = Number(svg.match(/width="(\d+)"/)![1]);
		expect(width).toBe(Math.ceil(TEXT_X + 12 * CHAR_WIDTH + 10));
	});

	it("applies the requested theme", () => {
		const up = { up: true, ms: 1 } as const;
		const auto = renderBadge(up, "en");
		const light = renderBadge(up, "en", "light");
		const dark = renderBadge(up, "en", "dark");
		expect(auto).toContain("prefers-color-scheme:dark");
		expect(auto).toContain("#34c759");
		expect(auto).toContain("#30d158");
		expect(light).toContain("#34c759");
		expect(light).not.toContain("#30d158");
		expect(dark).toContain("#30d158");
		expect(dark).not.toContain("#34c759");
		expect(dark).not.toContain("prefers-color-scheme");
	});
});
