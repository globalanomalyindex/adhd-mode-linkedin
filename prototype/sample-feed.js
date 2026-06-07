// prototype/sample-feed.js
// The six canonical posts (canon section 3). Authors keep the same name,
// title, and body across every artifact: the prototype, the screens, and the
// case study all draw from this set. Bodies are specific and human, with no
// influencer bait.
//
// Coverage of the reflow branches: Priya and Maya run long enough to reflow
// (TL;DR first, then paged body); James and Daniel are medium; Acme and Lena
// are short single-page posts.
/** @typedef {import('../lib/types').Post} Post */

/** @type {Post[]} */
export const SAMPLE_FEED = [
  {
    id: 'p1',
    author: 'Priya Nair',
    role: 'Engineering Manager (formerly Cobalt Robotics)',
    text:
      'Friday was my last day at Cobalt. My whole team was cut in the restructure. I am not going to pretend it does not sting.\n\n' +
      'What I keep coming back to: the best work I did there was the reliability work nobody noticed until it stopped breaking.\n\n' +
      'If you are hiring an EM who cares more about a humane on-call rotation than about the org chart, I would love to talk.',
    avatarTheme: 'blue',
  },
  {
    id: 'p2',
    author: 'James Park',
    role: 'Product Manager at Atlas Health',
    text:
      'We are hiring two product designers on the Atlas Health platform team. The work is unglamorous and it matters: we are rebuilding the intake flow every patient touches before they ever see a doctor.\n\n' +
      'If you have shipped healthcare or other high-stakes workflows, my messages are open.',
    avatarTheme: 'red',
  },
  {
    id: 'p3',
    author: 'Maya Chen',
    role: 'Staff Engineer at Northwind Logistics',
    text:
      'We finally retired the cron job that ran our billing pipeline. It had thirty seven downstream consumers and a single point of failure that took us down twice last quarter.\n\n' +
      'Moving to an event log was not the hard part. The hard part was convincing six teams that "it has always worked" is not the same as "it works."\n\n' +
      'Migration notes in the comments.',
    avatarTheme: 'yellow',
  },
  {
    id: 'p4',
    author: 'Acme Cloud',
    role: 'Cloud infrastructure',
    text:
      'Acme Cloud now supports point in time recovery on every plan, including the free tier. Because losing data should not be a premium feature.',
    avatarTheme: 'grey',
  },
  {
    id: 'p5',
    author: 'Daniel Okafor',
    role: 'UX Researcher at Meridian Bank',
    text:
      'Watched twelve people use our new dashboard this week. Eleven of them ignored the feature we spent a quarter building and went straight for the export button.\n\n' +
      'The export button took an afternoon. There is a lesson in that I am still sitting with.',
    avatarTheme: 'teal',
  },
  {
    id: 'p6',
    author: 'Lena Fischer',
    role: 'Logistics Analyst at Northwind',
    text:
      'Five years at Northwind today. Grateful for the people who answered my questions back when I was the most junior person in the room.',
    avatarTheme: 'green',
  },
];

/**
 * Look up a sample post by id.
 * @param {string} id
 * @returns {Post | undefined}
 */
export function getPostById(id) {
  return SAMPLE_FEED.find(p => p.id === id);
}
