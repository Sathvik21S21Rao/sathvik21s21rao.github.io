import type { CollectionEntry } from 'astro:content';
import type { Backlink } from './wikilinks';

export type Post = CollectionEntry<'blog'>;

/**
 * Score candidates by shared tags, weighting rarer tags (across the corpus)
 * higher than common ones — a simple IDF. Ties broken by recency.
 *
 * Side tracks are excluded from the candidate pool: they're tangents off
 * another post, not peers a reader should be routed to as "related". (The
 * current post itself may still be a side track — that's fine, it just
 * won't recommend other side tracks.)
 *
 * If the current post is itself a side track, its own parent is also
 * excluded: the rail's "Side track of" block already links there, and a
 * parent/child pair almost always share tags, so without this the parent
 * would win a "related" slot too and the reader would see the same link
 * twice on one page.
 */
export function getRelatedPosts(current: Post, all: Post[], limit = 3): Post[] {
  const corpus = all.filter((p) => !p.data.draft && !p.data.parent);
  const currentTags = new Set(current.data.tags ?? []);
  if (currentTags.size === 0) return [];

  const tagDocFreq = new Map<string, number>();
  for (const post of corpus) {
    for (const tag of new Set(post.data.tags ?? [])) {
      tagDocFreq.set(tag, (tagDocFreq.get(tag) ?? 0) + 1);
    }
  }

  const scored = corpus
    .filter((post) => post.id !== current.id && post.id !== current.data.parent)
    .map((post) => {
      const score = (post.data.tags ?? [])
        .filter((tag) => currentTags.has(tag))
        .reduce((sum, tag) => sum + Math.log(corpus.length / (tagDocFreq.get(tag) ?? 1) + 1), 0);
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.date.getTime() - a.post.data.date.getTime());

  return scored.slice(0, limit).map((entry) => entry.post);
}

/**
 * Children of `slug`: side tracks whose `parent` frontmatter points here.
 * Drafts excluded, sorted oldest first so they read in the order they were
 * written. Same shape as Backlink so it drops straight into the rail markup
 * Backlinks.astro already renders.
 */
export function getSideTracks(slug: string, all: Post[]): Backlink[] {
  return all
    .filter((post) => !post.data.draft && post.data.parent === slug)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime())
    .map((post) => ({ slug: post.id, title: post.data.title }));
}
