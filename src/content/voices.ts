// ElevenLabs voice per speaker id, for the later pre-render step (see README "Voices").
// Speakers without an entry stay text-only. Several ids = render the line with each voice and mix them
// (the Cloud Idols speak in unison).
export const VOICES: Record<string, string | string[]> = {
  mac: 'nwXBqbMKJWkQdYCbhxqZ',
  formsworth: 'hYZHGYzFnp1GKImhQtGi',
  cron: 'MKlLqCItoCkvdhrxgtLv',
  guard: 'aWSwMfJOK8iYZivczje6',
  hook: '4Vl3K2x290GidNvuaLm7',
  bartender: 'YrAYvOVjAFiqVwBgB4qI',
  maintainer: 'B52raBK48m23qWYbwchQ',
  painter: 'y2b9DGVjU8YIDErGsc5F',
  wordy: 'fIGaHjfrR8KmMy0vGEVJ',
  composer: 'b4XCIIupgo5eH7TxhBNk',
  fieldsworth: 'cauGUrZQIRUvQs3glrUi',
  promptington: 'dUercWozs0yhe4xBCgZ0',
  ghostflash: 'AocjYzHzWRalprWmBG9m',
  ghostgeo: 'TsHrPyMlNFuIYnbODF01',
  ghostblink: 'AocjYzHzWRalprWmBG9m', // shares Flash's voice; the two never speak in the same scene
  xena: 'RiK8PTtVIeKKoFFTk9fg',
  chuck: 'Riw1Wp5PIcFW1ZJAsxKi',
  toby: 'K3qyh1gNj6Du1xkps2Z5',
  master: 'aGv5jHWKBy8K5xKvYeSX',
  bob: 'k9kFjM4M02PYt2PvKMYq', // Bikeshed Bianca
  larry: 'R9RZPy40Zzy1wNxrgQpj', // LGTM Lenny
  nell: 'rk9BD4xwuG39syvDIBQy',
  keykeeper: 'dhwafD61uVd8h85wAZSE',
  ollama: 'O4MtuMnH7ahDiPGxxIC7',
  librarian: 'OOk3INdXVLRmSaQoAX9D',
  modelia: 'vFLqXa8bgbofGarf6fZh',
  officer: 'xNtG3W2oqJs0cJZuTyBc',
  slackbot: 'bAq8AI9QURijOtmeFFqT',
  speakotron: 'nPijfmaNgvm5OSN4xM8H',
  idols: ['7lJ2JuXZKHyck5zlS7XQ', 'Df0A8fHl2LOO7kDNIlpg', 'RhnjhPth7vQCdC4HFKLp'],
  node: '342hpGp7PKo7DsTTVSdr', // Captain Node
};
