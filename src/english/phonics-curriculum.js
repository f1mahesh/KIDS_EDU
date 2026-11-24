/* K–5 English Phonics Curriculum & Audio Cues (3-Letter & 4-Letter Regular Words) */
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

  // Clean UFLI-aligned phoneme transcription per word (zero trailing "-uh" schwa)
  // and `soundUnits` mapping to pure acoustic keys in AudioEngine.playPhoneme().
  const RAW_WORDS = [
    // Kindergarten ('k') — 12 regular 3-letter CVC words
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

    // Grade 1 ('g1') — 12 regular 4-letter initial/final blend words (each consonant sound kept distinct)
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

    // Grade 2 ('g2') — 12 regular digraph, nasal ng, & FLSZ words
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

    // Grade 3 ('g3') — 12 regular VCe (Silent E) & R-controlled vowel words
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

    // Grades 4–5 ('g4_5') — 12 regular vowel-team words
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
    { word: 'snow', emoji: '❄️', tier: 'g4_5', onset: 'sn', rime: 'ow', tiles: ['s', 'n', 'ow'], phonemes: ['s', 'n', 'ō'], soundUnits: ['s', 'n', 'ow'], decoys: ['slow', 'glow', 'show'] }
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
    soundUnits: (entry.soundUnits || entry.tiles).slice(),
    decoys: entry.decoys.slice(),
    meaning: WORD_MEANINGS[entry.word] || ''
  }));

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

  // UFLI Foundations Sound Wall metadata (aligned with ufli.education.ufl.edu)
  // Clipped stops never add a trailing "-uh" schwa; continuous sounds stretch smoothly.
  const UFLI_GRAPHEMES = {
    a:  { symbol: '/ă/',  keyword: 'apple',      emoji: '🍎', kind: 'vowel-short', cue: 'Jaw drops low — /ă/ as in apple' },
    b:  { symbol: '/b/',  keyword: 'bat',        emoji: '🦇', kind: 'stop',        cue: 'Clipped stop — quick lip pop, no "uh"' },
    c:  { symbol: '/k/',  keyword: 'cat',        emoji: '🐱', kind: 'stop',        cue: 'Clipped unvoiced stop — quick /k/, no "uh"' },
    d:  { symbol: '/d/',  keyword: 'dog',        emoji: '🐶', kind: 'stop',        cue: 'Clipped voiced stop — quick tongue tap, no "uh"' },
    e:  { symbol: '/ĕ/',  keyword: 'edge',       emoji: '📏', kind: 'vowel-short', cue: 'Mid-open relaxed — /ĕ/ as in edge' },
    f:  { symbol: '/f/',  keyword: 'fish',       emoji: '🐟', kind: 'continuous',  cue: 'Continuous unvoiced air — stretch /f/' },
    g:  { symbol: '/g/',  keyword: 'goat',       emoji: '🐐', kind: 'stop',        cue: 'Clipped voiced stop — quick /g/, no "uh"' },
    h:  { symbol: '/h/',  keyword: 'hat',        emoji: '🎩', kind: 'continuous',  cue: 'Soft unvoiced breath — /h/ as in hat' },
    i:  { symbol: '/ĭ/',  keyword: 'itch',       emoji: '🦟', kind: 'vowel-short', cue: 'Smile corners slightly — /ĭ/ as in itch' },
    j:  { symbol: '/j/',  keyword: 'jar',        emoji: '🫙', kind: 'affricate',   cue: 'Clipped affricate — clean /j/, no "uh"' },
    k:  { symbol: '/k/',  keyword: 'kite',       emoji: '🪁', kind: 'stop',        cue: 'Clipped unvoiced stop — quick /k/, no "uh"' },
    l:  { symbol: '/l/',  keyword: 'leaf',       emoji: '🍃', kind: 'continuous',  cue: 'Continuous liquid — tongue tip behind top teeth' },
    m:  { symbol: '/m/',  keyword: 'mouse',      emoji: '🐭', kind: 'continuous',  cue: 'Continuous nasal — lips closed, hum /m/' },
    n:  { symbol: '/n/',  keyword: 'nose',       emoji: '👃', kind: 'continuous',  cue: 'Continuous nasal — tongue up, hum /n/' },
    o:  { symbol: '/ŏ/',  keyword: 'octopus',    emoji: '🐙', kind: 'vowel-short', cue: 'Jaw drops open round — /ŏ/ as in octopus' },
    p:  { symbol: '/p/',  keyword: 'pig',        emoji: '🐷', kind: 'stop',        cue: 'Clipped unvoiced pop — puff of air, no "uh"' },
    q:  { symbol: '/kw/', keyword: 'queen',      emoji: '👑', kind: 'glide',       cue: 'Clean /k/ + glide /w/ — no "uh"' },
    qu: { symbol: '/kw/', keyword: 'queen',      emoji: '👑', kind: 'glide',       cue: 'Clean /k/ + glide /w/ — no "uh"' },
    r:  { symbol: '/r/',  keyword: 'red',        emoji: '🔴', kind: 'continuous',  cue: 'Continuous liquid — tongue curled back softly' },
    s:  { symbol: '/s/',  keyword: 'sun',        emoji: '☀️', kind: 'continuous',  cue: 'Continuous unvoiced hiss — stretch /s/' },
    t:  { symbol: '/t/',  keyword: 'tiger',      emoji: '🐯', kind: 'stop',        cue: 'Clipped unvoiced tap — quick /t/, no "uh"' },
    u:  { symbol: '/ŭ/',  keyword: 'up',         emoji: '⬆️', kind: 'vowel-short', cue: 'Relaxed center mouth — /ŭ/ as in up' },
    v:  { symbol: '/v/',  keyword: 'volcano',    emoji: '🌋', kind: 'continuous',  cue: 'Continuous voiced — top teeth buzz bottom lip' },
    w:  { symbol: '/w/',  keyword: 'watermelon', emoji: '🍉', kind: 'glide',       cue: 'Rounded lips glide open — clean /w/' },
    x:  { symbol: '/ks/', keyword: 'fox',        emoji: '🦊', kind: 'stop',        cue: 'Two sounds /k/ + /s/ — crisp finish' },
    y:  { symbol: '/y/',  keyword: 'yellow',     emoji: '💛', kind: 'glide',       cue: 'Tongue arches forward — clean glide /y/' },
    z:  { symbol: '/z/',  keyword: 'zipper',     emoji: '🤐', kind: 'continuous',  cue: 'Continuous voiced buzz — stretch /z/' },

    // UFLI Digraphs & FLSZ Spelling Rule (ff, ll, ss, zz)
    sh:       { symbol: '/sh/', keyword: 'ship',    emoji: '🚢', kind: 'continuous', cue: 'Rounded lips continuous airflow /sh/' },
    ch:       { symbol: '/ch/', keyword: 'chat',    emoji: '💬', kind: 'affricate',  cue: 'Crisp unvoiced /ch/ release, no "uh"' },
    th:       { symbol: '/th/', keyword: 'thumb',   emoji: '👍', kind: 'continuous', cue: 'Tongue lightly between teeth — stretch /th/' },
    wh:       { symbol: '/wh/', keyword: 'whistle', emoji: '📣', kind: 'glide',      cue: 'Rounded lips breathy glide /wh/' },
    ph:       { symbol: '/f/',  keyword: 'phone',   emoji: '📱', kind: 'continuous', cue: 'Two letters make /f/ like fish' },
    ck:       { symbol: '/k/',  keyword: 'duck',    emoji: '🦆', kind: 'stop',       cue: 'Used after short vowels — clipped /k/' },
    ng:       { symbol: '/ng/', keyword: 'ring',    emoji: '💍', kind: 'continuous', cue: 'Nasal sound in back of throat — /ng/' },
    ff:       { symbol: '/f/',  keyword: 'puff',    emoji: '💨', kind: 'continuous', cue: 'FLSZ doubled f — continuous /f/' },
    ll:       { symbol: '/l/',  keyword: 'bell',    emoji: '🔔', kind: 'continuous', cue: 'FLSZ doubled l — continuous /l/' },
    ss:       { symbol: '/s/',  keyword: 'grass',   emoji: '🌿', kind: 'continuous', cue: 'FLSZ doubled s — continuous /s/' },
    zz:       { symbol: '/z/',  keyword: 'buzz',    emoji: '🐝', kind: 'continuous', cue: 'FLSZ doubled z — continuous /z/' },

    // VCe (Silent Magic-E)
    a_e:      { symbol: '/ā/',  keyword: 'cake',    emoji: '🎂', kind: 'vowel-long', cue: 'VCe long A — says its name /ā/' },
    i_e:      { symbol: '/ī/',  keyword: 'kite',    emoji: '🪁', kind: 'vowel-long', cue: 'VCe long I — says its name /ī/' },
    o_e:      { symbol: '/ō/',  keyword: 'bone',    emoji: '🦴', kind: 'vowel-long', cue: 'VCe long O — says its name /ō/' },
    u_e:      { symbol: '/yū/', keyword: 'cube',    emoji: '🧊', kind: 'vowel-long', cue: 'VCe long U — says /yū/ or /ū/' },
    e_e:      { symbol: '/ē/',  keyword: 'these',   emoji: '👉', kind: 'vowel-long', cue: 'VCe long E — says its name /ē/' },

    // Vowel Teams & R-Controlled Vowels
    ai:       { symbol: '/ā/',  keyword: 'rain',    emoji: '🌧️', kind: 'vowel-team', cue: 'Vowel team ai says long /ā/' },
    ay:       { symbol: '/ā/',  keyword: 'play',    emoji: '🎮', kind: 'vowel-team', cue: 'Vowel team ay says long /ā/' },
    ee:       { symbol: '/ē/',  keyword: 'tree',    emoji: '🌳', kind: 'vowel-team', cue: 'Vowel team ee says long /ē/' },
    ea:       { symbol: '/ē/',  keyword: 'leaf',    emoji: '🍃', kind: 'vowel-team', cue: 'Vowel team ea says long /ē/' },
    oa:       { symbol: '/ō/',  keyword: 'boat',    emoji: '⛵', kind: 'vowel-team', cue: 'Vowel team oa says long /ō/' },
    ow:       { symbol: '/ō/',  keyword: 'snow',    emoji: '❄️', kind: 'vowel-team', cue: 'Vowel team ow says long /ō/' },
    oo:       { symbol: '/ū/',  keyword: 'moon',    emoji: '🌙', kind: 'vowel-team', cue: 'Long oo as in moon' },
    oo_short: { symbol: '/ʊ/',  keyword: 'book',    emoji: '📖', kind: 'vowel-team', cue: 'Short oo as in book' },
    ar:       { symbol: '/ar/', keyword: 'star',    emoji: '⭐', kind: 'vowel-r',    cue: 'R-controlled /ar/ as in star' },
    or:       { symbol: '/or/', keyword: 'fork',    emoji: '🍴', kind: 'vowel-r',    cue: 'R-controlled /or/ as in fork' },
    er:       { symbol: '/er/', keyword: 'fern',    emoji: '🌿', kind: 'vowel-r',    cue: 'R-controlled /er/ as in fern' },
    ir:       { symbol: '/er/', keyword: 'bird',    emoji: '🐦', kind: 'vowel-r',    cue: 'R-controlled /er/ as in bird' },
    ur:       { symbol: '/er/', keyword: 'surf',    emoji: '🏄', kind: 'vowel-r',    cue: 'R-controlled /er/ as in surf' }
  };

  // Clean UFLI display symbols (no "-uh" schwa anywhere)
  const PHONEME_SOUNDS = {
    a: '/ă/', b: '/b/', c: '/k/', d: '/d/', e: '/ĕ/', f: '/f/', g: '/g/', h: '/h/',
    i: '/ĭ/', j: '/j/', k: '/k/', l: '/l/', m: '/m/', n: '/n/', o: '/ŏ/', p: '/p/',
    q: '/kw/', qu: '/kw/', r: '/r/', s: '/s/', t: '/t/', u: '/ŭ/', v: '/v/', w: '/w/',
    x: '/ks/', y: '/y/', z: '/z/',
    sh: '/sh/', ch: '/ch/', th: '/th/', wh: '/wh/', ph: '/f/', ck: '/k/', ng: '/ng/',
    ff: '/f/', ll: '/l/', ss: '/s/', zz: '/z/',
    fr: '/f/ /r/', cr: '/k/ /r/', dr: '/d/ /r/', fl: '/f/ /l/', cl: '/k/ /l/',
    sw: '/s/ /w/', st: '/s/ /t/', pl: '/p/ /l/', sn: '/s/ /n/', tr: '/t/ /r/',
    ai: '/ā/', ay: '/ā/', ee: '/ē/', ea: '/ē/', oa: '/ō/', oo: '/ū/', oo_short: '/ʊ/', ow: '/ō/',
    a_e: '/ā/', i_e: '/ī/', o_e: '/ō/', u_e: '/yū/', e_e: '/ē/',
    ar: '/ar/', or: '/or/', er: '/er/', ir: '/er/', ur: '/er/',
    at: 'at', og: 'og', un: 'un', ig: 'ig', ed: 'ed', us: 'us', ox: 'ox', up: 'up', ug: 'ug', ap: 'ap',
    et: 'et', ab: 'ab', um: 'um', ag: 'ag', im: 'im', op: 'op', amp: 'amp', ent: 'ent', and: 'and',
    est: 'est', ip: 'ip', ish: 'ish', in: 'in', ath: 'ath', oth: 'oth', uck: 'uck', ock: 'ock',
    ing: 'ing', ell: 'ell', ake: 'ake', ike: 'ike', ite: 'ite', one: 'one', ube: 'ube', ape: 'ape',
    ine: 'ine', ark: 'ark', ork: 'ork', orn: 'orn', ain: 'ain', ail: 'ail', eed: 'eed', eaf: 'eaf',
    eal: 'eal', oat: 'oat', oon: 'oon', ook: 'ook'
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
    'ks': 'x', 'kw': 'qu'
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

  function speakPhoneme(token, cancelActive = true) {
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
      const ok1 = AudioEngine.playPhoneme(c1, 0);
      const ok2 = AudioEngine.playPhoneme(c2, 0.16);
      if (ok1 || ok2) return cue;
    }

    if (AudioEngine && typeof AudioEngine.playPhoneme === 'function') {
      if (AudioEngine.playPhoneme(key, 0)) {
        return cue;
      }
    }

    // Whole rimes/words or fallback if Web Audio unavailable
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

  // Separated Letter + Phoneme cue ("Letter M sounds ... /mmm/") so they never blend together
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

    const stepMs = 390;
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
    WORDS,
    MAGIC_E_PAIRS,
    PHONEME_SOUNDS,
    UFLI_GRAPHEMES,
    WORD_MEANINGS,
    getWords,
    pickWord,
    findWord,
    getMeaning,
    getUfliGrapheme,
    getLetterSound,
    speakPhoneme,
    speakLetterAndSound,
    speakWordSounds,
    speakWord
  };

  app.EnglishPhonics = EnglishPhonics;
})(window.KidApp = window.KidApp || {});
