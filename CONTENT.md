# Adding a post

Drop a file in `src/content/blog/`. The filename (minus extension) becomes
the slug and URL: `my-post.md` → `/blog/my-post/`. Don't rename it later.

## Frontmatter

Paste this at the top and fill it in:

```yaml
---
title: "A real title, not a placeholder"
date: 2026-08-19
blurb: "One sentence — what's this post actually about?"
tags: ["debugging", "mental-models"]
draft: false
---
```

- `title`, `date`, `blurb`, `tags` are required; `draft` defaults to `false`.
- `updated` is optional — add a date if you substantially revise a post later.
- `tags` create their own pages automatically at `/tags/<tag>/` — just use one.
- `cover` is optional: `{ src: string, alt: string }`. Real photo, real alt
  text once you have one. Until then, seed a placeholder and be honest about
  it in the alt text:

  ```yaml
  # TODO(sathvik): replace with a real image and write real alt text
  cover: { src: "https://picsum.photos/seed/my-post/1600/900", alt: "Placeholder image" }
  ```

  Use the post's own slug as the picsum seed, at 1600x900. Never write alt
  text that describes content the placeholder doesn't actually have.

## Projects

`src/content/projects/*.md` works the same way, with `name`, `blurb`,
`order` (for sort position), and optional `url`, `repo`, `tags`, `year`, and
`image`. `image` has the same `{ src, alt }` shape as a post's `cover`,
seeded at 1200x800, same placeholder discipline.

## `.md` vs `.mdx`

Use plain `.md` by default. Switch to `.mdx` only if you need `<Term>` or a
component in the post — then import it right after the frontmatter:

```mdx
import Term from '../../components/Term.astro';
```

Use it inline for jargon: `<Term def="plain-English explanation">jargon</Term>`.

## Wiki-links

Link to another post by its slug, anywhere in the body:

```
See [[the-three-day-bug]] for the debugging version of this problem.
[[why-estimates-lie|estimates are wrong for the same reason]]
```

The plain form links using the post's title as the link text; the piped
form (`[[slug|text]]`) lets you write your own. Get the slug exactly right —
it's the filename, not the title. Linked posts get a backlink automatically.

## Side tracks

A side track is a tangent or a technical deep dive that branches off a main
post, without cluttering the main index. It's a regular post with one extra
field:

```yaml
---
title: "Why Await Actually Fixes a Race"
date: 2025-11-05
blurb: "One sentence about the tangent itself."
tags: ["debugging", "javascript"]
draft: false
parent: the-three-day-bug
---
```

`parent` is the slug of the post this branches off. That's the whole
feature:

- It's hidden from `/`, `/rss.xml`, and "Related posts" everywhere else,
  because it's a tangent, not a peer article. It still gets a real page at
  `/blog/<its-own-slug>/`, and still shows up (badged) on tag pages.
- The parent post's margin rail gets a "Side tracks" list linking to it; its
  own rail shows "Side track of" linking back up.
- One level only, a side track can't itself have a `parent`. The build fails
  loudly if `parent` points at a slug that doesn't exist or at another side
  track.

Link to it from the parent post with a normal wiki-link:
`[[await-and-the-event-loop|a short side track on why await fixes it]]`. It
renders with a slightly different (dotted, lighter) underline so a tangent
reads as lower-weight than a normal cross-post link.

## Drafts and publishing

`draft: true` hides a post while you're still writing it — the file can sit
in the repo unfinished without going live. Flip it to `false` when ready.

There's no separate publish step — the site rebuilds from `main`:

```
git add src/content/blog/my-post.md
git commit -m "Add my-post"
git push
```
