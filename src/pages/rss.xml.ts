import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../config';

export async function GET(context: APIContext) {
  // Side tracks don't clutter the feed either — same rule as the index.
  const posts = (await getCollection('blog', ({ data }) => !data.draft && !data.parent)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.blurb,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
