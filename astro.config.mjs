// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import { stepsPlugin } from './src/plugins/steps.mjs';

// Served from the Patchkite VM behind Cloudflare Tunnel at https://docs.patchkite.com.
export default defineConfig({
	site: 'https://docs.patchkite.com',
	markdown: { processor: satteri({ hastPlugins: [stepsPlugin] }) },
	integrations: [
		starlight({
			title: 'Patchkite',
			description: 'Self-hosted over-the-air updates for React Native and Flutter.',
			logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg', replacesTitle: true },
			favicon: '/favicon.svg',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/patchkite' }],
			editLink: { baseUrl: 'https://github.com/patchkite/docs/edit/main/' },
			lastUpdated: true,
			customCss: [
				'@fontsource-variable/archivo/wdth.css',
				'@fontsource-variable/plus-jakarta-sans',
				'@fontsource-variable/jetbrains-mono',
				'./src/styles/theme.css',
			],
			components: {
				Hero: './src/components/Hero.astro',
				SocialIcons: './src/components/SocialIcons.astro',
			},
			expressiveCode: {
				themes: ['github-dark-default', 'github-light-default'],
				styleOverrides: {
					borderRadius: '12px',
					borderColor: 'var(--sl-color-hairline-light)',
					codeBackground: ({ theme }) => (theme.type === 'dark' ? '#070d29' : '#f2f5fe'),
					codeFontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
					codeFontSize: '0.86rem',
					codeLineHeight: '1.7',
					uiFontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif",
					frames: {
						shadowColor: 'transparent',
						editorTabBarBackground: ({ theme }) => (theme.type === 'dark' ? '#0b1437' : '#eaf0ff'),
						editorActiveTabBackground: ({ theme }) => (theme.type === 'dark' ? '#070d29' : '#f2f5fe'),
						terminalTitlebarBackground: ({ theme }) => (theme.type === 'dark' ? '#0b1437' : '#eaf0ff'),
						terminalBackground: ({ theme }) => (theme.type === 'dark' ? '#070d29' : '#f2f5fe'),
						terminalTitlebarBorderBottomColor: 'var(--sl-color-hairline)',
						editorTabBarBorderBottomColor: 'var(--sl-color-hairline)',
					},
				},
			},
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Self-hosting', items: [{ autogenerate: { directory: 'self-hosting' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});
