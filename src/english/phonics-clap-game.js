/* English Phonics Clap Blender AR — Camera Motion + Mic Clap + Touch Hybrid Arcade */
(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, drawTreasureCanvasItem, EnglishPhonics } = app;

const SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   vyMin: 0.52, vyRange: 0.28, duration: 90, fontSize: 38 },
    medium: { label: '🚀 Medium (Ages 6–8)', vyMin: 0.90, vyRange: 0.44, duration: 75, fontSize: 35 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  vyMin: 1.42, vyRange: 0.62, duration: 60, fontSize: 32 }
  };

  // Fallback Phonics Word Bank (used if EnglishPhonics is absent, and merged with it when present)
  const FALLBACK_WORDS = [
    // Kindergarten (CVC)
    { word: 'cat', onset: 'c', rime: 'at', emoji: '🐱', tier: 'k' },
    { word: 'hat', onset: 'h', rime: 'at', emoji: '👒', tier: 'k' },
    { word: 'bat', onset: 'b', rime: 'at', emoji: '🦇', tier: 'k' },
    { word: 'mat', onset: 'm', rime: 'at', emoji: '🧘', tier: 'k' },
    { word: 'rat', onset: 'r', rime: 'at', emoji: '🐀', tier: 'k' },
    { word: 'dog', onset: 'd', rime: 'og', emoji: '🐶', tier: 'k' },
    { word: 'log', onset: 'l', rime: 'og', emoji: '🪵', tier: 'k' },
    { word: 'hog', onset: 'h', rime: 'og', emoji: '🐗', tier: 'k' },
    { word: 'pig', onset: 'p', rime: 'ig', emoji: '🐷', tier: 'k' },
    { word: 'wig', onset: 'w', rime: 'ig', emoji: '💇', tier: 'k' },
    { word: 'sun', onset: 's', rime: 'un', emoji: '☀️', tier: 'k' },
    { word: 'bun', onset: 'b', rime: 'un', emoji: '🍔', tier: 'k' },
    { word: 'run', onset: 'r', rime: 'un', emoji: '🏃', tier: 'k' },
    { word: 'bug', onset: 'b', rime: 'ug', emoji: '🐞', tier: 'k' },
    { word: 'hug', onset: 'h', rime: 'ug', emoji: '🤗', tier: 'k' },
    { word: 'mug', onset: 'm', rime: 'ug', emoji: '☕', tier: 'k' },
    { word: 'rug', onset: 'r', rime: 'ug', emoji: '🧶', tier: 'k' },
    { word: 'hen', onset: 'h', rime: 'en', emoji: '🐔', tier: 'k' },
    { word: 'pen', onset: 'p', rime: 'en', emoji: '🖊️', tier: 'k' },
    { word: 'ten', onset: 't', rime: 'en', emoji: '🔟', tier: 'k' },
    { word: 'bed', onset: 'b', rime: 'ed', emoji: '🛏️', tier: 'k' },
    { word: 'red', onset: 'r', rime: 'ed', emoji: '🔴', tier: 'k' },
    { word: 'fox', onset: 'f', rime: 'ox', emoji: '🦊', tier: 'k' },
    { word: 'box', onset: 'b', rime: 'ox', emoji: '📦', tier: 'k' },
    { word: 'cup', onset: 'c', rime: 'up', emoji: '🥤', tier: 'k' },
    { word: 'pup', onset: 'p', rime: 'up', emoji: '🐕', tier: 'k' },
    { word: 'van', onset: 'v', rime: 'an', emoji: '🚐', tier: 'k' },
    { word: 'pan', onset: 'p', rime: 'an', emoji: '🍳', tier: 'k' },
    { word: 'fan', onset: 'f', rime: 'an', emoji: '🪭', tier: 'k' },
    { word: 'can', onset: 'c', rime: 'an', emoji: '🥫', tier: 'k' },
    { word: 'man', onset: 'm', rime: 'an', emoji: '👨', tier: 'k' },
    { word: 'cap', onset: 'c', rime: 'ap', emoji: '🧢', tier: 'k' },
    { word: 'map', onset: 'm', rime: 'ap', emoji: '🗺️', tier: 'k' },
    { word: 'nap', onset: 'n', rime: 'ap', emoji: '😴', tier: 'k' },
    { word: 'pot', onset: 'p', rime: 'ot', emoji: '🍲', tier: 'k' },
    { word: 'hot', onset: 'h', rime: 'ot', emoji: '🔥', tier: 'k' },
    { word: 'dot', onset: 'd', rime: 'ot', emoji: '⚫', tier: 'k' },
    { word: 'mop', onset: 'm', rime: 'op', emoji: '🧹', tier: 'k' },
    { word: 'hop', onset: 'h', rime: 'op', emoji: '🐇', tier: 'k' },
    { word: 'jam', onset: 'j', rime: 'am', emoji: '🍓', tier: 'k' },
    { word: 'ham', onset: 'h', rime: 'am', emoji: '🍖', tier: 'k' },
    { word: 'bus', onset: 'b', rime: 'us', emoji: '🚌', tier: 'k' },

    // Grades 1–2 (Blends, Digraphs & Long Vowels)
    { word: 'frog', onset: 'fr', rime: 'og', emoji: '🐸', tier: 'g1_2' },
    { word: 'crab', onset: 'cr', rime: 'ab', emoji: '🦀', tier: 'g1_2' },
    { word: 'star', onset: 'st', rime: 'ar', emoji: '⭐', tier: 'g1_2' },
    { word: 'ship', onset: 'sh', rime: 'ip', emoji: '🚢', tier: 'g1_2' },
    { word: 'shop', onset: 'sh', rime: 'op', emoji: '🛍️', tier: 'g1_2' },
    { word: 'fish', onset: 'f', rime: 'ish', emoji: '🐟', tier: 'g1_2' },
    { word: 'dish', onset: 'd', rime: 'ish', emoji: '🍽️', tier: 'g1_2' },
    { word: 'wish', onset: 'w', rime: 'ish', emoji: '🌠', tier: 'g1_2' },
    { word: 'chin', onset: 'ch', rime: 'in', emoji: '🧔', tier: 'g1_2' },
    { word: 'chop', onset: 'ch', rime: 'op', emoji: '🪓', tier: 'g1_2' },
    { word: 'chat', onset: 'ch', rime: 'at', emoji: '💬', tier: 'g1_2' },
    { word: 'sled', onset: 'sl', rime: 'ed', emoji: '🛷', tier: 'g1_2' },
    { word: 'plum', onset: 'pl', rime: 'um', emoji: '🫐', tier: 'g1_2' },
    { word: 'drum', onset: 'dr', rime: 'um', emoji: '🥁', tier: 'g1_2' },
    { word: 'clap', onset: 'cl', rime: 'ap', emoji: '👏', tier: 'g1_2' },
    { word: 'flag', onset: 'fl', rime: 'ag', emoji: '🚩', tier: 'g1_2' },
    { word: 'snap', onset: 'sn', rime: 'ap', emoji: '🫰', tier: 'g1_2' },
    { word: 'stop', onset: 'st', rime: 'op', emoji: '🛑', tier: 'g1_2' },
    { word: 'drop', onset: 'dr', rime: 'op', emoji: '💧', tier: 'g1_2' },
    { word: 'swim', onset: 'sw', rime: 'im', emoji: '🏊', tier: 'g1_2' },
    { word: 'cake', onset: 'c', rime: 'ake', emoji: '🍰', tier: 'g1_2' },
    { word: 'bake', onset: 'b', rime: 'ake', emoji: '🧁', tier: 'g1_2' },
    { word: 'snake', onset: 'sn', rime: 'ake', emoji: '🐍', tier: 'g1_2' },
    { word: 'bike', onset: 'b', rime: 'ike', emoji: '🚲', tier: 'g1_2' },
    { word: 'kite', onset: 'k', rime: 'ite', emoji: '🪁', tier: 'g1_2' },
    { word: 'rain', onset: 'r', rime: 'ain', emoji: '🌧️', tier: 'g1_2' },
    { word: 'train', onset: 'tr', rime: 'ain', emoji: '🚂', tier: 'g1_2' },
    { word: 'brain', onset: 'br', rime: 'ain', emoji: '🧠', tier: 'g1_2' },
    { word: 'boat', onset: 'b', rime: 'oat', emoji: '⛵', tier: 'g1_2' },
    { word: 'goat', onset: 'g', rime: 'oat', emoji: '🐐', tier: 'g1_2' },
    { word: 'coat', onset: 'c', rime: 'oat', emoji: '🧥', tier: 'g1_2' },
    { word: 'moon', onset: 'm', rime: 'oon', emoji: '🌙', tier: 'g1_2' },
    { word: 'spoon', onset: 'sp', rime: 'oon', emoji: '🥄', tier: 'g1_2' },
    { word: 'tree', onset: 'tr', rime: 'ee', emoji: '🌳', tier: 'g1_2' },
    { word: 'bee', onset: 'b', rime: 'ee', emoji: '🐝', tier: 'g1_2' },
    { word: 'duck', onset: 'd', rime: 'uck', emoji: '🦆', tier: 'g1_2' },
    { word: 'truck', onset: 'tr', rime: 'uck', emoji: '🚚', tier: 'g1_2' },
    { word: 'sock', onset: 's', rime: 'ock', emoji: '🧦', tier: 'g1_2' },
    { word: 'clock', onset: 'cl', rime: 'ock', emoji: '🕰️', tier: 'g1_2' },
    { word: 'rock', onset: 'r', rime: 'ock', emoji: '🪨', tier: 'g1_2' },
    { word: 'bell', onset: 'b', rime: 'ell', emoji: '🔔', tier: 'g1_2' },
    { word: 'shell', onset: 'sh', rime: 'ell', emoji: '🐚', tier: 'g1_2' },
    { word: 'king', onset: 'k', rime: 'ing', emoji: '👑', tier: 'g1_2' },
    { word: 'ring', onset: 'r', rime: 'ing', emoji: '💍', tier: 'g1_2' },
    { word: 'wing', onset: 'w', rime: 'ing', emoji: '🪽', tier: 'g1_2' },

    // Grades 3–5 (Complex Blends, Silent Letters, R-Controlled & Vowel Teams)
    { word: 'flame', onset: 'fl', rime: 'ame', emoji: '🔥', tier: 'g4_5' },
    { word: 'grape', onset: 'gr', rime: 'ape', emoji: '🍇', tier: 'g4_5' },
    { word: 'shape', onset: 'sh', rime: 'ape', emoji: '🔷', tier: 'g4_5' },
    { word: 'plane', onset: 'pl', rime: 'ane', emoji: '✈️', tier: 'g4_5' },
    { word: 'stone', onset: 'st', rime: 'one', emoji: '🪨', tier: 'g4_5' },
    { word: 'phone', onset: 'ph', rime: 'one', emoji: '📱', tier: 'g4_5' },
    { word: 'smile', onset: 'sm', rime: 'ile', emoji: '😊', tier: 'g4_5' },
    { word: 'slide', onset: 'sl', rime: 'ide', emoji: '🛝', tier: 'g4_5' },
    { word: 'whale', onset: 'wh', rime: 'ale', emoji: '🐳', tier: 'g4_5' },
    { word: 'skate', onset: 'sk', rime: 'ate', emoji: '⛸️', tier: 'g4_5' },
    { word: 'plate', onset: 'pl', rime: 'ate', emoji: '🍽️', tier: 'g4_5' },
    { word: 'globe', onset: 'gl', rime: 'obe', emoji: '🌍', tier: 'g4_5' },
    { word: 'spark', onset: 'sp', rime: 'ark', emoji: '✨', tier: 'g4_5' },
    { word: 'shark', onset: 'sh', rime: 'ark', emoji: '🦈', tier: 'g4_5' },
    { word: 'storm', onset: 'st', rime: 'orm', emoji: '⛈️', tier: 'g4_5' },
    { word: 'crown', onset: 'cr', rime: 'own', emoji: '👑', tier: 'g4_5' },
    { word: 'clown', onset: 'cl', rime: 'own', emoji: '🤡', tier: 'g4_5' },
    { word: 'cloud', onset: 'cl', rime: 'oud', emoji: '☁️', tier: 'g4_5' },
    { word: 'toast', onset: 't', rime: 'oast', emoji: '🍞', tier: 'g4_5' },
    { word: 'dream', onset: 'dr', rime: 'eam', emoji: '💭', tier: 'g4_5' },
    { word: 'cream', onset: 'cr', rime: 'eam', emoji: '🍦', tier: 'g4_5' },
    { word: 'light', onset: 'l', rime: 'ight', emoji: '💡', tier: 'g4_5' },
    { word: 'night', onset: 'n', rime: 'ight', emoji: '🌃', tier: 'g4_5' },
    { word: 'knight', onset: 'kn', rime: 'ight', emoji: '⚔️', tier: 'g4_5' },
    { word: 'spring', onset: 'spr', rime: 'ing', emoji: '🌱', tier: 'g4_5' },
    { word: 'string', onset: 'str', rime: 'ing', emoji: '🧵', tier: 'g4_5' },
    { word: 'brush', onset: 'br', rime: 'ush', emoji: '🖌️', tier: 'g4_5' },
    { word: 'smart', onset: 'sm', rime: 'art', emoji: '🎓', tier: 'g4_5' },
    { word: 'chart', onset: 'ch', rime: 'art', emoji: '📊', tier: 'g4_5' },
    { word: 'stamp', onset: 'st', rime: 'amp', emoji: '📮', tier: 'g4_5' },
    { word: 'camp', onset: 'c', rime: 'amp', emoji: '⛺', tier: 'g4_5' }
  ];

  // Magic-E base -> transformed word pairs
  const MAGIC_E_PAIRS = [
    { base: 'cap', baseEmoji: '🧢', result: 'cape', resultEmoji: '🦸' },
    { base: 'kit', baseEmoji: '🧰', result: 'kite', resultEmoji: '🪁' },
    { base: 'tap', baseEmoji: '🚰', result: 'tape', resultEmoji: '📼' },
    { base: 'cub', baseEmoji: '🐻', result: 'cube', resultEmoji: '🧊' },
    { base: 'hop', baseEmoji: '🐇', result: 'hope', resultEmoji: '🌈' },
    { base: 'pin', baseEmoji: '📌', result: 'pine', resultEmoji: '🌲' },
    { base: 'tub', baseEmoji: '🛁', result: 'tube', resultEmoji: '🧪' },
    { base: 'mad', baseEmoji: '😠', result: 'made', resultEmoji: '🛠️' },
    { base: 'can', baseEmoji: '🥫', result: 'cane', resultEmoji: '🦯' },
    { base: 'man', baseEmoji: '👨', result: 'mane', resultEmoji: '🦁' },
    { base: 'pan', baseEmoji: '🍳', result: 'pane', resultEmoji: '🪟' },
    { base: 'hug', baseEmoji: '🤗', result: 'huge', resultEmoji: '🦕' },
    { base: 'not', baseEmoji: '🚫', result: 'note', resultEmoji: '🎵' },
    { base: 'fin', baseEmoji: '🦈', result: 'fine', resultEmoji: '☀️' },
    { base: 'cut', baseEmoji: '✂️', result: 'cute', resultEmoji: '🐶' },
    { base: 'rip', baseEmoji: '📄', result: 'ripe', resultEmoji: '🍓' },
    { base: 'plan', baseEmoji: '🗺️', result: 'plane', resultEmoji: '✈️' }
  ];

  const EXTRA_WORDS_BY_KEY = {
    caps: { word: 'caps', emoji: '🧢' },
    kits: { word: 'kits', emoji: '🧰' },
    taps: { word: 'taps', emoji: '🚰' },
    cubs: { word: 'cubs', emoji: '🐻' },
    hops: { word: 'hops', emoji: '🐇' },
    pins: { word: 'pins', emoji: '📌' },
    tubs: { word: 'tubs', emoji: '🛁' },
    cans: { word: 'cans', emoji: '🥫' },
    pans: { word: 'pans', emoji: '🍳' },
    fins: { word: 'fins', emoji: '🦈' },
    cuts: { word: 'cuts', emoji: '✂️' },
    plans: { word: 'plans', emoji: '🗺️' },
    cape: { word: 'cape', emoji: '🦸' },
    tape: { word: 'tape', emoji: '📼' },
    cube: { word: 'cube', emoji: '🧊' },
    hope: { word: 'hope', emoji: '🌈' },
    pine: { word: 'pine', emoji: '🌲' },
    tube: { word: 'tube', emoji: '🧪' },
    made: { word: 'made', emoji: '🛠️' },
    cane: { word: 'cane', emoji: '🦯' },
    mane: { word: 'mane', emoji: '🦁' },
    pane: { word: 'pane', emoji: '🪟' },
    huge: { word: 'huge', emoji: '🦕' },
    note: { word: 'note', emoji: '🎵' },
    fine: { word: 'fine', emoji: '☀️' },
    cute: { word: 'cute', emoji: '🐶' },
    ripe: { word: 'ripe', emoji: '🍓' }
  };

  const FALLBACK_MEANINGS = {
    bat: 'A flying night mammal, or a wooden stick used in baseball!',
    rat: 'A small furry rodent with a long tail!',
    mat: 'A small flat rug placed on the floor!',
    sat: 'Rested down on a chair or bench!',
    log: 'A thick piece of wood cut from a fallen tree!',
    fog: 'A thick cloud sitting close to the ground!',
    hug: 'Wrapping your arms warmly around someone!',
    mug: 'A sturdy cup with a handle for warm drinks!',
    rug: 'A soft woven floor covering!',
    hop: 'To make a quick little jump!',
    mop: 'A long-handled brush for cleaning floors!',
    top: 'The highest point, or a spinning toy!',
    pan: 'A flat metal pot used for cooking food!',
    fan: 'A device that blows cool air, or a big supporter!',
    man: 'A grown-up male person!',
    van: 'A boxy vehicle with room for passengers or cargo!',
    pen: 'A writing tool filled with ink!',
    hen: 'A female chicken that lays eggs!',
    ten: 'The counting number right after nine!',
    pin: 'A tiny sharp needle used to hold paper or cloth!',
    win: 'To come in first place in a game or race!',
    bin: 'A box or container for storing things!',
    bag: 'A soft sack with handles for carrying items!',
    tag: 'A small label, or a running chase game!',
    jet: 'A super-fast airplane!',
    pet: 'A friendly animal kept and cared for at home!',
    red: 'The bright color of strawberries and fire trucks!',
    box: 'A square container with flat sides!',
    fox: 'A clever wild animal with a bushy orange tail!',
    snap: 'A crisp click sound with your fingers!',
    drop: 'A tiny bead of liquid, or letting something fall!',
    bake: 'To cook bread, cookies, or cake in an oven!',
    snake: 'A long scaly reptile with no legs!',
    train: 'Connected railroad cars pulled along tracks!',
    brain: 'The thinking organ inside your head!',
    coat: 'A warm outer jacket worn in cold weather!',
    spoon: 'A curved utensil used for eating soup or cereal!',
    bee: 'A buzzing yellow-and-black insect that makes honey!',
    truck: 'A large vehicle built for hauling heavy loads!',
    sock: 'A soft cloth covering worn on your foot!',
    clock: 'A tool that shows the hours and minutes of the day!',
    rock: 'A hard solid piece of stone from the earth!',
    shell: 'The hard outer home of a snail, clam, or crab!',
    king: 'A male ruler who wears a royal crown!',
    wing: 'A feathered or flat limb used for flying!',
    flame: 'The bright, hot glowing tongue of a fire!',
    grape: 'A sweet round fruit that grows in bunches!',
    shape: 'The outline or form of something, like a circle or star!',
    plane: 'An aircraft with wings that flies through the sky!',
    stone: 'A smooth or rough piece of rock!',
    phone: 'A device used to call or message people!',
    smile: 'A happy curved grin on your face!',
    slide: 'A smooth ramp at the playground to glide down!',
    whale: 'A giant ocean mammal that breathes through a blowhole!',
    skate: 'A shoe with blades or wheels for gliding!',
    plate: 'A flat dish used to serve food!',
    globe: 'A round 3D model of planet Earth!',
    spark: 'A tiny bright flash of fire or light!',
    shark: 'A fast ocean fish with sharp teeth and fins!',
    storm: 'Strong winds with heavy rain, thunder, or snow!',
    crown: 'A golden headpiece worn by kings and queens!',
    clown: 'A funny performer with colorful clothes and a red nose!',
    cloud: 'A fluffy group of tiny water drops floating in the sky!',
    toast: 'Crispy browned slices of warm bread!',
    dream: 'Stories and pictures your mind imagines while sleeping!',
    cream: 'The rich, smooth, sweet part of milk!',
    light: 'Brightness that helps us see in the dark!',
    night: 'The dark time after sunset when the moon shines!',
    knight: 'A brave armored hero from long ago!',
    spring: 'The sunny season when flowers bloom, or a bouncy coil!',
    string: 'A thin twisted cord used for tying things!',
    brush: 'A tool with bristles for painting or tidying hair!',
    smart: 'Quick at learning and solving puzzles!',
    chart: 'A visual picture or table showing facts clearly!',
    stamp: 'A small sticker put on mail before sending it!',
    camp: 'Sleeping outdoors in tents under the stars!',
    caps: 'More than one soft hat with a brim!',
    kits: 'Sets of tools or supplies packed together!',
    taps: 'Gentle hits, or water faucets!',
    cubs: 'Baby bears, lions, or foxes!',
    hops: 'Quick little jumps!',
    pins: 'Tiny fasteners used to hold things together!',
    tubs: 'Large containers for holding water!',
    cans: 'Sealed metal containers for food or drinks!',
    pans: 'Flat metal pots used for cooking!',
    fins: 'Flat wing-like parts that help fish swim!',
    cuts: 'Slices made with scissors or a knife!',
    plans: 'Careful ideas for how to do something!'
  };

  function splitOnsetRime(word) {
    const clean = String(word || '').toLowerCase().trim();
    const m = clean.match(/^([^aeiouy]+)([aeiouy].*)$/);
    if (m) return { onset: m[1], rime: m[2] };
    if (clean.length >= 2) return { onset: clean.slice(0, 1), rime: clean.slice(1) };
    return { onset: clean, rime: '' };
  }

  function normalizeTier(tier) {
    const t = String(tier || 'all').toLowerCase().trim();
    if (t === 'k' || t === 'kinder' || t === 'kindergarten') return 'k';
    if (t === 'g1' || t === 'g2' || t === 'g3' || t === 'g4_5' || t === 'all') return t;
    if (t === 'g1_2' || t === 'g1-2') return 'g1_2';
    if (t === 'g3_4' || t === 'g3_5' || t === 'g3-5' || t === 'g4-5') return 'g4_5';
    return 'all';
  }

  function tierLabel(tier) {
    const ep = EnglishPhonics;
    if (ep && Array.isArray(ep.TIERS)) {
      const found = ep.TIERS.find((t) => t.id === tier);
      if (found && found.label) return found.label;
    }
    const t = normalizeTier(tier);
    if (t === 'k') return '🐣 Grade K';
    if (t === 'g1') return '🌱 Grade 1';
    if (t === 'g2') return '🚀 Grade 2';
    if (t === 'g1_2') return '🚀 Grades 1–2';
    if (t === 'g3') return '✨ Grade 3';
    if (t === 'g4_5') return '👑 Grades 4–5';
    return '🎲 All K–5';
  }

  class PhonicsClapGame {
    constructor(options = {}) {
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onScore = options.onScore || (() => {});
      this.onFinish = options.onFinish || (() => {});
      this.onStatus = options.onStatus || (() => {});

      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.muted = true;

      // Offscreen canvas for lightweight 80x60 motion detection
      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 80;
      this.motionCanvas.height = 60;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      this.prevFrame = null;

      // Microphone clap-sound detector
      this.audioCtx = null;
      this.analyser = null;
      this.audioBuf = null;
      this.hasMic = false;
      this.micLiveSignal = false;
      this.micLevel = 0;
      this.avgNoise = 0.03;
      this.clapSoundWindow = 0;

      this.stream = null;
      this.hasCamera = false;
      this.running = false;
      this.rafId = null;
      this.timerId = null;

      this.tier = 'all';
      this.speed = 'slow';
      this.mode = 'blend';
      this.score = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = 90;

      this.sparkles = [];
      this.fallingTiles = [];
      this.fallingTreasures = [];
      this.particles = [];
      this.popups = [];
      this.heldLeft = null;
      this.heldRight = null;
      this.lastWord = null;
      this.bigWord = null;
      this.pictureCheck = null;
      this.clapCooldown = 0;
      this.catchGrace = 0;
      this.leftReleaseCooldown = 0;
      this.rightReleaseCooldown = 0;
      this.leftPose = { isFist: false, fistFrames: 0, openFrames: 0, openSpread: 0, openSpan: 0, openArea: 0 };
      this.rightPose = { isFist: false, fistFrames: 0, openFrames: 0, openSpread: 0, openSpan: 0, openArea: 0 };
      this.handsWereApart = false;
      this.tick = 0;
      this.motionGrid = { left: 0, center: 0, right: 0 };
      this.leftHand = { x: 110, y: this.canvas.height - 82, active: false, isFist: false };
      this.rightHand = { x: this.canvas.width - 110, y: this.canvas.height - 82, active: false, isFist: false };

      this._initAmbientSparkles();
      this._bindPointer();
      this._onResize = () => { if (this.running) this._syncCanvasSize(); };
      window.addEventListener('resize', this._onResize);
    }

    _syncCanvasSize() {
      const vw = Math.max(320, window.innerWidth || 640);
      const vh = Math.max(320, window.innerHeight || 480);
      const w = Math.max(480, Math.min(920, vw));
      const h = Math.max(360, Math.round((w * vh) / vw));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        // Keep motionCanvas aspect-matched so portrait iPhone & landscape desktop track accurately
        this.motionCanvas.width = 80;
        this.motionCanvas.height = Math.max(44, Math.round((80 * h) / w));
        this.prevFrame = null;
        this.leftHand.x = w * 0.22;
        this.leftHand.y = h - 135;
        this.rightHand.x = w * 0.78;
        this.rightHand.y = h - 135;
        this._initAmbientSparkles();
      }
    }

    _drawVideoCover(targetCtx, tw, th) {
      const vw = this.video.videoWidth || tw;
      const vh = this.video.videoHeight || th;
      const scale = Math.max(tw / vw, th / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (tw - dw) / 2;
      const dy = (th - dh) / 2;
      targetCtx.save();
      targetCtx.scale(-1, 1);
      targetCtx.drawImage(this.video, -(dx + dw), dy, dw, dh);
      targetCtx.restore();
    }

    _initAmbientSparkles() {
      this.sparkles = [];
      for (let i = 0; i < 38; i++) {
        this.sparkles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          r: 1.5 + Math.random() * 3.0,
          vy: 0.45 + Math.random() * 1.15,
          vx: (Math.random() - 0.5) * 0.5,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    _roundRect(ctx, x, y, w, h, r) {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
        return;
      }
      const rad = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + rad, y);
      ctx.lineTo(x + w - rad, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
      ctx.lineTo(x + w, y + h - rad);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
      ctx.lineTo(x + rad, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
      ctx.lineTo(x, y + rad);
      ctx.quadraticCurveTo(x, y, x + rad, y);
      ctx.closePath();
    }

    // --- EnglishPhonics Bridge + Safe Fallback ---

    _getAllWords() {
      const merged = new Map();
      for (const entry of FALLBACK_WORDS) {
        merged.set(entry.word, entry);
      }

      const ep = EnglishPhonics;
      if (ep) {
        let externalList = null;
        if (typeof ep.getAllWords === 'function') {
          try { externalList = ep.getAllWords(); } catch (_) {}
        } else if (typeof ep.getWords === 'function') {
          try { externalList = ep.getWords('all'); } catch (_) {}
        } else if (Array.isArray(ep.WORDS)) {
          externalList = ep.WORDS;
        } else if (Array.isArray(ep.words)) {
          externalList = ep.words;
        }

        if (Array.isArray(externalList)) {
          for (const raw of externalList) {
            if (!raw || !raw.word) continue;
            const word = String(raw.word).toLowerCase().trim();
            const split = (raw.onset && raw.rime)
              ? { onset: String(raw.onset).toLowerCase(), rime: String(raw.rime).toLowerCase() }
              : splitOnsetRime(word);
            if (!split.onset || !split.rime) continue;
            merged.set(word, {
              word,
              onset: split.onset,
              rime: split.rime,
              emoji: raw.emoji || (merged.get(word) && merged.get(word).emoji) || '📖',
              tier: normalizeTier(raw.tier || 'all')
            });
          }
        }
      }

      return Array.from(merged.values());
    }

    _getTierWords(tier = this.tier) {
      const norm = normalizeTier(tier);
      const ep = EnglishPhonics;

      if (ep && typeof ep.getWords === 'function' && norm !== 'all') {
        try {
          const list = ep.getWords(tier);
          if (Array.isArray(list) && list.length > 0) {
            const normalized = list
              .filter((r) => r && r.word)
              .map((r) => {
                const word = String(r.word).toLowerCase().trim();
                const split = (r.onset && r.rime)
                  ? { onset: String(r.onset).toLowerCase(), rime: String(r.rime).toLowerCase() }
                  : splitOnsetRime(word);
                return {
                  word,
                  onset: split.onset,
                  rime: split.rime,
                  emoji: r.emoji || '📖',
                  tier: norm
                };
              })
              .filter((r) => r.onset && r.rime);
            if (normalized.length > 0) return normalized;
          }
        } catch (_) {}
      }

      const all = this._getAllWords();
      if (norm === 'all') return all;
      if (norm === 'g1') {
        const g1 = all.filter((w) => w.tier === 'g1' || w.tier === 'g1_2');
        return g1.length > 0 ? g1 : all;
      }
      if (norm === 'g2') {
        const g2 = all.filter((w) => w.tier === 'g2' || w.tier === 'g1_2');
        return g2.length > 0 ? g2 : all;
      }
      if (norm === 'g3') {
        const g3 = all.filter((w) => w.tier === 'g3' || w.tier === 'g4_5');
        return g3.length > 0 ? g3 : all;
      }
      const filtered = all.filter((w) => w.tier === norm);
      return filtered.length > 0 ? filtered : all;
    }

    _getMeaning(wordStr) {
      const clean = String(wordStr || '').toLowerCase().trim();
      if (!clean) return '';
      const ep = EnglishPhonics;
      if (ep && typeof ep.getMeaning === 'function') {
        const m = ep.getMeaning(clean);
        if (m) return m;
      }
      if (ep && ep.WORD_MEANINGS && ep.WORD_MEANINGS[clean]) {
        return ep.WORD_MEANINGS[clean];
      }
      return FALLBACK_MEANINGS[clean] || '';
    }

    _lookupWord(wordStr) {
      const clean = String(wordStr || '').toLowerCase().trim();
      if (!clean) return null;

      const ep = EnglishPhonics;
      if (ep) {
        let found = null;
        if (typeof ep.findWord === 'function') {
          try { found = ep.findWord(clean); } catch (_) {}
        } else if (typeof ep.lookupWord === 'function') {
          try { found = ep.lookupWord(clean); } catch (_) {}
        } else if (typeof ep.getWord === 'function') {
          try { found = ep.getWord(clean); } catch (_) {}
        } else if (ep.BY_WORD && ep.BY_WORD[clean]) {
          found = ep.BY_WORD[clean];
        }
        if (found && (found.word || found.emoji)) {
          const w = String(found.word || clean).toLowerCase();
          return {
            word: w,
            emoji: found.emoji || '📖',
            meaning: found.meaning || this._getMeaning(w)
          };
        }
      }

      const all = this._getAllWords();
      const match = all.find((w) => w.word === clean);
      if (match) {
        return {
          ...match,
          meaning: match.meaning || this._getMeaning(match.word)
        };
      }

      if (EXTRA_WORDS_BY_KEY[clean]) {
        const ex = EXTRA_WORDS_BY_KEY[clean];
        return {
          ...ex,
          meaning: ex.meaning || this._getMeaning(ex.word)
        };
      }
      return null;
    }

    _getMagicEPairs() {
      const ep = EnglishPhonics;
      const raw = (ep && Array.isArray(ep.MAGIC_E_PAIRS) && ep.MAGIC_E_PAIRS.length > 0)
        ? ep.MAGIC_E_PAIRS
        : (ep && Array.isArray(ep.MAGIC_E) && ep.MAGIC_E.length > 0)
          ? ep.MAGIC_E
          : (ep && Array.isArray(ep.magicE) && ep.magicE.length > 0)
            ? ep.magicE
            : MAGIC_E_PAIRS;

      return raw.map((p) => ({
        base: p.base,
        baseEmoji: p.baseEmoji || '📝',
        result: p.result || p.magic || `${p.base}e`,
        resultEmoji: p.resultEmoji || p.magicEmoji || '✨'
      }));
    }

    _speakPhonics(text, wordOnly = null) {
      const ep = EnglishPhonics;
      if (ep && typeof ep.speakWord === 'function' && wordOnly) {
        try {
          ep.speakWord(wordOnly);
          return;
        } catch (_) {}
      }
      if (AudioEngine && typeof AudioEngine.speak === 'function') {
        AudioEngine.speak(text, 'cheer');
        return;
      }
      if (window.speechSynthesis && text) {
        try {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(String(text));
          utt.rate = 0.92;
          utt.pitch = 1.18;
          window.speechSynthesis.speak(utt);
        } catch (_) {}
      }
    }

    _buildPictureChoices(targetWord, targetEmoji) {
      const pool = this._getAllWords();
      const usedEmojis = new Set([targetEmoji]);
      const distractors = [];

      const ep = EnglishPhonics;
      if (ep && typeof ep.getPictureDistractors === 'function') {
        try {
          const ext = ep.getPictureDistractors(targetWord, 2);
          if (Array.isArray(ext)) {
            for (const item of ext) {
              const emo = typeof item === 'string' ? item : (item && item.emoji);
              if (emo && !usedEmojis.has(emo)) {
                usedEmojis.add(emo);
                distractors.push({ emoji: emo, isCorrect: false, dimmed: false });
              }
            }
          }
        } catch (_) {}
      }

      // Fill remaining distractors with distinct emojis
      let safety = 0;
      while (distractors.length < 2 && safety < 80) {
        safety++;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick && pick.emoji && !usedEmojis.has(pick.emoji)) {
          usedEmojis.add(pick.emoji);
          distractors.push({ emoji: pick.emoji, isCorrect: false, dimmed: false });
        }
      }

      const fallbackIcons = ['☀️', '🐸', '🚗', '🎈', '🍎', '🌟'];
      for (const icon of fallbackIcons) {
        if (distractors.length >= 2) break;
        if (!usedEmojis.has(icon)) {
          usedEmojis.add(icon);
          distractors.push({ emoji: icon, isCorrect: false, dimmed: false });
        }
      }

      const choices = [
        { emoji: targetEmoji, isCorrect: true, dimmed: false },
        ...distractors.slice(0, 2)
      ];
      // Fisher-Yates shuffle
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      return choices;
    }

    // --- Pointer / Touch Interaction ---

    _bindPointer() {
      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.canvas.height;

        // 1. Reading Picture Check bubble tap takes priority!
        if (this.pictureCheck) {
          for (let i = 0; i < this.pictureCheck.choices.length; i++) {
            const ch = this.pictureCheck.choices[i];
            if (!ch.dimmed && Math.hypot(x - ch.x, y - ch.y) <= ch.r + 14) {
              this._selectPictureChoice(i);
              return;
            }
          }
          return;
        }

        if (this.bigWord) return;

        // 2. Tap a held palm directly to release its tile & pick a new one!
        if (this.heldLeft !== null && Math.hypot(x - this.leftHand.x, y - (this.leftHand.y - 10)) <= 54) {
          this._releaseTile('left');
          return;
        }
        if (this.heldRight !== null && Math.hypot(x - this.rightHand.x, y - (this.rightHand.y - 10)) <= 54) {
          this._releaseTile('right');
          return;
        }

        // 3. If holding both and tapping center -> trigger clap!
        if (this.heldLeft !== null && this.heldRight !== null) {
          if (Math.abs(x - this.canvas.width / 2) < this.canvas.width * 0.28) {
            this.triggerClap();
            return;
          }
        }

        // 4. Tap a falling bonus treasure!
        for (let i = this.fallingTreasures.length - 1; i >= 0; i--) {
          const tr = this.fallingTreasures[i];
          if (Math.hypot(x - tr.x, y - tr.y) <= tr.r + 18) {
            this._collectTreasure(tr, i);
            return;
          }
        }

        // 5. Tap a falling phonics tile to catch it into matching palm!
        for (let i = this.fallingTiles.length - 1; i >= 0; i--) {
          const tile = this.fallingTiles[i];
          if (Math.hypot(x - tile.x, y - tile.y) <= tile.r + 18) {
            this._catchTile(tile, i, true);
            break;
          }
        }
      });
    }

    // --- Public Controls ---

    setTier(tier) {
      this.tier = normalizeTier(tier);
      this.heldLeft = null;
      this.heldRight = null;
      this.bigWord = null;
      this.pictureCheck = null;
      this.fallingTiles = [];
      this._spawnWave();
      this.onStatus(`Phonics Level: ${tierLabel(this.tier)} — Catch Left + Right & 👏 CLAP!`);
      this._emitScore();
    }

    setSpeed(speedKey) {
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = SPEED_PRESETS[this.speed];
      this.fallingTiles = [];
      this._spawnWave();
      this.onStatus(`Tile Flow: ${preset.label} — Catch Left + Right & 👏 CLAP!`);
    }

    setMode(mode) {
      this.mode = mode === 'magic-e' ? 'magic-e' : 'blend';
      this.heldLeft = null;
      this.heldRight = null;
      this.bigWord = null;
      this.pictureCheck = null;
      this.fallingTiles = [];
      this._spawnWave();
      this.onStatus(
        this.mode === 'magic-e'
          ? '✨ Magic-E Mode! Catch a base word (cap) + ✨ e, then 👏 CLAP!'
          : '🔤 Blend Mode! Catch Onset (c) + Rime (at), then 👏 CLAP!'
      );
      this._emitScore();
    }

    async start(tier = 'all', speedKey = 'slow', mode = 'blend') {
      this.stop();
      this._syncCanvasSize();
      this.tier = normalizeTier(tier);
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      this.mode = mode === 'magic-e' ? 'magic-e' : 'blend';

      const preset = SPEED_PRESETS[this.speed];
      this.score = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = preset.duration;
      this.heldLeft = null;
      this.heldRight = null;
      this.lastWord = null;
      this.bigWord = null;
      this.pictureCheck = null;
      this.fallingTiles = [];
      this.fallingTreasures = [];
      this.particles = [];
      this.popups = [];
      this.prevFrame = null;
      this.catchGrace = 0;
      this.clapCooldown = 0;
      this.leftReleaseCooldown = 0;
      this.rightReleaseCooldown = 0;
      this.leftPose = { isFist: false, fistFrames: 0, openFrames: 0, openSpread: 0, openSpan: 0, openArea: 0 };
      this.rightPose = { isFist: false, fistFrames: 0, openFrames: 0, openSpread: 0, openSpan: 0, openArea: 0 };
      this.leftHand.isFist = false;
      this.rightHand.isFist = false;
      this.handsWereApart = false;
      this.clapSoundWindow = 0;
      this.micLiveSignal = false;
      this.running = true;

      // Unlock AudioContext synchronously inside user click/tap for iOS Safari!
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.audioCtx = new AudioCtx();
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
        } catch (_) {
          this.audioCtx = null;
        }
      }

      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');

      this.onStatus('📷 Starting Phonics Camera & Clap Mic...');
      await this._startCamera();
      if (!this.running) return;

      this._spawnWave();
      this._emitScore();

      this.timerId = setInterval(() => {
        if (!this.running) return;
        this.timeLeft -= 1;
        this._emitScore();
        if (this.timeLeft <= 0) {
          this.stop();
          this.onFinish({ score: this.score, stars: this.stars });
        }
      }, 1000);

      const loop = () => {
        if (!this.running) return;
        this._update();
        this._render();
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    _setupMic(stream) {
      try {
        const audioTracks = stream.getAudioTracks();
        if (!audioTracks || audioTracks.length === 0 || !this.audioCtx) {
          this.hasMic = false;
          return;
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        const src = this.audioCtx.createMediaStreamSource(stream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        // Connect through a muted GainNode(0) to destination — REQUIRED on iOS Safari so AnalyserNode pulls samples!
        const silentGain = this.audioCtx.createGain();
        silentGain.gain.value = 0;
        src.connect(this.analyser);
        this.analyser.connect(silentGain);
        silentGain.connect(this.audioCtx.destination);

        this.audioBuf = new Uint8Array(this.analyser.fftSize);
        this.hasMic = true;
      } catch (_) {
        this.hasMic = false;
      }
    }

    async _startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.hasCamera = false;
        this.hasMic = false;
        this.onStatus('🔤 Touch Phonics Mode! Tap Left + Right tiles & tap CLAP!');
        return;
      }
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });
        this._setupMic(this.stream);
      } catch (_) {
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
          this.hasMic = false;
        } catch (__) {
          this.hasCamera = false;
          this.hasMic = false;
          this.onStatus('🔤 Touch Phonics Mode (Camera off)! Tap Left + Right tiles & tap CLAP!');
          return;
        }
      }

      try {
        this.video.srcObject = this.stream;
        await this.video.play();
        this.hasCamera = true;
        this.onStatus(
          this.hasMic
            ? '🙌 Hold in OPEN PALM ✋ • Make a FIST ✊ to release • 👏 CLAP to blend!'
            : '🙌 Hold in OPEN PALM ✋ • Make a FIST ✊ to release • 👏 Bring palms together!'
        );
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('🔤 Touch Phonics Mode! Tap Left + Right tiles & tap CLAP!');
      }
    }

    stop() {
      this.running = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close().catch(() => {});
        this.audioCtx = null;
        this.analyser = null;
        this.hasMic = false;
      }
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this.video.srcObject = null;
    }

    // --- Spawning ---

    _findSpacedSpawnPos(isLeft, slotIdx, w) {
      const minX = isLeft ? Math.max(66, w * 0.11) : w * 0.56;
      const maxX = isLeft ? w * 0.42 : Math.min(w - 66, w * 0.89);
      const spanX = Math.max(40, maxX - minX);
      const baseY = -44 - slotIdx * 138;

      let bestX = minX + (slotIdx % 2 === 0 ? 0.22 : 0.78) * spanX;
      let bestY = baseY;

      for (let attempt = 0; attempt < 18; attempt++) {
        const laneHalf = attempt % 2 === 0 ? 0.18 : 0.68;
        const candX = minX + (laneHalf + (Math.random() - 0.5) * 0.26) * spanX;
        const clampedX = Math.max(minX, Math.min(maxX, candX));
        const candY = baseY - Math.random() * 54;

        const collides = this.fallingTiles.some(
          (o) => Math.abs(clampedX - o.x) < 92 && Math.abs(candY - o.y) < 126
        ) || this.fallingTreasures.some(
          (o) => Math.abs(clampedX - o.x) < 76 && Math.abs(candY - o.y) < 100
        );

        if (!collides) {
          return { x: clampedX, y: candY };
        }
        bestX = clampedX;
        bestY = candY - 110;
      }
      return { x: bestX, y: bestY };
    }

    _spawnWave() {
      const w = this.canvas.width;
      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      const leftCount = this.fallingTiles.filter((t) => t.side === 'left').length;
      const rightCount = this.fallingTiles.filter((t) => t.side === 'right').length;
      const needLeft = Math.max(0, 2 - leftCount);
      const needRight = Math.max(0, 2 - rightCount);

      if (this.mode === 'magic-e') {
        const pairs = this._getMagicEPairs();
        for (let i = 0; i < needLeft; i++) {
          const pos = this._findSpacedSpawnPos(true, leftCount + i, w);
          const p = pairs[Math.floor(Math.random() * pairs.length)];
          this.fallingTiles.push({
            x: pos.x,
            y: pos.y,
            r: 34,
            vy: preset.vyMin + Math.random() * preset.vyRange * 0.6,
            side: 'left',
            val: p.base,
            badge: p.baseEmoji,
            isMagicE: false,
            fontSize: preset.fontSize,
            wobble: Math.random() * Math.PI * 2
          });
        }
        for (let i = 0; i < needRight; i++) {
          const pos = this._findSpacedSpawnPos(false, rightCount + i, w);
          const roll = Math.random();
          let val = 'e';
          let badge = '✨';
          if (roll >= 0.72 && roll < 0.86) {
            val = 's';
            badge = null;
          } else if (roll >= 0.86) {
            val = 'a';
            badge = null;
          }
          this.fallingTiles.push({
            x: pos.x,
            y: pos.y,
            r: 34,
            vy: preset.vyMin + Math.random() * preset.vyRange * 0.6,
            side: 'right',
            val,
            badge,
            isMagicE: val === 'e',
            fontSize: preset.fontSize,
            wobble: Math.random() * Math.PI * 2
          });
        }
      } else {
        const tierWords = this._getTierWords(this.tier);
        const allOnsets = Array.from(new Set(tierWords.map((item) => item.onset)));
        const allRimes = Array.from(new Set(tierWords.map((item) => item.rime)));

        const seedWord = tierWords[Math.floor(Math.random() * tierWords.length)];
        const matchingRimes = this.heldLeft
          ? tierWords.filter((item) => item.onset === this.heldLeft).map((item) => item.rime)
          : [];
        const matchingOnsets = this.heldRight
          ? tierWords.filter((item) => item.rime === this.heldRight).map((item) => item.onset)
          : [];

        const existingLeftVals = new Set(this.fallingTiles.filter((t) => t.side === 'left').map((t) => t.val));
        const existingRightVals = new Set(this.fallingTiles.filter((t) => t.side === 'right').map((t) => t.val));

        for (let i = 0; i < needLeft; i++) {
          const pos = this._findSpacedSpawnPos(true, leftCount + i, w);
          let val;
          if (matchingOnsets.length > 0 && Math.random() < 0.75) {
            val = matchingOnsets[Math.floor(Math.random() * matchingOnsets.length)];
          } else if (i === 0 && !this.heldLeft && seedWord && !existingLeftVals.has(seedWord.onset)) {
            val = seedWord.onset;
          } else {
            const fresh = allOnsets.filter((o) => !existingLeftVals.has(o));
            const pool = fresh.length > 0 ? fresh : allOnsets;
            val = pool[Math.floor(Math.random() * pool.length)];
          }
          existingLeftVals.add(val);
          this.fallingTiles.push({
            x: pos.x,
            y: pos.y,
            r: 33,
            vy: preset.vyMin + Math.random() * preset.vyRange * 0.6,
            side: 'left',
            val,
            badge: null,
            isMagicE: false,
            fontSize: preset.fontSize,
            wobble: Math.random() * Math.PI * 2
          });
        }

        for (let i = 0; i < needRight; i++) {
          const pos = this._findSpacedSpawnPos(false, rightCount + i, w);
          let val;
          if (matchingRimes.length > 0 && (i === 0 || Math.random() < 0.78)) {
            val = matchingRimes[Math.floor(Math.random() * matchingRimes.length)];
          } else if (i === 0 && !this.heldLeft && seedWord && !existingRightVals.has(seedWord.rime)) {
            val = seedWord.rime;
          } else {
            const fresh = allRimes.filter((r) => !existingRightVals.has(r));
            const pool = fresh.length > 0 ? fresh : allRimes;
            val = pool[Math.floor(Math.random() * pool.length)];
          }
          existingRightVals.add(val);
          this.fallingTiles.push({
            x: pos.x,
            y: pos.y,
            r: 33,
            vy: preset.vyMin + Math.random() * preset.vyRange * 0.6,
            side: 'right',
            val,
            badge: null,
            isMagicE: false,
            fontSize: preset.fontSize,
            wobble: Math.random() * Math.PI * 2
          });
        }
      }

      if (true && this.fallingTreasures.length < 1 && Math.random() < 0.65) {
        const mat = pickRandomTreasure();
        const tx = w * 0.22 + Math.random() * (w * 0.56);
        this.fallingTreasures.push({
          x: tx,
          y: -110 - Math.random() * 80,
          r: 23,
          vy: preset.vyMin * 0.85 + Math.random() * 0.3,
          wobble: Math.random() * Math.PI * 2,
          mat
        });
      }
    }

    // --- Motion & Mic Clap Detection ---

    _analyzeMotion() {
      if (!this.hasCamera || this.video.readyState < 2) return;
      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;

      this._drawVideoCover(this.motionCtx, mw, mh);

      const data = this.motionCtx.getImageData(0, 0, mw, mh).data;
      if (!this.prevFrame) {
        this.prevFrame = new Uint8ClampedArray(data);
        return;
      }

      const bothHeld = this.heldLeft !== null && this.heldRight !== null;
      const yStart = Math.round(mh * 0.34); // Skip upper head region
      const yEnd = Math.round(mh * 0.88);
      const leftBound = bothHeld ? mw * 0.56 : mw * 0.44;
      const rightBound = bothHeld ? mw * 0.44 : mw * 0.56;

      let leftSum = 0;
      let leftX = 0;
      let leftY = 0;
      let centerSum = 0;
      let rightSum = 0;
      let rightX = 0;
      let rightY = 0;

      for (let y = yStart; y < yEnd; y++) {
        for (let x = 0; x < mw; x++) {
          const idx = (y * mw + x) * 4;
          const diff =
            Math.abs(data[idx] - this.prevFrame[idx]) +
            Math.abs(data[idx + 1] - this.prevFrame[idx + 1]) +
            Math.abs(data[idx + 2] - this.prevFrame[idx + 2]);
          if (diff > 62) {
            if (x < leftBound) {
              leftSum++;
              leftX += x;
              leftY += y;
            }
            if (x > rightBound) {
              rightSum++;
              rightX += x;
              rightY += y;
            }
            if (x >= mw * 0.32 && x <= mw * 0.68 && diff > 72) {
              centerSum++;
            }
          }
        }
      }

      this.prevFrame.set(data);
      this.motionGrid = { left: leftSum, center: centerSum, right: rightSum };

      const w = this.canvas.width;
      const h = this.canvas.height;
      const minMotionPixels = Math.max(14, Math.round((mw * mh) * 0.0035));

      if (leftSum > minMotionPixels) {
        const rawX = (leftX / leftSum / mw) * w;
        const rawY = (leftY / leftSum / mh) * h;
        const tx = Math.max(w * 0.12, Math.min(bothHeld ? w * 0.54 : w * 0.44, rawX));
        const ty = Math.max(h * 0.36, Math.min(h - 125, rawY));
        this.leftHand.x += (tx - this.leftHand.x) * 0.25;
        this.leftHand.y += (ty - this.leftHand.y) * 0.25;
        this.leftHand.active = true;
      } else {
        this.leftHand.active = false;
      }

      if (rightSum > minMotionPixels) {
        const rawX = (rightX / rightSum / mw) * w;
        const rawY = (rightY / rightSum / mh) * h;
        const tx = Math.max(bothHeld ? w * 0.46 : w * 0.56, Math.min(w * 0.88, rawX));
        const ty = Math.max(h * 0.36, Math.min(h - 125, rawY));
        this.rightHand.x += (tx - this.rightHand.x) * 0.25;
        this.rightHand.y += (ty - this.rightHand.y) * 0.25;
        this.rightHand.active = true;
      } else {
        this.rightHand.active = false;
      }

      // Open Palm vs Closed Fist detection per hand (strictly isolated left vs right)
      const inClapZone = bothHeld && Math.hypot(this.leftHand.x - this.rightHand.x, this.leftHand.y - this.rightHand.y) < w * 0.31;
      this._analyzeHandPose('left', data, mw, mh, w, h, inClapZone);
      this._analyzeHandPose('right', data, mw, mh, w, h, inClapZone);
    }

    _isSkinYCbCr(r, g, b) {
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      if (y < 36) return false;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      return cb >= 74 && cb <= 132 && cr >= 130 && cr <= 178;
    }

    _analyzeHandPose(side, data, mw, mh, w, h, inClapZone) {
      const hand = side === 'left' ? this.leftHand : this.rightHand;
      const pose = side === 'left' ? this.leftPose : this.rightPose;
      const heldVal = side === 'left' ? this.heldLeft : this.heldRight;
      const cooldown = side === 'left' ? this.leftReleaseCooldown : this.rightReleaseCooldown;

      const hx = Math.round((hand.x / w) * mw);
      const hy = Math.round((hand.y / h) * mh);
      const rad = 16;

      const sideMinX = side === 'left' ? 0 : Math.ceil(mw * 0.54);
      const sideMaxX = side === 'left' ? Math.floor(mw * 0.46) : mw - 1;
      const x0 = Math.max(sideMinX, hx - rad);
      const x1 = Math.min(sideMaxX, hx + rad);
      const y0 = Math.max(Math.round(mh * 0.24), hy - rad);
      const y1 = Math.min(Math.round(mh * 0.92), hy + rad);

      if (x1 <= x0 || y1 <= y0) return;

      let skinCount = 0;
      let sumX = 0;
      let sumY = 0;
      let minX = x1;
      let maxX = x0;
      let minY = y1;
      let maxY = y0;

      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const idx = (y * mw + x) * 4;
          if (this._isSkinYCbCr(data[idx], data[idx + 1], data[idx + 2])) {
            skinCount++;
            sumX += x;
            sumY += y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const patchArea = (x1 - x0 + 1) * (y1 - y0 + 1);
      // Ignore if hand not visible or background itself is skin-toned
      if (skinCount < 16 || skinCount > patchArea * 0.72) {
        pose.fistFrames = 0;
        if (skinCount < 16) {
          pose.openFrames = 0;
          pose.isFist = false;
          hand.isFist = false;
        }
        return;
      }

      const cx = sumX / skinCount;
      const cy = sumY / skinCount;
      let sumSq = 0;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = (y * mw + x) * 4;
          if (this._isSkinYCbCr(data[idx], data[idx + 1], data[idx + 2])) {
            const dx = x - cx;
            const dy = y - cy;
            sumSq += dx * dx + dy * dy;
          }
        }
      }

      const spread = Math.sqrt(sumSq / skinCount);
      const boxW = Math.max(1, maxX - minX + 1);
      const boxH = Math.max(1, maxY - minY + 1);
      const span = Math.max(boxW, boxH);
      const aspect = boxW / boxH;
      const solidity = skinCount / (boxW * boxH);

      if (pose.openSpread === 0) {
        pose.openSpread = spread;
        pose.openSpan = span;
        pose.openArea = skinCount;
      }

      const fistByRelativeShrink =
        pose.openSpread > 0 &&
        spread <= pose.openSpread * 0.78 &&
        span <= pose.openSpan * 0.88;

      const fistByCompactShape =
        solidity >= 0.64 &&
        aspect >= 0.60 &&
        aspect <= 1.60 &&
        pose.openSpread > 0 &&
        spread <= pose.openSpread * 0.85 &&
        skinCount <= pose.openArea * 0.82;

      if (fistByRelativeShrink || fistByCompactShape) {
        pose.fistFrames += 1;
        pose.openFrames = 0;
        if (pose.fistFrames >= 4) {
          pose.isFist = true;
          hand.isFist = true;
          if (
            heldVal !== null &&
            !inClapZone &&
            this.catchGrace === 0 &&
            cooldown === 0 &&
            !this.bigWord &&
            !this.pictureCheck
          ) {
            this._releaseTile(side, 'fist');
          }
        }
      } else {
        pose.fistFrames = 0;
        pose.openFrames += 1;
        // Slowly adapt open-palm baseline while fingers are spread open
        if (solidity < 0.64 || spread >= pose.openSpread * 0.90) {
          pose.openSpread = Math.max(spread, pose.openSpread * 0.994);
          pose.openSpan = Math.max(span, pose.openSpan * 0.994);
          pose.openArea = Math.max(skinCount, pose.openArea * 0.994);
        }
        if (pose.openFrames >= 3) {
          pose.isFist = false;
          hand.isFist = false;
        }
      }
    }

    _releaseTile(side, reason = 'tap') {
      const old = side === 'left' ? this.heldLeft : this.heldRight;
      if (old === null) return;
      if (side === 'left') {
        this.heldLeft = null;
        this.leftReleaseCooldown = 34;
      } else {
        this.heldRight = null;
        this.rightReleaseCooldown = 34;
      }
      this.handsWereApart = false;
      const hand = side === 'left' ? this.leftHand : this.rightHand;
      this.popups.push({
        x: hand.x,
        y: hand.y - 42,
        text: reason === 'fist' ? `✊ Released "${old}"!` : `👋 Released "${old}"!`,
        color: '#bae6fd',
        life: 38
      });
      if (AudioEngine) AudioEngine.flip();
      this.onStatus(
        reason === 'fist'
          ? `✊ Fist released "${old}" — open palm ✋ to hold a new word!`
          : `👋 Released "${old}" — open palm ✋ to hold a new word!`
      );
      this._emitScore();
    }

    _sampleClapAudio() {
      if (!this.hasMic || !this.analyser || !this.audioBuf || !this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
        return;
      }
      this.analyser.getByteTimeDomainData(this.audioBuf);
      let peak = 0;
      for (let i = 0; i < this.audioBuf.length; i++) {
        const amp = Math.abs(this.audioBuf[i] - 128) / 128;
        if (amp > peak) peak = amp;
      }
      if (peak > 0.0015) {
        this.micLiveSignal = true;
      }
      this.micLevel = peak;
      this.avgNoise = this.avgNoise * 0.90 + peak * 0.10;

      if (peak > 0.09 && peak > this.avgNoise * 1.65) {
        this.clapSoundWindow = 26;
      } else if (this.clapSoundWindow > 0) {
        this.clapSoundWindow -= 1;
      }
    }

    // --- Catching & Scoring ---

    _emitScore(extra = {}) {
      this.onScore({
        score: this.score,
        combo: this.combo,
        stars: this.stars,
        timeLeft: this.timeLeft,
        heldLeft: this.heldLeft,
        heldRight: this.heldRight,
        lastWord: this.lastWord,
        collectedMaterial: extra.collectedMaterial || null
      });
    }

    _catchTile(tile, index, allowReplace = false) {
      let caught = false;
      if (tile.side === 'left' && (!this.heldLeft || allowReplace)) {
        this.heldLeft = tile.val;
        caught = true;
      } else if (tile.side === 'right' && (!this.heldRight || allowReplace)) {
        this.heldRight = tile.val;
        caught = true;
      }

      if (caught) {
        this.fallingTiles.splice(index, 1);
        this.catchGrace = 28;
        this.handsWereApart = false;
        if (AudioEngine) AudioEngine.pop();
        if (EnglishPhonics && typeof EnglishPhonics.speakPhoneme === 'function') {
          try { EnglishPhonics.speakPhoneme(tile.val); } catch (_) {}
        }
        this._emitScore();
      }
    }

    _collectTreasure(tr, index) {
      this.fallingTreasures.splice(index, 1);
      const mat = tr.mat;
      this.score += mat.pts;
      this.stars += mat.stars;
      if (AudioEngine) AudioEngine.magic();
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 * i) / 16;
        const spd = 2 + Math.random() * 4;
        this.particles.push({
          x: tr.x,
          y: tr.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 2.5 + Math.random() * 3.5,
          color: mat.glow,
          life: 28 + Math.random() * 12
        });
      }
      this.popups.push({
        x: tr.x,
        y: tr.y - 10,
        text: `${mat.emoji} +${mat.pts} ${mat.short}!`,
        color: mat.glow,
        life: 44
      });
      this._emitScore({ collectedMaterial: mat.id });
    }

    _spawnExplosion(cx, cy, colors) {
      for (let i = 0; i < 36; i++) {
        const ang = (Math.PI * 2 * i) / 36;
        const spd = 2.5 + Math.random() * 5;
        this.particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 3 + Math.random() * 5,
          color: colors[i % colors.length],
          life: 40 + Math.random() * 20
        });
      }
    }

    _selectPictureChoice(index) {
      if (!this.pictureCheck) return;
      const choice = this.pictureCheck.choices[index];
      if (!choice || choice.dimmed) return;

      if (choice.isCorrect) {
        const bonus = 50;
        this.score += bonus;
        this.stars += 1;
        this.combo = Math.min(5, this.combo + 1);
        this.popups.push({
          x: choice.x,
          y: choice.y - 45,
          text: `${choice.emoji} +${bonus} Reading Bonus!`,
          color: '#4ade80',
          life: 52
        });
        this._spawnExplosion(choice.x, choice.y, ['#4ade80', '#fde047', '#38bdf8']);
        if (AudioEngine) AudioEngine.correct();
        this.pictureCheck = null;
        this.clapCooldown = 24;
        if (this.bigWord) {
          this.bigWord.showImage = true;
          this.bigWord.life = 88;
        } else {
          this._spawnWave();
        }
        this._emitScore();
      } else {
        choice.dimmed = true;
        if (AudioEngine) AudioEngine.wrong();
        this.popups.push({
          x: choice.x,
          y: choice.y - 36,
          text: 'Try another picture!',
          color: '#fca5a5',
          life: 36
        });
      }
    }

    triggerClap() {
      if (this.heldLeft === null || this.heldRight === null || this.bigWord || this.pictureCheck) return;

      const left = String(this.heldLeft);
      const right = String(this.heldRight);
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;

      let blended = `${left}${right}`;
      let magicPair = null;

      if (this.mode === 'magic-e') {
        const pairs = this._getMagicEPairs();
        if (right === 'e') {
          magicPair = pairs.find((p) => p.base === left) || null;
          blended = magicPair ? magicPair.result : `${left}e`;
        }
      }

      const wordMatch = magicPair
        ? {
            word: magicPair.result,
            emoji: magicPair.resultEmoji,
            meaning: this._getMeaning(magicPair.result)
          }
        : this._lookupWord(blended);

      this.lastWord = blended;
      this.clapCooldown = 45;

      let pts = 0;
      let clapBonus = null;

      if (wordMatch) {
        pts = (magicPair ? 120 : 100) * this.combo;
        this.score += pts;
        this.stars += 2;
        this.combo = Math.min(5, this.combo + 1);

        const meaning = wordMatch.meaning || this._getMeaning(wordMatch.word);
        const expr = magicPair
          ? `${left} + ✨ e → ${wordMatch.word} (${magicPair.baseEmoji} → ${magicPair.resultEmoji})`
          : `${left} + ${right} = ${wordMatch.word}`;

        this.bigWord = {
          word: wordMatch.word,
          emoji: wordMatch.emoji,
          meaning,
          expr,
          isReal: true,
          isMagicE: Boolean(magicPair),
          scale: 0.2,
          life: 255
        };

        this._spawnExplosion(cx, cy - 30, ['#fde047', '#34d399', '#38bdf8', '#f472b6']);

        if (AudioEngine) AudioEngine.magic();
        const spokenMeaning = meaning
          ? `${magicPair ? `Magic E! ${left} plus e makes ${wordMatch.word}!` : `${wordMatch.word}!`} ${meaning}`
          : (magicPair ? `Magic E! ${left} plus e makes ${wordMatch.word}!` : `${wordMatch.word}!`);
        this._speakPhonics(spokenMeaning, null);
        if (meaning) {
          this.onStatus(`${wordMatch.emoji} ${wordMatch.word.toUpperCase()}: ${meaning}`);
        }

        clapBonus = true ? pickRandomTreasure() : null;
        if (clapBonus) {
          this.popups.push({
            x: cx,
            y: cy + 122,
            text: `${clapBonus.emoji} Bonus ${clapBonus.name}!`,
            color: clapBonus.glow,
            life: 62
          });
        }

        // Launch ~4.2 second Reading Picture Check (255 frames at 60fps)
        const choices = this._buildPictureChoices(wordMatch.word, wordMatch.emoji);
        const w = this.canvas.width;
        const h = this.canvas.height;
        const spacing = Math.min(180, w * 0.27);
        const bubbleR = Math.max(36, Math.min(52, w * 0.082, h * 0.12));
        const topOffset = w < 600 ? 92 : 60;
        const choiceY = Math.max(topOffset + 190 + bubbleR, h * 0.69);
        choices.forEach((ch, idx) => {
          ch.x = cx + (idx - 1) * spacing;
          ch.y = choiceY;
          ch.r = bubbleR;
        });

        this.pictureCheck = {
          word: wordMatch.word,
          emoji: wordMatch.emoji,
          choices,
          life: 240,
          maxLife: 240,
          grace: 32
        };
      } else {
        // Cheerful Silly Word practice!
        pts = 40;
        this.score += pts;
        this.stars += 1;

        this.bigWord = {
          word: blended,
          emoji: '🤪',
          expr: `${left} + ${right} = ${blended}`,
          isReal: false,
          isMagicE: false,
          scale: 0.2,
          life: 78
        };

        this._spawnExplosion(cx, cy, ['#c084fc', '#f472b6', '#fde047']);

        if (AudioEngine) AudioEngine.giggle();
        this._speakPhonics(
          this.mode === 'magic-e' && right !== 'e'
            ? `${blended}! Try catching magic e!`
            : `${blended}! Silly word!`,
          blended
        );
      }

      this.heldLeft = null;
      this.heldRight = null;
      this._emitScore({ collectedMaterial: clapBonus ? clapBonus.id : null });
    }

    // --- Frame Update ---

    _update() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.tick += 1;
      if (this.clapCooldown > 0) this.clapCooldown--;
      if (this.catchGrace > 0) this.catchGrace--;
      if (this.leftReleaseCooldown > 0) this.leftReleaseCooldown--;
      if (this.rightReleaseCooldown > 0) this.rightReleaseCooldown--;

      // Ambient sparkles
      for (const s of this.sparkles) {
        s.y += s.vy;
        s.x += s.vx;
        s.phase += 0.06;
        if (s.y > h) { s.y = -6; s.x = Math.random() * w; }
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
      }

      // Motion & Microphone Clap Audio detection
      this._analyzeMotion();
      this._sampleClapAudio();

      // Gently settle idle hands back toward resting palm spots
      if (!this.leftHand.active) {
        this.leftHand.x += (w * 0.22 - this.leftHand.x) * 0.04;
        this.leftHand.y += (h - 135 - this.leftHand.y) * 0.04;
      }
      if (!this.rightHand.active) {
        this.rightHand.x += (w * 0.78 - this.rightHand.x) * 0.04;
        this.rightHand.y += (h - 135 - this.rightHand.y) * 0.04;
      }

      // Active Reading Picture Check (~4s window)
      if (this.pictureCheck) {
        if (this.bigWord) {
          this.bigWord.scale = Math.min(1, this.bigWord.scale + 0.12);
        }
        if (this.pictureCheck.grace > 0) this.pictureCheck.grace--;
        this.pictureCheck.life -= 1;

        // Re-center choice coordinates smoothly in case of resize
        const cx = w / 2;
        const spacing = Math.min(180, w * 0.27);
        const bubbleR = Math.max(36, Math.min(52, w * 0.082, h * 0.12));
        const topOffset = w < 600 ? 92 : 60;
        const choiceY = Math.max(topOffset + 190 + bubbleR, h * 0.69);
        this.pictureCheck.choices.forEach((ch, idx) => {
          ch.x = cx + (idx - 1) * spacing;
          ch.y = choiceY;
          ch.r = bubbleR;
        });

        // Camera hand wave selection after brief post-clap grace
        if (this.hasCamera && this.pictureCheck.grace === 0) {
          for (let i = 0; i < this.pictureCheck.choices.length; i++) {
            const ch = this.pictureCheck.choices[i];
            if (ch.dimmed) continue;
            const hitL = this.leftHand.active && Math.hypot(this.leftHand.x - ch.x, this.leftHand.y - ch.y) < ch.r + 22;
            const hitR = this.rightHand.active && Math.hypot(this.rightHand.x - ch.x, this.rightHand.y - ch.y) < ch.r + 22;
            if (hitL || hitR) {
              this._selectPictureChoice(i);
              break;
            }
          }
        }

        if (this.pictureCheck && this.pictureCheck.life <= 0) {
          const ans = this.pictureCheck;
          this.popups.push({
            x: cx,
            y: choiceY - 40,
            text: `${ans.emoji} "${ans.word}"`,
            color: '#bae6fd',
            life: 44
          });
          this.pictureCheck = null;
          if (this.bigWord) {
            this.bigWord.showImage = true;
            this.bigWord.life = 88;
          } else {
            this._spawnWave();
          }
        }
      } else if (this.bigWord) {
        // Silly-word / non-picture-check big word display timer
        this.bigWord.scale = Math.min(1, this.bigWord.scale + 0.11);
        this.bigWord.life -= 1;
        if (this.bigWord.life <= 0) {
          this.bigWord = null;
          this._spawnWave();
        }
      }

      // Falling phonics tiles & treasures
      if (!this.bigWord && !this.pictureCheck) {
        const leftCount = this.fallingTiles.filter((t) => t.side === 'left').length;
        const rightCount = this.fallingTiles.filter((t) => t.side === 'right').length;
        if (leftCount < 2 || rightCount < 2) {
          this._spawnWave();
        }
        const catchRadius = Math.max(46, Math.round(w * 0.095));

        for (let i = this.fallingTiles.length - 1; i >= 0; i--) {
          const tile = this.fallingTiles[i];
          tile.y += tile.vy;
          tile.wobble += 0.04;
          tile.x += Math.sin(tile.wobble) * 0.4;
          if (tile.y > h + 44) {
            this.fallingTiles.splice(i, 1);
          }
        }

        // Allow kids to choose & capture ONLY in OPEN PALM (fist does not catch!)
        if (this.hasCamera) {
          if (this.leftHand.active && !this.leftHand.isFist && !this.heldLeft && this.leftReleaseCooldown === 0) {
            let bestIdx = -1;
            let bestDist = catchRadius;
            for (let i = 0; i < this.fallingTiles.length; i++) {
              const tile = this.fallingTiles[i];
              if (tile.side !== 'left' || tile.y <= h * 0.20 || tile.y >= h * 0.90) continue;
              const d = Math.hypot(tile.x - this.leftHand.x, tile.y - this.leftHand.y);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
              }
            }
            if (bestIdx !== -1) {
              this._catchTile(this.fallingTiles[bestIdx], bestIdx, false);
            }
          }

          if (this.rightHand.active && !this.rightHand.isFist && !this.heldRight && this.rightReleaseCooldown === 0) {
            let bestIdx = -1;
            let bestDist = catchRadius;
            for (let i = 0; i < this.fallingTiles.length; i++) {
              const tile = this.fallingTiles[i];
              if (tile.side !== 'right' || tile.y <= h * 0.20 || tile.y >= h * 0.90) continue;
              const d = Math.hypot(tile.x - this.rightHand.x, tile.y - this.rightHand.y);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
              }
            }
            if (bestIdx !== -1) {
              this._catchTile(this.fallingTiles[bestIdx], bestIdx, false);
            }
          }
        }

        for (let i = this.fallingTreasures.length - 1; i >= 0; i--) {
          const tr = this.fallingTreasures[i];
          tr.y += tr.vy;
          tr.wobble += 0.06;
          tr.x += Math.sin(tr.wobble) * 0.7;
          if (this.hasCamera && tr.y > h * 0.22 && tr.y < h * 0.90) {
            const distL = Math.hypot(tr.x - this.leftHand.x, tr.y - this.leftHand.y);
            const distR = Math.hypot(tr.x - this.rightHand.x, tr.y - this.rightHand.y);
            if (distL < catchRadius || distR < catchRadius) {
              this._collectTreasure(tr, i);
              continue;
            }
          }
          if (tr.y > h + 36) {
            this.fallingTreasures.splice(i, 1);
          }
        }

        // Cross-device Clap Detection
        if (
          this.hasCamera &&
          this.heldLeft !== null &&
          this.heldRight !== null &&
          this.clapCooldown === 0 &&
          this.catchGrace === 0
        ) {
          const palmDist = Math.hypot(this.leftHand.x - this.rightHand.x, this.leftHand.y - this.rightHand.y);
          const apartDist = w * 0.30;
          const closeDist = w * 0.28;
          const centerBurstMin = Math.max(24, Math.round((this.motionCanvas.width * this.motionCanvas.height) * 0.007));

          if (palmDist > apartDist) {
            this.handsWereApart = true;
          }

          const gestureClap =
            this.handsWereApart &&
            (this.leftHand.active || this.rightHand.active) &&
            palmDist < closeDist &&
            this.motionGrid.center > centerBurstMin;

          const micWorking = this.hasMic && this.micLiveSignal && this.audioCtx && this.audioCtx.state === 'running';
          if (micWorking) {
            const soundClap = this.clapSoundWindow > 0;
            const visualAction = palmDist < w * 0.48 || this.motionGrid.center > centerBurstMin * 0.6;
            if ((soundClap && visualAction) || (gestureClap && this.motionGrid.center > centerBurstMin * 1.4)) {
              this.clapSoundWindow = 0;
              this.triggerClap();
            }
          } else if (gestureClap) {
            this.triggerClap();
          }
        }
      }

      // Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    }

    // --- Drawing Helpers ---

    _drawOpenPalm(x, y, side, hasTile, isFist = false) {
      const ctx = this.ctx;
      const flip = side === 'right' ? -1 : 1;
      ctx.save();
      ctx.translate(x, y + 14);
      ctx.scale(flip, 1);

      ctx.shadowColor = isFist ? '#fb923c' : hasTile ? '#34d399' : (side === 'left' ? '#38bdf8' : '#f472b6');
      ctx.shadowBlur = hasTile || isFist ? 20 : 12;
      ctx.fillStyle = isFist
        ? 'rgba(251, 146, 60, 0.42)'
        : hasTile
        ? 'rgba(209, 250, 229, 0.42)'
        : 'rgba(255, 255, 255, 0.22)';
      ctx.strokeStyle = isFist
        ? '#fdba74'
        : hasTile
        ? '#6ee7b7'
        : (side === 'left' ? 'rgba(125, 211, 252, 0.9)' : 'rgba(249, 168, 212, 0.9)');
      ctx.lineWidth = 2.4;

      if (isFist) {
        // Closed Fist silhouette
        ctx.beginPath();
        this._roundRect(ctx, -22, -16, 44, 38, 16);
        ctx.fill();
        ctx.stroke();

        const knuckles = [-14, -5, 4, 13];
        for (const kx of knuckles) {
          ctx.beginPath();
          this._roundRect(ctx, kx - 4, -20, 8, 12, 4);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      ctx.beginPath();
      this._roundRect(ctx, -24, -10, 48, 34, 16);
      ctx.fill();
      ctx.stroke();

      const fingers = [
        { fx: -28, fy: -6, fw: 10, fh: 22, rot: -0.55 },
        { fx: -18, fy: -32, fw: 9, fh: 24, rot: -0.15 },
        { fx: -6, fy: -36, fw: 9, fh: 28, rot: 0 },
        { fx: 6, fy: -34, fw: 9, fh: 26, rot: 0.12 },
        { fx: 17, fy: -28, fw: 8, fh: 21, rot: 0.28 }
      ];
      for (const fg of fingers) {
        ctx.save();
        ctx.translate(fg.fx, fg.fy + fg.fh / 2);
        ctx.rotate(fg.rot);
        ctx.beginPath();
        this._roundRect(ctx, -fg.fw / 2, -fg.fh / 2, fg.fw, fg.fh, 5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (hasTile) {
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(0, -10, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    _drawPhonicsTile(x, y, baseSize, text, side, options = {}) {
      const ctx = this.ctx;
      const str = String(text);
      const isMagicE = Boolean(options.isMagicE);
      const isHeld = Boolean(options.isHeld);
      const badge = options.badge || null;

      const label = isMagicE ? '✨ e' : str;
      const charScale = label.length >= 4 ? 0.72 : label.length === 3 ? 0.84 : 1.0;
      const fontSize = Math.round(baseSize * charScale);
      const boxW = Math.max(70, Math.round(label.length * fontSize * 0.72 + 32));
      const boxH = Math.max(58, Math.round(baseSize * 1.48));

      ctx.save();
      ctx.translate(x, y);

      let glow = side === 'left' ? '#38bdf8' : '#f472b6';
      let topCol = side === 'left' ? '#e0f2fe' : '#fce7f3';
      let botCol = side === 'left' ? '#38bdf8' : '#ec4899';
      let strokeCol = side === 'left' ? '#bae6fd' : '#fbcfe8';
      let textCol = '#0f172a';

      if (isMagicE) {
        glow = '#fde047';
        topCol = '#fef9c3';
        botCol = '#a855f7';
        strokeCol = '#fde047';
        textCol = '#ffffff';
      } else if (isHeld) {
        glow = '#34d399';
        strokeCol = '#6ee7b7';
      }

      ctx.shadowColor = glow;
      ctx.shadowBlur = isMagicE ? 22 : 15;

      const grad = ctx.createLinearGradient(0, -boxH / 2, 0, boxH / 2);
      grad.addColorStop(0, topCol);
      grad.addColorStop(1, botCol);

      ctx.fillStyle = grad;
      ctx.beginPath();
      this._roundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 18);
      ctx.fill();

      ctx.lineWidth = isMagicE ? 3.5 : 2.8;
      ctx.strokeStyle = strokeCol;
      ctx.stroke();

      // Glossy top highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
      ctx.beginPath();
      this._roundRect(ctx, -boxW / 2 + 5, -boxH / 2 + 4, boxW - 10, boxH * 0.36, 12);
      ctx.fill();

      // Word / phoneme text
      ctx.font = `900 ${fontSize}px "Arial Rounded MT Bold", "Nunito", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isMagicE) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#3b0764';
        ctx.strokeText(label, 0, 1);
      }
      ctx.fillStyle = textCol;
      ctx.fillText(label, 0, 1);

      // Optional picture hint badge on Magic-E base words
      if (badge && !isMagicE) {
        ctx.font = '20px system-ui, sans-serif';
        ctx.fillText(badge, boxW / 2 - 6, -boxH / 2 + 2);
      }

      ctx.restore();
    }

    _drawBigWordOverlay(w, h) {
      const ctx = this.ctx;
      const bw = this.bigWord;
      if (!bw) return;

      const cx = w / 2;
      const topOffset = w < 600 ? 92 : 60;
      const hasMeaning = Boolean(bw.isReal && bw.meaning);
      const showShowcase = Boolean(bw.isReal && bw.showImage && bw.emoji);
      const cy = this.pictureCheck ? Math.max(topOffset + (hasMeaning ? 112 : 96), h * 0.29) : h / 2;
      const s = bw.scale;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(s, s);

      const cardW = Math.min(w - 24, Math.max(showShowcase ? 370 : 310, bw.word.length * 46 + (showShowcase ? 230 : 160)));
      const cardH = this.pictureCheck ? (hasMeaning ? 136 : 102) : (hasMeaning ? 196 : 160);

      ctx.shadowColor = bw.isReal ? '#fde047' : '#c084fc';
      ctx.shadowBlur = 28;
      const bg = ctx.createLinearGradient(0, -cardH / 2, 0, cardH / 2);
      if (bw.isMagicE) {
        bg.addColorStop(0, 'rgba(88, 28, 135, 0.94)');
        bg.addColorStop(1, 'rgba(30, 27, 75, 0.96)');
      } else if (bw.isReal) {
        bg.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
        bg.addColorStop(1, 'rgba(30, 58, 138, 0.94)');
      } else {
        bg.addColorStop(0, 'rgba(88, 28, 135, 0.90)');
        bg.addColorStop(1, 'rgba(157, 23, 77, 0.92)');
      }

      ctx.fillStyle = bg;
      ctx.beginPath();
      this._roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 28);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = bw.isReal ? '#fde047' : '#f472b6';
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Top expression or badge
      ctx.fillStyle = bw.isReal ? '#fde047' : '#fbcfe8';
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        bw.isReal
          ? (bw.isMagicE ? `✨ Magic-E! ${bw.expr}` : `✨ ${bw.expr}`)
          : `🤪 Silly Word! ${bw.expr} (+40)`,
        0,
        -cardH / 2 + 22
      );

      // Framed Picture of the Object/Thing during Picture Showcase!
      const textCenterX = showShowcase ? 54 : 0;
      if (showShowcase) {
        const picX = -cardW / 2 + 68;
        const picY = 10;
        const picR = 46;
        ctx.save();
        const picGrad = ctx.createRadialGradient(picX - 10, picY - 12, 8, picX, picY, picR);
        picGrad.addColorStop(0, '#ffffff');
        picGrad.addColorStop(0.7, '#e0f2fe');
        picGrad.addColorStop(1, '#7dd3fc');
        ctx.fillStyle = picGrad;
        ctx.beginPath();
        ctx.arc(picX, picY, picR, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();

        ctx.font = '56px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bw.emoji, picX, picY + 3);
        ctx.restore();
      }

      // Giant blended word
      const wordFont = this.pictureCheck ? 48 : (showShowcase ? 56 : 64);
      const wordY = hasMeaning ? -4 : 14;
      ctx.font = `900 ${wordFont}px "Arial Rounded MT Bold", "Nunito", system-ui, sans-serif`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#0f172a';
      const displayWord = (!this.pictureCheck && !bw.isReal) ? `${bw.word} 🤪` : bw.word;
      ctx.strokeText(displayWord, textCenterX, wordY);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(displayWord, textCenterX, wordY);

      // Word meaning banner inside card
      if (hasMeaning) {
        ctx.fillStyle = '#bae6fd';
        ctx.font = '800 13px system-ui, sans-serif';
        const maxTextW = showShowcase ? cardW - 146 : cardW - 32;
        const words = `💡 ${bw.meaning}`.split(' ');
        let line1 = '';
        let line2 = '';
        for (const word of words) {
          const test = line1 ? `${line1} ${word}` : word;
          if (ctx.measureText(test).width <= maxTextW) {
            line1 = test;
          } else {
            line2 = line2 ? `${line2} ${word}` : word;
          }
        }
        if (line2) {
          ctx.fillText(line1, textCenterX, cardH / 2 - 34, maxTextW);
          ctx.fillText(line2, textCenterX, cardH / 2 - 16, maxTextW);
        } else {
          ctx.fillText(line1, textCenterX, cardH / 2 - 24, maxTextW);
        }
      }

      ctx.restore();
    }

    _drawPictureCheck(w) {
      const pc = this.pictureCheck;
      if (!pc) return;
      const ctx = this.ctx;

      // Prompt pill at y >= 60 (safely below top HTML scoreboard & side pills!)
      ctx.save();
      const pillW = Math.min(w - 28, 350);
      const pillX = w / 2 - pillW / 2;
      const pillY = w < 600 ? 92 : 60;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      this._roundRect(ctx, pillX, pillY, pillW, 38, 18);
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🎯 Tap the picture for "${pc.word}"! (+50)`, w / 2, pillY + 16);

      // Countdown bar inside pill bottom
      const pct = Math.max(0, pc.life / pc.maxLife);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      this._roundRect(ctx, pillX + 18, pillY + 29, pillW - 36, 5, 3);
      ctx.fill();
      ctx.fillStyle = pct > 0.3 ? '#4ade80' : '#fb923c';
      ctx.beginPath();
      this._roundRect(ctx, pillX + 18, pillY + 29, (pillW - 36) * pct, 5, 3);
      ctx.fill();
      ctx.restore();

      // 3 Big Picture Choice Bubbles
      for (let i = 0; i < pc.choices.length; i++) {
        const ch = pc.choices[i];
        const bob = Math.sin(this.tick * 0.09 + i * 1.7) * 4;
        const cy = ch.y + bob;

        ctx.save();
        ctx.globalAlpha = ch.dimmed ? 0.35 : 1;
        ctx.shadowColor = ch.dimmed ? '#64748b' : '#38bdf8';
        ctx.shadowBlur = ch.dimmed ? 4 : 22;

        const grad = ctx.createRadialGradient(ch.x - ch.r * 0.25, cy - ch.r * 0.25, ch.r * 0.1, ch.x, cy, ch.r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.65, '#e0f2fe');
        grad.addColorStop(1, '#7dd3fc');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ch.x, cy, ch.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = ch.dimmed ? '#94a3b8' : '#fde047';
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = `${Math.round(ch.r * 1.05)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch.emoji, ch.x, cy + 3);
        ctx.restore();
      }
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background: Full-Screen Mirrored Camera OR Vibrant Phonics Night Sky
      if (this.hasCamera && this.video.readyState >= 2) {
        this._drawVideoCover(ctx, w, h);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.20)';
        ctx.fillRect(0, 0, w, h);
      } else {
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#1e1b4b');
        bg.addColorStop(0.55, '#312e81');
        bg.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
      }

      // Ambient twinkling sparkles
      for (const s of this.sparkles) {
        const alpha = 0.4 + 0.45 * Math.sin(s.phase);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Open Palm Hand Cradles
      const lx = this.leftHand.x;
      const ly = this.leftHand.y;
      const rx = this.rightHand.x;
      const ry = this.rightHand.y;

      this._drawOpenPalm(lx, ly, 'left', this.heldLeft !== null, this.leftHand.isFist);
      this._drawOpenPalm(rx, ry, 'right', this.heldRight !== null, this.rightHand.isFist);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.heldLeft !== null
          ? '✊ FIST / TAP TO DROP'
          : this.leftHand.isFist
          ? '✊ OPEN PALM TO HOLD'
          : (this.mode === 'magic-e' ? '✋ BASE WORD PALM' : '✋ ONSET PALM'),
        lx,
        ly + 52
      );
      ctx.fillText(
        this.heldRight !== null
          ? '✊ FIST / TAP TO DROP'
          : this.rightHand.isFist
          ? '✊ OPEN PALM TO HOLD'
          : (this.mode === 'magic-e' ? '✋ MAGIC-E PALM' : '✋ RIME PALM'),
        rx,
        ry + 52
      );

      // Falling Phonics Tiles (hidden during Picture Check so kids focus cleanly)
      if (!this.pictureCheck) {
        for (const tile of this.fallingTiles) {
          this._drawPhonicsTile(tile.x, tile.y, tile.fontSize || 36, tile.val, tile.side, {
            isMagicE: tile.isMagicE,
            badge: tile.badge
          });
        }

        // Falling Bonus Treasure Materials
        if (true) {
          for (const tr of this.fallingTreasures) {
            ctx.save();
            ctx.translate(tr.x, tr.y);
            drawTreasureCanvasItem(ctx, tr.mat.id, tr.r, this.tick);
            ctx.restore();
          }
        }
      }

      // Live Mic Clap Sound Indicator (positioned at y >= 58 below slim HTML scoreboard)
      if (this.hasMic) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
        ctx.beginPath();
        this._roundRect(ctx, 14, 62, 118, 26, 999);
        ctx.fill();
        ctx.fillStyle = this.clapSoundWindow > 0 ? '#fde047' : '#bae6fd';
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.clapSoundWindow > 0 ? '🎤 CLAP HEARD!' : '🎤 Clap Mic', 24, 79);
        ctx.restore();
      }

      // Mode & Tier indicator pill on right (positioned at y >= 58)
      ctx.save();
      const modePill = this.mode === 'magic-e' ? '✨ Magic-E' : tierLabel(this.tier);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
      ctx.beginPath();
      this._roundRect(ctx, w - 134, 62, 120, 26, 999);
      ctx.fill();
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(modePill, w - 74, 79);
      ctx.restore();

      // Held Tiles resting inside each Open Palm
      if (this.heldLeft !== null) {
        this._drawPhonicsTile(lx, ly - 18, 42, this.heldLeft, 'left', { isHeld: true });
      }
      if (this.heldRight !== null) {
        this._drawPhonicsTile(rx, ry - 18, 42, this.heldRight, 'right', {
          isHeld: true,
          isMagicE: this.mode === 'magic-e' && this.heldRight === 'e'
        });
      }

      // Prompt when both open palms are holding tiles (y >= 58)
      if (this.heldLeft !== null && this.heldRight !== null && !this.bigWord && !this.pictureCheck) {
        ctx.save();
        const bannerW = Math.min(w - 40, 310);
        const bannerY = w < 600 ? 92 : 60;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.beginPath();
        this._roundRect(ctx, w / 2 - bannerW / 2, bannerY, bannerW, 44, 20);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 17px system-ui, sans-serif';
        ctx.textAlign = 'center';
        const rightDisp = (this.mode === 'magic-e' && this.heldRight === 'e') ? '✨e' : this.heldRight;
        ctx.fillText(`👏 CLAP PALMS! (${this.heldLeft} + ${rightDisp})`, w / 2, bannerY + 28);
        ctx.restore();
      }

      // Giant Blended Word + Reading Picture Check
      if (this.bigWord) {
        this._drawBigWordOverlay(w, h);
      }
      if (this.pictureCheck) {
        this._drawPictureCheck(w);
      }

      // Explosion particles & bonus popups
      for (const p of this.particles) {
        ctx.fillStyle = p.color || '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.y -= 1.1;
        pop.life -= 1;
        if (pop.life <= 0) {
          this.popups.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, pop.life / 18);
        ctx.font = '900 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeText(pop.text, pop.x, pop.y);
        ctx.fillStyle = pop.color || '#fde047';
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      }
    }
  }

  app.PhonicsClapGame = PhonicsClapGame;
})(window.KidApp = window.KidApp || {});
