<img src="public/favicon.svg" alt="noar" width="56">

# noar-badge

A live status badge for your README or website. It sends a `GET` to your health endpoint and shows whether the app is on air and how fast it answered.

[![status](https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/)](https://racha.hemk.dev)
[![status](https://status.hemk.dev/badge?url=https://hemk.dev/&lang=en&theme=dark)](https://hemk.dev)

## Usage

```markdown
[![status](https://status.hemk.dev/badge?url=https://your.app/health)](https://your.app)
```

Or paste your endpoint at [status.hemk.dev](https://status.hemk.dev) and copy the ready snippet.

| Parameter | Default | Description |
| --------- | ------- | ----------- |
| `url`     | —       | `https` health endpoint (required) |
| `lang`    | `pt`    | `pt` or `en` |
| `theme`   | `auto`  | `auto`, `light` or `dark` |
| `style`   | `pill`  | `pill` or `flat` (small corners) |
| `size`    | `md`    | `sm`, `md` or `lg` |
| `label`   | —       | text before the status, up to 24 characters: `racha · online · 121 ms` |
| `ms`      | `1`     | `0` hides the latency |
| `color`   | green   | hex without `#` (`0a84ff`) for the "on air" dot. Grey for down never changes |
| `font`    | `mono`  | `mono` or `sans`, both from the visitor's system |

If your endpoint has its own query string, URL-encode it (`?` → `%3F`, `&` → `%26`), or its parameters are read as the badge's. The snippet from [status.hemk.dev](https://status.hemk.dev) is already encoded.

A 2xx response shows green with the latency. Anything else shows grey `indisponível` / `unavailable`. A missing, non-https, localhost or IP target shows grey `url inválida` / `invalid url` without being measured.

### Example with all parameters:

```markdown
[![status](https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/&lang=en&theme=dark)](https://racha.hemk.dev)
```

### Output:

[![status](https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/&lang=en&theme=dark)](https://racha.hemk.dev)

> **Note:** results are cached for ~60 s per URL, with at most 10 measurements per minute per host. `localhost` and IP addresses are rejected. Inside an image, `auto` follows the visitor's OS, not GitHub's theme.

## What it is, and what it isn't

- **Measured on view, from the edge.** Nothing runs in the background: the badge measures when someone loads it, from the Cloudflare location closest to whoever asked. On GitHub that is the `camo` image proxy, so latency there may differ from what a visitor nearby sees.
- **Not a monitor.** No history, uptime % or alerts. For that, use [Upptime](https://github.com/upptime/upptime) or [Uptime Kuma](https://github.com/louislam/uptime-kuma). For a plain up/down badge, shields.io's [website badge](https://shields.io/badges/website) works too.
- **Polite to the target.** At most one `GET` per URL every ~60 s and 10 per minute per host in each Cloudflare location, only while someone is looking, with `User-Agent: noar-badge (+https://status.hemk.dev)`.
- **Free, best effort.** Runs on a free Cloudflare plan with no uptime guarantee. If you need one, fork it and deploy your own Worker.

## Running locally

```sh
npm ci && npm run dev
```

Types for `env` are generated from `wrangler.jsonc` and not committed. Run `npm run cf-typegen` before `npx tsc --noEmit`; `npm run dev` and `npm test` work without it.

## Contribution

Contributions are welcome! Feel free to open an issue or submit a pull request if you have a way to improve this project.

## Support

_If you're using this repo, feel free to show support and give it a ⭐ star! It means a lot, thank you :)_

## Acknowledgements

- [cardzera](https://github.com/matheusaudibert/cardzera) by [@matheusaudibert](https://github.com/matheusaudibert): the idea of a live card for a README. Thx!
- [shields.io](https://github.com/badges/shields): the format, an SVG badge behind a URL.
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats): the shape, a function that turns a query string into an SVG, with caching that keeps GitHub's `camo` in mind.

## License

[MIT](LICENSE)
