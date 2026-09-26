# Media checklist — Graph World Models

Everything goes in `public/blog/graph-world-models/`.

**Figures** are still `MEDIA:` comments sitting at the exact spot in the post where
they belong — drop the file in, then replace the comment with the image tag, e.g.
`![alt text](/blog/graph-world-models/loop.png)`. Alt text is not optional; the
figures carry argument, not decoration.

**Hover GIFs** are already wired via `<HoverGif>` and need nothing but the file at the
path named below. They play when the reader hovers the highlighted words, not before —
the src is only fetched on first hover, so a reader who never hovers never downloads
them. Two consequences worth respecting when you pick the files:

- **They must loop.** Nothing resets the animation on a second hover, so a play-once
  GIF is dead after its first viewing.
- **Budget roughly 1–2 MB each.** They're lazy, not free, and they're comic relief.

Until a file exists, the popover hides itself rather than showing a broken-image icon,
so shipping before they're uploaded degrades to plain text. Readers with reduced motion
never see them at all — the highlight disappears too, so nothing is promised that
isn't delivered.

## Main post — `src/content/blog/graph-world-models.mdx`

- [ ] **Cover image**, 1600×900. Currently a picsum placeholder in the frontmatter,
      along with its placeholder alt text.
- [x] **Hover GIF — `bruh.gif`.** On the words "Like bruh" in the intro, after the
      boiling-kettle line.
- [x] **Figure — the four steps as a loop.** Done as an inline SVG, `src/assets/blog/graph-world-models/world-model-loop.svg`. Perceive → understand → simulate
      candidate actions → act, drawn as a cycle, related back to the 2018 world
      models paper. In _What is a world model?_
- [x] **Hover GIF — `empty-wallet.gif`.** On "break the bank", in
      _Application of world models_.
- [x] **Figure — plan scoring.** Done as an inline SVG, `src/assets/blog/graph-world-models/plan-scoring.svg`. Agent proposes three plans, the GWM scores each,
      only the winner is actually executed. In _Application of world models_.
- [x] **Hover image — `crude-oil.jpeg`** (a still, not a GIF). On "crude oil", in _Limitations of GWMs_.

- [x] **Interactive — power grid failure demo.** After the power grid paragraph in
      _Why talk about graph world models then?_ Built as `src/components/GridSim.astro`,
      prediction rules in `src/lib/grid.ts` (checked in `lib.test.ts`). Nothing to upload.

## Case study — `src/content/blog/graph-world-models-case-study.mdx`

- [ ] **Figure — the state graph.** Context node, four tool nodes (`read`, `edit`,
      `compile`, `test`), three file nodes, tool→file edges and file→file dependency
      edges. The rollout below (slide 0) draws this exact graph at rest, so this may
      turn out to be redundant with it.
- [x] **Figure — Plan A vs Plan B.** Done as `src/components/RolloutSlides.astro`:
      both plans' rollouts ship in one figure with a plan switcher, not a
      side-by-side drawing. Nothing to upload.

## Technicalities — `src/content/blog/graph-world-models-technicalities.md`

Page is intentionally empty for now; these land when the section is written.

- [ ] **Figure — power grid and molecule**, one illustrating fixed edges, one
      dynamic edges.

## Not media, but blocking

- [x] **A maths renderer.** Done: `remark-math` + `rehype-katex` + `katex`, wired in
      `astro.config.mjs`, stylesheet imported by `Prose.astro`. Maths renders at build
      time, so no client JS. Write `$x$` for inline and `$$` on its own lines for a
      display block. The technicalities draft's LaTeX can now be pasted in as-is.
- [ ] **The missing section.** The vault draft's callout says "skip ahead to
      _How do you know the world model is any good?_" — that section was never
      written. Either write it or the reference goes away for good.
