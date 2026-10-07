// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Served from GitHub Pages at https://patchkite.github.io/docs until a custom domain exists.
export default defineConfig({
	site: 'https://patchkite.github.io',
	base: '/docs',
	integrations: [
		starlight({
			title: 'Patchkite',
			description: 'Self-hosted over-the-air updates for React Native and Flutter.',
			logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg', replacesTitle: true },
			favicon: '/favicon.svg',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/patchkite' }],
			editLink: { baseUrl: 'https://github.com/patchkite/docs/edit/main/' },
			lastUpdated: true,
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Self-hosting', items: [{ autogenerate: { directory: 'self-hosting' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});
