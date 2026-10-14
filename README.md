# Patchkite documentation

Source of [docs.patchkite.com](https://docs.patchkite.com/), built with [Astro Starlight](https://starlight.astro.build).

```bash
npm install
npm run dev       # http://localhost:4321/docs/
npm run build     # output in dist/
```

Pages live in `src/content/docs/`, one Markdown file per page; the sidebar is generated from the folders. Every page has an "Edit page" link, so small fixes can be made straight from GitHub.

To show a sequence as numbered steps, start each `##` heading with its number (`## 1. Start a server`); `src/plugins/steps.mjs` turns those sections into the kite-and-string steps. The look follows patchkite.com: colours and type live in `src/styles/theme.css`, and the home page hero is `src/components/Hero.astro`.

When documenting CLI options or SDK APIs, check them against the current [CLI](https://github.com/patchkite/cli) help output and SDK sources.

## License

[MIT](LICENSE)
