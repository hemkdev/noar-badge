export type Lang = "pt" | "en";
export type Theme = "auto" | "light" | "dark";
export type Status = { up: true; ms: number } | { up: false; invalid?: true };
export type Look = {
	style: "pill" | "flat";
	size: "sm" | "md" | "lg";
	label: string;
	ms: boolean;
	color?: string;
	font: "mono" | "sans";
};

export const DEFAULT_LOOK: Look = { style: "pill", size: "md", label: "", ms: true, font: "mono" };
export const MAX_LABEL = 24;
// The badge is laid out once at md and scaled through viewBox, so every size keeps its proportions.
const SCALE = { sm: 0.85, md: 1, lg: 1.4 };
const FONTS = {
	mono: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
	sans: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
};

const LABELS = {
	pt: { up: "no ar", down: "indisponível", invalid: "url inválida" },
	en: { up: "online", down: "unavailable", invalid: "invalid url" },
} as const;

const FONT_SIZE = 12;
export const CHAR_WIDTH = FONT_SIZE * 0.6;
const HEIGHT = 22;
const PAD = 10;
const DOT_R = 3.5;
const GAP = 6;
export const TEXT_X = PAD + DOT_R * 2 + GAP;

// Palette mirrors hemk.dev: neutral pill like its buttons, green reserved for the "up" dot.
const LIGHT = ".bg{fill:#e5e5ea}.fg{fill:#111114}.muted{fill:#6e6e73}.up{fill:#34c759}.down{fill:#aeaeb2}";
const DARK = ".bg{fill:#2c2c2e}.fg{fill:#f5f5f7}.muted{fill:#98989d}.up{fill:#30d158}.down{fill:#636366}";
// Inside <img>, prefers-color-scheme follows the OS, not the host page's theme toggle.
const PALETTE: Record<Theme, string> = {
	auto: `${LIGHT}@media (prefers-color-scheme:dark){${DARK}}`,
	light: LIGHT,
	dark: DARK,
};
const MOTION = `
.halo{transform-box:fill-box;transform-origin:center;animation:h 2s ease-out infinite}
@keyframes h{from{transform:scale(1);opacity:.6}to{transform:scale(2.6);opacity:0}}
@media (prefers-reduced-motion:reduce){.halo{animation:none;opacity:0}}`;

export function escapeXml(s: string): string {
	return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function badgeText(status: Status, lang: Lang, look: Partial<Look> = {}): string {
	const { label, ms } = { ...DEFAULT_LOOK, ...look };
	const state = status.up
		? ms
			? `${LABELS[lang].up} · ${Math.round(status.ms)} ms`
			: LABELS[lang].up
		: status.invalid
			? LABELS[lang].invalid
			: LABELS[lang].down;
	// Control characters are invalid in XML and would break the whole SVG.
	const name = [...label.replace(/[\u0000-\u001f\u007f]/g, "").trim()].slice(0, MAX_LABEL).join("");
	return name ? `${name} · ${state}` : state;
}

export function renderBadge(status: Status, lang: Lang, theme: Theme = "auto", look: Partial<Look> = {}): string {
	const { style, size, color, font } = { ...DEFAULT_LOOK, ...look };
	const raw = badgeText(status, lang, look);
	const text = escapeXml(raw);
	// SVG can't measure its own text: fix the width and force glyphs into it with textLength.
	const textLen = [...raw].length * CHAR_WIDTH;
	const width = Math.ceil(TEXT_X + textLen + PAD);
	const cx = PAD + DOT_R;
	const cy = HEIGHT / 2;
	const halo = status.up ? `<circle class="up halo" cx="${cx}" cy="${cy}" r="${DOT_R}"/>` : "";
	const k = SCALE[size];
	// Only the "up" green is recolorable: grey must always mean "not on air".
	const accent = color && /^[0-9a-f]{6}$/i.test(color) ? `.up{fill:#${color}}` : "";

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(width * k)}" height="${Math.ceil(HEIGHT * k)}" viewBox="0 0 ${width} ${HEIGHT}" role="img" aria-label="${text}">
<title>${text}</title>
<style>${PALETTE[theme]}${accent}${MOTION}</style>
<rect class="bg" width="${width}" height="${HEIGHT}" rx="${style === "pill" ? HEIGHT / 2 : 3}"/>
${halo}<circle class="${status.up ? "up" : "down"}" cx="${cx}" cy="${cy}" r="${DOT_R}"/>
<text class="${status.up ? "fg" : "muted"}" x="${TEXT_X}" y="15" font-family="${FONTS[font]}" font-size="${FONT_SIZE}" font-weight="500" textLength="${textLen}" lengthAdjust="spacingAndGlyphs">${text}</text>
</svg>`;
}
