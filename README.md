<img src="public/favicon.svg" alt="noar" width="56">

# noar-badge

A live status badge for your README or website. It sends a `GET` to your health endpoint and shows whether the app is on air and how fast it answered.

[![status](https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/)](https://racha.hemk.dev)
[![status](https://status.hemk.dev/badge?url=https://hemk.dev/&lang=en&theme=dark)](https://hemk.dev)

_Inspired by [cardzera](https://github.com/matheusaudibert/cardzera) by [@matheusaudibert](https://github.com/matheusaudibert). Thx!_

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

A 2xx response shows green with the latency. Anything else shows grey `indisponível` / `unavailable`. A missing, non-https, localhost or IP target shows grey `url inválida` / `invalid url` without being measured.

### Example with all parameters:

```markdown
[![status](https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/&lang=en&theme=dark)](https://racha.hemk.dev)
```

### Output:

[![status](https://status.hemk.dev/badge?url=https://racha.hemk.dev/health/&lang=en&theme=dark)](https://racha.hemk.dev)

> **Note:** results are cached for ~60 s per URL, with at most 10 measurements per minute per host. `localhost` and IP addresses are rejected. Inside an image, `auto` follows the visitor's OS, not GitHub's theme.

## Running locally

```sh
npm ci && npm run dev
```

## Contribution

Contributions are welcome! Feel free to open an issue or submit a pull request if you have a way to improve this project.

## Support

_If you're using this repo, feel free to show support and give it a ⭐ star! It means a lot, thank you :)_

## License

[MIT](LICENSE)
