// Code review at the crossroads and in the dojo. Each reviewer shows patches with one real bug
// each; Mac's comment for a bug only shows up once a reviewer has explained it to him.
// Lenny, Bianca and Nell teach eight kinds of bug between them. Master Rebase's patches were
// written by AI agents: the same eight bugs, better hidden, and her last one is the stale cache.
import type { BugDef, PatchDef } from '../engine/core';

export const bugs: BugDef[] = [
  { id: 'raw', name: 'AI output printed with |raw', comment: '|raw prints the AI output as HTML. Escape it.' },
  { id: 'key', name: 'API keys in the code', comment: 'A live API key in the code. Use the Key module.' },
  { id: 'words', name: 'pull requests written by an AI', comment: 'An AI wrote this. Use your own words.' },
  { id: 'access', name: 'pages anyone can open', comment: 'Anyone can open this. Check a permission.' },
  { id: 'loop', name: 'an AI call for every item, while you wait', comment: 'One AI call per item, on page load. Queue it.' },
  { id: 'sql', name: 'user input glued into SQL', comment: 'User input glued into SQL. Use placeholders.' },
  { id: 'cache', name: 'caches without cache tags', comment: 'No cache tags: it will show stale data.' },
  { id: 'agent', name: 'agents with every tool', comment: 'This agent gets every tool. Limit it.' },
];

