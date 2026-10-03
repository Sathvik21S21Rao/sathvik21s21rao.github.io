export const site = {
  name: 'Sathvik Rao', // TODO(sathvik): confirm display name
  handle: 'sathvik21s21rao',
  url: 'https://sathvik21s21rao.github.io',
  title: 'Sathvik Rao',
  description: 'Notes on things I cannot stop thinking about.', // TODO(sathvik): your tagline
  socials: {
    github: 'https://github.com/sathvik21s21rao',
    email: 'sathvikrao04@gmail.com',
    linkedin: 'https://www.linkedin.com/in/sathvik-s-rao-998292278/',
    // TODO(sathvik): add x / bluesky if you want them
  },
  nav: [
    { href: '/', label: 'About' },
    { href: '/writing', label: 'Writing' },
  ],
  // IDs come from the GitHub GraphQL API / giscus.app; the giscus GitHub App must be installed on the repo.
  giscus: {
    repo: 'Sathvik21S21Rao/sathvik21s21rao.github.io',
    repoId: 'R_kgDOUs6Syg',
    category: 'Announcements',
    categoryId: 'DIC_kwDOUs6Sys4DG5bO',
  },
} as const;
