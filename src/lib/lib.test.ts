// Run with: node --test src/lib/lib.test.ts   (from the project root)
// Plain node:test + node:assert. No framework, no fixture files on disk
// beyond a throwaway temp dir this test creates and cleans up itself.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';

import { getRelatedPosts, getSideTracks } from './related.ts';
import { readingTime } from './reading-time.ts';

// --- related.ts -------------------------------------------------------

function mkPost(
  id: string,
  tags: string[],
  date: string,
  draft = false,
  parent?: string
) {
  return { id, data: { title: id, tags, date: new Date(date), draft, blurb: '', parent } } as any;
}

test('getRelatedPosts: no shared tags -> empty', () => {
  const current = mkPost('a', ['x'], '2024-01-01');
  const other = mkPost('b', ['y'], '2024-01-02');
  assert.deepEqual(getRelatedPosts(current, [current, other]), []);
});

test('getRelatedPosts: current post never appears in results', () => {
  const current = mkPost('a', ['x'], '2024-01-01');
  const all = [current, mkPost('b', ['x'], '2024-01-02')];
  const related = getRelatedPosts(current, all);
  assert.ok(!related.some((p) => p.id === 'a'));
});

test('getRelatedPosts: respects limit', () => {
  const current = mkPost('a', ['x'], '2024-01-01');
  const all = [
    current,
    mkPost('b', ['x'], '2024-01-02'),
    mkPost('c', ['x'], '2024-01-03'),
    mkPost('d', ['x'], '2024-01-04'),
  ];
  assert.equal(getRelatedPosts(current, all, 2).length, 2);
});

test('getRelatedPosts: excludes drafts', () => {
  const current = mkPost('a', ['x'], '2024-01-01');
  const draftPost = mkPost('b', ['x'], '2024-01-02', true);
  assert.deepEqual(getRelatedPosts(current, [current, draftPost]), []);
});

test('getRelatedPosts: rarer shared tag ranks above a common one', () => {
  const current = mkPost('a', ['common', 'rare'], '2024-01-01');
  const all = [
    current,
    mkPost('b', ['common'], '2024-01-02'),
    mkPost('c', ['common'], '2024-01-03'),
    mkPost('d', ['common'], '2024-01-04'),
    mkPost('e', ['rare'], '2024-01-05'), // only 2 posts (a, e) share 'rare'
  ];
  const [top] = getRelatedPosts(current, all, 1);
  assert.equal(top.id, 'e');
});

test('getRelatedPosts: side tracks are never candidates', () => {
  const current = mkPost('a', ['x'], '2024-01-01');
  const sideTrack = mkPost('b', ['x'], '2024-01-02', false, 'some-other-post');
  const normal = mkPost('c', ['x'], '2024-01-03');
  const related = getRelatedPosts(current, [current, sideTrack, normal]);
  assert.deepEqual(related.map((p) => p.id), ['c']);
});

test('getRelatedPosts: a side track never recommends its own parent (rail already links it)', () => {
  const parent = mkPost('trunk', ['x'], '2024-01-01');
  const current = mkPost('tangent', ['x'], '2024-01-02', false, 'trunk');
  const normal = mkPost('other', ['x'], '2024-01-03');
  const related = getRelatedPosts(current, [parent, current, normal]);
  assert.deepEqual(related.map((p) => p.id), ['other']);
});

// --- getSideTracks --------------------------------------------------------

test('getSideTracks: finds children by parent slug', () => {
  const parent = mkPost('trunk', ['x'], '2024-01-01');
  const child = mkPost('tangent', ['x'], '2024-01-02', false, 'trunk');
  const unrelated = mkPost('other', ['x'], '2024-01-03');
  const tracks = getSideTracks('trunk', [parent, child, unrelated]);
  assert.deepEqual(tracks, [{ slug: 'tangent', title: 'tangent' }]);
});

test('getSideTracks: excludes drafts', () => {
  const parent = mkPost('trunk', ['x'], '2024-01-01');
  const draftChild = mkPost('tangent', ['x'], '2024-01-02', true, 'trunk');
  assert.deepEqual(getSideTracks('trunk', [parent, draftChild]), []);
});

test('getSideTracks: sorted oldest first (reading order)', () => {
  const parent = mkPost('trunk', ['x'], '2024-01-01');
  const second = mkPost('second', ['x'], '2024-03-01', false, 'trunk');
  const first = mkPost('first', ['x'], '2024-02-01', false, 'trunk');
  const tracks = getSideTracks('trunk', [parent, second, first]);
  assert.deepEqual(tracks.map((t) => t.slug), ['first', 'second']);
});

