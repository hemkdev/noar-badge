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

	it("shows invalid url when nothing was measured", () => {
		expect(badgeText({ up: false, invalid: true }, "pt")).toBe("url inválida");
		expect(badgeText({ up: false, invalid: true }, "en")).toBe("invalid url");
	});
});

describe("badgeText look", () => {
	it("prefixes a label, cut at MAX_LABEL characters", () => {
		expect(badgeText({ up: false }, "en", { label: "racha" })).toBe("racha · unavailable");
		expect(badgeText({ up: false }, "en", { label: "x".repeat(30) })).toBe(`${"x".repeat(24)} · unavailable`);
	});

	it("drops control characters and blank labels", () => {
		expect(badgeText({ up: false }, "en", { label: "a\u0001b" })).toBe("ab · unavailable");
		expect(badgeText({ up: false }, "en", { label: "   " })).toBe("unavailable");
	});

	it("hides latency when ms is off", () => {
		expect(badgeText({ up: true, ms: 120 }, "pt", { ms: false })).toBe("no ar");
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

	it("escapes the label", () => {
		const svg = renderBadge({ up: false }, "en", "auto", { label: `<script>&"` });
		expect(svg).not.toContain("<script>");
		expect(svg).toContain("&#60;script&#62;&#38;&#34;");
	});

	it("scales size through viewBox and squares corners for flat", () => {
		const lg = renderBadge({ up: false }, "en", "auto", { size: "lg", style: "flat" });
		expect(lg).toContain('height="31"');
		expect(lg).toContain('viewBox="0 0 ');
		expect(lg).toContain('rx="3"');
	});

	it("recolors only the up dot, and only with a valid hex", () => {
		expect(renderBadge({ up: true, ms: 1 }, "en", "auto", { color: "0a84ff" })).toContain(".up{fill:#0a84ff}");
		expect(renderBadge({ up: true, ms: 1 }, "en", "auto", { color: "red;}" })).not.toContain(".up{fill:#red");
	});

	it("switches to the sans stack", () => {
		expect(renderBadge({ up: false }, "en", "auto", { font: "sans" })).toContain('font-family="system-ui');
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
