# sathvik21s21rao.github.io

Personal blog, built with Astro.

## Running it

- `npm run dev` — local dev server
- `npm run build` — build to `./dist/`
- `npm run preview` — preview the production build locally

## Adding a post

Drop a new `.md` or `.mdx` file into `src/content/blog/`, with frontmatter matching the `blog`
collection schema in `src/content.config.ts` (`title`, `date`, `blurb`, `tags`, `draft`,
`updated`). The file's slug becomes its URL.

## Comments (giscus)

Comments are powered by [giscus](https://giscus.app), which stores threads as GitHub Discussions
on this repo. To turn them on:

1. Enable **Discussions** on this GitHub repo (Settings → General → Features).
2. Install the [giscus app](https://github.com/apps/giscus) on this repo.
3. Configure your setup at [giscus.app](https://giscus.app), selecting the **Announcements**
   category.
4. Copy the generated `repo`, `repoId`, and `categoryId` values into `src/config.ts` under
   `site.giscus`. Comments stay hidden until `repo`, `repoId`, and `categoryId` are all filled in.
