# Placeholder copy — fill-in checklist

This is a restore log, not a spec. Everything below was cut from a public page because it was
still `TODO(sathvik)` text and the site is about to go live under a real name. Each block is
copied here verbatim, with its original location and guidance comment, so it can be pasted back
in once it's actually written — not reinvented from scratch.

## `src/pages/index.astro`

- [ ] **`likes` array**, originally lines 22–28. Replaced with `const likes: string[] = [];` and
      a guidance comment. The "Things I like" `<section>` is guarded on `likes.length > 0`, so
      it stays hidden until this is filled in — no code change needed beyond adding items back
      to the array.

  ```
  const likes = [
    'TODO(sathvik): a food',
    'TODO(sathvik): a place',
    "TODO(sathvik): a tool or piece of software you'll defend in an argument",
    'TODO(sathvik): a genre, band, or specific album',
    'TODO(sathvik): something completely unrelated to computers',
  ];
  ```

- [ ] **Portrait**, originally lines 37–46 (a `<figure class="portrait">` hotlinking
      `https://picsum.photos/seed/about-portrait/800/1000` with alt text "Placeholder image").
      Deleted entirely. Guidance comment left in its place:

  `{/* TODO(sathvik): replace with a real portrait and write real alt text */}`

  Until a real `<figure class="portrait">` comes back, `.about-grid > :only-child` makes
  `.about-content` span the full grid width. That rule can stay even after the portrait
  returns — it only matches when there's one child, so it's inert with two.

- [ ] **"How I got here"**, originally lines 49–57:

  ```
  <section class="section">
    <h2>How I got here</h2>
    <p>
      {/* TODO(sathvik): the honest, slightly winding version, not "I've always loved
          computers," but the actual turn or accident that got you paying attention. */}
      TODO(sathvik), the short version of a longer story, told the way you'd actually
      tell it to someone at a party rather than the way it would look on a form.
    </p>
  </section>
  ```

- [ ] **"What I'm chewing on"**, originally lines 59–67:

  ```
  <section class="section">
    <h2>What I'm chewing on</h2>
    <p>
      {/* TODO(sathvik): the current open question, obsession, or half-formed idea,
          something in progress, not resolved. This is the paragraph that changes most. */}
      Lately it's TODO(sathvik), no conclusions yet, just the questions that keep
      showing up uninvited.
    </p>
  </section>
  ```

  Both guidance comments now live together as a single JSX comment at the top of
  `<article class="about-content">`.

## `src/components/AboutIntro.astro`

- [ ] **"What I work on"**, originally lines 18–28:

  ```
  <section class="section">
    <h2>What I work on</h2>
    <p>
      {/* TODO(sathvik): 2-4 sentences on the kind of problems you gravitate toward,
          specific enough that someone could picture a Tuesday of yours. Not a list of
          technologies; the shape of the work, not the resume of it. */}
      Right now that's mostly TODO(sathvik), the kind of problem that sits at the
      intersection of TODO(sathvik) and TODO(sathvik), where the interesting part
      isn't the code itself but the thing the code is standing in for.
    </p>
  </section>
  ```

  The guidance comment stays in the file where the section was. The `.hook` heading above it
  (the real opening sentence) was untouched. The `.section` CSS rule in this file's `<style>`
  block is now unused by anything else in the file — left as-is since the section is coming
  back and it's two lines.

## `src/pages/now.astro`

- [ ] **"Building"**, originally lines 20–28:

  ```
  <section class="section">
    <h2>Building</h2>
    <p>
      {/* TODO(sathvik): one paragraph, what's on the workbench right now, and what part
          of it is actually hard. */}
      TODO(sathvik), the thing currently taking up the most desk space, literal or
      otherwise.
    </p>
  </section>
  ```

- [ ] **"Reading"**, originally lines 30–37:

  ```
  <section class="section">
    <h2>Reading</h2>
    <p>
      {/* TODO(sathvik): what's actually open on the nightstand or the tab bar, not the
          aspirational list. */}
      TODO(sathvik), whatever's genuinely got a bookmark in it this week.
    </p>
  </section>
  ```

