/* Activity Catalog — Single Source of Truth for Discovery, Filtering & Smart Launch */

(function (app) {
  'use strict';

  const AGE_BANDS = [
    { id: '4-6', label: 'Ages 4–6', emoji: '🐣', short: '4–6', englishTier: 'k', mathLevel: 'easy' },
    { id: '6-8', label: 'Ages 6–8', emoji: '🚀', short: '6–8', englishTier: 'g2', mathLevel: 'medium' },
    { id: '8-10', label: 'Ages 8–10+', emoji: '👑', short: '8–10+', englishTier: 'g4_5', mathLevel: 'hard' }
  ];

  const ACTIVITIES = [
    // --- ABC & Reading ---
    {
      id: 'en-trace',
      title: 'Air-Trace & Letters',
      shortDesc: 'Trace letters & spell words',
      emoji: '✍️',
      category: 'english',
      group: 'build',
      style: 'touch',
      ages: ['4-6', '6-8'],
      badge: 'Touch & Air',
      cardClass: 'mode-en-trace',
      action: 'open-en-trace'
    },
    {
      id: 'en-pop',
      title: 'Phonics Bubble Pop',
      shortDesc: 'Hear a sound & pop the letter',
      emoji: '🫧',
      category: 'english',
      group: 'sound',
      style: 'ar',
      ages: ['4-6', '6-8'],
      badge: 'Sound + AR',
      cardClass: 'mode-en-pop',
      action: 'open-en-pop'
    },
    {
      id: 'en-builder',
      title: 'Word Builder Board',
      shortDesc: 'Drag letter tiles to build words',
      emoji: '🧩',
      category: 'english',
      group: 'build',
      style: 'touch',
      ages: ['4-6', '6-8', '8-10'],
      badge: 'Touch K–8',
      cardClass: 'mode-en-builder',
      action: 'open-en-builder'
    },
    {
      id: 'en-clap',
      title: 'Clap Blender',
      shortDesc: 'Clap sounds together into words',
      emoji: '👏',
      category: 'english',
      group: 'sound',
      style: 'ar',
      ages: ['4-6', '6-8'],
      badge: 'Clap AR',
      cardClass: 'mode-en-clap',
      action: 'open-en-clap'
    },
    {
      id: 'en-blaster',
      title: 'Letter Blaster',
      shortDesc: 'Smash letters in spelling order',
      emoji: '🥊',
      category: 'english',
      group: 'action',
      style: 'ar',
      ages: ['6-8', '8-10'],
      badge: 'Punch AR',
      cardClass: 'mode-en-blaster',
      action: 'open-en-blaster'
    },
    {
      id: 'en-runner',
      title: 'Phonics Runner',
      shortDesc: 'Run into the matching word gate',
      emoji: '🏃',
      category: 'english',
      group: 'action',
      style: 'ar',
      ages: ['4-6', '6-8', '8-10'],
      badge: 'Body AR',
      cardClass: 'mode-en-runner',
      action: 'open-en-runner'
    },

    // --- 123 & Math ---
    {
      id: 'math-add',
      title: 'Addition 3D',
      shortDesc: 'Join glowing 3D cube blocks',
      emoji: '➕',
      category: 'math',
      group: 'learn',
      style: 'touch',
      ages: ['4-6', '6-8', '8-10'],
      badge: '3D Blocks',
      cardClass: 'mode-add',
      action: 'start-setup',
      op: 'add'
    },
    {
      id: 'math-sub',
      title: 'Subtraction 3D',
      shortDesc: 'Pop cubes & count what is left',
      emoji: '➖',
      category: 'math',
      group: 'learn',
      style: 'touch',
      ages: ['4-6', '6-8', '8-10'],
      badge: '3D Blocks',
      cardClass: 'mode-sub',
      action: 'start-setup',
      op: 'sub'
    },
    {
      id: 'math-mul',
      title: 'Multiplication 3D',
      shortDesc: 'Build 3D cube grids & multiply',
      emoji: '✖️',
      category: 'math',
      group: 'learn',
      style: 'touch',
      ages: ['6-8', '8-10'],
      badge: '3D Grid',
      cardClass: 'mode-mul',
      action: 'start-setup',
      op: 'mul'
    },
    {
      id: 'math-tables',
      title: 'Times Tables 1–12',
      shortDesc: 'Flip 3D flashcards & table quiz',
      emoji: '🔢',
      category: 'math',
      group: 'learn',
      style: 'touch',
      ages: ['6-8', '8-10'],
      badge: 'Flashcards',
      cardClass: 'mode-tables',
      action: 'open-tables'
    },
    {
      id: 'math-magic',
      title: 'Magic Mixer Lab',
      shortDesc: 'Mix bubbles, planets & fruits',
      emoji: '🪄',
      category: 'math',
      group: 'learn',
      style: 'touch',
      ages: ['4-6', '6-8'],
      badge: 'Drag & Drop',
      cardClass: 'mode-magic',
      action: 'open-magic'
    },
    {
      id: 'math-blitz',
      title: '60s Speed Blitz',
      shortDesc: 'Beat the 60-second math clock',
      emoji: '⚡',
      category: 'math',
      group: 'learn',
      style: 'touch',
      ages: ['6-8', '8-10'],
      badge: 'Fast Quiz',
      cardClass: 'mode-arcade',
      action: 'start-arcade'
    },
    {
      id: 'math-runner',
      title: 'Number Runner AR',
      shortDesc: 'Jump, duck & pick answers',
      emoji: '🏃',
      category: 'math',
      group: 'ar',
      style: 'ar',
      ages: ['4-6', '6-8', '8-10'],
      badge: 'Body AR',
      cardClass: 'mode-runner',
      action: 'open-runner'
    },
    {
      id: 'math-snow',
      title: 'Snow Clap AR',
      shortDesc: 'Catch snow numbers & clap',
      emoji: '❄️',
      category: 'math',
      group: 'ar',
      style: 'ar',
      ages: ['4-6', '6-8'],
      badge: 'Clap AR',
      cardClass: 'mode-snow',
      action: 'open-snow'
    },
    {
      id: 'math-rock',
      title: 'Rock Blaster AR',
      shortDesc: 'Punch targets & collect gems',
      emoji: '🥊',
      category: 'math',
      group: 'ar',
      style: 'ar',
      ages: ['4-6', '6-8', '8-10'],
      badge: 'Punch AR',
      cardClass: 'mode-rock',
      action: 'open-rock'
    },
    {
      id: 'math-squirrel',
      title: 'Squirrel Bridge AR',
      shortDesc: 'Stretch both arms to build bridges',
      emoji: '🐿️',
      category: 'math',
      group: 'ar',
      style: 'ar',
      ages: ['4-6', '6-8'],
      badge: 'Stretch AR',
      cardClass: 'mode-squirrel',
      action: 'open-squirrel'
    },

    // --- Play & Stories ---
    {
      id: 'fun-puzzle',
      title: 'Picture Puzzle',
      shortDesc: 'Jigsaw puzzles or your own photo',
      emoji: '🖼️',
      category: 'fun',
      group: 'play',
      style: 'touch',
      ages: ['4-6', '6-8', '8-10'],
      badge: 'Jigsaw',
      cardClass: 'mode-puzzle',
      action: 'open-puzzle'
    },
    {
      id: 'fun-racer',
      title: 'Turbo Hand Racer',
      shortDesc: 'Steer with hands & grab gems',
      emoji: '🏎️',
      category: 'fun',
      group: 'play',
      style: 'ar',
      ages: ['4-6', '6-8', '8-10'],
      badge: 'Hand Steer',
      cardClass: 'mode-racer',
      action: 'open-fun-racer'
    },
    {
      id: 'fun-story',
      title: 'Little Ganesha Story',
      shortDesc: 'Interactive illustrated storybook',
      emoji: '🪷',
      category: 'fun',
      group: 'story',
      style: 'touch',
      ages: ['4-6', '6-8', '8-10'],
      badge: 'Storybook',
      cardClass: 'mode-story',
      action: 'open-story'
    }
  ];

  const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));
  const AGE_BAND_BY_ID = Object.fromEntries(AGE_BANDS.map((b) => [b.id, b]));

  app.AGE_BANDS = AGE_BANDS;
  app.AGE_BAND_BY_ID = AGE_BAND_BY_ID;
  app.ACTIVITIES = ACTIVITIES;
  app.ACTIVITY_BY_ID = ACTIVITY_BY_ID;
})(window.KidApp = window.KidApp || {});
