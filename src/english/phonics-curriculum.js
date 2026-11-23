/* K–5 English Phonics Curriculum & Audio Cues (3-Letter & 4-Letter Regular Words) */
(function (app) {
  'use strict';

  const { AudioEngine } = app;

const TIERS = [
    { id: 'k', label: '🐣 K (3-Letter)' },
    { id: 'g1', label: '🌱 G1 (Blends)' },
    { id: 'g2', label: '🚀 G2 (Digraphs)' },
    { id: 'g3', label: '✨ G3 (Magic-E)' },
    { id: 'g4_5', label: '👑 G4–5 (Teams)' },
    { id: 'all', label: '🎲 All K–5' }
  ];

  const RAW_WORDS = [
    // Kindergarten ('k') — 12 regular 3-letter CVC words
    { word: 'cat', emoji: '🐱', tier: 'k', onset: 'c', rime: 'at', tiles: ['c', 'a', 't'], phonemes: ['kuh', 'ah', 'tuh'], decoys: ['bat', 'hat', 'cot'] },
    { word: 'dog', emoji: '🐶', tier: 'k', onset: 'd', rime: 'og', tiles: ['d', 'o', 'g'], phonemes: ['duh', 'aw', 'guh'], decoys: ['log', 'fog', 'dig'] },
    { word: 'sun', emoji: '☀️', tier: 'k', onset: 's', rime: 'un', tiles: ['s', 'u', 'n'], phonemes: ['sss', 'uh', 'nnn'], decoys: ['fun', 'run', 'bun'] },
    { word: 'pig', emoji: '🐷', tier: 'k', onset: 'p', rime: 'ig', tiles: ['p', 'i', 'g'], phonemes: ['puh', 'ih', 'guh'], decoys: ['dig', 'wig', 'peg'] },
    { word: 'hat', emoji: '🎩', tier: 'k', onset: 'h', rime: 'at', tiles: ['h', 'a', 't'], phonemes: ['huh', 'ah', 'tuh'], decoys: ['cat', 'bat', 'hot'] },
    { word: 'bed', emoji: '🛏️', tier: 'k', onset: 'b', rime: 'ed', tiles: ['b', 'e', 'd'], phonemes: ['buh', 'eh', 'duh'], decoys: ['red', 'fed', 'bad'] },
    { word: 'bus', emoji: '🚌', tier: 'k', onset: 'b', rime: 'us', tiles: ['b', 'u', 's'], phonemes: ['buh', 'uh', 'sss'], decoys: ['bug', 'bun', 'bat'] },
    { word: 'fox', emoji: '🦊', tier: 'k', onset: 'f', rime: 'ox', tiles: ['f', 'o', 'x'], phonemes: ['fff', 'aw', 'ks'], decoys: ['box', 'fix', 'fan'] },
    { word: 'cup', emoji: '☕', tier: 'k', onset: 'c', rime: 'up', tiles: ['c', 'u', 'p'], phonemes: ['kuh', 'uh', 'puh'], decoys: ['pup', 'cap', 'cub'] },
    { word: 'bug', emoji: '🐛', tier: 'k', onset: 'b', rime: 'ug', tiles: ['b', 'u', 'g'], phonemes: ['buh', 'uh', 'guh'], decoys: ['hug', 'mug', 'bag'] },
    { word: 'map', emoji: '🗺️', tier: 'k', onset: 'm', rime: 'ap', tiles: ['m', 'a', 'p'], phonemes: ['mmm', 'ah', 'puh'], decoys: ['cap', 'nap', 'mop'] },
    { word: 'net', emoji: '🥅', tier: 'k', onset: 'n', rime: 'et', tiles: ['n', 'e', 't'], phonemes: ['nnn', 'eh', 'tuh'], decoys: ['pet', 'jet', 'nut'] },

    // Grade 1 ('g1') — 12 regular 4-letter initial/final blend words
    { word: 'frog', emoji: '🐸', tier: 'g1', onset: 'fr', rime: 'og', tiles: ['f', 'r', 'o', 'g'], phonemes: ['fff', 'rrr', 'aw', 'guh'], decoys: ['flag', 'fog', 'from'] },
    { word: 'crab', emoji: '🦀', tier: 'g1', onset: 'cr', rime: 'ab', tiles: ['c', 'r', 'a', 'b'], phonemes: ['kuh', 'rrr', 'ah', 'buh'], decoys: ['crib', 'clam', 'cab'] },
    { word: 'drum', emoji: '🥁', tier: 'g1', onset: 'dr', rime: 'um', tiles: ['d', 'r', 'u', 'm'], phonemes: ['duh', 'rrr', 'uh', 'mmm'], decoys: ['drop', 'plum', 'dam'] },
    { word: 'flag', emoji: '🚩', tier: 'g1', onset: 'fl', rime: 'ag', tiles: ['f', 'l', 'a', 'g'], phonemes: ['fff', 'lll', 'ah', 'guh'], decoys: ['flat', 'frog', 'bag'] },
    { word: 'clap', emoji: '👏', tier: 'g1', onset: 'cl', rime: 'ap', tiles: ['c', 'l', 'a', 'p'], phonemes: ['kuh', 'lll', 'ah', 'puh'], decoys: ['clip', 'flap', 'cap'] },
    { word: 'swim', emoji: '🏊', tier: 'g1', onset: 'sw', rime: 'im', tiles: ['s', 'w', 'i', 'm'], phonemes: ['sss', 'wuh', 'ih', 'mmm'], decoys: ['slim', 'spin', 'win'] },
    { word: 'stop', emoji: '🛑', tier: 'g1', onset: 'st', rime: 'op', tiles: ['s', 't', 'o', 'p'], phonemes: ['sss', 'tuh', 'aw', 'puh'], decoys: ['step', 'spot', 'top'] },
    { word: 'plum', emoji: '🫐', tier: 'g1', onset: 'pl', rime: 'um', tiles: ['p', 'l', 'u', 'm'], phonemes: ['puh', 'lll', 'uh', 'mmm'], decoys: ['plan', 'plug', 'drum'] },
    { word: 'lamp', emoji: '💡', tier: 'g1', onset: 'l', rime: 'amp', tiles: ['l', 'a', 'm', 'p'], phonemes: ['lll', 'ah', 'mmm', 'puh'], decoys: ['camp', 'damp', 'limp'] },
    { word: 'tent', emoji: '⛺', tier: 'g1', onset: 't', rime: 'ent', tiles: ['t', 'e', 'n', 't'], phonemes: ['tuh', 'eh', 'nnn', 'tuh'], decoys: ['bent', 'sent', 'tint'] },
    { word: 'hand', emoji: '✋', tier: 'g1', onset: 'h', rime: 'and', tiles: ['h', 'a', 'n', 'd'], phonemes: ['huh', 'ah', 'nnn', 'duh'], decoys: ['land', 'sand', 'band'] },
    { word: 'nest', emoji: '🪺', tier: 'g1', onset: 'n', rime: 'est', tiles: ['n', 'e', 's', 't'], phonemes: ['nnn', 'eh', 'sss', 'tuh'], decoys: ['best', 'rest', 'test'] },

    // Grade 2 ('g2') — 12 regular 4-letter digraph & FLOSS words
    { word: 'ship', emoji: '🚢', tier: 'g2', onset: 'sh', rime: 'ip', tiles: ['sh', 'i', 'p'], phonemes: ['shh', 'ih', 'puh'], decoys: ['shop', 'chip', 'slip'] },
    { word: 'fish', emoji: '🐟', tier: 'g2', onset: 'f', rime: 'ish', tiles: ['f', 'i', 'sh'], phonemes: ['fff', 'ih', 'shh'], decoys: ['dish', 'wish', 'fist'] },
    { word: 'shop', emoji: '🛍️', tier: 'g2', onset: 'sh', rime: 'op', tiles: ['sh', 'o', 'p'], phonemes: ['shh', 'aw', 'puh'], decoys: ['ship', 'chop', 'stop'] },
    { word: 'chip', emoji: '🍟', tier: 'g2', onset: 'ch', rime: 'ip', tiles: ['ch', 'i', 'p'], phonemes: ['chuh', 'ih', 'puh'], decoys: ['chop', 'ship', 'clip'] },
    { word: 'chat', emoji: '💬', tier: 'g2', onset: 'ch', rime: 'at', tiles: ['ch', 'a', 't'], phonemes: ['chuh', 'ah', 'tuh'], decoys: ['that', 'chap', 'flat'] },
    { word: 'chin', emoji: '😊', tier: 'g2', onset: 'ch', rime: 'in', tiles: ['ch', 'i', 'n'], phonemes: ['chuh', 'ih', 'nnn'], decoys: ['thin', 'shin', 'spin'] },
    { word: 'bath', emoji: '🛁', tier: 'g2', onset: 'b', rime: 'ath', tiles: ['b', 'a', 'th'], phonemes: ['buh', 'ah', 'thh'], decoys: ['path', 'math', 'bash'] },
    { word: 'moth', emoji: '🦋', tier: 'g2', onset: 'm', rime: 'oth', tiles: ['m', 'o', 'th'], phonemes: ['mmm', 'aw', 'thh'], decoys: ['math', 'moss', 'with'] },
    { word: 'duck', emoji: '🦆', tier: 'g2', onset: 'd', rime: 'uck', tiles: ['d', 'u', 'ck'], phonemes: ['duh', 'uh', 'kuh'], decoys: ['luck', 'truck', 'dock'] },
    { word: 'lock', emoji: '🔒', tier: 'g2', onset: 'l', rime: 'ock', tiles: ['l', 'o', 'ck'], phonemes: ['lll', 'aw', 'kuh'], decoys: ['rock', 'sock', 'lick'] },
    { word: 'ring', emoji: '💍', tier: 'g2', onset: 'r', rime: 'ing', tiles: ['r', 'i', 'ng'], phonemes: ['rrr', 'ih', 'ng'], decoys: ['king', 'sing', 'wing'] },
    { word: 'bell', emoji: '🔔', tier: 'g2', onset: 'b', rime: 'ell', tiles: ['b', 'e', 'll'], phonemes: ['buh', 'eh', 'lll'], decoys: ['well', 'tell', 'ball'] },

    // Grade 3 ('g3') — 12 regular 4-letter Magic-E & r-controlled words
    { word: 'cake', emoji: '🎂', tier: 'g3', onset: 'c', rime: 'ake', tiles: ['c', 'a', 'k', 'e'], phonemes: ['kuh', 'ay', 'kuh', 'silent e'], decoys: ['bake', 'lake', 'make'] },
    { word: 'bike', emoji: '🚲', tier: 'g3', onset: 'b', rime: 'ike', tiles: ['b', 'i', 'k', 'e'], phonemes: ['buh', 'eye', 'kuh', 'silent e'], decoys: ['hike', 'like', 'bake'] },
    { word: 'kite', emoji: '🪁', tier: 'g3', onset: 'k', rime: 'ite', tiles: ['k', 'i', 't', 'e'], phonemes: ['kuh', 'eye', 'tuh', 'silent e'], decoys: ['bite', 'kit', 'kate'] },
    { word: 'bone', emoji: '🦴', tier: 'g3', onset: 'b', rime: 'one', tiles: ['b', 'o', 'n', 'e'], phonemes: ['buh', 'oh', 'nnn', 'silent e'], decoys: ['cone', 'tone', 'done'] },
    { word: 'cube', emoji: '🧊', tier: 'g3', onset: 'c', rime: 'ube', tiles: ['c', 'u', 'b', 'e'], phonemes: ['kuh', 'yoo', 'buh', 'silent e'], decoys: ['tube', 'cub', 'cute'] },
    { word: 'tape', emoji: '🩹', tier: 'g3', onset: 't', rime: 'ape', tiles: ['t', 'a', 'p', 'e'], phonemes: ['tuh', 'ay', 'puh', 'silent e'], decoys: ['cape', 'tap', 'take'] },
    { word: 'cape', emoji: '🦸', tier: 'g3', onset: 'c', rime: 'ape', tiles: ['c', 'a', 'p', 'e'], phonemes: ['kuh', 'ay', 'puh', 'silent e'], decoys: ['tape', 'cap', 'cake'] },
    { word: 'pine', emoji: '🌲', tier: 'g3', onset: 'p', rime: 'ine', tiles: ['p', 'i', 'n', 'e'], phonemes: ['puh', 'eye', 'nnn', 'silent e'], decoys: ['line', 'pin', 'fine'] },
    { word: 'star', emoji: '⭐', tier: 'g3', onset: 'st', rime: 'ar', tiles: ['s', 't', 'ar'], phonemes: ['sss', 'tuh', 'ar'], decoys: ['scar', 'stir', 'stay'] },
    { word: 'bark', emoji: '🐕', tier: 'g3', onset: 'b', rime: 'ark', tiles: ['b', 'ar', 'k'], phonemes: ['buh', 'ar', 'kuh'], decoys: ['park', 'dark', 'barn'] },
    { word: 'fork', emoji: '🍴', tier: 'g3', onset: 'f', rime: 'ork', tiles: ['f', 'or', 'k'], phonemes: ['fff', 'or', 'kuh'], decoys: ['cork', 'pork', 'fort'] },
    { word: 'corn', emoji: '🌽', tier: 'g3', onset: 'c', rime: 'orn', tiles: ['c', 'or', 'n'], phonemes: ['kuh', 'or', 'nnn'], decoys: ['horn', 'born', 'cord'] },

    // Grades 4–5 ('g4_5') — 12 regular 4-letter vowel-team words
    { word: 'rain', emoji: '🌧️', tier: 'g4_5', onset: 'r', rime: 'ain', tiles: ['r', 'ai', 'n'], phonemes: ['rrr', 'ay', 'nnn'], decoys: ['pain', 'train', 'ran'] },
    { word: 'tail', emoji: '🦊', tier: 'g4_5', onset: 't', rime: 'ail', tiles: ['t', 'ai', 'l'], phonemes: ['tuh', 'ay', 'lll'], decoys: ['mail', 'sail', 'tall'] },
    { word: 'play', emoji: '🎮', tier: 'g4_5', onset: 'pl', rime: 'ay', tiles: ['p', 'l', 'ay'], phonemes: ['puh', 'lll', 'ay'], decoys: ['clay', 'stay', 'plan'] },
    { word: 'tree', emoji: '🌳', tier: 'g4_5', onset: 'tr', rime: 'ee', tiles: ['t', 'r', 'ee'], phonemes: ['tuh', 'rrr', 'ee'], decoys: ['free', 'three', 'try'] },
    { word: 'seed', emoji: '🌱', tier: 'g4_5', onset: 's', rime: 'eed', tiles: ['s', 'ee', 'd'], phonemes: ['sss', 'ee', 'duh'], decoys: ['feed', 'need', 'sled'] },
    { word: 'leaf', emoji: '🍃', tier: 'g4_5', onset: 'l', rime: 'eaf', tiles: ['l', 'ea', 'f'], phonemes: ['lll', 'ee', 'fff'], decoys: ['loaf', 'bead', 'left'] },
    { word: 'seal', emoji: '🦭', tier: 'g4_5', onset: 's', rime: 'eal', tiles: ['s', 'ea', 'l'], phonemes: ['sss', 'ee', 'lll'], decoys: ['meal', 'real', 'sail'] },
    { word: 'boat', emoji: '⛵', tier: 'g4_5', onset: 'b', rime: 'oat', tiles: ['b', 'oa', 't'], phonemes: ['buh', 'oh', 'tuh'], decoys: ['coat', 'goat', 'boot'] },
    { word: 'goat', emoji: '🐐', tier: 'g4_5', onset: 'g', rime: 'oat', tiles: ['g', 'oa', 't'], phonemes: ['guh', 'oh', 'tuh'], decoys: ['boat', 'coat', 'goal'] },
    { word: 'moon', emoji: '🌙', tier: 'g4_5', onset: 'm', rime: 'oon', tiles: ['m', 'oo', 'n'], phonemes: ['mmm', 'ooo', 'nnn'], decoys: ['noon', 'spoon', 'moan'] },
    { word: 'book', emoji: '📖', tier: 'g4_5', onset: 'b', rime: 'ook', tiles: ['b', 'oo', 'k'], phonemes: ['buh', 'uhh', 'kuh'], decoys: ['look', 'cook', 'boot'] },
    { word: 'snow', emoji: '❄️', tier: 'g4_5', onset: 'sn', rime: 'ow', tiles: ['s', 'n', 'ow'], phonemes: ['sss', 'nnn', 'oh'], decoys: ['slow', 'glow', 'show'] }
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
    net: 'A mesh woven tool used to catch bugs or score goals!',
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
    // G2
    ship: 'A large boat that sails across deep oceans!',
    fish: 'An animal with fins and gills that lives in water!',
    shop: 'A store where people buy things they need!',
    chip: 'A crunchy snack or a tiny piece of something!',
    chat: 'A friendly talk between people!',
    chin: 'The bottom front part of your face below your mouth!',
    bath: 'Washing yourself in a tub full of warm water!',
    moth: 'A winged insect that loves flying near lights at night!',
    duck: 'A water bird with webbed feet that says quack!',
    lock: 'A clasp that keeps a door or box safely closed!',
    ring: 'A shiny round band worn on a finger, or a bell sound!',
    bell: 'A hollow metal cup that rings when tapped!',
    // G3
    cake: 'A sweet baked treat often topped with frosting!',
    bike: 'A two-wheeled ride powered by your pedals!',
    kite: 'A light toy that flies high in the wind on a string!',
    bone: 'A hard white part inside a skeleton, or a dog treat!',
    cube: 'A 3D box shape with six equal square faces!',
    tape: 'A sticky strip used to hold paper or gifts together!',
    cape: 'A flowing cloth worn on the shoulders like a hero!',
    pine: 'An evergreen tree with needles and pinecones!',
    star: 'A glowing ball of light twinkling in outer space!',
    bark: 'The sound a dog makes, or the outer cover of a tree!',
    fork: 'A tool with prongs used for picking up food!',
    corn: 'A tall plant with sweet yellow kernels on a cob!',
    // G4-5
    rain: 'Water drops falling down from clouds in the sky!',
    tail: 'The wagging back part of an animal’s body!',
    play: 'Having fun with games, toys, or friends!',
    tree: 'A tall plant with a wooden trunk, branches, and leaves!',
    seed: 'A tiny plant baby that grows into a flower or tree!',
    leaf: 'A flat green part growing on a tree or plant!',
    seal: 'A playful ocean mammal with flippers that barks!',
    boat: 'A small vessel that floats and travels on water!',
    goat: 'A horned farm animal that loves to climb and munch!',
    moon: 'The bright round neighbor that orbits Earth at night!',
    book: 'Pages filled with stories or facts to read!',
    snow: 'Soft white ice crystals that drift down in winter!',
    // Magic-E base & pairs
    cap: 'A soft hat with a curved brim in front!',
    tap: 'A gentle hit, or a faucet where water comes out!',
    kit: 'A box or bag holding tools or supplies!',
    pin: 'A tiny sharp needle used to hold cloth or notes!',
    cub: 'A baby bear, lion, or fox!',
    tub: 'A wide container for holding water or taking a bath!',
    hop: 'To jump forward on one or two feet!',
    mad: 'Feeling very angry or upset!',
    tube: 'A long hollow cylinder or pipe!',
    hope: 'Wishing and believing something good will happen!',
    made: 'Built or created something!',
    can: 'A metal container, or being able to do something!',
    cane: 'A sturdy walking stick!',
    man: 'A grown-up male person!',
    mane: 'The long fluffy hair around a lion’s head!',
    pan: 'A flat metal pot used for cooking food!',
    pane: 'A clear sheet of glass inside a window!',
    hug: 'Squeezing someone warmly with both arms!',
    huge: 'Super giant and very big!',
    not: 'A word that means zero or no!',
    note: 'A short written message or a musical sound!',
    fin: 'A flat wing-like part that helps fish steer in water!',
    fine: 'Feeling great, or very thin and neat!',
    cut: 'To divide something with scissors or a knife!',
    cute: 'Adorable, sweet, and lovely!',
    rip: 'To tear paper or cloth apart!',
    ripe: 'Fruit that is fully grown and sweet to eat!',
    plan: 'A careful idea for how to do something!',
    plane: 'An aircraft with wings that flies through the sky!'
  };

  const WORDS = RAW_WORDS.map((entry) => ({
    word: entry.word,
    emoji: entry.emoji,
    tier: entry.tier,
    onset: entry.onset,
    rime: entry.rime,
    tiles: entry.tiles.slice(),
    letters: entry.word.split(''),
    phonemes: entry.phonemes.slice(),
    decoys: entry.decoys.slice(),
    meaning: WORD_MEANINGS[entry.word] || ''
  }));

  const MAGIC_E_PAIRS = [
    { base: 'cap', baseEmoji: '🧢', magic: 'cape', magicEmoji: '🦸', shortVowel: 'ah', longVowel: 'ay' },
    { base: 'tap', baseEmoji: '🚰', magic: 'tape', magicEmoji: '🩹', shortVowel: 'ah', longVowel: 'ay' },
    { base: 'kit', baseEmoji: '🧰', magic: 'kite', magicEmoji: '🪁', shortVowel: 'ih', longVowel: 'eye' },
    { base: 'pin', baseEmoji: '📌', magic: 'pine', magicEmoji: '🌲', shortVowel: 'ih', longVowel: 'eye' },
    { base: 'cub', baseEmoji: '🐻', magic: 'cube', magicEmoji: '🧊', shortVowel: 'uh', longVowel: 'yoo' },
    { base: 'tub', baseEmoji: '🛁', magic: 'tube', magicEmoji: '🧪', shortVowel: 'uh', longVowel: 'yoo' },
    { base: 'hop', baseEmoji: '🐇', magic: 'hope', magicEmoji: '🌟', shortVowel: 'aw', longVowel: 'oh' },
    { base: 'mad', baseEmoji: '😠', magic: 'made', magicEmoji: '🎨', shortVowel: 'ah', longVowel: 'ay' }
  ];

  const PHONEME_SOUNDS = {
    // Single letters (a-z)
    a: 'ah',
    b: 'buh',
    c: 'kuh',
    d: 'duh',
    e: 'eh',
    f: 'fff',
    g: 'guh',
    h: 'huh',
    i: 'ih',
    j: 'juh',
    k: 'kuh',
    l: 'lll',
    m: 'mmm',
    n: 'nnn',
    o: 'aw',
    p: 'puh',
    q: 'kwuh',
    r: 'rrr',
    s: 'sss',
    t: 'tuh',
    u: 'uh',
    v: 'vvv',
    w: 'wuh',
    x: 'ks',
    y: 'yuh',
    z: 'zzz',

    // Digraphs & FLOSS
    sh: 'shh',
    ch: 'chuh',
    th: 'thh',
    wh: 'wuh',
    ph: 'fff',
    ck: 'kuh',
    ng: 'ng',
    ll: 'lll',
    ss: 'sss',
    ff: 'fff',
    zz: 'zzz',

    // Common initial blends
    fr: 'fruh',
    cr: 'kruh',
    dr: 'druh',
    fl: 'fluh',
    cl: 'kluh',
    sw: 'swuh',
    st: 'stuh',
    pl: 'pluh',
    sn: 'snuh',
    tr: 'truh',

    // Vowel teams & r-controlled vowels
    ai: 'ay',
    ay: 'ay',
    ee: 'ee',
    ea: 'ee',
    oa: 'oh',
    oo: 'ooo',
    ow: 'oh',
    ar: 'ar',
    or: 'or',
    er: 'er',
    ir: 'er',
    ur: 'er',

    // Common rimes across K-5 word list
    at: 'at',
    og: 'og',
    un: 'un',
    ig: 'ig',
    ed: 'ed',
    us: 'us',
    ox: 'ox',
    up: 'up',
    ug: 'ug',
    ap: 'ap',
    et: 'et',
    ab: 'ab',
    um: 'um',
    ag: 'ag',
    im: 'im',
    op: 'op',
    amp: 'amp',
    ent: 'ent',
    and: 'and',
    est: 'est',
    ip: 'ip',
    ish: 'ish',
    in: 'in',
    ath: 'ath',
    oth: 'oth',
    uck: 'uck',
    ock: 'ock',
    ing: 'ing',
    ell: 'ell',
    ake: 'ayk',
    ike: 'ike',
    ite: 'ite',
    one: 'ohn',
    ube: 'yoob',
    ape: 'ayp',
    ine: 'ine',
    ark: 'ark',
    ork: 'ork',
    orn: 'orn',
    ain: 'ayn',
    ail: 'ayl',
    eed: 'eed',
    eaf: 'eef',
    eal: 'eel',
    oat: 'oht',
    oon: 'oon',
    ook: 'ook'
  };

  function getWords(tier) {
    if (!tier || tier === 'all') {
      return WORDS.slice();
    }
    const filtered = WORDS.filter((entry) => entry.tier === tier);
    return filtered.length > 0 ? filtered : WORDS.slice();
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
    return WORDS.find((entry) => entry.word === key) || null;
  }

  function getLetterSound(ch) {
    if (ch === undefined || ch === null) return '';
    const key = String(ch).trim().toLowerCase();
    if (!key) return '';
    return PHONEME_SOUNDS[key] || key;
  }

  function speakPhoneme(token) {
    if (token === undefined || token === null) return '';
    const key = String(token).trim().toLowerCase();
    if (!key) return '';
    const cue = PHONEME_SOUNDS[key] || String(token).trim();
    if (AudioEngine && typeof AudioEngine.speak === 'function') {
      AudioEngine.speak(cue, 'gentle');
    }
    return cue;
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
    WORDS,
    MAGIC_E_PAIRS,
    PHONEME_SOUNDS,
    WORD_MEANINGS,
    getWords,
    pickWord,
    findWord,
    getMeaning,
    getLetterSound,
    speakPhoneme,
    speakWord
  };

  app.EnglishPhonics = EnglishPhonics;
})(window.KidApp = window.KidApp || {});
