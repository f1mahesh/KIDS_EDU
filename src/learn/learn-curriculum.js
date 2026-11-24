/* Categorized Math & English Learning Guides */

(function (app) {
  'use strict';

const MATH_LESSONS = {
  '4-6': [
    {
      emoji: '🧱',
      title: 'Adding = Putting Together',
      body: 'When you add, you put two groups of blocks together and count how many you have in total!',
      example: '🟢🟢🟢 + 🔵🔵 = 5 blocks total',
      op: 'add',
      level: 'easy'
    },
    {
      emoji: '🎈',
      title: 'Subtracting = Taking Away',
      body: 'Subtraction means starting with a group and taking some away. Count the blocks that are left!',
      example: '🟠🟠🟠🟠🟠 − 2 popped = 3 left',
      op: 'sub',
      level: 'easy'
    },
    {
      emoji: '🖐️',
      title: 'Count On From the Big Number',
      body: 'Start at the bigger number in your head and count up on your fingers for the smaller number!',
      example: '3 + 5 → Start at 5, count: 6, 7, 8!',
      op: 'add',
      level: 'easy'
    }
  ],
  '6-8': [
    {
      emoji: '🔟',
      title: 'The Make-10 Trick',
      body: 'Numbers that add up to 10 are super friends (1+9, 2+8, 3+7, 4+6, 5+5). Make a 10 first, then add the rest!',
      example: '8 + 5 → (8 + 2) + 3 = 10 + 3 = 13',
      op: 'add',
      level: 'medium'
    },
    {
      emoji: '👯',
      title: 'Doubles & Near-Doubles',
      body: 'Memorize doubles like 4+4=8 and 6+6=12. For 6+7, just double 6 and add 1 more!',
      example: '6 + 7 = (6 + 6) + 1 = 13',
      op: 'add',
      level: 'medium'
    },
    {
      emoji: '🦘',
      title: 'Number Line Hop Back',
      body: 'For subtraction, start at the first number and hop backward! Or count up from the smaller number.',
      example: '14 − 4 → Hop back 4: 13, 12, 11, 10',
      op: 'sub',
      level: 'medium'
    },
    {
      emoji: '🐾',
      title: 'Skip Counting = Multiplication',
      body: 'Multiplication is fast adding! 3 × 4 means 3 jumps of 4: 4, 8, 12.',
      example: '3 × 4 → 4 + 4 + 4 = 12',
      op: 'mul',
      level: 'easy'
    }
  ],
  '8-10': [
    {
      emoji: '🔄',
      title: 'Order Doesn’t Matter (× & +)',
      body: '3 × 7 is the exact same as 7 × 3! Spin the 3D grid sideways to see why.',
      example: '3 rows of 7 = 7 rows of 3 = 21',
      op: 'mul',
      level: 'medium'
    },
    {
      emoji: '✋',
      title: 'Fast ×5 and ×10 Tricks',
      body: 'Every ×10 ends in 0 (just add a 0!). Every ×5 ends in 0 or 5 (half of ×10!).',
      example: '6 × 10 = 60 • 6 × 5 = 30 (half of 60)',
      op: 'mul',
      level: 'medium'
    },
    {
      emoji: '🖐️',
      title: 'The ×9 Magic Trick',
      body: 'For 9 × N, the tens digit is N−1, and the two digits always add up to 9!',
      example: '9 × 4 → Tens = 3, 3 + 6 = 9 → 36!',
      op: 'mul',
      level: 'hard'
    },
    {
      emoji: '🧩',
      title: 'Break Apart Big Numbers',
      body: 'Split 2-digit numbers into Tens and Ones to add or subtract mentally!',
      example: '24 + 13 = (20 + 10) + (4 + 3) = 37',
      op: 'add',
      level: 'hard'
    }
  ]
};

const ENGLISH_LESSONS = [
  {
    emoji: '🐣',
    tierId: 'k',
    title: 'Kindergarten • UFLI Short Vowels & Clean Sounds',
    body: 'Clip stop sounds (/b/, /t/, /p/, /k/, /d/, /g/) crisply—never add "uh"! Stretch continuous sounds (/m/, /s/, /f/) and connect sounds smoothly with short vowels: apple /ă/, edge /ĕ/, itch /ĭ/, octopus /ŏ/, up /ŭ/.',
    example: '🍎 /ă/ apple • 📏 /ĕ/ edge • 🦟 /ĭ/ itch • 🐙 /ŏ/ octopus • ⬆️ /ŭ/ up',
    speakText: 'Keep stop sounds short and clean without adding uh! Connect sounds smoothly like apple, edge, itch, octopus, up!'
  },
  {
    emoji: '🌱',
    tierId: 'g1',
    title: 'Grade 1 • Consonant Blends & Connected Phonation',
    body: 'Two consonants together at the start or end keep both crisp sounds! Hold continuous sounds smoothly into the next sound (fff-rrr-ŏ-g → frog) instead of adding "uh".',
    example: '🐸 /f/ /r/ /ŏ/ /g/ → frog  •  👏 /k/ /l/ /ă/ /p/ → clap  •  ✋ /h/ /ă/ /n/ /d/ → hand',
    speakText: 'In blends, both consonants keep their own clean sound! Slide smoothly from sound to sound like frog, clap, hand!'
  },
  {
    emoji: '🚀',
    tierId: 'g2',
    title: 'Grade 2 • Digraphs & FLSZ Spelling Rule',
    body: 'Digraphs (sh, ch, th, wh, ph, ck, ng) pair two letters for ONE clean phoneme! Under the FLSZ Rule, double f, l, s, or z right after a short vowel in one-syllable words.',
    example: '🚢 /sh/ /ĭ/ /p/ → ship  •  🦆 /d/ /ŭ/ /k/ → duck  •  🔔 /b/ /ĕ/ /l/ → bell (FLSZ)',
    speakText: 'Digraphs team up to make one clean sound like ship and duck! And the FLSZ rule doubles f, l, s, or z after a short vowel, like bell!'
  },
  {
    emoji: '✨',
    tierId: 'g3',
    title: 'Grade 3 • VCe (Silent E) & R-Controlled Vowels',
    body: 'In a VCe pattern (a_e, i_e, o_e, u_e), the silent final E signals the vowel to say its long name! And Bossy-R controls vowels in ar (/ar/), or (/or/), and er/ir/ur (/er/).',
    example: '🎂 cake (/k/ /ā/ /k/)  •  🪁 kite (/k/ /ī/ /t/)  •  ⭐ star (/s/ /t/ /ar/)',
    speakText: 'V C e silent E makes the vowel say its long name like cake and kite! And R-controlled vowels make ar and or like star and fork!'
  },
  {
    emoji: '👑',
    tierId: 'g4_5',
    title: 'Grades 4–5 • UFLI Vowel Teams',
    body: 'Vowel teams combine letters to spell one vowel phoneme: ai/ay (/ā/), ee/ea (/ē/), oa/ow (/ō/), plus long /ū/ (moon) and short /ʊ/ (book).',
    example: '🌧️ rain (/r/ /ā/ /n/)  •  🌳 tree (/t/ /r/ /ē/)  •  ⛵ boat (/b/ /ō/ /t/)',
    speakText: 'Vowel teams spell long vowel sounds like rain, tree, and boat!'
  }
];

  app.MATH_LESSONS = MATH_LESSONS;
  app.ENGLISH_LESSONS = ENGLISH_LESSONS;
})(window.KidApp = window.KidApp || {});