export const patches: PatchDef[] = [
  // ---- LGTM Lenny: he approved these already --------------------------------------------
  {
    id: 'lenny-raw', who: 'larry', bug: 'raw',
    title: 'Patch #101: Show the AI answer on the page',
    code: ['{# ai-answer.html.twig #}', '<div class="answer">', '  {{ ai_answer|raw }}', '</div>'],
    intro: ["I already approved this one. Just double-check it. Quickly. It's fine. It's FINE."],
    decoys: [
      { text: 'LGTM! Ship it!', reply: "THAT'S what I said! ...Wait. Why do I feel nervous?" },
      { text: 'Put two spaces before the curly braces.', reply: 'Nobody cares, Mac. Not even Bianca. ...Okay, Bianca cares.' },
    ],
    explain: [
      'Nell caught this one last week. I only remember because she was so nice about it.',
      "|raw prints the AI's answer as raw HTML. If the AI repeats something nasty a stranger typed, it runs in your visitor's browser.",
      "Drop the |raw. Twig escapes everything by default. That's the whole point.",
    ],
    yes: ['...You actually read it. Nobody actually reads it.', 'LGTM. And this time it really does look good to me.'],
  },
  {
    id: 'lenny-key', who: 'larry', bug: 'key',
    title: 'Patch #102: Connect to the AI provider',
    code: ['$client = new AiClient([', "  'provider' => 'cloud-idols',", "  'api_key' => 'sk-live-8f3a9c2e77d1',", ']);'],
    intro: ['This one connects to the cloud idols. It works! I tried it! On production!'],
    decoys: [
      { text: "'cloud-idols' should be in capitals.", reply: "It's a string, Mac. Strings have feelings too." },
      { text: 'Great work. Ship it!', reply: 'Finally, someone who gets me!' },
    ],
    explain: [
      'See the sk-live bit? That is a real API key. In the code. In git. Forever.',
      'Anyone who can read the repository can spend your tokens. Keys go in the Key module, and the code asks for the key by name.',
      'The Key Keeper would have fainted. Twice.',
    ],
    yes: ['Oh no. Oh no no no. I approved a password.', "...Thanks, Mac. I'm changing the key now."],
  },
  {
    id: 'lenny-words', who: 'larry', bug: 'words',
    title: 'PR #103: "A comprehensive enhancement"',
    code: [
      'This PR delves into a robust, comprehensive',
      'enhancement, seamlessly elevating the',
      'codebase to new heights. In summary, this',
      'change is a testament to excellence!!',
      'Files changed: README.txt (1 line)',
    ],
    intro: ['Look at this description! So long! So professional! Mine usually just say "fix".'],
    decoys: [
      { text: 'Needs more words. Maybe a poem.', reply: 'The AI can do poems! ...Wait. Should it?' },
      { text: 'LGTM! Very professional!', reply: 'Right?! It says "delve"! Nobody says "delve"!' },
    ],
    explain: [
      "Huh. You know, I've read it twice and I still don't know what changed. Or why.",
      'Nell always says: the code can come from anywhere, but the pull request is YOU, talking to the people who review it.',
      'Write it in your own words. What you changed, why, and how you tested it. Short is fine. Honest is better.',
    ],
    yes: ['"Your own words." Huh. So what did it actually change?', '...One line in the README. And it took an AI four sentences to not say so.'],
  },

  // ---- Bikeshed Bianca: everything is a naming discussion -------------------------------
  {
    id: 'bianca-access', who: 'bob', bug: 'access',
    title: 'Patch #201: A page for the AI settings',
    code: ['ai_settings.form:', "  path: '/admin/ai/settings'", '  requirements:', "    _access: 'TRUE'"],
    intro: ["My new settings page! Before you say anything: the button is teal. I've decided. For now."],
    decoys: [
      { text: 'The button should be blue.', reply: 'BLUE? We settled this! ...Fine. I am opening a poll.' },
      { text: 'Call it ai_config, not ai_settings.', reply: 'Ooh. Naming. My favourite. Let us discuss for three weeks.' },
    ],
    explain: [
      "_access: 'TRUE' means anyone can open it. Anyone. Anonymous visitors. Seagulls.",
      "And that page holds your AI provider and your prompts. Require a permission instead: _permission: 'administer ai'.",
      'I spent so long on the button that I forgot the door.',
    ],
    yes: ['...You looked past the button. Nobody looks past the button.', 'Fine. A permission it is. The button stays teal.'],
  },
  {
    id: 'bianca-loop', who: 'bob', bug: 'loop',
    title: 'Patch #202: A summary for every article',
    code: [
      'foreach ($articles as $article) {',
      '  // 10,000 articles, one request each',
      "  $summary = $ai->chat('Summarise: '",
      '    . $article->body->value);',
      '}',
      '// runs when the front page loads',
    ],
    intro: ['Every article gets an AI summary! And I named the loop variable $article. Not $a. I am growing.'],
    decoys: [
      { text: 'Rename $article to $thing.', reply: '$THING? Mac. Mac. We just talked about growth.' },
      { text: 'Use tabs, not spaces.', reply: 'FINALLY someone who wants to talk about the important things!' },
    ],
    explain: [
      'Ten thousand AI requests. One at a time. Every time someone opens the front page.',
      'The page takes an hour to load, and the token bill takes your house. Ask the idols how that goes.',
      'Do it once, in the background, with a queue, and save the summaries. Then the page just shows them.',
    ],
    yes: ["...Oh. Ten thousand. When you say it out loud, it's a lot.", 'A queue it is. I will name the queue... no. No. I will just name it.'],
  },

  // ---- Nitpick Nell: the hard ones, kindly ----------------------------------------------
  {
    id: 'nell-sql', who: 'nell', bug: 'sql',
    title: 'Patch #301: Search the reviews by name',
    code: [
      "$name = $request->query->get('name');",
      '$rows = $db->query(',
      '  "SELECT * FROM reviews WHERE name = \'"',
      '  . $name . "\'")->fetchAll();',
    ],
    intro: ["Here's one from an old module. Take your time. What would you say to the person who wrote it?"],
    decoys: [
      { text: 'SELECT * is lazy. Name the columns.', reply: "That's a fair nit! But it's not the one that hurts. Look at where $name comes from." },
      { text: 'There should be a blank line at the end.', reply: "Ha! There should, actually. Good eye. But there's a bigger fish in here." },
    ],
    explain: [
      "$name comes straight from the address bar, and it's glued right into the SQL.",
      "So someone types a \"name\" like ' OR 1=1 --, and the database does whatever they say. That's SQL injection.",
      "Use a placeholder: WHERE name = :name, and pass the value separately. Drupal's database API keeps the two apart for you.",
    ],
    yes: ['Exactly right. And you said it kindly. That matters as much as the catch.'],
  },
  {
    id: 'nell-cache', who: 'nell', bug: 'cache',
    title: 'Patch #302: A block with the latest news',
    code: ["$build['news'] = [", "  '#markup' => $node->getTitle(),", '];', '// cached with the page, like everything'],
    intro: ["This one's subtle. It works perfectly. On the first day."],
    decoys: [
      { text: 'Rename $build to $render.', reply: "Bianca would love that. But it's not the problem. Think about tomorrow." },
      { text: 'It needs a test.', reply: 'It does! Always! But a test would pass today. Think about tomorrow.' },
    ],
    explain: [
      'The title gets cached along with the page. But nothing tells Drupal it came from this node.',
      'So when someone edits the news, every page keeps showing the old title. Forever.',
      "Add the node's cache tags: '#cache' => ['tags' => $node->getCacheTags()]. Then Drupal clears it exactly when the node changes.",
      'Stale caches are how islands get cursed, you know. Ask anyone in town.',
    ],
    yes: ['Yes! Cache tags! Most people need years to spot that one.', "If the whole island reviewed like that, we wouldn't be stuck in 2009."],
  },
  {
    id: 'nell-agent', who: 'nell', bug: 'agent',
    title: 'Patch #303: An agent that fixes typos',
    code: ['agent: content_tidier', "goal: 'Fix typos in articles.'", "tools: ['*']", 'run_as: admin'],
    intro: ['An AI agent that fixes typos. Lovely idea. Read the config, though.'],
    decoys: [
      { text: "'Tidier' is not a real word.", reply: 'It is, actually! But this agent can do much worse than spell things wrong.' },
      { text: 'Fixing typos is a waste of AI.', reply: "Honestly? Typos annoy people a lot. The goal is fine. It's what the agent is allowed to do." },
    ],
    explain: [
      "tools: ['*'] hands it every tool on the site. And it runs as admin.",
      'So one bad prompt, or one sneaky sentence hidden in an article, and it can delete pages or hand out roles.',
      "Give an agent only the tools its job needs, and a role with only those permissions. To fix typos: read and edit articles. That's it.",
    ],
    yes: ["Exactly. Least privilege. Master Rebase would be proud. She'll ask you about agents, you know."],
  },

  // ---- Master Rebase: patches written by AI agents --------------------------------------
  {
    id: 'master-raw', who: 'master', bug: 'raw',
    title: 'Agent PR: Show the chatbot reply',
    code: ['<p class="bot">', '  {{ chatbot.reply|raw }}', '</p>'],
    intro: ['An agent wrote this. Agents write fast. Review faster.'],
    decoys: [
      { text: 'Use a <div>, not a <p>.', reply: 'You are polishing the door of a burning house.' },
      { text: 'Approved. The agent knows best.', reply: 'The agent knows nothing. It repeats. You review.' },
    ],
    explain: ['|raw. Whatever the chatbot is tricked into saying, the browser obeys.'],
    yes: ['Hm. Correct.'],
  },
  {
    id: 'master-key', who: 'master', bug: 'key',
    title: 'Agent PR: Faster setup',
    code: ['// settings.php', "$config['ai.provider']['key'] =", "  'sk-live-0dd5ea1c0ffee';", '// added by agent, to save you time'],
    intro: ['This agent wanted to save you time. Look at what it saved.'],
    decoys: [
      { text: 'Use double quotes for consistency.', reply: 'Consistently leaking. Yes. Very tidy.' },
      { text: 'Nice! Setup is so much faster now.', reply: 'For you. And for everyone who reads your repository.' },
    ],
    explain: ['A secret, in a file, in git. It saved you time. It will cost you tokens. Use the Key module.'],
    yes: ['Hm. The Key Keeper taught you well. Or frightened you well.'],
  },
  {
    id: 'master-words', who: 'master', bug: 'words',
    title: 'Agent PR: Description',
    code: [
      'As an AI language model, I have refactored',
      'the module to be more robust and scalable,',
      'ensuring a seamless experience. Let me',
      'know if you would like any further changes!',
    ],
    intro: ['The description of the next pull request. Read it as if you were the reviewer. You are.'],
    decoys: [
      { text: 'Very polite. Approved.', reply: 'Polite, and empty. A bowl with no soup.' },
      { text: 'It should end with a summary.', reply: 'It IS a summary. Of nothing.' },
    ],
    explain: [
      'It says nothing. What changed? Why? Who tested it?',
      'The code may come from an agent. The pull request comes from you: your words, your name, your responsibility.',
    ],
    yes: ['Yes. A reviewer reads a pull request to understand a person. Not a language model.'],
  },
  {
    id: 'master-access', who: 'master', bug: 'access',
    title: 'Agent PR: Prompt editor',
    code: ['ai_prompts.edit:', "  path: '/admin/ai/prompts'", '  requirements:', "    _access: 'TRUE' # agent: fixed 403!"],
    intro: ['The agent fixed an error. Very proud. Look at how.'],
    decoys: [
      { text: "Great, the 403 error is gone.", reply: 'The lock was annoying, so it removed the door.' },
      { text: "Call the path /admin/ai/prompt.", reply: 'Singular, plural. The burglars do not care.' },
    ],
    explain: ["The 403 was the permission check doing its job. Now anyone can change your prompts. Put the permission back."],
    yes: ['Correct. An error is sometimes the system working.'],
  },
  {
    id: 'master-loop', who: 'master', bug: 'loop',
    title: 'Agent PR: Moderate every profile',
    code: ['function island_page_attachments(&$page) {', '  foreach (User::loadMultiple() as $u) {', '    $ai->moderate($u->bio->value);', '  }', '}'],
    intro: ['Moderation. Very responsible. Also on every page view.'],
    decoys: [
      { text: 'Rename $u to $user.', reply: 'A better name for a bigger fire.' },
      { text: 'Add a comment above the loop.', reply: '"Here is where the money goes." Yes. Good comment.' },
    ],
    explain: ['Every page view moderates every user again. Moderate once, when a profile changes. Or in a queue.'],
    yes: ['Hm. You count the requests. The idols will be pleased. Briefly.'],
  },
  {
    id: 'master-sql', who: 'master', bug: 'sql',
    title: 'Agent PR: Clean up the log',
    code: ['$db->query("DELETE FROM island_log', "  WHERE id = \" . $_GET['id']);"],
    intro: ['Short. Agents like short. So do attackers.'],
    decoys: [
      { text: 'Do we need to delete logs at all?', reply: 'A fine question for a meeting. Not for this line.' },
      { text: 'Put it on one line.', reply: 'One line, two lines. The hole is the same size.' },
    ],
    explain: ['The id comes from the URL, straight into a DELETE. Someone sends "1 OR 1=1", and the log is gone. Placeholders.'],
    yes: ['Correct. Placeholders. Always.'],
  },
  {
    id: 'master-agent', who: 'master', bug: 'agent',
    title: 'Agent PR: Configure the help desk agent',
    code: ['agent: help_desk', "goal: 'Answer visitor questions.'", "tools: ['*']", "run_as: 'admin' # agent: avoids errors"],
    intro: ['An agent that configured another agent. They are very generous with each other.'],
    decoys: [
      { text: 'The goal needs to be friendlier.', reply: 'It will be very friendly while it deletes the site.' },
      { text: 'No errors? Lovely. Approved.', reply: 'No errors, because nothing is forbidden. That is not lovely.' },
    ],
    explain: ['It answers questions. It needs to read content. Nothing else. Every tool, as admin, is an open door.'],
    yes: ['Yes. Give it a small key, not the whole keyring.'],
  },
  {
    id: 'master-cache', who: 'master', bug: 'cache',
    title: 'Agent PR: The island news, on every page',
    code: [
      "$build['news'] = [",
      "  '#markup' => $news->getTitle(),",
      "  '#cache' => ['max-age' => Cache::PERMANENT],",
      '];',
      '// merged in 2009, by an agent',
    ],
    intro: [
      'My last patch. An agent wrote it, many years ago. Nobody reviewed it.',
      'It is the reason nothing on this island ever changes.',
    ],
    decoys: [
      { text: 'PERMANENT is very fast. Good!', reply: 'Fast. And wrong. Forever.' },
      { text: '$news should be $headline.', reply: 'The headline has said the same thing since 2009. Whatever you call it.' },
    ],
    explain: [
      'Cached forever, and no cache tags. When the news changes, nothing tells Drupal to throw the old page away.',
      'That, student, is the Curse of the Stale Cache. Add the cache tags.',
    ],
    yes: [
      '...',
      'Yes. No cache tags. Cached forever. Since 2009.',
      'That, student, is the Curse of the Stale Cache. Nobody reviewed it. So the island stood still.',
    ],
  },
];