- [ ] **"Learning"**, originally lines 39–46:

  ```
  <section class="section">
    <h2>Learning</h2>
    <p>
      {/* TODO(sathvik): a skill or subject you're actively bad at and working on, the
          more specific the better. */}
      TODO(sathvik), something you'd currently rate yourself uncomfortably low at.
    </p>
  </section>
  ```

  All three guidance comments now live together as one comment where the sections were.
  The `<h1>`, the `Last updated` line, and the `.explainer` paragraph above them are real
  and were left alone.

## Blog covers

Four posts had a picsum hotlink as `cover:` frontmatter, each with a
`# TODO(sathvik): replace with a real image and write real alt text` comment line above it.
Both lines are deleted (`cover` is optional in `src/content.config.ts`, and both places that
read it — `PostLayout.astro:27` and `PostIndex.astro:47` — are already behind a truthiness
check, so nothing broke). Re-seed with real 1600×900 images at these paths/URLs if the same
picsum seeds are worth keeping as a visual placeholder pattern, or just write real ones:

- [ ] `the-three-day-bug.mdx` — was `https://picsum.photos/seed/the-three-day-bug/1600/900`
- [ ] `what-the-cloud-actually-is.mdx` — was
      `https://picsum.photos/seed/what-the-cloud-actually-is/1600/900`
- [ ] `why-estimates-lie.mdx` — was `https://picsum.photos/seed/why-estimates-lie/1600/900`
- [ ] `graph-world-models.mdx` — was `https://picsum.photos/seed/graph-world-models/1600/900`

To add a cover back, add the two lines back above the closing `---` of the post's frontmatter:

```
# TODO(sathvik): replace with a real image and write real alt text
cover: { src: "/path/to/real-image.jpg", alt: "Real alt text" }
```

## The three placeholder projects

`cli-tool.md`, `web-app.md`, and `hardware-project.md` had `name:`/`blurb:` frontmatter that was
pure `TODO(sathvik)` text, rendering on `/projects`. Underscore-prefixing (`_cli-tool.md`) was
tried first per the original plan, since Vite's glob usually ignores `_`-prefixed files — **it
does not work here**: Astro's content-layer `glob()` loader still picked them up, so `/projects`
kept showing three "TODO(sathvik): name the ___" cards even with the underscore. So instead they
were moved out of the collection entirely, to **`docs/project-templates/`** (this directory),
unchanged apart from the move. `/projects` now correctly falls back to `projects.astro`'s
"Nothing here yet, check back soon." state.

To bring one back: move it from `docs/project-templates/<name>.md` to
`src/content/projects/<name>.md` and fill in `name:`, `blurb:`, and `image:` (each file still has
its own `# TODO(sathvik): replace with a real image and write real alt text` /
`image: { src: "https://picsum.photos/seed/<slug>/1200/800", alt: "Placeholder image" }` pair,
left untouched since these files are no longer on a public page).

## One more fix, not in the original seven

`src/content/blog/graph-world-models-technicalities.md` had a `TODO(sathvik)` outline as a raw
`<!-- -->` HTML comment in the Markdown body. Markdown passes HTML comments straight through to
the rendered page's HTML source (invisible on screen, but present in `view-source`), so it was
leaking a `TODO(sathvik)` string into the built `/blog/graph-world-models-technicalities` page —
failing the "zero `TODO(sathvik)` in `dist/`" check even though nothing was visible on the page.
Fixed by moving the same outline into the frontmatter as a YAML comment instead (frontmatter is
stripped entirely at build time, same reason the blog-cover TODO comments above were always
safe). No wording was changed, only where the comment lives:

```yaml
# TODO(sathvik): outline lifted from the vault draft, fill in when the maths is settled.
#
# ## The transition function
# ## Fixed edge GWMs
# ## Dynamic edge GWMs
# ## What is F_θ then?
# ## Training objective
#
# Needs a maths renderer before any of this goes in — see docs/graph-world-models-media.md.
```
