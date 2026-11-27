/* K–8 English Phonics Curriculum, Word Builder Bank & Contextual Phonics Hints */
(function (app) {
  'use strict';

  const { AudioEngine } = app;

  const TIERS = [
    { id: 'k', label: '🐣 K (CVC)' },
    { id: 'g1', label: '🌱 G1 (Blends)' },
    { id: 'g2', label: '🚀 G2 (Digraphs & FLSZ)' },
    { id: 'g3', label: '✨ G3 (VCe / R-Ctrl)' },
    { id: 'g4_5', label: '👑 G4–5 (Teams)' },
    { id: 'all', label: '🎲 All K–5' }
  ];

  const BUILDER_TIERS = [
    { id: 'k', label: '🐣 K (Ages 4–6)' },
    { id: 'g1', label: '🌱 Grade 1 (Ages 6–7)' },
    { id: 'g2', label: '🚀 Grade 2 (Ages 7–8)' },
    { id: 'g3', label: '✨ Grade 3 (Ages 8–9)' },
    { id: 'g4_5', label: '📘 Grades 4–5 (Ages 9–11)' },
    { id: 'g6', label: '🔭 Grade 6 (Ages 11–12)' },
    { id: 'g7_8', label: '👑 Grades 7–8 (Ages 12–14)' },
    { id: 'all', label: '🎲 All (K–8)' }
  ];

  // Clean UFLI-aligned phoneme transcription per word (zero trailing "-uh" schwa)
  // and `soundUnits` mapping to pure acoustic keys in AudioEngine.playPhoneme().
  const RAW_WORDS = [
    // Kindergarten ('k') — 3-letter regular CVC words
    { word: 'cat', emoji: '🐱', tier: 'k', onset: 'c', rime: 'at', tiles: ['c', 'a', 't'], phonemes: ['k', 'ă', 't'], soundUnits: ['c', 'a', 't'], decoys: ['bat', 'hat', 'cot'] },
    { word: 'dog', emoji: '🐶', tier: 'k', onset: 'd', rime: 'og', tiles: ['d', 'o', 'g'], phonemes: ['d', 'ŏ', 'g'], soundUnits: ['d', 'o', 'g'], decoys: ['log', 'fog', 'dig'] },
    { word: 'sun', emoji: '☀️', tier: 'k', onset: 's', rime: 'un', tiles: ['s', 'u', 'n'], phonemes: ['s', 'ŭ', 'n'], soundUnits: ['s', 'u', 'n'], decoys: ['fun', 'run', 'bun'] },
    { word: 'pig', emoji: '🐷', tier: 'k', onset: 'p', rime: 'ig', tiles: ['p', 'i', 'g'], phonemes: ['p', 'ĭ', 'g'], soundUnits: ['p', 'i', 'g'], decoys: ['dig', 'wig', 'peg'] },
    { word: 'hat', emoji: '🎩', tier: 'k', onset: 'h', rime: 'at', tiles: ['h', 'a', 't'], phonemes: ['h', 'ă', 't'], soundUnits: ['h', 'a', 't'], decoys: ['cat', 'bat', 'hot'] },
    { word: 'bed', emoji: '🛏️', tier: 'k', onset: 'b', rime: 'ed', tiles: ['b', 'e', 'd'], phonemes: ['b', 'ĕ', 'd'], soundUnits: ['b', 'e', 'd'], decoys: ['red', 'fed', 'bad'] },
    { word: 'bus', emoji: '🚌', tier: 'k', onset: 'b', rime: 'us', tiles: ['b', 'u', 's'], phonemes: ['b', 'ŭ', 's'], soundUnits: ['b', 'u', 's'], decoys: ['bug', 'bun', 'bat'] },
    { word: 'fox', emoji: '🦊', tier: 'k', onset: 'f', rime: 'ox', tiles: ['f', 'o', 'x'], phonemes: ['f', 'ŏ', 'ks'], soundUnits: ['f', 'o', 'x'], decoys: ['box', 'fix', 'fan'] },
    { word: 'cup', emoji: '☕', tier: 'k', onset: 'c', rime: 'up', tiles: ['c', 'u', 'p'], phonemes: ['k', 'ŭ', 'p'], soundUnits: ['c', 'u', 'p'], decoys: ['pup', 'cap', 'cub'] },
    { word: 'bug', emoji: '🐛', tier: 'k', onset: 'b', rime: 'ug', tiles: ['b', 'u', 'g'], phonemes: ['b', 'ŭ', 'g'], soundUnits: ['b', 'u', 'g'], decoys: ['hug', 'mug', 'bag'] },
    { word: 'map', emoji: '🗺️', tier: 'k', onset: 'm', rime: 'ap', tiles: ['m', 'a', 'p'], phonemes: ['m', 'ă', 'p'], soundUnits: ['m', 'a', 'p'], decoys: ['cap', 'nap', 'mop'] },
    { word: 'net', emoji: '🥅', tier: 'k', onset: 'n', rime: 'et', tiles: ['n', 'e', 't'], phonemes: ['n', 'ĕ', 't'], soundUnits: ['n', 'e', 't'], decoys: ['pet', 'jet', 'nut'] },
    { word: 'bat', emoji: '🦇', tier: 'k', onset: 'b', rime: 'at', tiles: ['b', 'a', 't'], phonemes: ['b', 'ă', 't'], soundUnits: ['b', 'a', 't'], decoys: ['cat', 'hat', 'bit'] },
    { word: 'rat', emoji: '🐀', tier: 'k', onset: 'r', rime: 'at', tiles: ['r', 'a', 't'], phonemes: ['r', 'ă', 't'], soundUnits: ['r', 'a', 't'], decoys: ['mat', 'sat', 'rot'] },
    { word: 'mat', emoji: '🧘', tier: 'k', onset: 'm', rime: 'at', tiles: ['m', 'a', 't'], phonemes: ['m', 'ă', 't'], soundUnits: ['m', 'a', 't'], decoys: ['map', 'bat', 'met'] },
    { word: 'log', emoji: '🪵', tier: 'k', onset: 'l', rime: 'og', tiles: ['l', 'o', 'g'], phonemes: ['l', 'ŏ', 'g'], soundUnits: ['l', 'o', 'g'], decoys: ['dog', 'fog', 'leg'] },
    { word: 'fog', emoji: '🌫️', tier: 'k', onset: 'f', rime: 'og', tiles: ['f', 'o', 'g'], phonemes: ['f', 'ŏ', 'g'], soundUnits: ['f', 'o', 'g'], decoys: ['log', 'dog', 'fig'] },
    { word: 'wig', emoji: '💇', tier: 'k', onset: 'w', rime: 'ig', tiles: ['w', 'i', 'g'], phonemes: ['w', 'ĭ', 'g'], soundUnits: ['w', 'i', 'g'], decoys: ['pig', 'dig', 'wag'] },
    { word: 'dig', emoji: '⛏️', tier: 'k', onset: 'd', rime: 'ig', tiles: ['d', 'i', 'g'], phonemes: ['d', 'ĭ', 'g'], soundUnits: ['d', 'i', 'g'], decoys: ['pig', 'dog', 'big'] },
    { word: 'bun', emoji: '🍔', tier: 'k', onset: 'b', rime: 'un', tiles: ['b', 'u', 'n'], phonemes: ['b', 'ŭ', 'n'], soundUnits: ['b', 'u', 'n'], decoys: ['sun', 'run', 'bin'] },
    { word: 'run', emoji: '🏃', tier: 'k', onset: 'r', rime: 'un', tiles: ['r', 'u', 'n'], phonemes: ['r', 'ŭ', 'n'], soundUnits: ['r', 'u', 'n'], decoys: ['sun', 'fun', 'ran'] },
    { word: 'hug', emoji: '🤗', tier: 'k', onset: 'h', rime: 'ug', tiles: ['h', 'u', 'g'], phonemes: ['h', 'ŭ', 'g'], soundUnits: ['h', 'u', 'g'], decoys: ['bug', 'mug', 'rug'] },
    { word: 'mug', emoji: '🍺', tier: 'k', onset: 'm', rime: 'ug', tiles: ['m', 'u', 'g'], phonemes: ['m', 'ŭ', 'g'], soundUnits: ['m', 'u', 'g'], decoys: ['bug', 'hug', 'rug'] },
    { word: 'rug', emoji: '🧶', tier: 'k', onset: 'r', rime: 'ug', tiles: ['r', 'u', 'g'], phonemes: ['r', 'ŭ', 'g'], soundUnits: ['r', 'u', 'g'], decoys: ['bug', 'mug', 'rag'] },
    { word: 'hen', emoji: '🐔', tier: 'k', onset: 'h', rime: 'en', tiles: ['h', 'e', 'n'], phonemes: ['h', 'ĕ', 'n'], soundUnits: ['h', 'e', 'n'], decoys: ['pen', 'ten', 'men'] },
    { word: 'pen', emoji: '🖊️', tier: 'k', onset: 'p', rime: 'en', tiles: ['p', 'e', 'n'], phonemes: ['p', 'ĕ', 'n'], soundUnits: ['p', 'e', 'n'], decoys: ['hen', 'ten', 'pin'] },
    { word: 'ten', emoji: '🔟', tier: 'k', onset: 't', rime: 'en', tiles: ['t', 'e', 'n'], phonemes: ['t', 'ĕ', 'n'], soundUnits: ['t', 'e', 'n'], decoys: ['hen', 'pen', 'tin'] },
    { word: 'red', emoji: '🔴', tier: 'k', onset: 'r', rime: 'ed', tiles: ['r', 'e', 'd'], phonemes: ['r', 'ĕ', 'd'], soundUnits: ['r', 'e', 'd'], decoys: ['bed', 'fed', 'rod'] },
    { word: 'web', emoji: '🕸️', tier: 'k', onset: 'w', rime: 'eb', tiles: ['w', 'e', 'b'], phonemes: ['w', 'ĕ', 'b'], soundUnits: ['w', 'e', 'b'], decoys: ['bed', 'wet', 'win'] },
    { word: 'jet', emoji: '✈️', tier: 'k', onset: 'j', rime: 'et', tiles: ['j', 'e', 't'], phonemes: ['j', 'ĕ', 't'], soundUnits: ['j', 'e', 't'], decoys: ['net', 'pet', 'wet'] },
    { word: 'box', emoji: '📦', tier: 'k', onset: 'b', rime: 'ox', tiles: ['b', 'o', 'x'], phonemes: ['b', 'ŏ', 'ks'], soundUnits: ['b', 'o', 'x'], decoys: ['fox', 'pot', 'six'] },
    { word: 'van', emoji: '🚐', tier: 'k', onset: 'v', rime: 'an', tiles: ['v', 'a', 'n'], phonemes: ['v', 'ă', 'n'], soundUnits: ['v', 'a', 'n'], decoys: ['can', 'fan', 'pan'] },
    { word: 'pan', emoji: '🍳', tier: 'k', onset: 'p', rime: 'an', tiles: ['p', 'a', 'n'], phonemes: ['p', 'ă', 'n'], soundUnits: ['p', 'a', 'n'], decoys: ['can', 'fan', 'pin'] },
    { word: 'fan', emoji: '🪭', tier: 'k', onset: 'f', rime: 'an', tiles: ['f', 'a', 'n'], phonemes: ['f', 'ă', 'n'], soundUnits: ['f', 'a', 'n'], decoys: ['can', 'man', 'fin'] },
    { word: 'cap', emoji: '🧢', tier: 'k', onset: 'c', rime: 'ap', tiles: ['c', 'a', 'p'], phonemes: ['k', 'ă', 'p'], soundUnits: ['c', 'a', 'p'], decoys: ['map', 'nap', 'cup'] },
    { word: 'nap', emoji: '😴', tier: 'k', onset: 'n', rime: 'ap', tiles: ['n', 'a', 'p'], phonemes: ['n', 'ă', 'p'], soundUnits: ['n', 'a', 'p'], decoys: ['map', 'cap', 'tap'] },
    { word: 'pot', emoji: '🍲', tier: 'k', onset: 'p', rime: 'ot', tiles: ['p', 'o', 't'], phonemes: ['p', 'ŏ', 't'], soundUnits: ['p', 'o', 't'], decoys: ['hot', 'dot', 'pat'] },
    { word: 'hot', emoji: '🔥', tier: 'k', onset: 'h', rime: 'ot', tiles: ['h', 'o', 't'], phonemes: ['h', 'ŏ', 't'], soundUnits: ['h', 'o', 't'], decoys: ['pot', 'dot', 'hat'] },
    { word: 'mop', emoji: '🧹', tier: 'k', onset: 'm', rime: 'op', tiles: ['m', 'o', 'p'], phonemes: ['m', 'ŏ', 'p'], soundUnits: ['m', 'o', 'p'], decoys: ['hop', 'top', 'map'] },
    { word: 'hop', emoji: '🐇', tier: 'k', onset: 'h', rime: 'op', tiles: ['h', 'o', 'p'], phonemes: ['h', 'ŏ', 'p'], soundUnits: ['h', 'o', 'p'], decoys: ['mop', 'top', 'hip'] },
    { word: 'jam', emoji: '🍓', tier: 'k', onset: 'j', rime: 'am', tiles: ['j', 'a', 'm'], phonemes: ['j', 'ă', 'm'], soundUnits: ['j', 'a', 'm'], decoys: ['ham', 'ram', 'jet'] },
    { word: 'zip', emoji: '🤐', tier: 'k', onset: 'z', rime: 'ip', tiles: ['z', 'i', 'p'], phonemes: ['z', 'ĭ', 'p'], soundUnits: ['z', 'i', 'p'], decoys: ['lip', 'sip', 'zap'] },
    { word: 'tub', emoji: '🛁', tier: 'k', onset: 't', rime: 'ub', tiles: ['t', 'u', 'b'], phonemes: ['t', 'ŭ', 'b'], soundUnits: ['t', 'u', 'b'], decoys: ['cub', 'sub', 'tab'] },
    { word: 'cub', emoji: '🐻', tier: 'k', onset: 'c', rime: 'ub', tiles: ['c', 'u', 'b'], phonemes: ['k', 'ŭ', 'b'], soundUnits: ['c', 'u', 'b'], decoys: ['tub', 'cup', 'cab'] },
    { word: 'nut', emoji: '🥜', tier: 'k', onset: 'n', rime: 'ut', tiles: ['n', 'u', 't'], phonemes: ['n', 'ŭ', 't'], soundUnits: ['n', 'u', 't'], decoys: ['cut', 'hut', 'net'] },
    { word: 'mud', emoji: '🟤', tier: 'k', onset: 'm', rime: 'ud', tiles: ['m', 'u', 'd'], phonemes: ['m', 'ŭ', 'd'], soundUnits: ['m', 'u', 'd'], decoys: ['bud', 'mad', 'mug'] },

    // Grade 1 ('g1') — 4-letter initial/final blend words
    { word: 'frog', emoji: '🐸', tier: 'g1', onset: 'fr', rime: 'og', tiles: ['f', 'r', 'o', 'g'], phonemes: ['f', 'r', 'ŏ', 'g'], soundUnits: ['f', 'r', 'o', 'g'], decoys: ['flag', 'fog', 'from'] },
    { word: 'crab', emoji: '🦀', tier: 'g1', onset: 'cr', rime: 'ab', tiles: ['c', 'r', 'a', 'b'], phonemes: ['k', 'r', 'ă', 'b'], soundUnits: ['c', 'r', 'a', 'b'], decoys: ['crib', 'clam', 'cab'] },
    { word: 'drum', emoji: '🥁', tier: 'g1', onset: 'dr', rime: 'um', tiles: ['d', 'r', 'u', 'm'], phonemes: ['d', 'r', 'ŭ', 'm'], soundUnits: ['d', 'r', 'u', 'm'], decoys: ['drop', 'plum', 'dam'] },
    { word: 'flag', emoji: '🚩', tier: 'g1', onset: 'fl', rime: 'ag', tiles: ['f', 'l', 'a', 'g'], phonemes: ['f', 'l', 'ă', 'g'], soundUnits: ['f', 'l', 'a', 'g'], decoys: ['flat', 'frog', 'bag'] },
    { word: 'clap', emoji: '👏', tier: 'g1', onset: 'cl', rime: 'ap', tiles: ['c', 'l', 'a', 'p'], phonemes: ['k', 'l', 'ă', 'p'], soundUnits: ['c', 'l', 'a', 'p'], decoys: ['clip', 'flap', 'cap'] },
    { word: 'swim', emoji: '🏊', tier: 'g1', onset: 'sw', rime: 'im', tiles: ['s', 'w', 'i', 'm'], phonemes: ['s', 'w', 'ĭ', 'm'], soundUnits: ['s', 'w', 'i', 'm'], decoys: ['slim', 'spin', 'win'] },
    { word: 'stop', emoji: '🛑', tier: 'g1', onset: 'st', rime: 'op', tiles: ['s', 't', 'o', 'p'], phonemes: ['s', 't', 'ŏ', 'p'], soundUnits: ['s', 't', 'o', 'p'], decoys: ['step', 'spot', 'top'] },
    { word: 'plum', emoji: '🫐', tier: 'g1', onset: 'pl', rime: 'um', tiles: ['p', 'l', 'u', 'm'], phonemes: ['p', 'l', 'ŭ', 'm'], soundUnits: ['p', 'l', 'u', 'm'], decoys: ['plan', 'plug', 'drum'] },
    { word: 'lamp', emoji: '💡', tier: 'g1', onset: 'l', rime: 'amp', tiles: ['l', 'a', 'm', 'p'], phonemes: ['l', 'ă', 'm', 'p'], soundUnits: ['l', 'a', 'm', 'p'], decoys: ['camp', 'damp', 'limp'] },
    { word: 'tent', emoji: '⛺', tier: 'g1', onset: 't', rime: 'ent', tiles: ['t', 'e', 'n', 't'], phonemes: ['t', 'ĕ', 'n', 't'], soundUnits: ['t', 'e', 'n', 't'], decoys: ['bent', 'sent', 'tint'] },
    { word: 'hand', emoji: '✋', tier: 'g1', onset: 'h', rime: 'and', tiles: ['h', 'a', 'n', 'd'], phonemes: ['h', 'ă', 'n', 'd'], soundUnits: ['h', 'a', 'n', 'd'], decoys: ['land', 'sand', 'band'] },
    { word: 'nest', emoji: '🪺', tier: 'g1', onset: 'n', rime: 'est', tiles: ['n', 'e', 's', 't'], phonemes: ['n', 'ĕ', 's', 't'], soundUnits: ['n', 'e', 's', 't'], decoys: ['best', 'rest', 'test'] },
    { word: 'sled', emoji: '🛷', tier: 'g1', onset: 'sl', rime: 'ed', tiles: ['s', 'l', 'e', 'd'], phonemes: ['s', 'l', 'ĕ', 'd'], soundUnits: ['s', 'l', 'e', 'd'], decoys: ['slip', 'slam', 'shed'] },
    { word: 'snap', emoji: '🫰', tier: 'g1', onset: 'sn', rime: 'ap', tiles: ['s', 'n', 'a', 'p'], phonemes: ['s', 'n', 'ă', 'p'], soundUnits: ['s', 'n', 'a', 'p'], decoys: ['snip', 'clap', 'trap'] },
    { word: 'drop', emoji: '💧', tier: 'g1', onset: 'dr', rime: 'op', tiles: ['d', 'r', 'o', 'p'], phonemes: ['d', 'r', 'ŏ', 'p'], soundUnits: ['d', 'r', 'o', 'p'], decoys: ['drip', 'stop', 'crop'] },
    { word: 'step', emoji: '🪜', tier: 'g1', onset: 'st', rime: 'ep', tiles: ['s', 't', 'e', 'p'], phonemes: ['s', 't', 'ĕ', 'p'], soundUnits: ['s', 't', 'e', 'p'], decoys: ['stop', 'stem', 'sled'] },
    { word: 'spot', emoji: '🐾', tier: 'g1', onset: 'sp', rime: 'ot', tiles: ['s', 'p', 'o', 't'], phonemes: ['s', 'p', 'ŏ', 't'], soundUnits: ['s', 'p', 'o', 't'], decoys: ['stop', 'spin', 'plot'] },
    { word: 'plan', emoji: '🗺️', tier: 'g1', onset: 'pl', rime: 'an', tiles: ['p', 'l', 'a', 'n'], phonemes: ['p', 'l', 'ă', 'n'], soundUnits: ['p', 'l', 'a', 'n'], decoys: ['plum', 'plug', 'clap'] },
    { word: 'trip', emoji: '🧳', tier: 'g1', onset: 'tr', rime: 'ip', tiles: ['t', 'r', 'i', 'p'], phonemes: ['t', 'r', 'ĭ', 'p'], soundUnits: ['t', 'r', 'i', 'p'], decoys: ['trap', 'drip', 'grip'] },
    { word: 'skip', emoji: '🤸', tier: 'g1', onset: 'sk', rime: 'ip', tiles: ['s', 'k', 'i', 'p'], phonemes: ['s', 'k', 'ĭ', 'p'], soundUnits: ['s', 'k', 'i', 'p'], decoys: ['skin', 'slip', 'clip'] },
    { word: 'spin', emoji: '🌀', tier: 'g1', onset: 'sp', rime: 'in', tiles: ['s', 'p', 'i', 'n'], phonemes: ['s', 'p', 'ĭ', 'n'], soundUnits: ['s', 'p', 'i', 'n'], decoys: ['spot', 'twin', 'grin'] },
    { word: 'grin', emoji: '😁', tier: 'g1', onset: 'gr', rime: 'in', tiles: ['g', 'r', 'i', 'n'], phonemes: ['g', 'r', 'ĭ', 'n'], soundUnits: ['g', 'r', 'i', 'n'], decoys: ['grip', 'spin', 'twin'] },
    { word: 'twin', emoji: '👯', tier: 'g1', onset: 'tw', rime: 'in', tiles: ['t', 'w', 'i', 'n'], phonemes: ['t', 'w', 'ĭ', 'n'], soundUnits: ['t', 'w', 'i', 'n'], decoys: ['twig', 'grin', 'spin'] },
    { word: 'clip', emoji: '📎', tier: 'g1', onset: 'cl', rime: 'ip', tiles: ['c', 'l', 'i', 'p'], phonemes: ['k', 'l', 'ĭ', 'p'], soundUnits: ['c', 'l', 'i', 'p'], decoys: ['clap', 'flip', 'slip'] },
    { word: 'flip', emoji: '🥞', tier: 'g1', onset: 'fl', rime: 'ip', tiles: ['f', 'l', 'i', 'p'], phonemes: ['f', 'l', 'ĭ', 'p'], soundUnits: ['f', 'l', 'i', 'p'], decoys: ['flag', 'clip', 'slip'] },
    { word: 'stem', emoji: '🌿', tier: 'g1', onset: 'st', rime: 'em', tiles: ['s', 't', 'e', 'm'], phonemes: ['s', 't', 'ĕ', 'm'], soundUnits: ['s', 't', 'e', 'm'], decoys: ['step', 'stop', 'swim'] },
    { word: 'desk', emoji: '🪑', tier: 'g1', onset: 'd', rime: 'esk', tiles: ['d', 'e', 's', 'k'], phonemes: ['d', 'ĕ', 's', 'k'], soundUnits: ['d', 'e', 's', 'k'], decoys: ['dusk', 'disk', 'mask'] },
    { word: 'mask', emoji: '🎭', tier: 'g1', onset: 'm', rime: 'ask', tiles: ['m', 'a', 's', 'k'], phonemes: ['m', 'ă', 's', 'k'], soundUnits: ['m', 'a', 's', 'k'], decoys: ['milk', 'desk', 'task'] },
    { word: 'milk', emoji: '🥛', tier: 'g1', onset: 'm', rime: 'ilk', tiles: ['m', 'i', 'l', 'k'], phonemes: ['m', 'ĭ', 'l', 'k'], soundUnits: ['m', 'i', 'l', 'k'], decoys: ['silk', 'mint', 'mask'] },
    { word: 'jump', emoji: '🦘', tier: 'g1', onset: 'j', rime: 'ump', tiles: ['j', 'u', 'm', 'p'], phonemes: ['j', 'ŭ', 'm', 'p'], soundUnits: ['j', 'u', 'm', 'p'], decoys: ['bump', 'pump', 'lamp'] },
    { word: 'camp', emoji: '🏕️', tier: 'g1', onset: 'c', rime: 'amp', tiles: ['c', 'a', 'm', 'p'], phonemes: ['k', 'ă', 'm', 'p'], soundUnits: ['c', 'a', 'm', 'p'], decoys: ['lamp', 'damp', 'crab'] },
    { word: 'sand', emoji: '🏖️', tier: 'g1', onset: 's', rime: 'and', tiles: ['s', 'a', 'n', 'd'], phonemes: ['s', 'ă', 'n', 'd'], soundUnits: ['s', 'a', 'n', 'd'], decoys: ['hand', 'land', 'band'] },
    { word: 'pond', emoji: '🪷', tier: 'g1', onset: 'p', rime: 'ond', tiles: ['p', 'o', 'n', 'd'], phonemes: ['p', 'ŏ', 'n', 'd'], soundUnits: ['p', 'o', 'n', 'd'], decoys: ['fond', 'wind', 'sand'] },
    { word: 'wind', emoji: '💨', tier: 'g1', onset: 'w', rime: 'ind', tiles: ['w', 'i', 'n', 'd'], phonemes: ['w', 'ĭ', 'n', 'd'], soundUnits: ['w', 'i', 'n', 'd'], decoys: ['wing', 'pond', 'mint'] },
    { word: 'gift', emoji: '🎁', tier: 'g1', onset: 'g', rime: 'ift', tiles: ['g', 'i', 'f', 't'], phonemes: ['g', 'ĭ', 'f', 't'], soundUnits: ['g', 'i', 'f', 't'], decoys: ['lift', 'left', 'soft'] },
    { word: 'belt', emoji: '🥋', tier: 'g1', onset: 'b', rime: 'elt', tiles: ['b', 'e', 'l', 't'], phonemes: ['b', 'ĕ', 'l', 't'], soundUnits: ['b', 'e', 'l', 't'], decoys: ['melt', 'felt', 'best'] },

    // Grade 2 ('g2') — digraph, nasal ng, & FLSZ words
    { word: 'ship', emoji: '🚢', tier: 'g2', onset: 'sh', rime: 'ip', tiles: ['sh', 'i', 'p'], phonemes: ['sh', 'ĭ', 'p'], soundUnits: ['sh', 'i', 'p'], decoys: ['shop', 'chip', 'slip'] },
    { word: 'fish', emoji: '🐟', tier: 'g2', onset: 'f', rime: 'ish', tiles: ['f', 'i', 'sh'], phonemes: ['f', 'ĭ', 'sh'], soundUnits: ['f', 'i', 'sh'], decoys: ['dish', 'wish', 'fist'] },
    { word: 'shop', emoji: '🛍️', tier: 'g2', onset: 'sh', rime: 'op', tiles: ['sh', 'o', 'p'], phonemes: ['sh', 'ŏ', 'p'], soundUnits: ['sh', 'o', 'p'], decoys: ['ship', 'chop', 'stop'] },
    { word: 'chip', emoji: '🍟', tier: 'g2', onset: 'ch', rime: 'ip', tiles: ['ch', 'i', 'p'], phonemes: ['ch', 'ĭ', 'p'], soundUnits: ['ch', 'i', 'p'], decoys: ['chop', 'ship', 'clip'] },
    { word: 'chat', emoji: '💬', tier: 'g2', onset: 'ch', rime: 'at', tiles: ['ch', 'a', 't'], phonemes: ['ch', 'ă', 't'], soundUnits: ['ch', 'a', 't'], decoys: ['that', 'chap', 'flat'] },
    { word: 'chin', emoji: '😊', tier: 'g2', onset: 'ch', rime: 'in', tiles: ['ch', 'i', 'n'], phonemes: ['ch', 'ĭ', 'n'], soundUnits: ['ch', 'i', 'n'], decoys: ['thin', 'shin', 'spin'] },
    { word: 'bath', emoji: '🛁', tier: 'g2', onset: 'b', rime: 'ath', tiles: ['b', 'a', 'th'], phonemes: ['b', 'ă', 'th'], soundUnits: ['b', 'a', 'th'], decoys: ['path', 'math', 'bash'] },
    { word: 'moth', emoji: '🦋', tier: 'g2', onset: 'm', rime: 'oth', tiles: ['m', 'o', 'th'], phonemes: ['m', 'ŏ', 'th'], soundUnits: ['m', 'o', 'th'], decoys: ['math', 'moss', 'with'] },
    { word: 'duck', emoji: '🦆', tier: 'g2', onset: 'd', rime: 'uck', tiles: ['d', 'u', 'ck'], phonemes: ['d', 'ŭ', 'k'], soundUnits: ['d', 'u', 'ck'], decoys: ['luck', 'truck', 'dock'] },
    { word: 'lock', emoji: '🔒', tier: 'g2', onset: 'l', rime: 'ock', tiles: ['l', 'o', 'ck'], phonemes: ['l', 'ŏ', 'k'], soundUnits: ['l', 'o', 'ck'], decoys: ['rock', 'sock', 'lick'] },
    { word: 'ring', emoji: '💍', tier: 'g2', onset: 'r', rime: 'ing', tiles: ['r', 'i', 'ng'], phonemes: ['r', 'ĭ', 'ng'], soundUnits: ['r', 'i', 'ng'], decoys: ['king', 'sing', 'wing'] },
    { word: 'bell', emoji: '🔔', tier: 'g2', onset: 'b', rime: 'ell', tiles: ['b', 'e', 'll'], phonemes: ['b', 'ĕ', 'l'], soundUnits: ['b', 'e', 'll'], decoys: ['well', 'tell', 'ball'] },
    { word: 'dish', emoji: '🍽️', tier: 'g2', onset: 'd', rime: 'ish', tiles: ['d', 'i', 'sh'], phonemes: ['d', 'ĭ', 'sh'], soundUnits: ['d', 'i', 'sh'], decoys: ['fish', 'wish', 'dash'] },
    { word: 'wish', emoji: '🌠', tier: 'g2', onset: 'w', rime: 'ish', tiles: ['w', 'i', 'sh'], phonemes: ['w', 'ĭ', 'sh'], soundUnits: ['w', 'i', 'sh'], decoys: ['fish', 'dish', 'with'] },
    { word: 'chop', emoji: '🪓', tier: 'g2', onset: 'ch', rime: 'op', tiles: ['ch', 'o', 'p'], phonemes: ['ch', 'ŏ', 'p'], soundUnits: ['ch', 'o', 'p'], decoys: ['shop', 'chip', 'stop'] },
    { word: 'math', emoji: '➕', tier: 'g2', onset: 'm', rime: 'ath', tiles: ['m', 'a', 'th'], phonemes: ['m', 'ă', 'th'], soundUnits: ['m', 'a', 'th'], decoys: ['bath', 'path', 'moth'] },
    { word: 'path', emoji: '🥾', tier: 'g2', onset: 'p', rime: 'ath', tiles: ['p', 'a', 'th'], phonemes: ['p', 'ă', 'th'], soundUnits: ['p', 'a', 'th'], decoys: ['bath', 'math', 'pass'] },
    { word: 'shed', emoji: '🏚️', tier: 'g2', onset: 'sh', rime: 'ed', tiles: ['sh', 'e', 'd'], phonemes: ['sh', 'ĕ', 'd'], soundUnits: ['sh', 'e', 'd'], decoys: ['sled', 'ship', 'shell'] },
    { word: 'sock', emoji: '🧦', tier: 'g2', onset: 's', rime: 'ock', tiles: ['s', 'o', 'ck'], phonemes: ['s', 'ŏ', 'k'], soundUnits: ['s', 'o', 'ck'], decoys: ['rock', 'lock', 'sack'] },
    { word: 'rock', emoji: '🪨', tier: 'g2', onset: 'r', rime: 'ock', tiles: ['r', 'o', 'ck'], phonemes: ['r', 'ŏ', 'k'], soundUnits: ['r', 'o', 'ck'], decoys: ['sock', 'lock', 'rack'] },
    { word: 'king', emoji: '👑', tier: 'g2', onset: 'k', rime: 'ing', tiles: ['k', 'i', 'ng'], phonemes: ['k', 'ĭ', 'ng'], soundUnits: ['k', 'i', 'ng'], decoys: ['ring', 'sing', 'wing'] },
    { word: 'sing', emoji: '🎤', tier: 'g2', onset: 's', rime: 'ing', tiles: ['s', 'i', 'ng'], phonemes: ['s', 'ĭ', 'ng'], soundUnits: ['s', 'i', 'ng'], decoys: ['ring', 'king', 'wing'] },
    { word: 'wing', emoji: '🪽', tier: 'g2', onset: 'w', rime: 'ing', tiles: ['w', 'i', 'ng'], phonemes: ['w', 'ĭ', 'ng'], soundUnits: ['w', 'i', 'ng'], decoys: ['ring', 'king', 'wind'] },
    { word: 'song', emoji: '🎶', tier: 'g2', onset: 's', rime: 'ong', tiles: ['s', 'o', 'ng'], phonemes: ['s', 'ŏ', 'ng'], soundUnits: ['s', 'o', 'ng'], decoys: ['long', 'sing', 'gong'] },
    { word: 'ball', emoji: '⚽', tier: 'g2', onset: 'b', rime: 'all', tiles: ['b', 'a', 'll'], phonemes: ['b', 'aw', 'l'], soundUnits: ['b', 'au', 'll'], decoys: ['tall', 'wall', 'bell'] },
    { word: 'hill', emoji: '⛰️', tier: 'g2', onset: 'h', rime: 'ill', tiles: ['h', 'i', 'll'], phonemes: ['h', 'ĭ', 'l'], soundUnits: ['h', 'i', 'll'], decoys: ['fill', 'mill', 'hall'] },
    { word: 'doll', emoji: '🪆', tier: 'g2', onset: 'd', rime: 'oll', tiles: ['d', 'o', 'll'], phonemes: ['d', 'ŏ', 'l'], soundUnits: ['d', 'o', 'll'], decoys: ['ball', 'bell', 'roll'] },
    { word: 'moss', emoji: '🪴', tier: 'g2', onset: 'm', rime: 'oss', tiles: ['m', 'o', 'ss'], phonemes: ['m', 'ŏ', 's'], soundUnits: ['m', 'o', 'ss'], decoys: ['toss', 'moth', 'mess'] },
    { word: 'buzz', emoji: '🐝', tier: 'g2', onset: 'b', rime: 'uzz', tiles: ['b', 'u', 'zz'], phonemes: ['b', 'ŭ', 'z'], soundUnits: ['b', 'u', 'zz'], decoys: ['fuzz', 'jazz', 'bus'] },
    { word: 'whip', emoji: '🌪️', tier: 'g2', onset: 'wh', rime: 'ip', tiles: ['wh', 'i', 'p'], phonemes: ['wh', 'ĭ', 'p'], soundUnits: ['wh', 'i', 'p'], decoys: ['ship', 'chip', 'clip'] },
    { word: 'kick', emoji: '🦵', tier: 'g2', onset: 'k', rime: 'ick', tiles: ['k', 'i', 'ck'], phonemes: ['k', 'ĭ', 'k'], soundUnits: ['k', 'i', 'ck'], decoys: ['lick', 'pick', 'sick'] },
    { word: 'pack', emoji: '🎒', tier: 'g2', onset: 'p', rime: 'ack', tiles: ['p', 'a', 'ck'], phonemes: ['p', 'ă', 'k'], soundUnits: ['p', 'a', 'ck'], decoys: ['back', 'sack', 'pick'] },

    // Grade 3 ('g3') — VCe (Silent E) & R-controlled vowel words
    { word: 'cake', emoji: '🎂', tier: 'g3', onset: 'c', rime: 'ake', tiles: ['c', 'a', 'k', 'e'], phonemes: ['k', 'ā', 'k'], soundUnits: ['c', 'a_e', 'k'], decoys: ['bake', 'lake', 'make'] },
    { word: 'bike', emoji: '🚲', tier: 'g3', onset: 'b', rime: 'ike', tiles: ['b', 'i', 'k', 'e'], phonemes: ['b', 'ī', 'k'], soundUnits: ['b', 'i_e', 'k'], decoys: ['hike', 'like', 'bake'] },
    { word: 'kite', emoji: '🪁', tier: 'g3', onset: 'k', rime: 'ite', tiles: ['k', 'i', 't', 'e'], phonemes: ['k', 'ī', 't'], soundUnits: ['k', 'i_e', 't'], decoys: ['bite', 'kit', 'kate'] },
    { word: 'bone', emoji: '🦴', tier: 'g3', onset: 'b', rime: 'one', tiles: ['b', 'o', 'n', 'e'], phonemes: ['b', 'ō', 'n'], soundUnits: ['b', 'o_e', 'n'], decoys: ['cone', 'tone', 'done'] },
    { word: 'cube', emoji: '🧊', tier: 'g3', onset: 'c', rime: 'ube', tiles: ['c', 'u', 'b', 'e'], phonemes: ['k', 'yū', 'b'], soundUnits: ['c', 'u_e', 'b'], decoys: ['tube', 'cub', 'cute'] },
    { word: 'tape', emoji: '🩹', tier: 'g3', onset: 't', rime: 'ape', tiles: ['t', 'a', 'p', 'e'], phonemes: ['t', 'ā', 'p'], soundUnits: ['t', 'a_e', 'p'], decoys: ['cape', 'tap', 'take'] },
    { word: 'cape', emoji: '🦸', tier: 'g3', onset: 'c', rime: 'ape', tiles: ['c', 'a', 'p', 'e'], phonemes: ['k', 'ā', 'p'], soundUnits: ['c', 'a_e', 'p'], decoys: ['tape', 'cap', 'cake'] },
    { word: 'pine', emoji: '🌲', tier: 'g3', onset: 'p', rime: 'ine', tiles: ['p', 'i', 'n', 'e'], phonemes: ['p', 'ī', 'n'], soundUnits: ['p', 'i_e', 'n'], decoys: ['line', 'pin', 'fine'] },
    { word: 'star', emoji: '⭐', tier: 'g3', onset: 'st', rime: 'ar', tiles: ['s', 't', 'ar'], phonemes: ['s', 't', 'ar'], soundUnits: ['s', 't', 'ar'], decoys: ['scar', 'stir', 'stay'] },
    { word: 'bark', emoji: '🐕', tier: 'g3', onset: 'b', rime: 'ark', tiles: ['b', 'ar', 'k'], phonemes: ['b', 'ar', 'k'], soundUnits: ['b', 'ar', 'k'], decoys: ['park', 'dark', 'barn'] },
    { word: 'fork', emoji: '🍴', tier: 'g3', onset: 'f', rime: 'ork', tiles: ['f', 'or', 'k'], phonemes: ['f', 'or', 'k'], soundUnits: ['f', 'or', 'k'], decoys: ['cork', 'pork', 'fort'] },
    { word: 'corn', emoji: '🌽', tier: 'g3', onset: 'c', rime: 'orn', tiles: ['c', 'or', 'n'], phonemes: ['k', 'or', 'n'], soundUnits: ['c', 'or', 'n'], decoys: ['horn', 'born', 'cord'] },
    { word: 'bake', emoji: '🥐', tier: 'g3', onset: 'b', rime: 'ake', tiles: ['b', 'a', 'k', 'e'], phonemes: ['b', 'ā', 'k'], soundUnits: ['b', 'a_e', 'k'], decoys: ['cake', 'lake', 'make'] },
    { word: 'lake', emoji: '🏞️', tier: 'g3', onset: 'l', rime: 'ake', tiles: ['l', 'a', 'k', 'e'], phonemes: ['l', 'ā', 'k'], soundUnits: ['l', 'a_e', 'k'], decoys: ['cake', 'bake', 'make'] },
    { word: 'wave', emoji: '🌊', tier: 'g3', onset: 'w', rime: 'ave', tiles: ['w', 'a', 'v', 'e'], phonemes: ['w', 'ā', 'v'], soundUnits: ['w', 'a_e', 'v'], decoys: ['cave', 'save', 'gave'] },
    { word: 'cave', emoji: '🕳️', tier: 'g3', onset: 'c', rime: 'ave', tiles: ['c', 'a', 'v', 'e'], phonemes: ['k', 'ā', 'v'], soundUnits: ['c', 'a_e', 'v'], decoys: ['wave', 'save', 'cake'] },
    { word: 'game', emoji: '🎲', tier: 'g3', onset: 'g', rime: 'ame', tiles: ['g', 'a', 'm', 'e'], phonemes: ['g', 'ā', 'm'], soundUnits: ['g', 'a_e', 'm'], decoys: ['name', 'same', 'gate'] },
    { word: 'gate', emoji: '🚧', tier: 'g3', onset: 'g', rime: 'ate', tiles: ['g', 'a', 't', 'e'], phonemes: ['g', 'ā', 't'], soundUnits: ['g', 'a_e', 't'], decoys: ['late', 'mate', 'game'] },
    { word: 'time', emoji: '⏰', tier: 'g3', onset: 't', rime: 'ime', tiles: ['t', 'i', 'm', 'e'], phonemes: ['t', 'ī', 'm'], soundUnits: ['t', 'i_e', 'm'], decoys: ['dime', 'lime', 'tame'] },
    { word: 'dime', emoji: '🪙', tier: 'g3', onset: 'd', rime: 'ime', tiles: ['d', 'i', 'm', 'e'], phonemes: ['d', 'ī', 'm'], soundUnits: ['d', 'i_e', 'm'], decoys: ['time', 'lime', 'dive'] },
    { word: 'lime', emoji: '🍋', tier: 'g3', onset: 'l', rime: 'ime', tiles: ['l', 'i', 'm', 'e'], phonemes: ['l', 'ī', 'm'], soundUnits: ['l', 'i_e', 'm'], decoys: ['time', 'dime', 'line'] },
    { word: 'home', emoji: '🏠', tier: 'g3', onset: 'h', rime: 'ome', tiles: ['h', 'o', 'm', 'e'], phonemes: ['h', 'ō', 'm'], soundUnits: ['h', 'o_e', 'm'], decoys: ['cone', 'hope', 'bone'] },
    { word: 'cone', emoji: '🍦', tier: 'g3', onset: 'c', rime: 'one', tiles: ['c', 'o', 'n', 'e'], phonemes: ['k', 'ō', 'n'], soundUnits: ['c', 'o_e', 'n'], decoys: ['bone', 'tone', 'zone'] },
    { word: 'nose', emoji: '👃', tier: 'g3', onset: 'n', rime: 'ose', tiles: ['n', 'o', 's', 'e'], phonemes: ['n', 'ō', 'z'], soundUnits: ['n', 'o_e', 'z'], decoys: ['rose', 'hose', 'note'] },
    { word: 'rose', emoji: '🌹', tier: 'g3', onset: 'r', rime: 'ose', tiles: ['r', 'o', 's', 'e'], phonemes: ['r', 'ō', 'z'], soundUnits: ['r', 'o_e', 'z'], decoys: ['nose', 'hose', 'rope'] },
    { word: 'rope', emoji: '🪢', tier: 'g3', onset: 'r', rime: 'ope', tiles: ['r', 'o', 'p', 'e'], phonemes: ['r', 'ō', 'p'], soundUnits: ['r', 'o_e', 'p'], decoys: ['hope', 'rose', 'ripe'] },
    { word: 'barn', emoji: '🏚️', tier: 'g3', onset: 'b', rime: 'arn', tiles: ['b', 'ar', 'n'], phonemes: ['b', 'ar', 'n'], soundUnits: ['b', 'ar', 'n'], decoys: ['bark', 'yarn', 'farm'] },
    { word: 'farm', emoji: '🚜', tier: 'g3', onset: 'f', rime: 'arm', tiles: ['f', 'ar', 'm'], phonemes: ['f', 'ar', 'm'], soundUnits: ['f', 'ar', 'm'], decoys: ['harm', 'barn', 'form'] },
    { word: 'park', emoji: '🏞️', tier: 'g3', onset: 'p', rime: 'ark', tiles: ['p', 'ar', 'k'], phonemes: ['p', 'ar', 'k'], soundUnits: ['p', 'ar', 'k'], decoys: ['bark', 'dark', 'part'] },
    { word: 'cart', emoji: '🛒', tier: 'g3', onset: 'c', rime: 'art', tiles: ['c', 'ar', 't'], phonemes: ['k', 'ar', 't'], soundUnits: ['c', 'ar', 't'], decoys: ['part', 'dart', 'card'] },
    { word: 'horn', emoji: '📯', tier: 'g3', onset: 'h', rime: 'orn', tiles: ['h', 'or', 'n'], phonemes: ['h', 'or', 'n'], soundUnits: ['h', 'or', 'n'], decoys: ['corn', 'born', 'fork'] },
    { word: 'bird', emoji: '🐦', tier: 'g3', onset: 'b', rime: 'ird', tiles: ['b', 'ir', 'd'], phonemes: ['b', 'er', 'd'], soundUnits: ['b', 'ir', 'd'], decoys: ['girl', 'dirt', 'fern'] },
    { word: 'girl', emoji: '👧', tier: 'g3', onset: 'g', rime: 'irl', tiles: ['g', 'ir', 'l'], phonemes: ['g', 'er', 'l'], soundUnits: ['g', 'ir', 'l'], decoys: ['bird', 'curl', 'twirl'] },
    { word: 'surf', emoji: '🏄', tier: 'g3', onset: 's', rime: 'urf', tiles: ['s', 'ur', 'f'], phonemes: ['s', 'er', 'f'], soundUnits: ['s', 'ur', 'f'], decoys: ['turf', 'turn', 'burn'] },
    { word: 'fern', emoji: '🌿', tier: 'g3', onset: 'f', rime: 'ern', tiles: ['f', 'er', 'n'], phonemes: ['f', 'er', 'n'], soundUnits: ['f', 'er', 'n'], decoys: ['burn', 'turn', 'herd'] },

    // Grades 4–5 ('g4_5') — vowel-team & diphthong 4-letter words
    { word: 'rain', emoji: '🌧️', tier: 'g4_5', onset: 'r', rime: 'ain', tiles: ['r', 'ai', 'n'], phonemes: ['r', 'ā', 'n'], soundUnits: ['r', 'ai', 'n'], decoys: ['pain', 'train', 'ran'] },
    { word: 'tail', emoji: '🦊', tier: 'g4_5', onset: 't', rime: 'ail', tiles: ['t', 'ai', 'l'], phonemes: ['t', 'ā', 'l'], soundUnits: ['t', 'ai', 'l'], decoys: ['mail', 'sail', 'tall'] },
    { word: 'play', emoji: '🎮', tier: 'g4_5', onset: 'pl', rime: 'ay', tiles: ['p', 'l', 'ay'], phonemes: ['p', 'l', 'ā'], soundUnits: ['p', 'l', 'ay'], decoys: ['clay', 'stay', 'plan'] },
    { word: 'tree', emoji: '🌳', tier: 'g4_5', onset: 'tr', rime: 'ee', tiles: ['t', 'r', 'ee'], phonemes: ['t', 'r', 'ē'], soundUnits: ['t', 'r', 'ee'], decoys: ['free', 'three', 'try'] },
    { word: 'seed', emoji: '🌱', tier: 'g4_5', onset: 's', rime: 'eed', tiles: ['s', 'ee', 'd'], phonemes: ['s', 'ē', 'd'], soundUnits: ['s', 'ee', 'd'], decoys: ['feed', 'need', 'sled'] },
    { word: 'leaf', emoji: '🍃', tier: 'g4_5', onset: 'l', rime: 'eaf', tiles: ['l', 'ea', 'f'], phonemes: ['l', 'ē', 'f'], soundUnits: ['l', 'ea', 'f'], decoys: ['loaf', 'bead', 'left'] },
    { word: 'seal', emoji: '🦭', tier: 'g4_5', onset: 's', rime: 'eal', tiles: ['s', 'ea', 'l'], phonemes: ['s', 'ē', 'l'], soundUnits: ['s', 'ea', 'l'], decoys: ['meal', 'real', 'sail'] },
    { word: 'boat', emoji: '⛵', tier: 'g4_5', onset: 'b', rime: 'oat', tiles: ['b', 'oa', 't'], phonemes: ['b', 'ō', 't'], soundUnits: ['b', 'oa', 't'], decoys: ['coat', 'goat', 'boot'] },
    { word: 'goat', emoji: '🐐', tier: 'g4_5', onset: 'g', rime: 'oat', tiles: ['g', 'oa', 't'], phonemes: ['g', 'ō', 't'], soundUnits: ['g', 'oa', 't'], decoys: ['boat', 'coat', 'goal'] },
    { word: 'moon', emoji: '🌙', tier: 'g4_5', onset: 'm', rime: 'oon', tiles: ['m', 'oo', 'n'], phonemes: ['m', 'ū', 'n'], soundUnits: ['m', 'oo', 'n'], decoys: ['noon', 'spoon', 'moan'] },
    { word: 'book', emoji: '📖', tier: 'g4_5', onset: 'b', rime: 'ook', tiles: ['b', 'oo', 'k'], phonemes: ['b', 'ʊ', 'k'], soundUnits: ['b', 'oo_short', 'k'], decoys: ['look', 'cook', 'boot'] },
    { word: 'snow', emoji: '❄️', tier: 'g4_5', onset: 'sn', rime: 'ow', tiles: ['s', 'n', 'ow'], phonemes: ['s', 'n', 'ō'], soundUnits: ['s', 'n', 'ow'], decoys: ['slow', 'glow', 'show'] },
    { word: 'sail', emoji: '⛵', tier: 'g4_5', onset: 's', rime: 'ail', tiles: ['s', 'ai', 'l'], phonemes: ['s', 'ā', 'l'], soundUnits: ['s', 'ai', 'l'], decoys: ['tail', 'mail', 'seal'] },
    { word: 'mail', emoji: '✉️', tier: 'g4_5', onset: 'm', rime: 'ail', tiles: ['m', 'ai', 'l'], phonemes: ['m', 'ā', 'l'], soundUnits: ['m', 'ai', 'l'], decoys: ['tail', 'sail', 'nail'] },
    { word: 'clay', emoji: '🏺', tier: 'g4_5', onset: 'cl', rime: 'ay', tiles: ['c', 'l', 'ay'], phonemes: ['k', 'l', 'ā'], soundUnits: ['c', 'l', 'ay'], decoys: ['play', 'tray', 'stay'] },
    { word: 'tray', emoji: '🍽️', tier: 'g4_5', onset: 'tr', rime: 'ay', tiles: ['t', 'r', 'ay'], phonemes: ['t', 'r', 'ā'], soundUnits: ['t', 'r', 'ay'], decoys: ['play', 'clay', 'tree'] },
    { word: 'team', emoji: '🤝', tier: 'g4_5', onset: 't', rime: 'eam', tiles: ['t', 'ea', 'm'], phonemes: ['t', 'ē', 'm'], soundUnits: ['t', 'ea', 'm'], decoys: ['beam', 'read', 'tame'] },
    { word: 'read', emoji: '📚', tier: 'g4_5', onset: 'r', rime: 'ead', tiles: ['r', 'ea', 'd'], phonemes: ['r', 'ē', 'd'], soundUnits: ['r', 'ea', 'd'], decoys: ['seed', 'lead', 'road'] },
    { word: 'coat', emoji: '🧥', tier: 'g4_5', onset: 'c', rime: 'oat', tiles: ['c', 'oa', 't'], phonemes: ['k', 'ō', 't'], soundUnits: ['c', 'oa', 't'], decoys: ['boat', 'goat', 'cart'] },
    { word: 'road', emoji: '🛣️', tier: 'g4_5', onset: 'r', rime: 'oad', tiles: ['r', 'oa', 'd'], phonemes: ['r', 'ō', 'd'], soundUnits: ['r', 'oa', 'd'], decoys: ['toad', 'load', 'read'] },
    { word: 'toad', emoji: '🐸', tier: 'g4_5', onset: 't', rime: 'oad', tiles: ['t', 'oa', 'd'], phonemes: ['t', 'ō', 'd'], soundUnits: ['t', 'oa', 'd'], decoys: ['road', 'boat', 'told'] },
    { word: 'soap', emoji: '🧼', tier: 'g4_5', onset: 's', rime: 'oap', tiles: ['s', 'oa', 'p'], phonemes: ['s', 'ō', 'p'], soundUnits: ['s', 'oa', 'p'], decoys: ['boat', 'soup', 'shop'] },
    { word: 'glow', emoji: '✨', tier: 'g4_5', onset: 'gl', rime: 'ow', tiles: ['g', 'l', 'ow'], phonemes: ['g', 'l', 'ō'], soundUnits: ['g', 'l', 'ow'], decoys: ['snow', 'slow', 'grow'] },
    { word: 'grow', emoji: '🌱', tier: 'g4_5', onset: 'gr', rime: 'ow', tiles: ['g', 'r', 'ow'], phonemes: ['g', 'r', 'ō'], soundUnits: ['g', 'r', 'ow'], decoys: ['glow', 'snow', 'crow'] },
    { word: 'pool', emoji: '🏊', tier: 'g4_5', onset: 'p', rime: 'ool', tiles: ['p', 'oo', 'l'], phonemes: ['p', 'ū', 'l'], soundUnits: ['p', 'oo', 'l'], decoys: ['cool', 'tool', 'pole'] },
    { word: 'food', emoji: '🍲', tier: 'g4_5', onset: 'f', rime: 'ood', tiles: ['f', 'oo', 'd'], phonemes: ['f', 'ū', 'd'], soundUnits: ['f', 'oo', 'd'], decoys: ['wood', 'mood', 'foot'] },
    { word: 'wood', emoji: '🪵', tier: 'g4_5', onset: 'w', rime: 'ood', tiles: ['w', 'oo', 'd'], phonemes: ['w', 'ʊ', 'd'], soundUnits: ['w', 'oo_short', 'd'], decoys: ['food', 'hood', 'book'] },
    { word: 'foot', emoji: '🦶', tier: 'g4_5', onset: 'f', rime: 'oot', tiles: ['f', 'oo', 't'], phonemes: ['f', 'ʊ', 't'], soundUnits: ['f', 'oo_short', 't'], decoys: ['boot', 'book', 'food'] },
    { word: 'coin', emoji: '🪙', tier: 'g4_5', onset: 'c', rime: 'oin', tiles: ['c', 'oi', 'n'], phonemes: ['k', 'oi', 'n'], soundUnits: ['c', 'oi', 'n'], decoys: ['join', 'corn', 'cone'] },
    { word: 'loud', emoji: '📢', tier: 'g4_5', onset: 'l', rime: 'oud', tiles: ['l', 'ou', 'd'], phonemes: ['l', 'ou', 'd'], soundUnits: ['l', 'ou', 'd'], decoys: ['cloud', 'proud', 'load'] },
    { word: 'hawk', emoji: '🦅', tier: 'g4_5', onset: 'h', rime: 'awk', tiles: ['h', 'aw', 'k'], phonemes: ['h', 'aw', 'k'], soundUnits: ['h', 'aw', 'k'], decoys: ['claw', 'draw', 'hook'] },
    { word: 'gold', emoji: '🏅', tier: 'g4_5', onset: 'g', rime: 'old', tiles: ['g', 'o', 'l', 'd'], phonemes: ['g', 'ō', 'l', 'd'], soundUnits: ['g', 'o_e', 'l', 'd'], decoys: ['cold', 'bold', 'goat'] }
  ];

  const WORD_MEANINGS = {
    // K
    cat: 'A furry pet that says meow!',
    dog: 'A friendly pet that barks and wags its tail!',
    sun: 'The bright warm star shining in the sky!',
    pig: 'A pink farm animal that says oink!',
    hat: 'Something you wear on your head!',
    bed: 'A cozy place where you sleep at night!',
    bus: 'A big vehicle that carries many kids to school!',
    fox: 'A clever wild animal with a bushy orange tail!',
    cup: 'A small container you drink water or juice from!',
    bug: 'A tiny crawling or flying insect!',
    map: 'A picture guide that shows where places are!',
    net: 'A mesh woven tool used to catch insects or score goals!',
    bat: 'A flying night mammal, or a stick used in baseball!',
    rat: 'A small furry rodent with a long tail!',
    mat: 'A small flat rug placed on the floor!',
    log: 'A thick piece of wood from a fallen tree!',
    fog: 'A thick cloud sitting close to the ground!',
    wig: 'Fake hair worn on top of the head!',
    dig: 'To scoop a hole in dirt or sand!',
    bun: 'A round soft bread roll!',
    run: 'To move very fast using your legs!',
    hug: 'Squeezing someone warmly with both arms!',
    mug: 'A sturdy cup with a handle for warm drinks!',
    rug: 'A soft woven floor covering!',
    hen: 'A female chicken that lays eggs!',
    pen: 'A writing tool filled with ink!',
    ten: 'The counting number right after nine!',
    red: 'The bright color of strawberries and fire trucks!',
    web: 'A silky trap spun by a spider!',
    jet: 'A super-fast airplane!',
    box: 'A square container with flat sides!',
    van: 'A boxy vehicle with room for passengers or cargo!',
    pan: 'A flat metal pot used for cooking food!',
    fan: 'A device that blows cool air!',
    cap: 'A soft hat with a curved brim in front!',
    nap: 'A short daytime sleep!',
    pot: 'A deep round metal vessel used for cooking soup!',
    hot: 'Having a very high temperature!',
    mop: 'A long-handled tool for washing floors!',
    hop: 'To jump forward on one or two feet!',
    jam: 'Sweet fruit spread made for toast!',
    zip: 'To fasten a jacket using metal or plastic teeth!',
    tub: 'A wide basin for holding water or taking a bath!',
    cub: 'A baby bear, lion, or fox!',
    nut: 'A crunchy seed inside a hard shell!',
    mud: 'Wet, soft, squishy dirt!',
    // G1
    frog: 'A green hopper that jumps and says ribbit!',
    crab: 'A sea creature with a hard shell and two claws!',
    drum: 'A musical instrument you tap to make a beat!',
    flag: 'A colorful cloth banner that waves in the wind!',
    clap: 'Striking your two hands together to make a sound!',
    swim: 'Moving through water using your arms and legs!',
    stop: 'To freeze and quit moving right away!',
    plum: 'A sweet, juicy purple fruit!',
    lamp: 'A light you turn on to brighten a room!',
    tent: 'A cozy cloth shelter you set up for camping!',
    hand: 'The part at the end of your arm with five fingers!',
    nest: 'A cozy bowl made of twigs where birds lay eggs!',
    sled: 'A flat board with runners for sliding over snow!',
    snap: 'A crisp click sound made with your fingers!',
    drop: 'A tiny bead of liquid, or letting something fall!',
    step: 'Lifting and placing your foot forward to walk or climb!',
    spot: 'A small round dot, or a particular place!',
    plan: 'A careful idea for how to do something!',
    trip: 'A journey or visit to another place!',
    skip: 'A bouncy hop-and-step movement!',
    spin: 'To twirl round and round in a circle!',
    grin: 'A big happy smile showing teeth!',
    twin: 'One of two siblings born at the exact same time!',
    clip: 'A small clasp that holds papers together!',
    flip: 'To turn something upside down quickly!',
    stem: 'The tall green stalk holding up a flower!',
    desk: 'A table with drawers where students write and study!',
    mask: 'A covering worn over the face for a costume or safety!',
    milk: 'A creamy white drink rich in calcium!',
    jump: 'Pushing off the ground with both feet into the air!',
    camp: 'Staying outdoors in the woods or mountains!',
    sand: 'Tiny loose grains covering a beach or desert!',
    pond: 'A small calm body of fresh water!',
    wind: 'Moving air blowing across the sky!',
    gift: 'A wrapped present given to someone special!',
    belt: 'A strap worn around the waist!',
    // G2
    ship: 'A large boat that sails across deep oceans!',
    fish: 'An animal with fins and gills that lives in water!',
    shop: 'A store where people buy things they need!',
    chip: 'A crunchy snack or a tiny piece of something!',
    chat: 'A friendly talk between people!',
    chin: 'The bottom front part of your face below your mouth!',
    bath: 'Washing yourself in warm water!',
    moth: 'A winged insect that loves flying near lights at night!',
    duck: 'A water bird with webbed feet that says quack!',
    lock: 'A clasp that keeps a door or box safely closed!',
    ring: 'A shiny round band worn on a finger!',
    bell: 'A hollow metal cup that chimes when tapped!',
    dish: 'A shallow plate or bowl for serving food!',
    wish: 'Hoping strongly for something wonderful to happen!',
    chop: 'To cut something into smaller pieces!',
    math: 'Studying numbers, shapes, and adding!',
    path: 'A narrow trail made for walking!',
    shed: 'A small outdoor building for storing garden tools!',
    sock: 'A soft cloth covering worn on your foot!',
    rock: 'A hard solid stone from the earth!',
    king: 'A male ruler who wears a royal crown!',
    sing: 'Making musical sounds with your voice!',
    wing: 'A feathered limb that helps a bird fly!',
    song: 'A short piece of music with words to hum or chant!',
    ball: 'A round bouncy toy used in sports!',
    hill: 'A raised mound of land smaller than a mountain!',
    doll: 'A small toy shaped like a person!',
    moss: 'Soft green velvety plants growing on damp rocks!',
    buzz: 'The humming sound a bee makes!',
    whip: 'A quick snapping motion or kitchen whisking action!',
    kick: 'Striking something swiftly with your foot!',
    pack: 'A bag carried on the back, or putting items together!',
    // G3
    cake: 'A sweet baked treat often topped with frosting!',
    bike: 'A two-wheeled ride powered by your pedals!',
    kite: 'A light toy that flies high in the air on a string!',
    bone: 'A hard white part inside a skeleton!',
    cube: 'A 3D box shape with six equal square faces!',
    tape: 'A sticky strip used to hold paper or gifts together!',
    cape: 'A flowing cloth worn on the shoulders like a hero!',
    pine: 'An evergreen tree with needles and cones!',
    star: 'A glowing ball of light twinkling in outer space!',
    bark: 'The sound a dog makes, or the outer cover of a tree!',
    fork: 'A tool with prongs used for picking up food!',
    corn: 'A tall plant with sweet yellow kernels on a cob!',
    bake: 'To cook bread, cookies, or pastries in an oven!',
    lake: 'A large body of fresh water surrounded by land!',
    wave: 'A rolling swell of ocean water, or moving your hand hello!',
    cave: 'A natural hollow chamber inside a rock or hillside!',
    game: 'An activity with rules played for fun!',
    gate: 'A hinged door in a fence or wall!',
    time: 'What clocks and calendars measure in seconds and hours!',
    dime: 'A small silver coin worth ten cents!',
    lime: 'A small, tart, bright green citrus fruit!',
    home: 'The cozy place where a family lives!',
    cone: 'A 3D shape with a flat circle base and a pointy tip!',
    nose: 'The part of your face used for smelling and breathing!',
    rose: 'A fragrant garden flower with soft petals and thorns!',
    rope: 'A strong thick cord made of twisted fibers!',
    barn: 'A large farm building for animals and hay!',
    farm: 'Land where crops are grown and animals are raised!',
    park: 'A green public area with swings, paths, and trees!',
    cart: 'A wheeled basket pushed at a grocery store!',
    horn: 'A brass instrument, or a hard point on an animal’s head!',
    bird: 'A feathered creature with wings that lays eggs!',
    girl: 'A young female child!',
    surf: 'Riding ocean waves on a board!',
    fern: 'A leafy green plant with feathery fronds!',
    // G4-5
    rain: 'Water drops falling down from clouds in the sky!',
    tail: 'The wagging back part of an animal’s body!',
    play: 'Having fun with games, toys, or friends!',
    tree: 'A tall plant with a wooden trunk, branches, and leaves!',
    seed: 'A tiny plant baby that grows into a flower!',
    leaf: 'A flat green part growing on a branch!',
    seal: 'A playful ocean mammal with flippers!',
    boat: 'A small vessel that floats and travels on water!',
    goat: 'A horned farm animal that loves to climb and munch!',
    moon: 'The bright round neighbor that orbits Earth at night!',
    book: 'Pages filled with stories or facts to read!',
    snow: 'Soft white ice crystals that drift down in winter!',
    sail: 'A large cloth sheet that catches wind on a vessel!',
    mail: 'Letters and packages delivered to your door!',
    clay: 'Soft, moldable earth used to sculpt pottery!',
    tray: 'A flat board with a rim used for carrying dishes!',
    team: 'A group of players working together toward a goal!',
    read: 'Looking at written words and understanding them!',
    coat: 'A warm outer jacket worn in cold weather!',
    road: 'A paved path built for cars and bikes to travel!',
    toad: 'A bumpy-skinned amphibian related to frogs!',
    soap: 'Bubbly bars or liquid used to wash hands clean!',
    glow: 'To shine with a steady, gentle light!',
    grow: 'To become taller, larger, or older over time!',
    pool: 'A basin filled with water for swimming!',
    food: 'Nourishing things people and animals eat for energy!',
    wood: 'Hard fibrous material from trunks and branches!',
    foot: 'The bottom part of your leg that stands on the ground!',
    coin: 'A flat round piece of metal money!',
    loud: 'Making a strong, noisy sound!',
    hawk: 'A sharp-eyed bird of prey with curved talons!',
    gold: 'A precious shiny yellow metal!',
    // Extra Magic-E pairs
    tap: 'A gentle hit, or a faucet where water comes out!',
    kit: 'A container holding tools or supplies!',
    pin: 'A tiny sharp needle used to hold cloth or notes!',
    mad: 'Feeling very angry or upset!',
    tube: 'A long hollow cylinder or pipe!',
    hope: 'Wishing and believing something good will happen!',
    made: 'Built or created something!',
    can: 'A metal container, or being able to do something!',
    cane: 'A sturdy walking stick!',
    man: 'A grown-up male person!',
    mane: 'The long fluffy hair around a lion’s head!',
    pane: 'A clear sheet of glass inside a window!',
    huge: 'Super giant and very big!',
    not: 'A word that means zero or no!',
    note: 'A short written message or a musical sound!',
    fin: 'A flat wing-like part that steers in water!',
    fine: 'Feeling great, or very thin and neat!',
    cut: 'To divide something with scissors or a knife!',
    cute: 'Adorable, sweet, and lovely!',
    rip: 'To tear paper or cloth apart!',
    ripe: 'Fruit that is fully grown and sweet to eat!',
    plane: 'An aircraft with wings that flies through the sky!'
  };

  // Extended K–8 Word Builder Bank: [word, emoji, tier, clue]
  // Carefully curated for K-1 through Grade 8; clues NEVER contain the target word.
  const EXTENDED_BUILDER_RAW = [
    // Kindergarten extra ('k')
    ['ant', '🐜', 'k', 'A tiny six-legged insect that lives in an underground colony!'],
    ['bee', '🐝', 'k', 'A buzzing yellow-and-black insect that makes honey!'],
    ['cow', '🐄', 'k', 'A spotted farm animal that gives milk and says moo!'],
    ['owl', '🦉', 'k', 'A wise night bird with big round eyes that says hoot!'],
    ['egg', '🥚', 'k', 'An oval shell laid by birds and chickens!'],
    ['ice', '🧊', 'k', 'Frozen solid water that feels super cold!'],
    ['pie', '🥧', 'k', 'A baked dessert with sweet fruit inside a flaky crust!'],
    ['tie', '👔', 'k', 'A ribbon of cloth worn around a shirt collar, or to knot laces!'],
    ['key', '🔑', 'k', 'A notched metal tool that unlocks a door!'],
    ['toy', '🧸', 'k', 'Something fun you play with!'],
    ['boy', '👦', 'k', 'A young male child!'],
    ['joy', '😄', 'k', 'A feeling of pure happiness!'],
    ['sky', '🌌', 'k', 'The wide blue space above Earth where clouds float!'],
    ['fly', '🪰', 'k', 'To soar through the air with wings!'],
    ['cry', '😢', 'k', 'Letting tears fall when feeling sad!'],
    ['dry', '🏜️', 'k', 'Completely free of water or moisture!'],
    ['bag', '🛍️', 'k', 'A soft sack with handles for carrying items!'],
    ['tag', '🏷️', 'k', 'A small label, or a running chase game!'],
    ['wag', '🐕', 'k', 'Moving a tail happily back and forth!'],
    ['rag', '🧽', 'k', 'A small piece of cloth used for wiping!'],
    ['ham', '🍖', 'k', 'Savory sliced meat often served in sandwiches!'],
    ['yam', '🍠', 'k', 'A sweet orange root vegetable!'],
    ['ram', '🐏', 'k', 'A male sheep with curved horns!'],
    ['dam', '🦫', 'k', 'A wall built across a stream by beavers or engineers!'],
    ['lip', '👄', 'k', 'The soft pink edge around your mouth!'],
    ['sip', '🥤', 'k', 'To drink a tiny mouthful slowly!'],
    ['tip', '✏️', 'k', 'The pointed end of a pencil or mountain!'],
    ['dip', '🥣', 'k', 'A creamy sauce for dunking crunchy snacks!'],
    ['sit', '🪑', 'k', 'To rest your body on a chair!'],
    ['hit', '⚾', 'k', 'To strike a ball with a wooden stick!'],
    ['bit', '🧩', 'k', 'A very small piece of something!'],
    ['fit', '👟', 'k', 'Being the exact right size!'],
    ['win', '🏆', 'k', 'To finish in first place in a race or contest!'],
    ['bin', '🗑️', 'k', 'A container for holding toys or recycling!'],
    ['wet', '💦', 'k', 'Soaked or covered with water!'],
    ['pet', '🐾', 'k', 'A friendly tame animal cared for at home!'],
    ['vet', '🩺', 'k', 'An animal doctor who helps sick pets!'],
    ['pop', '🍿', 'k', 'A sudden crisp bursting sound!'],
    ['top', '🔝', 'k', 'The highest point, or a spinning toy!'],
    ['dot', '⚫', 'k', 'A tiny round spot!'],
    ['cot', '🛏️', 'k', 'A small folding sleeping frame!'],
    ['pod', '🫛', 'k', 'A green case holding peas or beans!'],
    ['rod', '🎣', 'k', 'A long slender pole used for fishing!'],
    ['nod', '🙂', 'k', 'Moving your head up and down to mean yes!'],
    ['sub', '🥪', 'k', 'A long sandwich, or a boat that dives underwater!'],
    ['hut', '🛖', 'k', 'A small simple shelter made of wood or thatch!'],
    ['gum', '🫧', 'k', 'Chewy sweet candy you can blow into bubbles!'],
    ['gem', '💎', 'k', 'A sparkling cut jewel or precious stone!'],
    ['mix', '🥣', 'k', 'To stir ingredients together!'],
    ['six', '6️⃣', 'k', 'The counting number between five and seven!'],
    ['fix', '🔧', 'k', 'To repair something that is broken!'],
    ['wax', '🕯️', 'k', 'Smooth material used to make candles!'],
    ['jar', '🫙', 'k', 'A glass container with a screw-on lid!'],
    ['car', '🚗', 'k', 'A four-wheeled vehicle that drives on roads!'],
    ['arm', '💪', 'k', 'The upper limb connecting your shoulder to your hand!'],
    ['art', '🎨', 'k', 'Drawing, painting, or sculpting creative works!'],

    // Grade 1 extra ('g1')
    ['glad', '😊', 'g1', 'Feeling happy and thankful!'],
    ['grab', '🤏', 'g1', 'To reach out and take hold quickly!'],
    ['slam', '🚪', 'g1', 'To shut a door loudly with force!'],
    ['twig', '🌿', 'g1', 'A thin little woody branch on a tree!'],
    ['crib', '👶', 'g1', 'A small baby bed with tall side rails!'],
    ['drip', '💧', 'g1', 'Water falling one tiny drop at a time!'],
    ['grip', '✊', 'g1', 'A firm tight hold with your hand!'],
    ['trap', '🪤', 'g1', 'A clever device built to catch something!'],
    ['flap', '🐦', 'g1', 'To wave wings up and down in the air!'],
    ['flat', '📏', 'g1', 'Smooth and level with no bumps!'],
    ['snug', '🧣', 'g1', 'Warm, cozy, and fitting nicely!'],
    ['plug', '🔌', 'g1', 'Prongs pushed into a wall outlet for power!'],
    ['slug', '🐌', 'g1', 'A slow soft garden creature like a snail without a shell!'],
    ['plus', '➕', 'g1', 'The math sign that means add together!'],
    ['help', '🤝', 'g1', 'Doing something kind to make another person’s job easier!'],
    ['felt', '🧶', 'g1', 'Soft pressed fabric used for crafts!'],
    ['silk', '🎀', 'g1', 'Smooth, shiny thread spun by caterpillars!'],
    ['tusk', '🐘', 'g1', 'A long curved ivory tooth on an elephant or walrus!'],
    ['dusk', '🌆', 'g1', 'The dim twilight time right after sunset!'],
    ['vest', '🦺', 'g1', 'A sleeveless jacket worn over a shirt!'],
    ['fast', '⚡', 'g1', 'Moving at very high speed!'],
    ['last', '🏁', 'g1', 'Coming at the very end!'],
    ['past', '⏳', 'g1', 'Time that already happened before today!'],
    ['best', '🥇', 'g1', 'Better than all the rest!'],
    ['rest', '😌', 'g1', 'Taking a quiet break to relax!'],
    ['test', '📝', 'g1', 'A quiz that checks what you have learned!'],
    ['west', '🧭', 'g1', 'The compass direction where the sun goes down!'],
    ['fist', '✊', 'g1', 'A hand with all fingers curled tightly shut!'],
    ['list', '📋', 'g1', 'Items written down one after another!'],
    ['mist', '🌫️', 'g1', 'Tiny floating droplets of water in cool air!'],
    ['dust', '🧹', 'g1', 'Tiny dry specks of dirt floating in the air!'],
    ['rust', '⛓️', 'g1', 'Reddish-orange flakes on wet iron!'],
    ['pink', '🩷', 'g1', 'A light rosy color mixed from red and white!'],
    ['sink', '🚰', 'g1', 'A basin with a faucet, or to go under water!'],
    ['wink', '😉', 'g1', 'Quickly closing and opening just one eye!'],
    ['tank', '🐠', 'g1', 'A clear glass container holding water for fish!'],
    ['bank', '🏦', 'g1', 'A safe building where people keep money!'],
    ['mint', '🌿', 'g1', 'A cool, fresh-smelling green herb!'],
    ['land', '🏝️', 'g1', 'Solid ground on Earth that is not ocean!'],
    ['band', '🎸', 'g1', 'A group of musicians playing together!'],
    ['bump', '🤕', 'g1', 'A raised lump, or knocking gently into something!'],
    ['pump', '⛽', 'g1', 'A machine that pushes air or water through a tube!'],
    ['lift', '🏋️', 'g1', 'To raise something heavy upward!'],
    ['melt', '🫠', 'g1', 'Turning from solid ice into liquid water when warm!'],
    ['soft', '☁️', 'g1', 'Gentle and squishy to touch, not hard!'],
    ['left', '⬅️', 'g1', 'The opposite side of right!'],
    ['raft', '🪵', 'g1', 'A flat floating platform made of tied logs!'],
    ['golf', '⛳', 'g1', 'A sport where players tap a tiny white ball into a hole!'],
    ['wolf', '🐺', 'g1', 'A wild canine that hunts in packs and howls!'],
    ['plum', '🫐', 'g1', 'A sweet dark purple orchard fruit!'],
    ['club', '♣️', 'g1', 'A group of friends who share a hobby!'],
    ['spin', '🌀', 'g1', 'Turning round and round rapidly!'],
    ['crab', '🦀', 'g1', 'An ocean crustacean that walks sideways!'],

    // Grade 2 extra ('g2')
    ['thin', '🥢', 'g2', 'Narrow from side to side, not wide!'],
    ['thick', '📕', 'g2', 'Wide from front to back, like a big encyclopedia!'],
    ['check', '✅', 'g2', 'To look carefully to be sure something is right!'],
    ['chest', '🧰', 'g2', 'A strong wooden box for storing treasures!'],
    ['chick', '🐥', 'g2', 'A fluffy baby chicken!'],
    ['chill', '🥶', 'g2', 'A sudden cold feeling in the air!'],
    ['shell', '🐚', 'g2', 'The hard outer home of a snail or clam!'],
    ['shock', '⚡', 'g2', 'A sudden jolt or big surprise!'],
    ['wheel', '🛞', 'g2', 'A round rim that rolls on an axle!'],
    ['whale', '🐳', 'g2', 'A giant ocean mammal that breathes through a blowhole!'],
    ['white', '⬜', 'g2', 'The bright color of fresh snow and clouds!'],
    ['clock', '🕰️', 'g2', 'A machine that shows hours and minutes!'],
    ['truck', '🚚', 'g2', 'A large motor vehicle built for hauling cargo!'],
    ['block', '🧱', 'g2', 'A solid wooden or plastic cube for building towers!'],
    ['stick', '🪵', 'g2', 'A thin fallen branch from a tree!'],
    ['brick', '🧱', 'g2', 'A hard baked clay rectangle used to build walls!'],
    ['pick', '⛏️', 'g2', 'To choose one item, or pluck fruit!'],
    ['sick', '🤒', 'g2', 'Not feeling healthy, needing rest!'],
    ['back', '🔙', 'g2', 'The rear side of something!'],
    ['sack', '💰', 'g2', 'A large sturdy bag made of cloth or paper!'],
    ['snack', '🥨', 'g2', 'A small tasty bite eaten between meals!'],
    ['track', '🛤️', 'g2', 'Parallel metal rails that trains roll along!'],
    ['long', '📏', 'g2', 'Measuring a great distance from end to end!'],
    ['strong', '💪', 'g2', 'Having great power and muscle!'],
    ['swing', '🛝', 'g2', 'A hanging playground seat that sways back and forth!'],
    ['bring', '🎁', 'g2', 'To carry something with you to a place!'],
    ['thing', '🧩', 'g2', 'An object or item you can see or touch!'],
    ['tall', '🦒', 'g2', 'Measuring high from bottom to top!'],
    ['wall', '🧱', 'g2', 'An upright solid barrier dividing a room!'],
    ['fall', '🍂', 'g2', 'The autumn season when leaves drop!'],
    ['hall', '🏫', 'g2', 'A long corridor inside a school or house!'],
    ['fill', '🥛', 'g2', 'Pouring until a container reaches the top!'],
    ['mill', '🌾', 'g2', 'A building where grain is ground into flour!'],
    ['grass', '🌿', 'g2', 'Short green blades covering a lawn or field!'],
    ['glass', '🥛', 'g2', 'Clear breakable material used for windows and cups!'],
    ['class', '🏫', 'g2', 'A group of students learning together!'],
    ['jazz', '🎷', 'g2', 'Lively rhythmic music often played on horns!'],
    ['puff', '💨', 'g2', 'A soft quick burst of air or smoke!'],
    ['stuff', '🧸', 'g2', 'Various items or belongings packed inside!'],
    ['cliff', '⛰️', 'g2', 'A very steep high wall of rock!'],
    ['fluff', '☁️', 'g2', 'Light airy softness like cotton!'],
    ['brush', '🖌️', 'g2', 'Bristles on a handle for painting or tidying hair!'],
    ['crash', '💥', 'g2', 'A loud banging collision!'],
    ['flash', '📸', 'g2', 'A sudden brief burst of bright light!'],
    ['trash', '🗑️', 'g2', 'Waste items thrown away into a bin!'],
    ['bench', '🪑', 'g2', 'A long seat for two or more people!'],
    ['lunch', '🥪', 'g2', 'The midday meal eaten around noon!'],
    ['bunch', '🍇', 'g2', 'Several items growing or grouped together!'],
    ['crunch', '🥕', 'g2', 'The crisp sound of biting an apple or carrot!'],
    ['tooth', '🦷', 'g2', 'A hard white part inside your mouth for chewing!'],
    ['thumb', '👍', 'g2', 'The short thick finger on the side of your hand!'],
    ['cloth', '🧣', 'g2', 'Woven fabric used to sew clothes!'],
    ['quack', '🦆', 'g2', 'The loud sound a duck makes!'],
    ['quick', '⚡', 'g2', 'Happening rapidly in very little time!'],
    ['queen', '👸', 'g2', 'A female monarch who rules a kingdom!'],
    ['phone', '📱', 'g2', 'A device used to call or message people!'],
    ['photo', '📷', 'g2', 'A picture captured by a camera!'],

    // Grade 3 extra ('g3')
    ['make', '🛠️', 'g3', 'To build or create something new!'],
    ['snake', '🐍', 'g3', 'A long scaly reptile with no legs!'],
    ['flame', '🔥', 'g3', 'The bright glowing tongue of a fire!'],
    ['grape', '🍇', 'g3', 'A sweet round fruit that grows in bunches!'],
    ['shape', '🔷', 'g3', 'The outline or form of a circle, square, or triangle!'],
    ['plate', '🍽️', 'g3', 'A flat round dish used to serve dinner!'],
    ['skate', '⛸️', 'g3', 'A shoe with blades or wheels for gliding!'],
    ['save', '💾', 'g3', 'To rescue, or keep something safely for later!'],
    ['name', '🏷️', 'g3', 'The special word a person or pet is called!'],
    ['line', '📏', 'g3', 'A long straight mark or row!'],
    ['nine', '9️⃣', 'g3', 'The counting number right before ten!'],
    ['shine', '✨', 'g3', 'To give off bright sparkling light!'],
    ['smile', '😊', 'g3', 'A happy curved grin on your face!'],
    ['slide', '🛝', 'g3', 'A smooth playground ramp to glide down!'],
    ['prize', '🏆', 'g3', 'An award won for doing great work!'],
    ['stone', '🪨', 'g3', 'A smooth or rough piece of mineral rock!'],
    ['globe', '🌍', 'g3', 'A round 3D sphere model of planet Earth!'],
    ['flute', '🪈', 'g3', 'A slender silver wind instrument played sideways!'],
    ['rule', '📏', 'g3', 'An instruction everyone agrees to follow!'],
    ['tune', '🎵', 'g3', 'A catchy musical melody!'],
    ['dark', '🌑', 'g3', 'Having very little or no light!'],
    ['shark', '🦈', 'g3', 'A fast ocean fish with sharp teeth and dorsal fin!'],
    ['spark', '✨', 'g3', 'A tiny bright flash of fire or electricity!'],
    ['smart', '🧠', 'g3', 'Clever and quick at solving puzzles!'],
    ['chart', '📊', 'g3', 'A visual diagram showing data clearly!'],
    ['yard', '🏡', 'g3', 'Grass space around a house, or three feet!'],
    ['card', '🃏', 'g3', 'A stiff piece of paper with a greeting or game symbol!'],
    ['hard', '🪨', 'g3', 'Solid and firm, not easy to bend!'],
    ['thorn', '🌹', 'g3', 'A sharp pointed spine on a stem!'],
    ['storm', '⛈️', 'g3', 'Rough weather with heavy rain, wind, and thunder!'],
    ['sport', '🏀', 'g3', 'An active physical game played with rules!'],
    ['short', '📏', 'g3', 'Measuring only a small length or height!'],
    ['horse', '🐴', 'g3', 'A fast four-legged animal with hooves and a mane!'],
    ['north', '🧭', 'g3', 'The top direction on most maps!'],
    ['shirt', '👕', 'g3', 'A piece of clothing worn on the upper body!'],
    ['skirt', '👗', 'g3', 'Clothing that hangs down from the waist!'],
    ['dirt', '🌱', 'g3', 'Loose soil covering the ground!'],
    ['first', '🥇', 'g3', 'Coming ahead of everyone else!'],
    ['third', '🥉', 'g3', 'Coming right after second place!'],
    ['turn', '🔄', 'g3', 'To rotate or change direction!'],
    ['burn', '🔥', 'g3', 'To glow with hot fire!'],
    ['curl', '🌀', 'g3', 'A twisted spiral ringlet shape!'],
    ['nurse', '🩺', 'g3', 'A trained medical caregiver who helps patients!'],
    ['purse', '👜', 'g3', 'A small bag for carrying keys and money!'],
    ['herb', '🌿', 'g3', 'A fragrant leafy plant used to flavor cooking!'],
    ['tiger', '🐯', 'g3', 'A giant striped wild cat from Asia!'],
    ['river', '🏞️', 'g3', 'A wide flowing stream of fresh water!'],
    ['water', '💧', 'g3', 'Clear liquid essential for all living things!'],
    ['paper', '📄', 'g3', 'Thin flat sheets made from wood pulp for writing!'],
    ['pencil', '✏️', 'g3', 'A wooden writing tool with graphite and an eraser!'],
    ['apple', '🍎', 'g3', 'A crisp sweet red or green orchard fruit!'],
    ['table', '🪑', 'g3', 'A flat piece of furniture supported by legs!'],
    ['circle', '⭕', 'g3', 'A perfectly round flat loop with no corners!'],
    ['turtle', '🐢', 'g3', 'A slow reptile wearing a protective shell!'],
    ['purple', '🟣', 'g3', 'The rich color mixed from red and blue!'],
    ['spider', '🕷️', 'g3', 'An eight-legged creature that weaves silky traps!'],

    // Grades 4–5 extra ('g4_5')
    ['train', '🚂', 'g4_5', 'Connected railroad cars pulled along steel tracks!'],
    ['brain', '🧠', 'g4_5', 'The thinking organ inside your skull!'],
    ['chain', '⛓️', 'g4_5', 'Connected metal links joined in a row!'],
    ['paint', '🎨', 'g4_5', 'Colored liquid brushed onto canvas or walls!'],
    ['snail', '🐌', 'g4_5', 'A slow creature carrying a spiral shell!'],
    ['stay', '🛑', 'g4_5', 'Remaining in one place without leaving!'],
    ['spray', '💦', 'g4_5', 'A fine shower of tiny liquid droplets!'],
    ['beach', '🏖️', 'g4_5', 'A sandy shore beside an ocean or lake!'],
    ['peach', '🍑', 'g4_5', 'A fuzzy sweet orange-pink stone fruit!'],
    ['teach', '👩‍🏫', 'g4_5', 'Helping students understand new skills!'],
    ['dream', '💭', 'g4_5', 'Stories and pictures your mind imagines while asleep!'],
    ['cream', '🍦', 'g4_5', 'The rich, smooth, sweet part of milk!'],
    ['steam', '♨️', 'g4_5', 'Hot invisible water vapor rising from boiling liquid!'],
    ['bread', '🍞', 'g4_5', 'Baked loaf made from flour, yeast, and water!'],
    ['head', '🗣️', 'g4_5', 'The top part of the body holding eyes, ears, and brain!'],
    ['green', '🟢', 'g4_5', 'The color of healthy leaves and emeralds!'],
    ['sleep', '😴', 'g4_5', 'Resting deeply with closed eyes every night!'],
    ['sheep', '🐑', 'g4_5', 'A woolly farm animal that says baa!'],
    ['sweet', '🍬', 'g4_5', 'Tasting sugary like honey or candy!'],
    ['street', '🛣️', 'g4_5', 'A paved town road lined with houses or shops!'],
    ['float', '🛟', 'g4_5', 'Resting lightly on top of water without sinking!'],
    ['toast', '🍞', 'g4_5', 'Warm crispy browned slices of bread!'],
    ['slow', '🐢', 'g4_5', 'Moving at a gentle, unhurried pace!'],
    ['show', '🎭', 'g4_5', 'A performance on stage or screen, or to display!'],
    ['throw', '⚾', 'g4_5', 'Tossing an object through the air with your arm!'],
    ['blow', '🌬️', 'g4_5', 'Pushing a strong stream of air!'],
    ['spoon', '🥄', 'g4_5', 'A curved utensil for eating soup or cereal!'],
    ['broom', '🧹', 'g4_5', 'A long-handled brush for sweeping floors!'],
    ['goose', '🪿', 'g4_5', 'A large honking water bird with a long neck!'],
    ['school', '🏫', 'g4_5', 'A place where teachers help students learn!'],
    ['cool', '😎', 'g4_5', 'Slightly chilly, or awesome!'],
    ['cook', '👨‍🍳', 'g4_5', 'Preparing tasty meals using heat!'],
    ['hook', '🪝', 'g4_5', 'A curved metal piece for hanging things!'],
    ['look', '👀', 'g4_5', 'Directing your eyes carefully at something!'],
    ['cloud', '☁️', 'g4_5', 'A fluffy group of tiny water drops floating high up!'],
    ['proud', '🦁', 'g4_5', 'Feeling pleased with something you worked hard on!'],
    ['shout', '📣', 'g4_5', 'Calling out in a very loud voice!'],
    ['mouth', '👄', 'g4_5', 'The opening in your face for speaking and eating!'],
    ['house', '🏠', 'g4_5', 'A building designed for a family to live in!'],
    ['mouse', '🐭', 'g4_5', 'A tiny whiskered rodent, or computer clicker!'],
    ['point', '👉', 'g4_5', 'A sharp tip, or aiming a finger at something!'],
    ['voice', '🗣️', 'g4_5', 'The sound made when a person speaks or sings!'],
    ['noise', '🔊', 'g4_5', 'Any loud or unexpected sound!'],
    ['enjoy', '🎉', 'g4_5', 'Having a wonderful, happy time doing something!'],
    ['royal', '👑', 'g4_5', 'Belonging to a king, queen, or palace!'],
    ['night', '🌃', 'g4_5', 'The dark hours after sunset when stars shine!'],
    ['light', '💡', 'g4_5', 'Brightness that lets us see clearly!'],
    ['bright', '☀️', 'g4_5', 'Shining with strong, cheerful radiance!'],
    ['flight', '✈️', 'g4_5', 'Traveling smoothly high through the air!'],
    ['knight', '⚔️', 'g4_5', 'A brave armored hero from medieval times!'],
    ['magnet', '🧲', 'g4_5', 'An object that pulls iron and steel toward itself!'],
    ['planet', '🪐', 'g4_5', 'A large round world orbiting around a star!'],
    ['rocket', '🚀', 'g4_5', 'A powerful spacecraft launched into outer space!'],
    ['jungle', '🌴', 'g4_5', 'A thick tropical forest filled with vines and wildlife!'],
    ['castle', '🏰', 'g4_5', 'A giant stone fortress with tall towers and a moat!'],
    ['garden', '🌻', 'g4_5', 'A sunny plot of soil for growing flowers and veggies!'],
    ['island', '🏝️', 'g4_5', 'A piece of land completely surrounded by water!'],
    ['forest', '🌲', 'g4_5', 'A large area thickly covered with tall trees!'],
    ['desert', '🏜️', 'g4_5', 'A very dry region with sand, cacti, and little rain!'],
    ['ocean', '🌊', 'g4_5', 'A vast body of salty water covering most of Earth!'],
    ['winter', '❄️', 'g4_5', 'The coldest snowy season of the year!'],
    ['summer', '☀️', 'g4_5', 'The warmest sunny season of the year!'],
    ['silver', '🥈', 'g4_5', 'A shiny gray-white precious metal!'],
    ['golden', '🏅', 'g4_5', 'Shining with a warm yellow metallic glow!'],
    ['dragon', '🐉', 'g4_5', 'A mythical winged reptile that breathes fire!'],
    ['wizard', '🧙', 'g4_5', 'A magical storybook character who casts spells!'],
    ['pirate', '🏴‍☠️', 'g4_5', 'An adventurer sailing seas in search of treasure chests!'],
    ['puzzle', '🧩', 'g4_5', 'A brain-teasing game with interlocking pieces!'],
    ['mirror', '🪞', 'g4_5', 'Smooth glass that reflects your image back!'],
    ['bridge', '🌉', 'g4_5', 'A structure built across a river or canyon!'],
    ['ladder', '🪜', 'g4_5', 'Steps between two side rails used for climbing high!'],
    ['hammer', '🔨', 'g4_5', 'A heavy-headed tool for pounding nails!'],
    ['basket', '🧺', 'g4_5', 'A woven container with handles for carrying goods!'],
    ['blanket', '🛏️', 'g4_5', 'A warm soft cover spread over a bed!'],
    ['pocket', '👖', 'g4_5', 'A small cloth pouch sewn into pants or a jacket!'],
    ['ticket', '🎟️', 'g4_5', 'A printed pass letting you enter a movie or ride!'],
    ['button', '🔘', 'g4_5', 'A small round fastener, or a switch you press!'],
    ['ribbon', '🎀', 'g4_5', 'A long narrow strip of colorful cloth!'],
    ['animal', '🦒', 'g4_5', 'A living creature that breathes, moves, and eats!'],
    ['family', '👨‍👩‍👧‍👦', 'g4_5', 'Parents, children, and relatives who care for each other!'],
    ['friend', '🤝', 'g4_5', 'Someone you trust and love spending time with!'],
    ['doctor', '🩺', 'g4_5', 'A medical expert who treats illness and injury!'],
    ['candle', '🕯️', 'g4_5', 'A wax cylinder with a wick that burns for light!'],
    ['tunnel', '🚇', 'g4_5', 'An underground passage dug through rock or earth!'],
    ['anchor', '⚓', 'g4_5', 'A heavy iron hook dropped to hold a ship still!'],

    // Grade 6 ('g6') — Upper-elementary / 6th grade academic & everyday vocabulary
    ['galaxy', '🌌', 'g6', 'A gigantic spinning system of billions of stars and dust!'],
    ['comet', '☄️', 'g6', 'An icy space rock that grows a glowing tail near the sun!'],
    ['orbit', '🪐', 'g6', 'The curved path a moon or planet follows around a star!'],
    ['crater', '🌑', 'g6', 'A bowl-shaped pit carved by a meteorite impact!'],
    ['fossil', '🦴', 'g6', 'Ancient preserved remains or prints of prehistoric life in stone!'],
    ['glacier', '🧊', 'g6', 'A massive slow-moving river of packed ice and snow!'],
    ['volcano', '🌋', 'g6', 'A mountain opening that erupts molten magma and ash!'],
    ['canyon', '🏜️', 'g6', 'A deep steep-sided valley carved by a rushing river!'],
    ['plateau', '⛰️', 'g6', 'A large flat area of high ground rising above nearby land!'],
    ['delta', '🏞️', 'g6', 'Fan-shaped fertile land where a river meets the sea!'],
    ['compass', '🧭', 'g6', 'A magnetic navigation tool pointing toward north!'],
    ['horizon', '🌅', 'g6', 'The distant line where Earth appears to meet the sky!'],
    ['climate', '🌦️', 'g6', 'The long-term pattern of weather in a region!'],
    ['weather', '⛅', 'g6', 'Day-to-day temperature, wind, and rain outdoors!'],
    ['oxygen', '🫧', 'g6', 'The invisible gas in air that living lungs breathe!'],
    ['energy', '⚡', 'g6', 'The power needed to do work, move, or create heat!'],
    ['gravity', '🍎', 'g6', 'The invisible force pulling objects toward Earth’s center!'],
    ['friction', '🛞', 'g6', 'A rubbing force that slows sliding surfaces down!'],
    ['circuit', '💡', 'g6', 'A closed loop path through which electric current flows!'],
    ['crystal', '💎', 'g6', 'A solid mineral with flat geometric faces!'],
    ['mineral', '🪨', 'g6', 'A natural nonliving solid formed inside rocks!'],
    ['element', '⚛️', 'g6', 'A pure substance made of only one kind of atom!'],
    ['carbon', '💎', 'g6', 'A key chemical building block found in diamonds and all life!'],
    ['nucleus', '🧬', 'g6', 'The central control center of a cell or atom!'],
    ['mammal', '🐬', 'g6', 'A warm-blooded animal with hair that feeds babies milk!'],
    ['reptile', '🦎', 'g6', 'A cold-blooded scaly animal like a lizard or snake!'],
    ['habitat', '🌿', 'g6', 'The natural home environment where a species lives!'],
    ['species', '🦋', 'g6', 'A distinct group of living organisms that share traits!'],
    ['migrate', '🦆', 'g6', 'Traveling seasonally from one region to another!'],
    ['extinct', '🦕', 'g6', 'No longer existing anywhere on Earth!'],
    ['predator', '🦁', 'g6', 'An animal that hunts other creatures for food!'],
    ['nectar', '🌺', 'g6', 'Sweet liquid inside flowers that attracts bees!'],
    ['pollen', '🌼', 'g6', 'Fine yellow dust carried between blossoms to make seeds!'],
    ['harvest', '🌾', 'g6', 'Gathering ripe crops from fields in autumn!'],
    ['orchard', '🍎', 'g6', 'A grove of trees planted to grow fruit or nuts!'],
    ['harbor', '⚓', 'g6', 'A sheltered coastal port where boats dock safely!'],
    ['voyage', '⛵', 'g6', 'A long journey across sea or space!'],
    ['museum', '🏛️', 'g6', 'A building displaying art, history, and science treasures!'],
    ['pyramid', '🔺', 'g6', 'An ancient stone tomb with triangular sides!'],
    ['pharaoh', '👑', 'g6', 'The royal ruler of ancient Egypt!'],
    ['chariot', '🐎', 'g6', 'A two-wheeled horse-drawn cart from ancient times!'],
    ['temple', '🏛️', 'g6', 'A grand ancient building dedicated to worship or ceremony!'],
    ['armor', '🛡️', 'g6', 'Protective metal plates worn in medieval battle!'],
    ['banner', '🚩', 'g6', 'A long cloth flag carrying a motto or symbol!'],
    ['emblem', '🏅', 'g6', 'A special badge or symbol representing a group!'],
    ['trophy', '🏆', 'g6', 'A shiny cup or statue awarded to a champion!'],
    ['rhythm', '🥁', 'g6', 'A steady repeating pattern of musical beats!'],
    ['melody', '🎶', 'g6', 'A pleasing sequence of musical notes you can hum!'],
    ['chorus', '🎤', 'g6', 'The repeated main verse sung together in a song!'],
    ['canvas', '🖼️', 'g6', 'Sturdy woven cloth stretched on a frame for oil painting!'],
    ['sketch', '✏️', 'g6', 'A quick rough pencil drawing!'],
    ['statue', '🗽', 'g6', 'A sculpted 3D figure carved from stone or metal!'],
    ['bronze', '🥉', 'g6', 'A strong brownish metal alloy of copper and tin!'],
    ['marble', '🏛️', 'g6', 'Smooth patterned stone prized by sculptors!'],
    ['diamond', '💎', 'g6', 'The hardest sparkling clear gemstone on Earth!'],
    ['emerald', '💚', 'g6', 'A rich deep-green precious jewel!'],
    ['pioneer', '🧭', 'g6', 'An early explorer who opens up new territory!'],
    ['frontier', '🌄', 'g6', 'The outer edge of explored territory!'],
    ['summit', '🏔️', 'g6', 'The very highest peak of a mountain!'],
    ['valley', '🏞️', 'g6', 'Low land nestled between hills or mountains!'],
    ['prairie', '🌾', 'g6', 'A wide open grassland with few trees!'],
    ['tundra', '❄️', 'g6', 'A treeless frozen plain near the Arctic!'],
    ['cyclone', '🌀', 'g6', 'A giant swirling storm system with strong winds!'],
    ['thunder', '🌩️', 'g6', 'The loud booming sound following a flash in storms!'],
    ['eclipse', '🌑', 'g6', 'When one space body blocks light from another!'],
    ['meteor', '🌠', 'g6', 'A bright shooting streak burning up in the sky!'],
    ['cavern', '🦇', 'g6', 'A vast underground cave chamber!'],
    ['lagoon', '🏝️', 'g6', 'Shallow calm water separated from the sea by a reef!'],

    // Grades 7–8 ('g7_8') — Middle school Grade 7–8 vocabulary
    ['atom', '⚛️', 'g7_8', 'The smallest basic building unit of chemical matter!'],
    ['photon', '✨', 'g7_8', 'A tiny weightless packet of light energy!'],
    ['neutron', '⚛️', 'g7_8', 'A particle with zero electric charge inside an atomic core!'],
    ['proton', '➕', 'g7_8', 'A positively charged particle inside an atomic core!'],
    ['electron', '⚡', 'g7_8', 'A tiny negatively charged particle orbiting an atomic core!'],
    ['molecule', '🧪', 'g7_8', 'Two or more atoms chemically bonded together!'],
    ['isotope', '☢️', 'g7_8', 'Variants of the same element with different neutron counts!'],
    ['enzyme', '🧬', 'g7_8', 'A biological protein that speeds up chemical reactions!'],
    ['protein', '🥩', 'g7_8', 'Complex chains of amino acids that build body tissue!'],
    ['osmosis', '💧', 'g7_8', 'Water moving across a cell membrane from high to low level!'],
    ['mitosis', '🔬', 'g7_8', 'Cell division producing two identical daughter cells!'],
    ['genome', '🧬', 'g7_8', 'The complete set of DNA instructions in an organism!'],
    ['neuron', '🧠', 'g7_8', 'A specialized nerve cell carrying electrical signals!'],
    ['reflex', '⚡', 'g7_8', 'An automatic instant reaction without conscious thought!'],
    ['artery', '❤️', 'g7_8', 'A blood vessel carrying oxygen-rich blood away from the heart!'],
    ['skeleton', '🦴', 'g7_8', 'The internal bony framework supporting a body!'],
    ['telescope', '🔭', 'g7_8', 'An optical instrument using lenses to view distant stars!'],
    ['microscope', '🔬', 'g7_8', 'A lab tool that magnifies tiny cells invisible to bare eyes!'],
    ['satellite', '🛰️', 'g7_8', 'An object or spacecraft orbiting around a larger world!'],
    ['velocity', '🚀', 'g7_8', 'Speed combined with a specific direction of motion!'],
    ['momentum', '🎱', 'g7_8', 'Mass multiplied by velocity in a moving object!'],
    ['inertia', '🪨', 'g7_8', 'Tendency of objects to keep their current motion or rest!'],
    ['pendulum', '🕰️', 'g7_8', 'A suspended weight swinging steadily back and forth!'],
    ['spectrum', '🌈', 'g7_8', 'The full band of rainbow colors split from white light!'],
    ['prism', '🔺', 'g7_8', 'A clear glass triangle that bends white light into colors!'],
    ['voltage', '🔋', 'g7_8', 'Electrical push measured between two points in a circuit!'],
    ['battery', '🔋', 'g7_8', 'A device storing chemical energy to supply electric power!'],
    ['turbine', '💨', 'g7_8', 'Spinning blades driven by wind, water, or steam!'],
    ['solar', '☀️', 'g7_8', 'Relating to sunlight or energy from the sun!'],
    ['thermal', '🔥', 'g7_8', 'Relating to heat and temperature transfer!'],
    ['kinetic', '⚡', 'g7_8', 'Energy possessed by any object in motion!'],
    ['catalyst', '🧪', 'g7_8', 'A substance that speeds up a reaction without being used up!'],
    ['solvent', '💧', 'g7_8', 'A liquid capable of dissolving another substance!'],
    ['mixture', '🥣', 'g7_8', 'Two or more substances combined without chemical bonding!'],
    ['equation', '➗', 'g7_8', 'A math statement showing two expressions are equal!'],
    ['algebra', '📐', 'g7_8', 'Branch of math using letters and symbols for unknowns!'],
    ['geometry', '📐', 'g7_8', 'Math studying points, lines, angles, and 3D shapes!'],
    ['polygon', '⬡', 'g7_8', 'A closed flat shape made of straight line segments!'],
    ['triangle', '🔺', 'g7_8', 'A three-sided polygon with three interior angles!'],
    ['diameter', '⭕', 'g7_8', 'A straight chord passing through the center of a circle!'],
    ['radius', '📏', 'g7_8', 'Distance from the center of a circle to its outer edge!'],
    ['symmetry', '🦋', 'g7_8', 'Balanced mirror-like matching across a dividing line!'],
    ['fraction', '🍕', 'g7_8', 'A numerical part representing equal pieces of a whole!'],
    ['decimal', '🔢', 'g7_8', 'A base-ten number written with a separating dot!'],
    ['percent', '💯', 'g7_8', 'A ratio comparing a quantity out of one hundred!'],
    ['ratio', '⚖️', 'g7_8', 'A comparison showing how much of one value relates to another!'],
    ['theorem', '📜', 'g7_8', 'A mathematical statement proven true by logical steps!'],
    ['hypothesis', '🔬', 'g7_8', 'A testable scientific prediction based on observation!'],
    ['evidence', '🔍', 'g7_8', 'Facts or observations supporting a claim or conclusion!'],
    ['analyze', '📊', 'g7_8', 'To examine something piece by piece to understand it!'],
    ['metaphor', '🎭', 'g7_8', 'A figure of speech comparing two things without like or as!'],
    ['simile', '✍️', 'g7_8', 'A comparison using the words like or as!'],
    ['stanza', '📖', 'g7_8', 'A grouped set of lines forming a verse in a poem!'],
    ['sonnet', '📜', 'g7_8', 'A classic fourteen-line poem with a formal rhyme scheme!'],
    ['prologue', '📘', 'g7_8', 'An introductory section before the main story begins!'],
    ['memoir', '📔', 'g7_8', 'A true personal account written from memory!'],
    ['fiction', '📚', 'g7_8', 'Stories invented from an author’s imagination!'],
    ['legend', '🐉', 'g7_8', 'A traditional tale passed down through generations!'],
    ['myth', '⚡', 'g7_8', 'An ancient story explaining nature, heroes, or gods!'],
    ['journal', '📓', 'g7_8', 'A daily notebook recording thoughts and events!'],
    ['citizen', '🏛️', 'g7_8', 'A legal member of a town, state, or nation!'],
    ['liberty', '🗽', 'g7_8', 'Freedom to live, speak, and make choices!'],
    ['justice', '⚖️', 'g7_8', 'Fair treatment and upholding what is right under law!'],
    ['treaty', '🤝', 'g7_8', 'A formal written peace or trade agreement between nations!'],
    ['senate', '🏛️', 'g7_8', 'An elected lawmaking assembly in government!'],
    ['empire', '👑', 'g7_8', 'A vast group of territories ruled by one central power!'],
    ['dynasty', '🏺', 'g7_8', 'A line of rulers from the same family across generations!'],
    ['colony', '⛵', 'g7_8', 'A settlement established in a distant land by another country!'],
    ['artifact', '🏺', 'g7_8', 'An old human-made tool or object uncovered by archaeologists!'],
    ['archive', '🗄️', 'g7_8', 'A collection preserving historical documents and records!'],
    ['chronicle', '📜', 'g7_8', 'A written historical record arranged in time order!'],
    ['strategy', '♟️', 'g7_8', 'A careful long-term plan for achieving a big goal!'],
    ['courage', '🦁', 'g7_8', 'Bravery to face danger or difficulty despite fear!'],
    ['triumph', '🏆', 'g7_8', 'A great victory or proud achievement!'],
    ['empathy', '💛', 'g7_8', 'Understanding and sharing how someone else feels!']
  ];

  const MAGIC_E_PAIRS = [
    { base: 'cap', baseEmoji: '🧢', magic: 'cape', magicEmoji: '🦸', shortVowel: '/ă/', longVowel: '/ā/' },
    { base: 'tap', baseEmoji: '🚰', magic: 'tape', magicEmoji: '🩹', shortVowel: '/ă/', longVowel: '/ā/' },
    { base: 'kit', baseEmoji: '🧰', magic: 'kite', magicEmoji: '🪁', shortVowel: '/ĭ/', longVowel: '/ī/' },
    { base: 'pin', baseEmoji: '📌', magic: 'pine', magicEmoji: '🌲', shortVowel: '/ĭ/', longVowel: '/ī/' },
    { base: 'cub', baseEmoji: '🐻', magic: 'cube', magicEmoji: '🧊', shortVowel: '/ŭ/', longVowel: '/yū/' },
    { base: 'tub', baseEmoji: '🛁', magic: 'tube', magicEmoji: '🧪', shortVowel: '/ŭ/', longVowel: '/yū/' },
    { base: 'hop', baseEmoji: '🐇', magic: 'hope', magicEmoji: '🌟', shortVowel: '/ŏ/', longVowel: '/ō/' },
    { base: 'mad', baseEmoji: '😠', magic: 'made', magicEmoji: '🎨', shortVowel: '/ă/', longVowel: '/ā/' }
  ];

  // UFLI Foundations Sound Wall metadata + extended K–8 graphemes
  // Each entry includes an altKeyword/altEmoji so hints never echo the target word!
  const UFLI_GRAPHEMES = {
    a:        { symbol: '/ă/',  keyword: 'apple',      emoji: '🍎', altKeyword: 'ant',       altEmoji: '🐜', kind: 'vowel-short', cue: 'Short vowel — jaw drops low as in' },
    b:        { symbol: '/b/',  keyword: 'bat',        emoji: '🦇', altKeyword: 'ball',      altEmoji: '⚽', kind: 'stop',        cue: 'Clipped voiced stop — quick lip pop, as in' },
    c:        { symbol: '/k/',  keyword: 'cat',        emoji: '🐱', altKeyword: 'cup',       altEmoji: '☕', kind: 'stop',        cue: 'Clipped unvoiced stop — crisp sound as in' },
    c_soft:   { symbol: '/s/',  keyword: 'city',       emoji: '🏙️', altKeyword: 'sun',       altEmoji: '☀️', kind: 'continuous',  cue: 'Soft sound before e/i/y — hisses like' },
    d:        { symbol: '/d/',  keyword: 'dog',        emoji: '🐶', altKeyword: 'duck',      altEmoji: '🦆', kind: 'stop',        cue: 'Clipped voiced stop — quick tongue tap as in' },
    e:        { symbol: '/ĕ/',  keyword: 'egg',        emoji: '🥚', altKeyword: 'elephant',  altEmoji: '🐘', kind: 'vowel-short', cue: 'Short vowel — relaxed mid-open sound as in' },
    f:        { symbol: '/f/',  keyword: 'fish',       emoji: '🐟', altKeyword: 'fox',       altEmoji: '🦊', kind: 'continuous',  cue: 'Continuous airy sound — gentle teeth on lip as in' },
    g:        { symbol: '/g/',  keyword: 'goat',       emoji: '🐐', altKeyword: 'gift',      altEmoji: '🎁', kind: 'stop',        cue: 'Clipped voiced stop — quick throat tap as in' },
    g_soft:   { symbol: '/j/',  keyword: 'gem',        emoji: '💎', altKeyword: 'jar',       altEmoji: '🫙', kind: 'affricate',   cue: 'Soft sound before e/i/y — sounds like' },
    h:        { symbol: '/h/',  keyword: 'hat',        emoji: '🎩', altKeyword: 'hand',      altEmoji: '✋', kind: 'continuous',  cue: 'Soft unvoiced breath — quiet puff as in' },
    i:        { symbol: '/ĭ/',  keyword: 'igloo',      emoji: '🧊', altKeyword: 'insect',    altEmoji: '🐛', kind: 'vowel-short', cue: 'Short vowel — small smile sound as in' },
    j:        { symbol: '/j/',  keyword: 'jar',        emoji: '🫙', altKeyword: 'jet',       altEmoji: '✈️', kind: 'affricate',   cue: 'Clipped affricate — crisp burst as in' },
    k:        { symbol: '/k/',  keyword: 'kite',       emoji: '🪁', altKeyword: 'king',      altEmoji: '👑', kind: 'stop',        cue: 'Clipped unvoiced stop — quick sound as in' },
    l:        { symbol: '/l/',  keyword: 'leaf',       emoji: '🍃', altKeyword: 'lamp',      altEmoji: '💡', kind: 'continuous',  cue: 'Continuous liquid — tongue tip behind top teeth as in' },
    m:        { symbol: '/m/',  keyword: 'mouse',      emoji: '🐭', altKeyword: 'moon',      altEmoji: '🌙', kind: 'continuous',  cue: 'Continuous nasal — lips closed, hum like' },
    n:        { symbol: '/n/',  keyword: 'nose',       emoji: '👃', altKeyword: 'nest',      altEmoji: '🪺', kind: 'continuous',  cue: 'Continuous nasal — tongue up, hum like' },
    o:        { symbol: '/ŏ/',  keyword: 'octopus',    emoji: '🐙', altKeyword: 'otter',     altEmoji: '🦦', kind: 'vowel-short', cue: 'Short vowel — open round mouth as in' },
    p:        { symbol: '/p/',  keyword: 'pig',        emoji: '🐷', altKeyword: 'pen',       altEmoji: '🖊️', kind: 'stop',        cue: 'Clipped unvoiced pop — quick puff of air as in' },
    q:        { symbol: '/kw/', keyword: 'queen',      emoji: '👑', altKeyword: 'quack',     altEmoji: '🦆', kind: 'glide',       cue: 'Crisp /k/ + /w/ glide together as in' },
    qu:       { symbol: '/kw/', keyword: 'queen',      emoji: '👑', altKeyword: 'quack',     altEmoji: '🦆', kind: 'glide',       cue: 'Crisp /k/ + /w/ glide together as in' },
    r:        { symbol: '/r/',  keyword: 'red',        emoji: '🔴', altKeyword: 'ring',      altEmoji: '💍', kind: 'continuous',  cue: 'Continuous liquid — tongue curled back softly as in' },
    s:        { symbol: '/s/',  keyword: 'sun',        emoji: '☀️', altKeyword: 'sock',      altEmoji: '🧦', kind: 'continuous',  cue: 'Continuous hiss — stretch the air like' },
    t:        { symbol: '/t/',  keyword: 'tiger',      emoji: '🐯', altKeyword: 'tent',      altEmoji: '⛺', kind: 'stop',        cue: 'Clipped unvoiced tap — crisp sound as in' },
    u:        { symbol: '/ŭ/',  keyword: 'umbrella',   emoji: '☂️', altKeyword: 'up',        altEmoji: '⬆️', kind: 'vowel-short', cue: 'Short vowel — relaxed center mouth as in' },
    v:        { symbol: '/v/',  keyword: 'volcano',    emoji: '🌋', altKeyword: 'van',       altEmoji: '🚐', kind: 'continuous',  cue: 'Continuous voiced buzz — top teeth on lip as in' },
    w:        { symbol: '/w/',  keyword: 'watermelon', emoji: '🍉', altKeyword: 'web',       altEmoji: '🕸️', kind: 'glide',       cue: 'Rounded lips glide open smoothly as in' },
    x:        { symbol: '/ks/', keyword: 'fox',        emoji: '🦊', altKeyword: 'box',       altEmoji: '📦', kind: 'stop',        cue: 'Two sounds /k/ + /s/ blended as in' },
    y:        { symbol: '/y/',  keyword: 'yellow',     emoji: '💛', altKeyword: 'yam',       altEmoji: '🍠', kind: 'glide',       cue: 'Tongue arches forward — clean glide as in' },
    y_i:      { symbol: '/ī/',  keyword: 'sky',        emoji: '🌌', altKeyword: 'fly',       altEmoji: '🪰', kind: 'vowel-long',  cue: 'Long /ī/ sound at the end as in' },
    y_e:      { symbol: '/ē/',  keyword: 'happy',      emoji: '😊', altKeyword: 'sunny',     altEmoji: '☀️', kind: 'vowel-long',  cue: 'Long /ē/ sound at the end as in' },
    y_short:  { symbol: '/ĭ/',  keyword: 'gym',        emoji: '🏋️', altKeyword: 'myth',      altEmoji: '⚡', kind: 'vowel-short', cue: 'Acts as a short vowel /ĭ/ inside the word like' },
    z:        { symbol: '/z/',  keyword: 'zipper',     emoji: '🤐', altKeyword: 'zebra',     altEmoji: '🦓', kind: 'continuous',  cue: 'Continuous voiced buzz — stretch like' },

    // UFLI Digraphs & FLSZ Spelling Rule
    sh:       { symbol: '/sh/', keyword: 'ship',       emoji: '🚢', altKeyword: 'shell',     altEmoji: '🐚', kind: 'continuous',  cue: 'Quiet shushing digraph — rounded lips as in' },
    ch:       { symbol: '/ch/', keyword: 'chair',      emoji: '🪑', altKeyword: 'chick',     altEmoji: '🐥', kind: 'affricate',   cue: 'Crisp digraph release as in' },
    th:       { symbol: '/th/', keyword: 'thumb',      emoji: '👍', altKeyword: 'thorn',     altEmoji: '🌹', kind: 'continuous',  cue: 'Tongue lightly between teeth as in' },
    wh:       { symbol: '/wh/', keyword: 'whale',      emoji: '🐳', altKeyword: 'wheel',     altEmoji: '🛞', kind: 'glide',       cue: 'Rounded lips breathy glide as in' },
    ph:       { symbol: '/f/',  keyword: 'phone',      emoji: '📱', altKeyword: 'fish',      altEmoji: '🐟', kind: 'continuous',  cue: 'Digraph making the /f/ sound as in' },
    ck:       { symbol: '/k/',  keyword: 'duck',       emoji: '🦆', altKeyword: 'lock',      altEmoji: '🔒', kind: 'stop',        cue: 'Digraph after a short vowel — clipped /k/ as in' },
    ng:       { symbol: '/ng/', keyword: 'ring',       emoji: '💍', altKeyword: 'king',      altEmoji: '👑', kind: 'continuous',  cue: 'Nasal sound in back of throat as in' },
    ff:       { symbol: '/f/',  keyword: 'puff',       emoji: '💨', altKeyword: 'cliff',     altEmoji: '⛰️', kind: 'continuous',  cue: 'Doubled consonant — continuous /f/ as in' },
    ll:       { symbol: '/l/',  keyword: 'bell',       emoji: '🔔', altKeyword: 'hill',      altEmoji: '⛰️', kind: 'continuous',  cue: 'Doubled consonant — continuous /l/ as in' },
    ss:       { symbol: '/s/',  keyword: 'grass',      emoji: '🌿', altKeyword: 'glass',     altEmoji: '🥛', kind: 'continuous',  cue: 'Doubled consonant — continuous /s/ as in' },
    zz:       { symbol: '/z/',  keyword: 'buzz',       emoji: '🐝', altKeyword: 'jazz',      altEmoji: '🎷', kind: 'continuous',  cue: 'Doubled consonant — continuous /z/ as in' },

    // VCe (Long Vowels)
    a_e:      { symbol: '/ā/',  keyword: 'cake',       emoji: '🎂', altKeyword: 'acorn',     altEmoji: '🌰', kind: 'vowel-long',  cue: 'Long vowel — says its own name /ā/ as in' },
    i_e:      { symbol: '/ī/',  keyword: 'kite',       emoji: '🪁', altKeyword: 'ice',       altEmoji: '🧊', kind: 'vowel-long',  cue: 'Long vowel — says its own name /ī/ as in' },
    o_e:      { symbol: '/ō/',  keyword: 'bone',       emoji: '🦴', altKeyword: 'ocean',     altEmoji: '🌊', kind: 'vowel-long',  cue: 'Long vowel — says its own name /ō/ as in' },
    u_e:      { symbol: '/yū/', keyword: 'cube',       emoji: '🧊', altKeyword: 'unicorn',   altEmoji: '🦄', kind: 'vowel-long',  cue: 'Long vowel — says /yū/ or /ū/ as in' },
    e_e:      { symbol: '/ē/',  keyword: 'tree',       emoji: '🌳', altKeyword: 'eagle',     altEmoji: '🦅', kind: 'vowel-long',  cue: 'Long vowel — says its own name /ē/ as in' },

    // Vowel Teams, Diphthongs & R-Controlled Vowels
    ai:       { symbol: '/ā/',  keyword: 'rain',       emoji: '🌧️', altKeyword: 'train',     altEmoji: '🚂', kind: 'vowel-team',  cue: 'Long /ā/ vowel team sound as in' },
    ay:       { symbol: '/ā/',  keyword: 'play',       emoji: '🎮', altKeyword: 'tray',      altEmoji: '🍽️', kind: 'vowel-team',  cue: 'Long /ā/ vowel team sound as in' },
    ee:       { symbol: '/ē/',  keyword: 'tree',       emoji: '🌳', altKeyword: 'bee',       altEmoji: '🐝', kind: 'vowel-team',  cue: 'Long /ē/ vowel team sound as in' },
    ea:       { symbol: '/ē/',  keyword: 'leaf',       emoji: '🍃', altKeyword: 'beach',     altEmoji: '🏖️', kind: 'vowel-team',  cue: 'Long /ē/ vowel team sound as in' },
    ie:       { symbol: '/ē/',  keyword: 'cookie',     emoji: '🍪', altKeyword: 'tree',      altEmoji: '🌳', kind: 'vowel-team',  cue: 'Long /ē/ vowel team sound as in' },
    oa:       { symbol: '/ō/',  keyword: 'boat',       emoji: '⛵', altKeyword: 'goat',      altEmoji: '🐐', kind: 'vowel-team',  cue: 'Long /ō/ vowel team sound as in' },
    ow:       { symbol: '/ō/',  keyword: 'snow',       emoji: '❄️', altKeyword: 'glow',      altEmoji: '✨', kind: 'vowel-team',  cue: 'Long /ō/ vowel sound as in' },
    ow_dip:   { symbol: '/ow/', keyword: 'cow',        emoji: '🐄', altKeyword: 'owl',       altEmoji: '🦉', kind: 'vowel-team',  cue: 'Gliding /ow/ diphthong sound as in' },
    ou:       { symbol: '/ow/', keyword: 'cloud',      emoji: '☁️', altKeyword: 'mouse',     altEmoji: '🐭', kind: 'vowel-team',  cue: 'Gliding /ow/ diphthong sound as in' },
    oi:       { symbol: '/oy/', keyword: 'coin',       emoji: '🪙', altKeyword: 'toy',       altEmoji: '🧸', kind: 'vowel-team',  cue: 'Gliding /oy/ diphthong sound as in' },
    oy:       { symbol: '/oy/', keyword: 'toy',        emoji: '🧸', altKeyword: 'coin',      altEmoji: '🪙', kind: 'vowel-team',  cue: 'Gliding /oy/ diphthong sound as in' },
    au:       { symbol: '/aw/', keyword: 'hawk',       emoji: '🦅', altKeyword: 'paw',       altEmoji: '🐾', kind: 'vowel-team',  cue: 'Open /aw/ vowel sound as in' },
    aw:       { symbol: '/aw/', keyword: 'hawk',       emoji: '🦅', altKeyword: 'paw',       altEmoji: '🐾', kind: 'vowel-team',  cue: 'Open /aw/ vowel sound as in' },
    oo:       { symbol: '/ū/',  keyword: 'moon',       emoji: '🌙', altKeyword: 'spoon',     altEmoji: '🥄', kind: 'vowel-team',  cue: 'Long /ū/ sound as in' },
    oo_short: { symbol: '/ʊ/',  keyword: 'book',       emoji: '📖', altKeyword: 'foot',      altEmoji: '🦶', kind: 'vowel-team',  cue: 'Short /ʊ/ sound as in' },
    ew:       { symbol: '/ū/',  keyword: 'moon',       emoji: '🌙', altKeyword: 'jewel',     altEmoji: '💎', kind: 'vowel-team',  cue: 'Long /ū/ sound as in' },
    ue:       { symbol: '/ū/',  keyword: 'glue',       emoji: '🧴', altKeyword: 'moon',      altEmoji: '🌙', kind: 'vowel-team',  cue: 'Long /ū/ sound as in' },
    ui:       { symbol: '/ū/',  keyword: 'fruit',      emoji: '🍓', altKeyword: 'juice',     altEmoji: '🧃', kind: 'vowel-team',  cue: 'Long /ū/ sound as in' },
    igh:      { symbol: '/ī/',  keyword: 'night',      emoji: '🌃', altKeyword: 'light',     altEmoji: '💡', kind: 'vowel-long',  cue: 'Long /ī/ sound as in' },
    ar:       { symbol: '/ar/', keyword: 'star',       emoji: '⭐', altKeyword: 'car',       altEmoji: '🚗', kind: 'vowel-r',     cue: 'R-controlled /ar/ sound as in' },
    or:       { symbol: '/or/', keyword: 'fork',       emoji: '🍴', altKeyword: 'corn',      altEmoji: '🌽', kind: 'vowel-r',     cue: 'R-controlled /or/ sound as in' },
    er:       { symbol: '/er/', keyword: 'fern',       emoji: '🌿', altKeyword: 'bird',      altEmoji: '🐦', kind: 'vowel-r',     cue: 'R-controlled /er/ sound as in' },
    ir:       { symbol: '/er/', keyword: 'bird',       emoji: '🐦', altKeyword: 'girl',      altEmoji: '👧', kind: 'vowel-r',     cue: 'R-controlled /er/ sound as in' },
    ur:       { symbol: '/er/', keyword: 'surf',       emoji: '🏄', altKeyword: 'turtle',    altEmoji: '🐢', kind: 'vowel-r',     cue: 'R-controlled /er/ sound as in' },
    schwa:    { symbol: '/ə/',  keyword: 'about',      emoji: '💬', altKeyword: 'banana',    altEmoji: '🍌', kind: 'vowel-short', cue: 'Soft unstressed /uh/ vowel sound as in' },
    zh:       { symbol: '/zh/', keyword: 'treasure',   emoji: '💎', altKeyword: 'vision',    altEmoji: '👀', kind: 'continuous',  cue: 'Voiced buzzing /zh/ sound as in' }
  };

  // Clean UFLI display symbols (no "-uh" schwa anywhere)
  const PHONEME_SOUNDS = {
    a: '/ă/', b: '/b/', c: '/k/', d: '/d/', e: '/ĕ/', f: '/f/', g: '/g/', h: '/h/',
    i: '/ĭ/', j: '/j/', k: '/k/', l: '/l/', m: '/m/', n: '/n/', o: '/ŏ/', p: '/p/',
    q: '/kw/', qu: '/kw/', r: '/r/', s: '/s/', t: '/t/', u: '/ŭ/', v: '/v/', w: '/w/',
    x: '/ks/', y: '/y/', z: '/z/',
    c_soft: '/s/', g_soft: '/j/', y_i: '/ī/', y_e: '/ē/', y_short: '/ĭ/',
    sh: '/sh/', ch: '/ch/', th: '/th/', wh: '/wh/', ph: '/f/', ck: '/k/', ng: '/ng/',
    ff: '/f/', ll: '/l/', ss: '/s/', zz: '/z/',
    fr: '/f/ /r/', cr: '/k/ /r/', dr: '/d/ /r/', fl: '/f/ /l/', cl: '/k/ /l/',
    sw: '/s/ /w/', st: '/s/ /t/', pl: '/p/ /l/', sn: '/s/ /n/', tr: '/t/ /r/',
    ai: '/ā/', ay: '/ā/', ee: '/ē/', ea: '/ē/', ie: '/ē/', oa: '/ō/', oo: '/ū/', oo_short: '/ʊ/', ow: '/ō/',
    ow_dip: '/ow/', ou: '/ow/', oi: '/oy/', oy: '/oy/', au: '/aw/', aw: '/aw/', ew: '/ū/', ue: '/ū/', ui: '/ū/',
    a_e: '/ā/', i_e: '/ī/', o_e: '/ō/', u_e: '/yū/', e_e: '/ē/', igh: '/ī/',
    ar: '/ar/', or: '/or/', er: '/er/', ir: '/er/', ur: '/er/',
    schwa: '/ə/', zh: '/zh/'
  };

  // Consonant blends that must be played as two connected individual phonemes (never "fruh"/"stuh")
  const CONSONANT_BLENDS = {
    fr: ['f', 'r'], cr: ['c', 'r'], dr: ['d', 'r'], fl: ['f', 'l'], cl: ['c', 'l'],
    sw: ['s', 'w'], st: ['s', 't'], pl: ['p', 'l'], sn: ['s', 'n'], tr: ['t', 'r']
  };

  // Spoken Unicode phoneme symbols -> Web Audio phoneme key mapping
  const PHONEME_ALIAS = {
    'ă': 'a', 'ĕ': 'e', 'ĭ': 'i', 'ŏ': 'o', 'ŭ': 'u',
    'ā': 'ai', 'ē': 'ee', 'ī': 'i_e', 'ō': 'oa', 'ū': 'oo', 'yū': 'u_e', 'ʊ': 'oo_short',
    'ks': 'x', 'kw': 'qu', 'ow': 'ou', 'oy': 'oi', 'aw': 'au', 'ə': 'schwa'
  };

  // Special per-word slot phonics overrides for irregular words across K–8
  const SPECIAL_WORD_SLOTS = {
    echo:     ['e', 'k', 'partner:k', 'o_e'],
    ocean:    ['o_e', 'sh', 'schwa', 'schwa', 'n'],
    school:   ['s', 'k', 'partner:k', 'oo', 'partner:oo', 'l'],
    chord:    ['k', 'partner:k', 'or', 'partner:or', 'd'],
    chorus:   ['k', 'partner:k', 'or', 'partner:or', 'u', 's'],
    anchor:   ['a', 'n', 'k', 'partner:k', 'er', 'partner:er'],
    island:   ['i_e', 'silent:partner', 'l', 'a', 'n', 'd'],
    castle:   ['c', 'a', 's', 'silent:partner', 'l', 'silent:vce'],
    knight:   ['silent:partner', 'n', 'igh', 'silent:igh', 'silent:igh', 't'],
    thumb:    ['th', 'partner:th', 'u', 'm', 'silent:partner'],
    climb:    ['c', 'l', 'i_e', 'm', 'silent:partner'],
    comb:     ['c', 'o_e', 'm', 'silent:partner'],
    lamb:     ['l', 'a', 'm', 'silent:partner'],
    bread:    ['b', 'r', 'e', 'silent:partner', 'd'],
    head:     ['h', 'e', 'silent:partner', 'd'],
    weather:  ['w', 'e', 'silent:partner', 'th', 'partner:th', 'er', 'partner:er'],
    treasure: ['t', 'r', 'e', 'silent:partner', 'zh', 'er', 'partner:er', 'silent:vce'],
    measure:  ['m', 'e', 'silent:partner', 'zh', 'er', 'partner:er', 'silent:vce'],
    water:    ['w', 'au', 't', 'er', 'partner:er'],
    eye:      ['i_e', 'silent:partner', 'silent:partner'],
    ice:      ['i_e', 'c_soft', 'silent:vce'],
    pie:      ['p', 'i_e', 'silent:partner'],
    tie:      ['t', 'i_e', 'silent:partner'],
    one:      ['w', 'u', 'silent:vce'],
    two:      ['t', 'silent:partner', 'oo'],
    shoe:     ['sh', 'partner:sh', 'oo', 'silent:partner'],
    cow:      ['c', 'ow_dip', 'partner:ow_dip'],
    owl:      ['ow_dip', 'partner:ow_dip', 'l'],
    crown:    ['c', 'r', 'ow_dip', 'partner:ow_dip', 'n'],
    clown:    ['c', 'l', 'ow_dip', 'partner:ow_dip', 'n'],
    brown:    ['b', 'r', 'ow_dip', 'partner:ow_dip', 'n'],
    town:     ['t', 'ow_dip', 'partner:ow_dip', 'n'],
    down:     ['d', 'ow_dip', 'partner:ow_dip', 'n'],
    wolf:     ['w', 'oo_short', 'l', 'f'],
    gold:     ['g', 'o_e', 'l', 'd'],
    book:     ['b', 'oo_short', 'partner:oo_short', 'k'],
    look:     ['l', 'oo_short', 'partner:oo_short', 'k'],
    cook:     ['c', 'oo_short', 'partner:oo_short', 'k'],
    hook:     ['h', 'oo_short', 'partner:oo_short', 'k'],
    foot:     ['f', 'oo_short', 'partner:oo_short', 't'],
    wood:     ['w', 'oo_short', 'partner:oo_short', 'd'],
    good:     ['g', 'oo_short', 'partner:oo_short', 'd'],
    cookie:   ['c', 'oo_short', 'partner:oo_short', 'k', 'ie', 'partner:ie'],
    ghost:    ['g', 'silent:partner', 'o_e', 's', 't'],
    friend:   ['f', 'r', 'e', 'silent:partner', 'n', 'd'],
    guitar:   ['g', 'silent:partner', 'i', 't', 'ar', 'partner:ar'],
    rhythm:   ['r', 'silent:partner', 'y_short', 'th', 'partner:th', 'm'],
    pyramid:  ['p', 'y_short', 'r', 'schwa', 'm', 'i', 'd'],
    crystal:  ['c', 'r', 'y_short', 's', 't', 'schwa', 'l'],
    symbol:   ['s', 'y_short', 'm', 'b', 'schwa', 'l'],
    myth:     ['m', 'y_short', 'th', 'partner:th'],
    oxygen:   ['o', 'x', 'y_short', 'g_soft', 'schwa', 'n'],
    galaxy:   ['g', 'a', 'l', 'schwa', 'x', 'y_e'],
    energy:   ['e', 'n', 'er', 'partner:er', 'g_soft', 'y_e'],
    biology:  ['b', 'i_e', 'o', 'l', 'schwa', 'g_soft', 'y_e'],
    diamond:  ['d', 'i_e', 'schwa', 'm', 'schwa', 'n', 'd'],
    emerald:  ['e', 'm', 'er', 'partner:er', 'schwa', 'l', 'd'],
    pharaoh:  ['ph', 'partner:ph', 'a_e', 'r', 'o_e', 'silent:partner'],
    museum:   ['m', 'u_e', 's', 'e_e', 'u', 'm'],
    chariot:  ['ch', 'partner:ch', 'a', 'r', 'e_e', 'schwa', 't'],
    giant:    ['g_soft', 'i_e', 'schwa', 'n', 't'],
    tiger:    ['t', 'i_e', 'g', 'er', 'partner:er'],
    paper:    ['p', 'a_e', 'p', 'er', 'partner:er'],
    table:    ['t', 'a_e', 'b', 'l', 'silent:vce'],
    apple:    ['a', 'p', 'double:p', 'l', 'silent:vce'],
    turtle:   ['t', 'ur', 'partner:ur', 't', 'l', 'silent:vce'],
    purple:   ['p', 'ur', 'partner:ur', 'p', 'l', 'silent:vce'],
    circle:   ['c_soft', 'ir', 'partner:ir', 'c', 'l', 'silent:vce'],
    pencil:   ['p', 'e', 'n', 'c_soft', 'i', 'l'],
    spider:   ['s', 'p', 'i_e', 'd', 'er', 'partner:er'],
    rocket:   ['r', 'o', 'ck', 'partner:ck', 'e', 't'],
    planet:   ['p', 'l', 'a', 'n', 'e', 't'],
    meteor:   ['m', 'e_e', 't', 'e_e', 'er', 'partner:er'],
    neutron:  ['n', 'ew', 'partner:ew', 't', 'r', 'o', 'n'],
    proton:   ['p', 'r', 'o_e', 't', 'o', 'n'],
    photon:   ['ph', 'partner:ph', 'o_e', 't', 'o', 'n'],
    isotope:  ['i_e', 's', 'schwa', 't', 'o_e', 'p', 'silent:vce'],
    enzyme:   ['e', 'n', 'z', 'i_e', 'm', 'silent:vce'],
    protein:  ['p', 'r', 'o_e', 't', 'ee', 'partner:ee', 'n'],
    genome:   ['g_soft', 'e_e', 'n', 'o_e', 'm', 'silent:vce'],
    neuron:   ['n', 'ew', 'partner:ew', 'r', 'o', 'n'],
    mitosis:  ['m', 'i_e', 't', 'o_e', 's', 'i', 's'],
    osmosis:  ['o', 'z', 'm', 'o_e', 's', 'i', 's'],
    triangle: ['t', 'r', 'i_e', 'a', 'n', 'g', 'l', 'silent:vce'],
    algebra:  ['a', 'l', 'g_soft', 'e', 'b', 'r', 'schwa'],
    geometry: ['g_soft', 'e_e', 'o', 'm', 'schwa', 't', 'r', 'y_e'],
    ratio:    ['r', 'a_e', 'sh', 'e_e', 'o_e'],
    radius:   ['r', 'a_e', 'd', 'e_e', 'u', 's'],
    diameter: ['d', 'i_e', 'a', 'm', 'schwa', 't', 'er', 'partner:er'],
    symmetry: ['s', 'y_short', 'm', 'double:m', 'schwa', 't', 'r', 'y_e'],
    simile:   ['s', 'i', 'm', 'schwa', 'l', 'e_e'],
    prologue: ['p', 'r', 'o_e', 'l', 'o', 'g', 'silent:partner', 'silent:vce'],
    memoir:   ['m', 'e', 'm', 'w', 'ar', 'partner:ar'],
    chronicle:['k', 'partner:k', 'r', 'o', 'n', 'i', 'c', 'l', 'silent:vce'],
    courage:  ['c', 'er', 'partner:er', 'a', 'g_soft', 'silent:vce'],
    science:  ['s', 'silent:partner', 'i_e', 'e', 'n', 'c_soft', 'silent:vce'],
    citizen:  ['c_soft', 'i', 't', 'i', 'z', 'schwa', 'n'],
    senate:   ['s', 'e', 'n', 'schwa', 't', 'silent:vce'],
    colony:   ['c', 'o', 'l', 'schwa', 'n', 'y_e'],
    eclipse:  ['e_e', 'c', 'l', 'i', 'p', 's', 'silent:vce'],
    glacier:  ['g', 'l', 'a_e', 'sh', 'er', 'partner:er'],
    plateau:  ['p', 'l', 'a', 't', 'o_e', 'silent:partner', 'silent:partner'],
    cyclone:  ['c_soft', 'y_i', 'c', 'l', 'o_e', 'n', 'silent:vce'],
    archive:  ['ar', 'partner:ar', 'k', 'partner:k', 'i_e', 'v', 'silent:vce'],
    voyage:   ['v', 'oy', 'partner:oy', 'a', 'g_soft', 'silent:vce'],
    climate:  ['c', 'l', 'i_e', 'm', 'schwa', 't', 'silent:vce'],
    horizon:  ['h', 'er', 'i_e', 'z', 'schwa', 'n'],
    habitat:  ['h', 'a', 'b', 'i', 't', 'a', 't'],
    migrate:  ['m', 'i_e', 'g', 'r', 'a_e', 't', 'silent:vce'],
    gravity:  ['g', 'r', 'a', 'v', 'i', 't', 'y_e'],
    species:  ['s', 'p', 'e_e', 'sh', 'e_e', 'partner:e_e', 'z'],
    nucleus:  ['n', 'u_e', 'c', 'l', 'e_e', 'u', 's'],
    telescope:['t', 'e', 'l', 'schwa', 's', 'c', 'o_e', 'p', 'silent:vce'],
    microscope:['m', 'i_e', 'c', 'r', 'schwa', 's', 'c', 'o_e', 'p', 'silent:vce'],
    satellite:['s', 'a', 't', 'schwa', 'double:l', 'i_e', 't', 'silent:vce'],
    hypothesis:['h', 'y_i', 'p', 'o', 'th', 'partner:th', 'schwa', 's', 'i', 's'],
    analyze:  ['a', 'n', 'schwa', 'l', 'y_i', 'z', 'silent:vce'],
    journal:  ['j', 'er', 'partner:er', 'partner:er', 'n', 'schwa', 'l'],
    dynasty:  ['d', 'y_i', 'n', 'schwa', 's', 't', 'y_e'],
    monarch:  ['m', 'o', 'n', 'ar', 'partner:ar', 'k', 'partner:k'],
    empire:   ['e', 'm', 'p', 'i_e', 'r', 'silent:vce'],
    liberty:  ['l', 'i', 'b', 'er', 'partner:er', 't', 'y_e'],
    justice:  ['j', 'u', 's', 't', 'i', 'c_soft', 'silent:vce'],
    evidence: ['e', 'v', 'i', 'd', 'e', 'n', 'c_soft', 'silent:vce'],
    empathy:  ['e', 'm', 'p', 'schwa', 'th', 'partner:th', 'y_e'],
    strategy: ['s', 't', 'r', 'a', 't', 'schwa', 'g_soft', 'y_e'],
    triumph:  ['t', 'r', 'i_e', 'u', 'm', 'ph', 'partner:ph'],
    inertia:  ['i', 'n', 'er', 'partner:er', 'sh', 'schwa', 'schwa'],
    velocity: ['v', 'schwa', 'l', 'o', 'c_soft', 'i', 't', 'y_e'],
    kinetic:  ['k', 'i', 'n', 'e', 't', 'i', 'c'],
    voltage:  ['v', 'o_e', 'l', 't', 'a', 'g_soft', 'silent:vce'],
    battery:  ['b', 'a', 't', 'double:t', 'er', 'partner:er', 'y_e'],
    turbine:  ['t', 'ur', 'partner:ur', 'b', 'i_e', 'n', 'silent:vce'],
    pendulum: ['p', 'e', 'n', 'd', 'j', 'schwa', 'l', 'u', 'm'],
    catalyst: ['c', 'a', 't', 'schwa', 'l', 'y_short', 's', 't'],
    mixture:  ['m', 'i', 'x', 'ch', 'er', 'partner:er', 'silent:vce'],
    weather_v:['w', 'e', 'silent:partner', 'th', 'partner:th', 'er', 'partner:er']
  };

  const HARD_G_EXCEPTIONS = new Set(['get', 'give', 'gift', 'girl', 'gear', 'geese', 'target', 'begin', 'tiger', 'finger', 'forget', 'anger']);
  const VCE_LONG_MAP = { a: 'a_e', e: 'e_e', i: 'i_e', o: 'o_e', u: 'u_e' };
  const CONSONANT_SET = new Set('bcdfghjklmnpqrstvwxyz'.split(''));
  const VOWEL_SET = new Set('aeiou'.split(''));

  function analyzeWordPhonics(wordStr) {
    const word = String(wordStr || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return [];
    if (SPECIAL_WORD_SLOTS[word]) {
      return SPECIAL_WORD_SLOTS[word].slice();
    }

    const n = word.length;
    const tokens = new Array(n).fill('');

    // Pre-mark trailing VCe (Silent E) when word ends in single vowel + single consonant + e
    let hasTrailingVce = false;
    if (
      n >= 4 &&
      word[n - 1] === 'e' &&
      CONSONANT_SET.has(word[n - 2]) &&
      VOWEL_SET.has(word[n - 3]) &&
      !VOWEL_SET.has(word[n - 4]) &&
      !word.endsWith('tion') &&
      !word.endsWith('sion') &&
      !word.endsWith('ture') &&
      !word.endsWith('le')
    ) {
      // Avoid words like "have", "give", "come", "some", "done", "love", "olive"
      if (word !== 'have' && word !== 'give' && word !== 'come' && word !== 'some' && word !== 'done' && word !== 'love') {
        hasTrailingVce = true;
      }
    }

    let i = 0;
    while (i < n) {
      // Ending -tion / -sion
      if (word.startsWith('tion', i) && i + 4 === n) {
        tokens[i] = 'sh';
        tokens[i + 1] = 'schwa';
        tokens[i + 2] = 'schwa';
        tokens[i + 3] = 'n';
        i += 4;
        continue;
      }
      if (word.startsWith('sion', i) && i + 4 === n) {
        tokens[i] = 'zh';
        tokens[i + 1] = 'schwa';
        tokens[i + 2] = 'schwa';
        tokens[i + 3] = 'n';
        i += 4;
        continue;
      }
      if (word.startsWith('ture', i) && i + 4 === n) {
        tokens[i] = 'ch';
        tokens[i + 1] = 'er';
        tokens[i + 2] = 'partner:er';
        tokens[i + 3] = 'silent:vce';
        i += 4;
        continue;
      }

      // 3-letter units
      if (word.startsWith('igh', i)) {
        tokens[i] = 'igh';
        tokens[i + 1] = 'silent:igh';
        tokens[i + 2] = 'silent:igh';
        i += 3;
        continue;
      }
      if (word.startsWith('tch', i)) {
        tokens[i] = 'silent:partner';
        tokens[i + 1] = 'ch';
        tokens[i + 2] = 'partner:ch';
        i += 3;
        continue;
      }
      if (word.startsWith('dge', i)) {
        tokens[i] = 'silent:partner';
        tokens[i + 1] = 'g_soft';
        tokens[i + 2] = 'silent:vce';
        i += 3;
        continue;
      }

      const two = word.slice(i, i + 2);

      // Initial silent partners kn-, wr-
      if (i === 0 && (two === 'kn' || two === 'wr')) {
        tokens[i] = 'silent:partner';
        tokens[i + 1] = two[1];
        i += 2;
        continue;
      }

      // Trailing VCe long vowel + consonant + silent e
      if (hasTrailingVce && i === n - 3) {
        tokens[i] = VCE_LONG_MAP[word[i]] || word[i];
        tokens[i + 1] = word[i + 1] === 'c' ? 'c_soft' : word[i + 1] === 'g' ? 'g_soft' : word[i + 1];
        tokens[i + 2] = 'silent:vce';
        i += 3;
        continue;
      }

      // 2-letter consonant digraphs
      if (two === 'sh' || two === 'ch' || two === 'th' || two === 'wh' || two === 'ph' || two === 'ck' || two === 'ng' || two === 'qu') {
        tokens[i] = two;
        tokens[i + 1] = `partner:${two}`;
        i += 2;
        continue;
      }

      // Double consonants
      if (two.length === 2 && two[0] === two[1] && CONSONANT_SET.has(two[0])) {
        tokens[i] = two[0];
        tokens[i + 1] = `double:${two[0]}`;
        i += 2;
        continue;
      }

      // Vowel teams & diphthongs
      if (
        two === 'ai' || two === 'ay' || two === 'ee' || two === 'ea' || two === 'ie' ||
        two === 'oa' || two === 'ow' || two === 'ou' || two === 'oi' || two === 'oy' ||
        two === 'au' || two === 'aw' || two === 'oo' || two === 'ew' || two === 'ue' || two === 'ui'
      ) {
        tokens[i] = two;
        tokens[i + 1] = `partner:${two}`;
        i += 2;
        continue;
      }

      // R-controlled vowels
      if (two === 'ar' || two === 'or' || two === 'er' || two === 'ir' || two === 'ur') {
        // Check if followed by another vowel (e.g. "pirate", "forest", "hero") — then r starts next syllable
        if (i + 2 < n && VOWEL_SET.has(word[i + 2]) && !hasTrailingVce) {
          tokens[i] = word[i];
          i += 1;
          continue;
        }
        tokens[i] = two;
        tokens[i + 1] = `partner:${two}`;
        i += 2;
        continue;
      }

      // Single letters with contextual rules
      const ch = word[i];
      const next = word[i + 1] || '';

      // Word-final -le (apple, table, candle, puzzle)
      if (i === n - 2 && two === 'le' && i > 0 && CONSONANT_SET.has(word[i - 1])) {
        tokens[i] = 'l';
        tokens[i + 1] = 'silent:vce';
        i += 2;
        continue;
      }

      if (ch === 'c' && (next === 'e' || next === 'i' || next === 'y')) {
        tokens[i] = 'c_soft';
      } else if (ch === 'g' && (next === 'e' || next === 'i' || next === 'y') && !HARD_G_EXCEPTIONS.has(word)) {
        tokens[i] = 'g_soft';
      } else if (ch === 'y') {
        if (i === 0) {
          tokens[i] = 'y';
        } else if (i === n - 1) {
          const hasEarlierVowel = /[aeiou]/.test(word.slice(0, i));
          tokens[i] = hasEarlierVowel ? 'y_e' : 'y_i';
        } else {
          tokens[i] = 'y_short';
        }
      } else {
        tokens[i] = ch;
      }
      i += 1;
    }

    return tokens;
  }

  function deriveSoundUnitsFromSlots(slotTokens) {
    const units = [];
    for (const tok of slotTokens) {
      if (!tok || tok.startsWith('partner:') || tok.startsWith('double:') || tok.startsWith('silent:')) {
        continue;
      }
      units.push(tok);
    }
    return units;
  }

  function buildWordEntry(raw) {
    const word = String(raw.word || '').toLowerCase().trim();
    const slotTokens = analyzeWordPhonics(word);
    const derivedUnits = deriveSoundUnitsFromSlots(slotTokens);
    const soundUnits = Array.isArray(raw.soundUnits) && raw.soundUnits.length > 0
      ? raw.soundUnits.slice()
      : derivedUnits;
    const phonemes = Array.isArray(raw.phonemes) && raw.phonemes.length > 0
      ? raw.phonemes.slice()
      : soundUnits.map((u) => PHONEME_SOUNDS[u] || `/${u}/`);

    return {
      word,
      emoji: raw.emoji || '📖',
      tier: raw.tier || 'k',
      onset: raw.onset || '',
      rime: raw.rime || '',
      tiles: Array.isArray(raw.tiles) ? raw.tiles.slice() : word.split(''),
      letters: word.split(''),
      phonemes,
      soundUnits,
      slotTokens,
      decoys: Array.isArray(raw.decoys) ? raw.decoys.slice() : [],
      meaning: raw.meaning || WORD_MEANINGS[word] || ''
    };
  }

  const WORDS = RAW_WORDS.map((entry) => buildWordEntry(entry));

  // Merge RAW_WORDS + EXTENDED_BUILDER_RAW into deduplicated BUILDER_WORDS
  const builderMap = new Map();
  WORDS.forEach((entry) => builderMap.set(entry.word, entry));
  EXTENDED_BUILDER_RAW.forEach(([word, emoji, tier, meaning]) => {
    if (!builderMap.has(word)) {
      WORD_MEANINGS[word] = WORD_MEANINGS[word] || meaning;
      builderMap.set(word, buildWordEntry({ word, emoji, tier, meaning }));
    }
  });
  const BUILDER_WORDS = Array.from(builderMap.values());

  function getWords(tier) {
    if (!tier || tier === 'all') {
      return WORDS.slice();
    }
    const filtered = WORDS.filter((entry) => entry.tier === tier);
    return filtered.length > 0 ? filtered : WORDS.slice();
  }

  function getBuilderWords(tier) {
    if (!tier || tier === 'all' || tier === 'all_k8') {
      return BUILDER_WORDS.slice();
    }
    if (tier === 'g6_8') {
      return BUILDER_WORDS.filter((entry) => entry.tier === 'g6' || entry.tier === 'g7_8');
    }
    const filtered = BUILDER_WORDS.filter((entry) => entry.tier === tier);
    return filtered.length > 0 ? filtered : BUILDER_WORDS.slice();
  }

  function pickWord(tier, excludeWord) {
    const pool = getWords(tier);
    const excludeText = typeof excludeWord === 'string'
      ? excludeWord.trim().toLowerCase()
      : (excludeWord && excludeWord.word ? String(excludeWord.word).trim().toLowerCase() : '');

    const candidates = excludeText && pool.length > 1
      ? pool.filter((entry) => entry.word !== excludeText)
      : pool;

    const list = candidates.length > 0 ? candidates : pool;
    return list[Math.floor(Math.random() * list.length)];
  }

  function findWord(str) {
    if (!str) return null;
    const key = String(str).trim().toLowerCase();
    if (!key) return null;
    return builderMap.get(key) || WORDS.find((entry) => entry.word === key) || null;
  }

  let soundSequenceTimers = [];

  function clearSoundSequence() {
    soundSequenceTimers.forEach((id) => clearTimeout(id));
    soundSequenceTimers = [];
  }

  function getUfliGrapheme(token) {
    if (token === undefined || token === null) return null;
    const raw = String(token).trim().toLowerCase().replace(/^\/|\/$/g, '');
    const key = PHONEME_ALIAS[raw] || raw;
    return UFLI_GRAPHEMES[key] || null;
  }

  function getLetterSound(ch) {
    if (ch === undefined || ch === null) return '';
    const key = String(ch).trim().toLowerCase().replace(/^\/|\/$/g, '');
    if (!key) return '';
    if (UFLI_GRAPHEMES[key]) return UFLI_GRAPHEMES[key].symbol;
    return PHONEME_SOUNDS[key] || `/${key}/`;
  }

  function pickSafeExample(info, targetWord) {
    if (!info) return { keyword: '', emoji: '' };
    const cleanWord = String(targetWord || '').toLowerCase();
    if (info.keyword && info.keyword.toLowerCase() !== cleanWord) {
      return { keyword: info.keyword, emoji: info.emoji || '' };
    }
    if (info.altKeyword && info.altKeyword.toLowerCase() !== cleanWord) {
      return { keyword: info.altKeyword, emoji: info.altEmoji || info.emoji || '' };
    }
    return { keyword: '', emoji: '' };
  }

  // Slow, natural spoken explanation per phoneme (never mentions the letter name!)
  const SPOKEN_PHONICS_GUIDE = {
    a:        (ex) => `Short vowel aah. Open your mouth wide, like at the start of ${ex}.`,
    b:        (ex) => `Quick lip pop sound. Press your lips and pop, like at the start of ${ex}.`,
    c:        (ex) => `Crisp throat click sound, like at the start of ${ex}.`,
    c_soft:   (ex) => `Soft hissing sound, like at the start of ${ex}.`,
    d:        (ex) => `Quick tongue tap sound behind your top teeth, like at the start of ${ex}.`,
    e:        (ex) => `Short vowel eh. Relax your mouth, like at the start of ${ex}.`,
    f:        (ex) => `Soft airy breath sound, top teeth on your bottom lip, like at the start of ${ex}.`,
    g:        (ex) => `Quick throat pop sound, like at the start of ${ex}.`,
    g_soft:   (ex) => `Crisp jump sound, like at the start of ${ex}.`,
    h:        (ex) => `Soft breathy puff, breathe out gently, like at the start of ${ex}.`,
    i:        (ex) => `Short vowel ih. Smile slightly, like at the start of ${ex}.`,
    j:        (ex) => `Crisp jump sound, like at the start of ${ex}.`,
    k:        (ex) => `Crisp throat click sound, like at the start of ${ex}.`,
    l:        (ex) => `Smooth rolling tongue sound behind your top teeth, like at the start of ${ex}.`,
    m:        (ex) => `Humming lips sound, mmm. Keep lips closed and hum, like at the start of ${ex}.`,
    n:        (ex) => `Humming nose sound. Press your tongue up and hum, like at the start of ${ex}.`,
    o:        (ex) => `Short vowel aww. Make a round circle mouth, like at the start of ${ex}.`,
    p:        (ex) => `Quick puff of air from your lips, like at the start of ${ex}.`,
    q:        (ex) => `Blended glide sound, like at the start of ${ex}.`,
    qu:       (ex) => `Blended glide sound, like at the start of ${ex}.`,
    r:        (ex) => `Smooth curled tongue sound, like at the start of ${ex}.`,
    s:        (ex) => `Continuous hissing sound, stretch the air, like at the start of ${ex}.`,
    t:        (ex) => `Quick tongue tip tap behind your top teeth, like at the start of ${ex}.`,
    u:        (ex) => `Short vowel uh. Keep your mouth relaxed, like at the start of ${ex}.`,
    v:        (ex) => `Buzzy lip sound, teeth on bottom lip, like at the start of ${ex}.`,
    w:        (ex) => `Smooth rounded glide, round your lips and open, like at the start of ${ex}.`,
    x:        (ex) => `Blended click and hiss sound, like at the end of ${ex}.`,
    y:        (ex) => `Smooth forward glide sound, like at the start of ${ex}.`,
    y_i:      (ex) => `Long vowel eye sound at the end, like in ${ex}.`,
    y_e:      (ex) => `Long vowel eee sound at the end, like in ${ex}.`,
    y_short:  (ex) => `Short vowel ih sound inside the word, like in ${ex}.`,
    z:        (ex) => `Continuous buzzing sound, like at the start of ${ex}.`,
    sh:       (ex) => `Quiet shushing sound, shhh, like at the start of ${ex}.`,
    ch:       (ex) => `Crisp train sound, like at the start of ${ex}.`,
    th:       (ex) => `Soft breath with tongue between teeth, like at the start of ${ex}.`,
    wh:       (ex) => `Breathy rounded glide, like at the start of ${ex}.`,
    ph:       (ex) => `Soft airy breath sound, two letters teaming up, like at the start of ${ex}.`,
    ck:       (ex) => `Crisp throat click sound after a short vowel, like at the end of ${ex}.`,
    ng:       (ex) => `Back-of-throat humming sound, like at the end of ${ex}.`,
    ff:       (ex) => `Doubled airy breath sound, like at the end of ${ex}.`,
    ll:       (ex) => `Doubled smooth tongue sound, like at the end of ${ex}.`,
    ss:       (ex) => `Doubled hissing sound, like at the end of ${ex}.`,
    zz:       (ex) => `Doubled buzzing sound, like at the end of ${ex}.`,
    a_e:      (ex) => `Long vowel ay. It says its own name, like in ${ex}.`,
    i_e:      (ex) => `Long vowel eye. It says its own name, like in ${ex}.`,
    o_e:      (ex) => `Long vowel oh. It says its own name, like in ${ex}.`,
    u_e:      (ex) => `Long vowel you, like in ${ex}.`,
    e_e:      (ex) => `Long vowel eee. It says its own name, like in ${ex}.`,
    ai:       (ex) => `Long vowel ay, vowel team sound, like in ${ex}.`,
    ay:       (ex) => `Long vowel ay, vowel team at the end, like in ${ex}.`,
    ee:       (ex) => `Long vowel eee, vowel team sound, like in ${ex}.`,
    ea:       (ex) => `Long vowel eee, vowel team sound, like in ${ex}.`,
    ie:       (ex) => `Long vowel eee, vowel team sound, like in ${ex}.`,
    oa:       (ex) => `Long vowel oh, vowel team sound, like in ${ex}.`,
    ow:       (ex) => `Long vowel oh sound, like in ${ex}.`,
    ow_dip:   (ex) => `Gliding ow sound, mouth moves from open to round, like in ${ex}.`,
    ou:       (ex) => `Gliding ow sound, mouth moves from open to round, like in ${ex}.`,
    oi:       (ex) => `Gliding oy sound, like in ${ex}.`,
    oy:       (ex) => `Gliding oy sound, like in ${ex}.`,
    au:       (ex) => `Open aww vowel sound, like in ${ex}.`,
    aw:       (ex) => `Open aww vowel sound, like in ${ex}.`,
    oo:       (ex) => `Long oo sound with rounded lips, like in ${ex}.`,
    oo_short: (ex) => `Short oo sound, relaxed rounded lips, like in ${ex}.`,
    ew:       (ex) => `Long oo sound, like in ${ex}.`,
    ue:       (ex) => `Long oo sound, like in ${ex}.`,
    ui:       (ex) => `Long oo sound, like in ${ex}.`,
    igh:      (ex) => `Long vowel eye, three letters teaming up, like in ${ex}.`,
    ar:       (ex) => `R-controlled arrr sound, like in ${ex}.`,
    or:       (ex) => `R-controlled orrr sound, like in ${ex}.`,
    er:       (ex) => `R-controlled errr sound, like in ${ex}.`,
    ir:       (ex) => `R-controlled errr sound, like in ${ex}.`,
    ur:       (ex) => `R-controlled errr sound, like in ${ex}.`,
    schwa:    (ex) => `Soft relaxed uh vowel sound, like at the start of ${ex}.`,
    zh:       (ex) => `Soft voiced buzzing sound, like in the middle of ${ex}.`
  };

  function buildSlowPhonicsSpeech(phonemeKey, exampleWord, mode = 'primary') {
    const cleanEx = exampleWord || 'that sound';
    const guideFn = SPOKEN_PHONICS_GUIDE[phonemeKey];
    if (mode === 'double') {
      const baseSpeech = guideFn ? guideFn(cleanEx) : `Doubled sound, like in ${cleanEx}.`;
      return `Doubled sound! Same letter as right before it. ${baseSpeech}`;
    }
    if (mode === 'partner') {
      const baseSpeech = guideFn ? guideFn(cleanEx) : `Partner sound, like in ${cleanEx}.`;
      return `Partner sound! Teams up with the letter right before it. ${baseSpeech}`;
    }
    if (guideFn) {
      return guideFn(cleanEx);
    }
    return `Listen for the sound like in ${cleanEx}.`;
  }

  /**
   * Returns a contextual phonics hint for a single box in a word.
   * NEVER reveals the target word or the target letter name!
   */
  function getPhonicsHintForSlot(wordOrEntry, idx) {
    const entry = typeof wordOrEntry === 'string' ? findWord(wordOrEntry) : wordOrEntry;
    const word = typeof wordOrEntry === 'string'
      ? wordOrEntry.trim().toLowerCase()
      : (entry && entry.word ? entry.word.toLowerCase() : '');
    if (!word || idx < 0 || idx >= word.length) {
      return {
        phonemeKey: '',
        symbol: '',
        keyword: '',
        emoji: '',
        isSilent: false,
        text: 'Listen closely to the word sound and find the matching letter!',
        spokenCue: 'Listen closely to the word sound and find the matching letter.'
      };
    }

    const tokens = (entry && Array.isArray(entry.slotTokens) && entry.slotTokens.length === word.length)
      ? entry.slotTokens
      : analyzeWordPhonics(word);
    const tok = tokens[idx] || word[idx];

    // 1. Silent trailing helper (Magic-E or -le)
    if (tok === 'silent:vce') {
      return {
        phonemeKey: '',
        symbol: '(silent)',
        keyword: '',
        emoji: '🤫',
        isSilent: true,
        text: `💡 Phonics hint: Silent helper at the end! It makes no sound of its own (it helps the vowel or ending sound).`,
        spokenCue: 'Silent helper at the end! It makes no sound, and helps the vowel say its long name.'
      };
    }

    // 2. Other silent partner letters (e.g., silent k in knight, silent g/h in igh, silent s in island)
    if (tok.startsWith('silent:')) {
      const nextTok = tokens[idx + 1] && !tokens[idx + 1].startsWith('silent:') && !tokens[idx + 1].startsWith('partner:')
        ? tokens[idx + 1]
        : '';
      const nextSym = nextTok ? getLetterSound(nextTok) : '';
      return {
        phonemeKey: nextTok || '',
        symbol: '(silent)',
        keyword: '',
        emoji: '🤫',
        isSilent: true,
        text: nextSym
          ? `💡 Phonics hint: Silent partner right next to ${nextSym} — find the quiet helper letter!`
          : `💡 Phonics hint: Silent partner letter that teams up quietly with its neighbor!`,
        spokenCue: 'Silent partner letter! It makes no sound of its own and teams up quietly with its neighbor.'
      };
    }

    // 3. Doubled consonant second slot (e.g., second l in bell)
    if (tok.startsWith('double:')) {
      const base = tok.slice('double:'.length);
      const info = UFLI_GRAPHEMES[base];
      const sym = getLetterSound(base);
      const ex = pickSafeExample(info, word);
      return {
        phonemeKey: base,
        symbol: sym,
        keyword: ex.keyword,
        emoji: ex.emoji,
        isSilent: false,
        text: `💡 Phonics hint: ${sym} — doubles the sound right after itself to keep the vowel short!`,
        spokenCue: buildSlowPhonicsSpeech(base, ex.keyword, 'double')
      };
    }

    // 4. Second letter of a multi-letter grapheme (digraph, vowel team, r-controlled)
    if (tok.startsWith('partner:')) {
      const base = tok.slice('partner:'.length);
      const info = UFLI_GRAPHEMES[base];
      const sym = getLetterSound(base);
      const ex = pickSafeExample(info, word);
      const exPart = ex.keyword ? ` (like in "${ex.keyword}" ${ex.emoji})` : '';
      return {
        phonemeKey: base,
        symbol: sym,
        keyword: ex.keyword,
        emoji: ex.emoji,
        isSilent: false,
        text: `💡 Phonics hint: ${sym} — teams up with the letter right before it${exPart}. Find the partner letter!`,
        spokenCue: buildSlowPhonicsSpeech(base, ex.keyword, 'partner')
      };
    }

    // 5. Primary grapheme sound (single letter, soft c/g, VCe vowel, digraph lead, vowel team lead, r-controlled lead)
    const info = UFLI_GRAPHEMES[tok] || UFLI_GRAPHEMES[word[idx]] || null;
    const sym = getLetterSound(tok);
    const ex = pickSafeExample(info, word);
    const isMulti = tok.length >= 2 && !tok.includes('_') && tok !== 'qu';
    const cueIntro = info && info.cue ? `${info.cue}` : `Makes the ${sym} sound as in`;
    const exPart = ex.keyword ? `"${ex.keyword}" ${ex.emoji}` : 'this sound';
    const teamNote = isMulti ? ' (teams up with the next letter)' : '';

    return {
      phonemeKey: tok,
      symbol: sym,
      keyword: ex.keyword,
      emoji: ex.emoji,
      isSilent: false,
      text: `💡 Phonics hint: ${sym}${teamNote} — ${cueIntro} ${exPart}. Find the letter!`,
      spokenCue: buildSlowPhonicsSpeech(tok, ex.keyword, 'primary')
    };
  }

  function speakPhoneme(token, cancelActive = true, boost = 3.0) {
    if (token === undefined || token === null) return '';
    const raw = String(token).trim().toLowerCase().replace(/^\/|\/$/g, '');
    if (!raw) return '';
    const key = PHONEME_ALIAS[raw] || raw;
    const cue = getLetterSound(key);

    if (cancelActive) {
      clearSoundSequence();
      if (AudioEngine && typeof AudioEngine.stopSpeech === 'function') {
        AudioEngine.stopSpeech();
      }
    }

    // Consonant blends play both constituent phonemes smoothly (connected phonation)
    if (CONSONANT_BLENDS[key] && AudioEngine && typeof AudioEngine.playPhoneme === 'function') {
      const [c1, c2] = CONSONANT_BLENDS[key];
      const ok1 = AudioEngine.playPhoneme(c1, 0, boost);
      const ok2 = AudioEngine.playPhoneme(c2, 0.16, boost);
      if (ok1 || ok2) return cue;
    }

    if (AudioEngine && typeof AudioEngine.playPhoneme === 'function') {
      if (AudioEngine.playPhoneme(key, 0, boost)) {
        return cue;
      }
    }

    // Fallback if Web Audio unavailable
    const info = UFLI_GRAPHEMES[key];
    if (AudioEngine && typeof AudioEngine.speak === 'function') {
      if (info && info.keyword) {
        AudioEngine.speak(`like ${info.keyword}`, 'gentle');
      } else {
        AudioEngine.speak(raw, 'gentle');
      }
    }
    return cue;
  }

  // Spoken hint explains the phonics sound slowly with an example at full system volume (no box number, no letter name, no target word!)
  function speakSlotPhonicsHint(hint) {
    if (!hint) return;
    clearSoundSequence();
    if (AudioEngine && typeof AudioEngine.stopSpeech === 'function') {
      AudioEngine.stopSpeech();
    }
    if (hint.spokenCue && AudioEngine && typeof AudioEngine.speak === 'function') {
      AudioEngine.speak(hint.spokenCue, 'slow');
      return;
    }
    if (hint.phonemeKey) {
      speakPhoneme(hint.phonemeKey, true, 3.4);
    }
  }

  // Plays the contextual phonics sound for slot `idx` when a letter is placed correctly
  function speakSlotPhoneme(wordOrEntry, idx) {
    const entry = typeof wordOrEntry === 'string' ? findWord(wordOrEntry) : wordOrEntry;
    const word = typeof wordOrEntry === 'string'
      ? wordOrEntry.trim().toLowerCase()
      : (entry && entry.word ? entry.word.toLowerCase() : '');
    if (!word || idx < 0 || idx >= word.length) return;

    const tokens = (entry && Array.isArray(entry.slotTokens) && entry.slotTokens.length === word.length)
      ? entry.slotTokens
      : analyzeWordPhonics(word);
    const tok = tokens[idx] || word[idx];

    if (tok === 'silent:vce' && idx >= 2) {
      const vowelKey = VCE_LONG_MAP[word[idx - 2]] || `${word[idx - 2]}_e`;
      speakPhoneme(vowelKey);
      return;
    }
    if (tok.startsWith('silent:')) {
      return;
    }
    if (tok.startsWith('double:')) {
      speakPhoneme(tok.slice('double:'.length));
      return;
    }
    if (tok.startsWith('partner:')) {
      speakPhoneme(tok.slice('partner:'.length));
      return;
    }
    speakPhoneme(tok);
  }

  // Separated Letter + Phoneme cue ("Letter M sounds ... /mmm/") for Air-Trace / direct letter drills
  function speakLetterAndSound(token) {
    if (token === undefined || token === null) return;
    const raw = String(token).trim().toLowerCase().replace(/^\/|\/$/g, '');
    if (!raw) return;
    clearSoundSequence();
    const letterSpoken = raw.length === 1 ? raw.toUpperCase() : raw;
    if (AudioEngine && typeof AudioEngine.speak === 'function') {
      AudioEngine.speak(`Letter ${letterSpoken} sounds`, 'gentle', () => {
        const id = setTimeout(() => {
          speakPhoneme(raw, false);
        }, 90);
        soundSequenceTimers.push(id);
      });
    } else {
      speakPhoneme(raw, false);
    }
  }

  // UFLI Connected Phonation Routine: play clean phoneme-by-phoneme, then smoothly blend the word
  function speakWordSounds(wordOrEntry, onStep) {
    clearSoundSequence();
    if (AudioEngine && typeof AudioEngine.stopSpeech === 'function') {
      AudioEngine.stopSpeech();
    }
    const entry = typeof wordOrEntry === 'string' ? findWord(wordOrEntry) : wordOrEntry;
    const units = entry && Array.isArray(entry.soundUnits) && entry.soundUnits.length > 0
      ? entry.soundUnits
      : (entry && Array.isArray(entry.phonemes) ? entry.phonemes : []);
    const wordText = typeof wordOrEntry === 'string' ? wordOrEntry : (entry && entry.word) || '';

    if (units.length === 0) {
      if (wordText) speakWord(wordText);
      return;
    }

    const stepMs = units.length > 6 ? 320 : 390;
    units.forEach((unit, idx) => {
      const id = setTimeout(() => {
        speakPhoneme(unit, false);
        if (typeof onStep === 'function') onStep(idx, unit);
      }, idx * stepMs);
      soundSequenceTimers.push(id);
    });

    if (wordText) {
      const blendId = setTimeout(() => {
        speakWord(wordText);
      }, units.length * stepMs + 180);
      soundSequenceTimers.push(blendId);
    }
  }

  function getMeaning(word) {
    if (!word) return '';
    const key = String(word).trim().toLowerCase();
    return WORD_MEANINGS[key] || '';
  }

  function speakWord(word, prefix) {
    const text = typeof word === 'string'
      ? word.trim()
      : (word && word.word ? String(word.word).trim() : '');
    if (!text) return '';
    const spoken = prefix ? `${String(prefix).trim()} ${text}` : text;
    if (AudioEngine && typeof AudioEngine.speak === 'function') {
      AudioEngine.speak(spoken, 'normal');
    }
    return spoken;
  }

  const EnglishPhonics = {
    TIERS,
    BUILDER_TIERS,
    WORDS,
    BUILDER_WORDS,
    MAGIC_E_PAIRS,
    PHONEME_SOUNDS,
    UFLI_GRAPHEMES,
    WORD_MEANINGS,
    getWords,
    getBuilderWords,
    pickWord,
    findWord,
    getMeaning,
    getUfliGrapheme,
    getLetterSound,
    analyzeWordPhonics,
    getPhonicsHintForSlot,
    speakPhoneme,
    speakSlotPhoneme,
    speakSlotPhonicsHint,
    speakLetterAndSound,
    speakWordSounds,
    speakWord
  };

  app.EnglishPhonics = EnglishPhonics;
})(window.KidApp = window.KidApp || {});