test('getSideTracks: no children -> empty', () => {
  const parent = mkPost('trunk', ['x'], '2024-01-01');
  assert.deepEqual(getSideTracks('trunk', [parent]), []);
});

// --- reading-time.ts ----------------------------------------------------

test('readingTime: code fences are excluded from the word count', () => {
  const codeHeavy = `# Title\n\nA couple sentences of real prose here.\n\n\`\`\`js\n${'word '.repeat(600)}\n\`\`\`\n`;
  const { minutes } = readingTime(codeHeavy);
  assert.ok(minutes <= 1, `expected code fence to be excluded, got ${minutes} min`);
});

test('readingTime: empty body -> 1 min minimum', () => {
  const result = readingTime('');
  assert.equal(result.minutes, 1);
  assert.equal(result.text, '1 min read');
});

test('readingTime: text format reads like "N min read"', () => {
  assert.equal(readingTime('hello world').text, '1 min read');
});

// --- wikilinks.ts ---------------------------------------------------------
// The plugin reads `${cwd}/src/content/blog` once, lazily, on first use.
// Build an isolated fixture dir and chdir into it before importing, so this
// test never touches the real src/content/blog (owned by another agent).

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-test-'));
const fixtureBlogDir = path.join(fixtureRoot, 'src/content/blog');
fs.mkdirSync(fixtureBlogDir, { recursive: true });
fs.writeFileSync(
  path.join(fixtureBlogDir, 'alpha.md'),
  '---\ntitle: Alpha\ndate: 2024-01-01\nblurb: b\n---\nBody.\n'
);
fs.writeFileSync(
  path.join(fixtureBlogDir, 'alpha-beta.md'),
  '---\ntitle: Alpha Beta\ndate: 2024-01-02\nblurb: b\n---\nBody.\n'
);
fs.writeFileSync(
  path.join(fixtureBlogDir, 'gamma.md'),
  '---\ntitle: Gamma\ndate: 2024-01-03\nblurb: b\n---\nSee [[alpha]] and [[missing-slug]].\n'
);
fs.writeFileSync(
  path.join(fixtureBlogDir, 'delta.md'),
  '---\ntitle: Delta\ndate: 2024-01-04\nblurb: b\n---\nRead [[alpha|the custom text]] too.\n'
);
fs.writeFileSync(
  path.join(fixtureBlogDir, 'epsilon.md'),
  '---\ntitle: Epsilon\ndate: 2024-01-05\nblurb: b\nparent: alpha\n---\nA side track off alpha.\n'
);

const originalCwd = process.cwd();
process.chdir(fixtureRoot);
const { default: remarkWikiLinks, getBacklinks } = await import('./wikilinks.ts');
process.chdir(originalCwd);

function renderWikilinks(markdown: string): string {
  const file = unified().use(remarkParse).use(remarkWikiLinks).use(remarkStringify).processSync(markdown);
  return String(file);
}

// remark-stringify drops hProperties (an HTML/rehype concept), so wikilink
// class/aria-label can't be asserted on the stringified markdown output.
// Walk the mdast tree directly instead.
function getWikilinkProps(markdown: string): Record<string, unknown>[] {
  const processor = unified().use(remarkParse).use(remarkWikiLinks);
  const tree = processor.parse(markdown);
  processor.runSync(tree);
  const props: Record<string, unknown>[] = [];
  visit(tree, 'link', (node: any) => {
    if (node.data?.hProperties) props.push(node.data.hProperties);
  });
  return props;
}

test('wikilinks: [[slug|custom text]] uses the custom text', () => {
  const out = renderWikilinks('See [[alpha|the custom text]] here.');
  assert.match(out, /\[the custom text\]\(\/blog\/alpha\/\)/);
});

test('wikilinks: [[slug]] alone uses the target post title', () => {
  const out = renderWikilinks('See [[alpha]] here.');
  assert.match(out, /\[Alpha\]\(\/blog\/alpha\/\)/);
});

test('wikilinks: broken link warns and does not throw the build', () => {
  const warnings: string[] = [];
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.join(' '));

  let out = '';
  assert.doesNotThrow(() => {
    out = renderWikilinks('A [[missing-slug]] reference.');
  });

  console.warn = origWarn;
  assert.ok(warnings.some((w) => w.includes('missing-slug')), 'expected a warning naming the missing slug');
  assert.match(out, /missing-slug/); // left as literal text, not a broken link (remark-stringify escapes the brackets)
});

test('wikilinks: [[alpha]] does not fuzzy-match the alpha-beta post', () => {
  const out = renderWikilinks('See [[alpha]] here.');
  assert.doesNotMatch(out, /Alpha Beta/);
});

