import type { Content } from '../engine/core';

/** Lines for when nothing specific applies. {name} = the object's name. */
export const fallback: Content['fallback'] = {
  look: [
    "It's a {name}. Exactly as legacy as everything else here.",
    'Nothing special about the {name}. I checked twice. Well, once.',
    "It's a {name}. If it had documentation, I'd read it.",
  ],
  pickup: [
    "I don't think I can pick that up.",
    "That's not going in my backpack.",
    'My backpack has a strict no-{name} policy.',
  ],
  use: [
    "That doesn't work. Like most of the code on this island.",
    "I can't figure out how to use that. There's no README.",
    'Nothing happens. Have I tried turning it off and on again?',
  ],
  open: ["It doesn't open.", "I can't open that. It's not open source."],
  close: ["It doesn't close.", "It's already as closed as it gets."],
  push: ["It won't budge.", "Pushing it doesn't help. Like pushing to production on a Friday."],
  pull: ["It won't budge.", "I'd need a much bigger pull request."],
  talk: [
    "I don't think it wants to talk.",
    "It's ignoring me. Like a ticket in the backlog.",
    'No response. Same as most support emails.',
  ],
  give: ["I don't think they want that.", "They don't seem interested. Tough crowd."],
  walk: ["I can't go there."],
  combine: [
    "I can't use those together.",
    "Those don't go together. Like tabs and spaces.",
    "Combining them does nothing. It's not a monorepo.",
  ],
};
