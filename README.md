# Patchkite documentation

Source of [docs.patchkite.com](https://docs.patchkite.com/), built with [Astro Starlight](https://starlight.astro.build).

```bash
npm install
npm run dev       # http://localhost:4321/docs/
npm run build     # output in dist/
```

Pages live in `src/content/docs/`, one Markdown file per page; the sidebar is generated from the folders. Every page has an "Edit page" link, so small fixes can be made straight from GitHub.

When documenting CLI options or SDK APIs, check them against the current [CLI](https://github.com/patchkite/cli) help output and SDK sources.

## License

[MIT](LICENSE)