test('wikilinks: a link to a side track gets the sidetrack class and marker', () => {
  const [props] = getWikilinkProps('See [[epsilon]] here.');
  assert.equal(props.class, 'wikilink wikilink--sidetrack');
  assert.match(String(props['aria-label']), /side track/); // non-visual affordance, not colour alone
});

test('wikilinks: a link to a non-side-track post gets the plain class only', () => {
  const [props] = getWikilinkProps('See [[alpha]] here.');
  assert.equal(props.class, 'wikilink');
  assert.equal(props['aria-label'], undefined);
});

test('getBacklinks: finds referrers, excludes self-references', () => {
  const all = [
    { id: 'alpha', body: 'Body.', data: { title: 'Alpha', draft: false } },
    { id: 'alpha-beta', body: 'Body.', data: { title: 'Alpha Beta', draft: false } },
    { id: 'gamma', body: 'See [[alpha]] and [[missing-slug]].', data: { title: 'Gamma', draft: false } },
    { id: 'delta', body: 'Read [[alpha|the custom text]] too.', data: { title: 'Delta', draft: false } },
  ];
  const backlinks = getBacklinks({ id: 'alpha', data: {} }, all);
  const slugs = backlinks.map((b) => b.slug).sort();
  assert.deepEqual(slugs, ['delta', 'gamma']);
  assert.ok(!slugs.includes('alpha'), 'self-reference must be excluded');
});

test('getBacklinks: excludes draft referrers', () => {
  const all = [
    { id: 'alpha', body: 'Body.', data: { title: 'Alpha', draft: false } },
    { id: 'draft-post', body: 'See [[alpha]].', data: { title: 'Draft Post', draft: true } },
  ];
  assert.deepEqual(getBacklinks({ id: 'alpha', data: {} }, all), []);
});

test('getBacklinks: [[foo]] does not match a post named foo-bar', () => {
  const all = [
    { id: 'foo-bar', body: 'Body.', data: { title: 'Foo Bar', draft: false } },
    { id: 'referrer', body: 'See [[foo-bar]].', data: { title: 'Referrer', draft: false } },
  ];
  assert.deepEqual(getBacklinks({ id: 'foo', data: {} }, all), []);
});

// A side track is always wiki-linked from its parent (see CONTENT.md), so
// the parent shows up in every side track's raw backlink scan by
// construction — this is the collision the rail's "Side track of" block
// already covers, so getBacklinks must exclude it itself.
test('getBacklinks: excludes the target post\'s own parent', () => {
  const all = [
    { id: 'trunk', body: 'See the [[tangent]] side track.', data: { title: 'Trunk', draft: false } },
    { id: 'other', body: 'Also references [[tangent]].', data: { title: 'Other', draft: false } },
  ];
  const backlinks = getBacklinks({ id: 'tangent', data: { parent: 'trunk' } }, all);
  assert.deepEqual(backlinks.map((b) => b.slug), ['other']);
});

after(() => {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
});

// --- grid.ts ----------------------------------------------------------

import { predict } from './grid.ts';

test('grid: nothing failed -> every substation powered at full voltage', () => {
  const { nodes } = predict(new Set());
  for (const s of ['s1', 's2', 's3', 's4'] as const) {
    assert.equal(nodes[s].status, 'ok');
    assert.equal(nodes[s].voltage, 110);
  }
  assert.equal(nodes.g1.power, 70);
  assert.equal(nodes.g2.power, 70);
});

test('grid: losing Gen 1 blacks out its only-child and overloads Gen 2 for everyone else', () => {
  const { nodes, flow } = predict(new Set(['g1'] as const));
  assert.equal(nodes.s3.status, 'dark'); // fed by Gen 1 alone
  assert.equal(nodes.g2.status, 'overloaded'); // 100 MW asked of a 90 MW generator
  assert.equal(nodes.g2.power, 90);
  for (const s of ['s1', 's2', 's4'] as const) {
    assert.equal(nodes[s].status, 'brownout', s); // the far end feels it too
    assert.equal(nodes[s].voltage, 99, s);
  }
  assert.equal(flow['g1-s1'], 0);
});

test('grid: a failed substation sheds its load and hurts nobody', () => {
  const { nodes } = predict(new Set(['s3'] as const));
  assert.equal(nodes.s3.status, 'failed');
  assert.equal(nodes.g1.power, 30);
  for (const s of ['s1', 's2', 's4'] as const) assert.equal(nodes[s].status, 'ok', s);
});

test('grid: both generators down -> every substation dark', () => {
  const { nodes } = predict(new Set(['g1', 'g2'] as const));
  for (const s of ['s1', 's2', 's3', 's4'] as const) assert.equal(nodes[s].status, 'dark', s);
});
