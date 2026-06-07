// prototype/sample-feed.js
// Sample post data for the working prototype. Covers all rendering branches:
// short, medium, long, with-image, listicle, with-quote.
/** @typedef {import('../lib/types').Post} Post */

/** @type {Post[]} */
export const SAMPLE_FEED = [
  {
    id: 'p1',
    author: 'Maya Chen',
    role: 'VP Engineering at Stripe',
    text:
      'I almost quit my job last year.\n\n' +
      'It was 11pm on a Thursday. I was sitting in my car in the office parking lot, staring at my phone. I had just opened our internal Slack to see another message from our CTO: "Can you jump on a call tomorrow at 7am?"\n\n' +
      "I closed the app. I opened my email. I started typing a resignation letter.\n\n" +
      "I didn't send it. Here's why, and here's what I learned about leading through ambiguity that I wish someone had told me three years ago.\n\n" +
      "When you take a senior role at a fast-growing company, nobody tells you that 80% of your job is going to be making decisions with incomplete information.\n\n" +
      "Your job isn't to remove ambiguity. It IS the job. Three things that means:\n\n" +
      '1. Make decisions, even bad ones, faster than feels comfortable.\n' +
      "2. Tell people what you don't know, as honestly as you can.\n" +
      '3. Give them a framework for moving forward without you.',
    avatarTheme: 'blue',
  },
  {
    id: 'p2',
    author: 'James Park',
    role: 'Former PM at Meta · #OpenToWork',
    text: 'Today I was part of the layoffs at Meta. After 6 years, I am officially looking. If you have any leads in product roles at scale, please reach out. Thank you to everyone who has reached out already.',
    avatarTheme: 'red',
  },
  {
    id: 'p3',
    author: 'Priya Nair',
    role: 'Writer',
    text: "My grandmother's last recipe, before her hands forgot. I am putting it here so the internet keeps it for our family.\n\nTake the rice. Wash it. Add cardamom, not too much. The trick is the slowness.",
    avatarTheme: 'yellow',
  },
  {
    id: 'p4',
    author: 'Alex Romero',
    role: 'Engineering Manager',
    text: 'Just shipped a thing. Feels good.',
    avatarTheme: 'green',
  },
  {
    id: 'p5',
    author: 'Sara Kim',
    role: 'Designer at Figma',
    text:
      "Five things I've learned about design hiring in 2026, after running 60+ portfolio reviews this year:\n\n" +
      '1. Show the rejected options. The artifact alone is not the work; the choice between artifacts is.\n' +
      '2. Name your trade-offs out loud. A confident "I chose X over Y because" reads stronger than perfect-looking screens.\n' +
      "3. Stop apologizing for incomplete work. If it's incomplete, say what's still open.\n" +
      "4. Don't lead with the visual. Lead with the problem.\n" +
      '5. Cite your research. Even when nobody asks.',
    avatarTheme: 'purple',
  },
  {
    id: 'p6',
    author: 'Tom Reeves',
    role: 'CTO at a startup you have not heard of',
    text: 'Quarterly reminder: if your strategy fits on one slide, it is not a strategy yet. It is a slogan.',
    avatarTheme: 'grey',
  },
  {
    id: 'p7',
    author: 'Dr. Lin Wei',
    role: 'Clinical researcher',
    text: 'New paper out today on cognitive disengagement in adult populations. Headline finding: the diagnostic threshold appears stable across cultures we sampled, but the daily-functioning impact varies sharply with workplace structure. Open access link in comments.',
    avatarTheme: 'teal',
  },
  {
    id: 'p8',
    author: 'Ben Olsen',
    role: 'Product at Spotify',
    text: 'Hot take: every "infinite scroll" surface should ship with a default cap that users can lift, not a default unbounded that users can cap.',
    avatarTheme: 'green',
  },
  {
    id: 'p9',
    author: 'Maya Chen',
    role: 'VP Engineering at Stripe',
    text: 'Hiring two senior platform engineers. Reply or DM. I read everything.',
    avatarTheme: 'blue',
  },
  {
    id: 'p10',
    author: 'Roya Ahmadi',
    role: 'Author & speaker',
    text:
      "Three quotes from this morning's reading, in order of how much they wrecked me:\n\n" +
      '"You cannot reason yourself into the version of yourself you have not yet become."\n\n' +
      '"The opposite of busy is not idle. It is intentional."\n\n' +
      '"What you tolerate is what you teach."',
    avatarTheme: 'red',
  },
  {
    id: 'p11',
    author: 'David Chu',
    role: 'Director at Adobe',
    text: "After 14 years here, today's my last day. Grateful, scared, ready.",
    avatarTheme: 'purple',
  },
  {
    id: 'p12',
    author: 'Hana Suzuki',
    role: 'Researcher at OpenAI',
    text: 'A surprising finding from our latest eval: models are sometimes wrong in ways that look right, and right in ways that look wrong. We are publishing a calibration dataset for those failure modes.',
    avatarTheme: 'yellow',
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
