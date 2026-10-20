export type Lang = "pt" | "en";
export type Theme = "auto" | "light" | "dark";
export type Status = { up: true; ms: number } | { up: false; invalid?: true };

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

export function badgeText(status: Status, lang: Lang): string {
	if (status.up) return `${LABELS[lang].up} · ${Math.round(status.ms)} ms`;
	return status.invalid ? LABELS[lang].invalid : LABELS[lang].down;
}

export function renderBadge(status: Status, lang: Lang, theme: Theme = "auto"): string {
	const raw = badgeText(status, lang);
	const text = escapeXml(raw);
	// SVG can't measure its own text: fix the width and force glyphs into it with textLength.
	const textLen = [...raw].length * CHAR_WIDTH;
	const width = Math.ceil(TEXT_X + textLen + PAD);
	const cx = PAD + DOT_R;
	const cy = HEIGHT / 2;
	const halo = status.up ? `<circle class="up halo" cx="${cx}" cy="${cy}" r="${DOT_R}"/>` : "";

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" role="img" aria-label="${text}">
<title>${text}</title>
<style>${PALETTE[theme]}${MOTION}</style>
<rect class="bg" width="${width}" height="${HEIGHT}" rx="${HEIGHT / 2}"/>
${halo}<circle class="${status.up ? "up" : "down"}" cx="${cx}" cy="${cy}" r="${DOT_R}"/>
<text class="${status.up ? "fg" : "muted"}" x="${TEXT_X}" y="15" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="${FONT_SIZE}" font-weight="500" textLength="${textLen}" lengthAdjust="spacingAndGlyphs">${text}</text>
</svg>`;
}
