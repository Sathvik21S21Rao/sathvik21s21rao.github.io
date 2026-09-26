export const site = {
  name: 'Sathvik Rao', // TODO(sathvik): confirm display name
  handle: 'sathvik21s21rao',
  url: 'https://sathvik21s21rao.github.io',
  title: 'Sathvik Rao',
  description: 'Notes on things I cannot stop thinking about.', // TODO(sathvik): your tagline
  socials: {
    github: 'https://github.com/sathvik21s21rao',
    email: 'sathvikrao04@gmail.com',
    // TODO(sathvik): add linkedin / x / bluesky if you want them
  },
  nav: [
    { href: '/', label: 'About' },
    { href: '/now', label: 'Now' },
    { href: '/writing', label: 'Writing' },
    { href: '/projects', label: 'Projects' },
  ],
  // Fill these in after the repo exists: see README. Comments stay hidden until repo+repoId+categoryId are all non-empty.
  giscus: {
    repo: '', // e.g. 'sathvik21s21rao/sathvik21s21rao.github.io'
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },
} as const;
