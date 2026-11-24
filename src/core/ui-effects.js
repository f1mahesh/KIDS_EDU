/* Shared UI Effects & Contextual Help Modal */

(function (app) {
  'use strict';

  const { AudioEngine } = app;

const $ = (id) => document.getElementById(id);

function launchConfetti(count = 36) {
  const layer = $('confetti-layer');
  if (!layer) return;
  const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#fde047'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 2200);
  }
}

function spawnFloatingPop(targetEl, text = '+1 ⭐') {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'floating-star-pop';
  pop.textContent = text;
  pop.style.left = `${rect.left + rect.width / 2}px`;
  pop.style.top = `${rect.top + 8}px`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 950);
}

const HELP_TOPICS = {
  setup: {
    title: '🎯 How Levels Work',
    body: `
      <ul class="help-list">
        <li><strong>🐣 Starter:</strong> Gentle numbers (1–10) or tables 1–5 — great for ages 4–6!</li>
        <li><strong>🚀 Explorer:</strong> Medium numbers (1–20) or tables 1–10 — great for ages 6–8!</li>
        <li><strong>👑 Master:</strong> Big challenges up to 50 and times tables up to 12!</li>
        <li><strong>🎲 Mix Mode:</strong> Combines Addition, Subtraction, and Multiplication together!</li>
      </ul>
    `
  },
  tables: {
    title: '🔢 Times Tables Tricks',
    body: `
      <ul class="help-list">
        <li><strong>×10 Trick:</strong> Just put a 0 on the end! (4 × 10 = 40)</li>
        <li><strong>×5 Trick:</strong> Count by 5s: 5, 10, 15, 20, 25...</li>
        <li><strong>×2 Trick:</strong> Just double the number! (6 × 2 = 6 + 6 = 12)</li>
        <li><strong>3D Array:</strong> Tap any card to flip it and see rows × columns of 3D blocks!</li>
      </ul>
    `
  },
  magic: {
    title: '🪄 How Magic Mixer Works',
    body: `
      <ul class="help-list">
        <li><strong>Drag or Tap:</strong> Drag two glowing bubbles, planets, or fruits into the Magic Portal (or just tap them!).</li>
        <li><strong>Auto-Mix:</strong> As soon as both slots are full, the Magic Portal mixes them automatically!</li>
        <li><strong>Treasure Drops:</strong> Magical matches award ⭐ Stars and bonus Stones, Coins, Jewels &amp; Diamonds!</li>
      </ul>
    `
  },
  english: {
    title: '📖 K–5 UFLI Phonics Guide',
    body: `
      <ul class="help-list">
        <li><strong>🔊 Clean UFLI Sounds:</strong> Clip stop sounds (<em>/b/, /t/, /p/, /k/, /d/, /g/</em>) sharply with no trailing "uh", and stretch continuous sounds (<em>/m/, /s/, /f/</em>)!</li>
        <li><strong>🐣 K (CVC):</strong> Short vowels (<em>apple /ă/, edge /ĕ/, itch /ĭ/, octopus /ŏ/, up /ŭ/</em>) in <em>cat, dog, sun, pig</em>.</li>
        <li><strong>🌱 G1 (Blends):</strong> Smooth connected blending in <em>frog, clap, stop, drum</em>.</li>
        <li><strong>🚀 G2 (Digraphs &amp; FLSZ):</strong> Digraphs (<em>ship, chat, duck</em>) &amp; FLSZ double letters (<em>bell</em>).</li>
        <li><strong>✨ G3 (VCe / R-Ctrl):</strong> Silent E long vowels (<em>cake, kite</em>) &amp; R-controlled (<em>star, fork</em>).</li>
        <li><strong>👑 G4–5 (Teams):</strong> Vowel teams like <em>rain, boat, seed, moon</em>.</li>
      </ul>
    `
  },
  'en-clap': {
    title: '👏 Phonics Clap Blender AR',
    body: `
      <ul class="help-list">
        <li><strong>🙌 Catch Onset &amp; Rime:</strong> Catch a starting sound on the left and ending sound on the right (or tap them).</li>
        <li><strong>👏 Clap to Blend:</strong> Clap loudly or bring palms together to blend the word, then tap the matching picture bubble!</li>
        <li><strong>🪄 Magic-E Mode:</strong> Add a sparkling <strong>e</strong> to turn <em>cap → cape</em> or <em>kit → kite</em>!</li>
      </ul>
    `
  },
  'en-blaster': {
    title: '🥊 Letter Blaster AR',
    body: `
      <ul class="help-list">
        <li><strong>🔊 Listen &amp; Spell:</strong> Watch the picture &amp; word prompt at the top and the glowing empty slots at the bottom.</li>
        <li><strong>🥊 Punch in Order:</strong> Punch, kick, or tap the falling letters from left to right to spell the word and hear each phoneme!</li>
        <li><strong>💎 Bonus Gems:</strong> Smash falling Stones, Coins, Jewels &amp; Diamonds while skipping red 🚫 hazards!</li>
      </ul>
    `
  },
  'en-runner': {
    title: '🏃 Phonics Runner AR',
    body: `
      <ul class="help-list">
        <li><strong>📖 Pick the Right Spelling:</strong> Look at the picture and listen to the word, then steer Left, Center, or Right into the matching word gate!</li>
        <li><strong>🦘 Jump &amp; 🦆 Duck:</strong> Jump over logs and duck under flyers while grabbing bonus treasure gems!</li>
      </ul>
    `
  },
  'fun-racer': {
    title: '🏎️ How Turbo Hand Racer Works',
    body: `
      <ul class="help-list">
        <li><strong>🖐️ Hand-Gesture Steering Wheel:</strong> Hold BOTH hands up like an invisible steering wheel and tilt left or right! Uses MediaPipe Hand Tracking with automatic offline fallback.</li>
        <li><strong>👆 Touch &amp; Keys:</strong> Drag across the road, hold <strong>⬅️ Left / Right ➡️</strong>, or use Arrow keys + Space for Turbo!</li>
        <li><strong>💎 Collect &amp; Dodge:</strong> Grab Stones, Coins, Jewels, Diamonds &amp; ⚡ Turbo Bolts while dodging 🚧 traffic cones!</li>
      </ul>
    `
  },
  'en-trace': {
    title: '✍️ Air-Trace & Glow Pad',
    body: `
      <ul class="help-list">
        <li><strong>✍️ Guided Trace:</strong> Trace each glowing dotted letter in the box with your finger, mouse, or Air-Cam motion brush to hear its phoneme sound!</li>
        <li><strong>🎧 Dictation Mode:</strong> Switch to Dictation in Settings to hear the word and write or tap letters into the sound boxes from memory!</li>
      </ul>
    `
  },
  'en-builder': {
    title: '🧩 Word Builder Board',
    body: `
      <ul class="help-list">
        <li><strong>🎂 Pick Your Age Level:</strong> Start with <em>Ages 4–5 (CVC)</em> 3-letter words and level up to 4-letter blends, digraphs, Magic-E &amp; vowel teams!</li>
        <li><strong>🔤 Drag Letters to Build:</strong> Drag any letter from the colorful Letter Board into the word boxes (or tap a letter to snap it into the next spot).</li>
        <li><strong>🖼️ + 🔊 Picture or Sound:</strong> Switch between Picture &amp; Sound, Picture Only, or Sound Only mystery words!</li>
        <li><strong>🎉 Cheer &amp; Treasures:</strong> Complete words to earn cheering praise, ⭐ Stars, and bonus Stones, Coins, Jewels &amp; Diamonds!</li>
      </ul>
    `
  },
  snow: {
    title: '❄️ How Snow Clap AR Works',
    body: `
      <ul class="help-list">
        <li><strong>🙌 Hold 2 Snow Numbers:</strong> Catch one snow-shaped number in each open palm (or tap them).</li>
        <li><strong>👏 Clap Sound + Gesture:</strong> Bring both palms together AND clap loudly (or tap <strong>👏 CLAP HANDS!</strong>) to form a giant snow number!</li>
        <li><strong>💎 Bonus Treasures:</strong> Catch falling Stones, Bronze Coins, Gold, Jewels, and Diamonds with your hands or taps!</li>
      </ul>
    `
  },
  squirrel: {
    title: '🐿️ How Squirrel Bridge Works',
    body: `
      <ul class="help-list">
        <li><strong>🙌 Stretch Wide:</strong> Stand in front of the camera and stretch BOTH arms out to touch the left &amp; right numbers!</li>
        <li><strong>💎 Collect Treasure:</strong> Sammy collects the shiny gem or coin hovering over your outstretched arms!</li>
        <li><strong>🌳 No Camera?</strong> Tap the left &amp; right numbers or press <strong>🙌 CONNECT BRIDGE!</strong></li>
      </ul>
    `
  },
  rock: {
    title: '🥊 How Rock Blaster AR Works',
    body: `
      <ul class="help-list">
        <li><strong>🥊 Punch &amp; 🦶 Kick HARD:</strong> Punch falling rocks, planets, bubbles, fruits, and bonus treasures!</li>
        <li><strong>💎 Treasure Haul:</strong> Switch to the Treasure pack in ⚙️ Settings to hunt Diamonds, Jewels, Gold &amp; Bronze Coins!</li>
        <li><strong>🚫 Skip Negative Numbers:</strong> Don't punch dark red <strong>-10 / -20 / -50</strong> hazard rocks!</li>
      </ul>
    `
  },
  runner: {
    title: '🏃 How Runner AR Works',
    body: `
      <ul class="help-list">
        <li><strong>⬅️ ➡️ Move Left / Center / Right:</strong> Lean or step left, center, or right (or swipe / tap the lane buttons)!</li>
        <li><strong>🦘 Jump &amp; 🦆 Duck:</strong> Jump high over low logs/rocks and duck low under flying bats/meteors!</li>
        <li><strong>💎 Collect Materials:</strong> Grab Stones, Coins, Jewels &amp; Diamonds along the track for bonus stars!</li>
      </ul>
    `
  }
};

function openHelpModal(topic) {
  AudioEngine.pop();
  const data = HELP_TOPICS[topic] || HELP_TOPICS.setup;
  $('help-modal-title').textContent = data.title;
  $('help-modal-body').innerHTML = data.body;
  $('help-modal').classList.remove('hidden');
}

function closeHelpModal() {
  $('help-modal').classList.add('hidden');
}

  app.$ = $;
  app.launchConfetti = launchConfetti;
  app.spawnFloatingPop = spawnFloatingPop;
  app.openHelpModal = openHelpModal;
  app.closeHelpModal = closeHelpModal;
})(window.KidApp = window.KidApp || {});
