const WORDS_PER_MINUTE = 200;

/**
 * Strip code fences, inline code, and common markdown syntax so a post full
 * of code (or markup) doesn't inflate the word count / reading time.
 */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/~~~[\s\S]*?~~~/g, ' ') // alt fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> link text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/[*_>#~-]/g, ' ') // emphasis / blockquote / rule markers
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingTime(markdown: string): { minutes: number; text: string } {
  const stripped = stripMarkdown(markdown ?? '');
  const words = stripped.length === 0 ? 0 : stripped.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, text: `${minutes} min read` };
}
