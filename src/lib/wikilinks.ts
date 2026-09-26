import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text, Link, Parent } from 'mdast';

// ponytail: single process-lifetime cache built from disk on first use, no
// invalidation. Fine for a build-time remark plugin (one process per build);
// revisit with an fs.watch invalidation if this ever runs in a long-lived dev server.
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

interface SlugMeta {
  title: string;
  parent?: string;
}

function buildSlugMetaMap(): Map<string, SlugMeta> {
  const map = new Map<string, SlugMeta>();
  const fileForSlug = new Map<string, string>();
  let files: string[] = [];
  try {
    files = fs.readdirSync(BLOG_DIR).filter((f) => /\.(md|mdx)$/.test(f));
  } catch {
    return map; // blog dir doesn't exist yet (e.g. other agents haven't added content)
  }
  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    let title = slug;
    let parent: string | undefined;
    try {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const titleMatch = fm?.[1].match(/^title:\s*(.+)\s*$/m);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      }
      const parentMatch = fm?.[1].match(/^parent:\s*(.+)\s*$/m);
      if (parentMatch) {
        parent = parentMatch[1].trim().replace(/^["']|["']$/g, '');
      }
    } catch {
      // unreadable file — fall back to slug as title, no parent
    }
    map.set(slug, { title, parent });
    fileForSlug.set(slug, file);
  }

  // ponytail: one level deep only — a side track can't itself have a parent.
  // This is a cross-entry check the zod schema in content.config.ts can't
  // see, so it's validated here, at build time, the first time the map is
  // built. Throws (not warns) — a broken `parent:` should fail the build.
  for (const [slug, meta] of map) {
    if (!meta.parent) continue;
    const file = fileForSlug.get(slug);
    const target = map.get(meta.parent);
    if (!target) {
      throw new Error(
        `[wikilinks] ${file}: parent "${meta.parent}" does not match any existing post slug.`
      );
    }
    if (target.parent) {
      throw new Error(
        `[wikilinks] ${file}: parent "${meta.parent}" is itself a side track (has its own parent) — nesting is one level deep only.`
      );
    }
  }

  return map;
}

let cachedMap: Map<string, SlugMeta> | null = null;
function getSlugMetaMap(): Map<string, SlugMeta> {
  if (!cachedMap) cachedMap = buildSlugMetaMap();
  return cachedMap;
}

// [[slug]] or [[slug|custom text]]. Captures the raw slug (untrimmed) and
// optional custom text.
const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export default function remarkWikiLinks(): Plugin<[], Root> {
  return (tree, file) => {
    const map = getSlugMetaMap();

    visit(tree, 'text', (node: Text, index, parent: Parent | undefined) => {
      if (index === null || index === undefined || !parent) return;
      if (!node.value.includes('[[')) return;

      const value = node.value;
      const replacement: Array<Text | Link> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      WIKILINK_RE.lastIndex = 0;

      while ((match = WIKILINK_RE.exec(value))) {
        const [full, rawSlug, rawCustomText] = match;
        const slug = rawSlug.trim();

        if (match.index > lastIndex) {
          replacement.push({ type: 'text', value: value.slice(lastIndex, match.index) });
        }

        const meta = map.get(slug);
        if (!meta) {
          console.warn(
            `[wikilinks] ${file.path ?? 'unknown file'}: broken link [[${slug}]] — no matching post slug.`
          );
          replacement.push({ type: 'text', value: full });
        } else {
          const linkText = (rawCustomText ?? meta.title).trim();
          // Side tracks get a distinct marker so a wiki-link reads as "this
          // is a tangent" rather than a normal cross-post reference. The
          // aria-label carries that distinction to screen readers too, since
          // the visual treatment (Backlinks.astro) can't rely on colour alone.
          const isSideTrack = Boolean(meta.parent);
          replacement.push({
            type: 'link',
            url: `/blog/${slug}/`,
            title: null,
            data: {
              hProperties: {
                class: isSideTrack ? 'wikilink wikilink--sidetrack' : 'wikilink',
                ...(isSideTrack ? { 'aria-label': `${linkText} (side track)` } : {}),
              },
            },
            children: [{ type: 'text', value: linkText }],
          });
        }

        lastIndex = match.index + full.length;
      }

      if (replacement.length === 0) return; // no actual matches, leave node alone

      if (lastIndex < value.length) {
        replacement.push({ type: 'text', value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}

export interface Backlink {
  slug: string;
  title: string;
}

/**
 * Scan every post's body for [[slug]] / [[slug|text]] references to
 * `target`. Excludes self-references and drafts. Matches the slug exactly
 * (`[[foo]]` does not match a post named `foo-bar`).
 *
 * Takes the target post itself (not just its slug) so it can exclude
 * `target`'s own parent, if it has one. A side track is always wiki-linked
 * from its parent (that's how a reader gets to it — see CONTENT.md), so the
 * parent would show up in this scan for every side track that will ever
 * exist: a guaranteed, structural duplicate of the "Side track of" block
 * the rail already renders, not an incidental one. Excluding it here (not
 * at each call site) means no future caller can forget and reintroduce it.
 */
export function getBacklinks(
  target: { id: string; data: { parent?: string } },
  all: Array<{ id: string; body?: string; data: { title: string; draft: boolean } }>
): Backlink[] {
  const results: Backlink[] = [];

  for (const post of all) {
    if (post.id === target.id) continue;
    if (target.data.parent && post.id === target.data.parent) continue;
    if (post.data.draft) continue;

    const body = post.body ?? '';
    WIKILINK_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    let references = false;
    while ((match = WIKILINK_RE.exec(body))) {
      if (match[1].trim() === target.id) {
        references = true;
        break;
      }
    }

    if (references) results.push({ slug: post.id, title: post.data.title });
  }

  return results;
}
