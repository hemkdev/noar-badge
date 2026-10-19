# noar-badge

A Cloudflare Worker that GETs a health endpoint and returns an SVG status badge for a README or site.

- 2xx response: green dot, `no ar · 142 ms` (`online · 142 ms` with `lang=en`).
- Anything else (non-2xx, timeout, network error, blocked URL): grey, `indisponível` / `unavailable`.
  The badge never claims "down", only that it couldn't confirm "up".

## Usage

```md
![status](https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/)
```

```html
<img src="https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/&lang=en" alt="status">
```

Or paste a URL at [status.hemk.dev](https://status.hemk.dev) to get the snippet.

| Param | Values | Default |
|---|---|---|
| `url` | `https` URL of the health endpoint | required |
| `lang` | `en` | Portuguese |
| `theme` | `light`, `dark` | follows `prefers-color-scheme` |

Inside `<img>`, the automatic theme follows the OS, not GitHub's theme. For GitHub, use the fixed
themes with `<picture>` or `#gh-dark-mode-only` / `#gh-light-mode-only`.

## Behavior

- Only `https`; `localhost` and IP literals are rejected. Each redirect hop is checked again.
- 5 s timeout, at most 3 redirects.
- Results are cached for ~60 s per host (path and query ignored), so the Worker can't be used to
  hammer someone else's site.
- Responses are sent with `Cache-Control: no-cache` so GitHub's image proxy doesn't freeze the badge.

## Development

```sh
npm ci
npm run dev      # http://localhost:8787
npx vitest run
npm run deploy
```

## AI use

This project was built with Claude (Anthropic): the code was generated with the AI explaining each
part, then reviewed and tested. Commits carry a `Co-Authored-By: Claude` trailer.

## License

[MIT](LICENSE)
