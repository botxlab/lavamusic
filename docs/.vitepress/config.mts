import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid({
  base: '/lavamusic/',
  title: "LavaMusic",
  description: "A professional music bot documentation site.",
  themeConfig: {
    logo: '/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/installation' },
      { text: 'Commands', link: '/commands' },
      {
        text: 'v4.7.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/bongodevs/lavamusic/releases' },
          { text: 'Contributing', link: 'https://github.com/bongodevs/lavamusic/blob/main/CONTRIBUTING.md' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/installation' },
          { text: 'Quick Setup', link: '/installation#step-by-step-setup' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Environment Variables', link: '/configuration' },
          { text: 'FAQ', link: '/faq' },
        ]
      },
      {
        text: 'Deployment',
        collapsed: false,
        items: [
          { text: 'Standard Setup', link: '/installation' },
          { text: 'Docker Guide', link: '/docker' },
        ]
      },
      {
        text: 'Usage & Commands',
        collapsed: false,
        items: [
          { text: 'Full Commands List', link: '/commands' },
          { text: 'Filters & Effects', link: '/commands#filters' },
        ]
      },
      {
        text: 'Internationalization',
        collapsed: true,
        items: [
          { text: 'Translation Guide', link: '/translation' },
          { text: 'Available Languages', link: '/translation#available-translations' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bongodevs/lavamusic' },
      { icon: 'discord', link: 'https://discord.gg/jgGEbxFbyM' }
    ],

    footer: {
      message: 'Released under the <b>GPL-3.0 License</b>.',
      copyright: 'Copyright © 2024-present <a href="https://github.com/appujet">appujet</a>'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: 'On this page'
    },

    editLink: {
      pattern: 'https://github.com/bongodevs/lavamusic/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },
  // Mermaid configuration
  mermaid: {
    // theme: 'dark', // or 'default'
  }
})
