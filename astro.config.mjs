// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';
import remarkWikiLinks from './src/lib/wikilinks.ts';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Prose.astro styles `.table-wrap` with overflow-x: auto so wide tables
// scroll inside themselves instead of the page. Wrap every rendered <table>
// in that div so the CSS has something to attach to.
function rehypeWrapTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table' && parent && index !== null) {
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [node],
        };
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://sathvik21s21rao.github.io',
  integrations: [mdx(), sitemap()],
  // ClientRouter turns prefetch on but defaults to 'hover', which spends the
  // hover-intent budget before the request even starts. Four nav destinations
  // and small HTML - just fetch what's on screen.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  markdown: {
    // KaTeX renders at build time, so maths ships as plain HTML - no client
    // JS, nothing to load on a static host. The stylesheet comes in via
    // Prose.astro.
    remarkPlugins: [remarkWikiLinks, remarkMath],
    rehypePlugins: [rehypeWrapTables, rehypeKatex],
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
