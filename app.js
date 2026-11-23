/* MathCube 3D — Main Application Logic */
(function () {
  const STORAGE_KEY = 'mathcube_3d_profile_v1';
  const PROFILES_KEY = 'mathcube_3d_profiles_v2';

  const RANKS = [
    { min: 0, label: '🌱 Number Sprout' },
    { min: 25, label: '🧱 Block Builder' },
    { min: 75, label: '🚀 Math Explorer' },
    { min: 150, label: '⭐ Star Captain' },
    { min: 300, label: '🧙 3D Math Wizard' }
  ];

  const BADGES = [
    { id: 'first_star', emoji: '🌟', name: 'First Star', req: 'Earn 1 star', check: (p) => p.stars >= 1 },
    { id: 'streak_5', emoji: '🔥', name: 'Hot Streak', req: '5 in a row', check: (p) => p.bestStreak >= 5 },
    { id: 'streak_10', emoji: '⚡', name: 'Unstoppable', req: '10 in a row', check: (p) => p.bestStreak >= 10 },
    { id: 'solved_25', emoji: '🧩', name: 'Puzzle Kid', req: 'Solve 25 problems', check: (p) => p.solved >= 25 },
    { id: 'solved_100', emoji: '🎓', name: 'Math Whiz', req: 'Solve 100 problems', check: (p) => p.solved >= 100 },
    { id: 'arcade_10', emoji: '🏎️', name: 'Speed Racer', req: 'Score 10+ in Blitz', check: (p) => p.arcadeBest >= 10 }
  ];

  function createEmptyProfile(name = '', avatar = '🦁') {
    return {
      name,
      avatar,
      stars: 0,
      hearts: 0,
      solved: 0,
      bestStreak: 0,
      arcadeBest: 0,
      rockBest: 0,
      stats: {
        add: { attempts: 0, correct: 0, hints: 0 },
        sub: { attempts: 0, correct: 0, hints: 0 },
        mul: { attempts: 0, correct: 0, hints: 0 }
      }
    };
  }

  function ensureProfileShape(p) {
    const base = createEmptyProfile(p.name || '', p.avatar || '🦁');
    return {
      ...base,
      ...p,
      stats: {
        add: { ...base.stats.add, ...(p.stats && p.stats.add) },
        sub: { ...base.stats.sub, ...(p.stats && p.stats.sub) },
        mul: { ...base.stats.mul, ...(p.stats && p.stats.mul) }
      }
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.profiles) return parsed;
      }
      const legacy = localStorage.getItem(STORAGE_KEY);
      if (legacy) {
        const p = ensureProfileShape(JSON.parse(legacy));
        return { activeId: 'default', profiles: { default: p } };
      }
    } catch (_) {}
    return { activeId: 'default', profiles: { default: createEmptyProfile() } };
  }

  const store = loadStore();
  let profile = ensureProfileShape(store.profiles[store.activeId] || createEmptyProfile());

  function saveProfile(p = profile) {
    profile = ensureProfileShape(p);
    store.profiles[store.activeId] = profile;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(store));
  }
  let currentStreak = 0;

  // Game session state
  const session = {
    mode: 'quest', // 'quest' | 'arcade' | 'table-quiz'
    op: 'add',
    level: 'easy',
    mix: false,
    useKeypad: false,
    tableNum: 2,
    totalQuestions: 10,
    index: 0,
    correctCount: 0,
    starsEarned: 0,
    roundBestStreak: 0,
    score: 0,
    currentQ: null,
    locked: false,
    keypadVal: '',
    timerId: null,
    timeLeft: 60,
    show3D: true,
    hintLevel: 0
  };

  // DOM helpers
  const $ = (id) => document.getElementById(id);
  const views = {
    home: $('view-home'),
    setup: $('view-setup'),
    play: $('view-play'),
    summary: $('view-summary'),
    tables: $('view-tables'),
    trophies: $('view-trophies'),
    learn: $('view-learn'),
    magic: $('view-magic'),
    games: $('view-games'),
    snow: $('view-snow'),
    squirrel: $('view-squirrel'),
    rock: $('view-rock')
  };

  let snowGame = null;
  let squirrelGame = null;
  let rockGame = null;

  function showView(name) {
    if (name !== 'snow' && snowGame) {
      snowGame.stop();
    }
    if (name !== 'squirrel' && squirrelGame) {
      squirrelGame.stop();
    }
    if (name !== 'rock' && rockGame) {
      rockGame.stop();
    }
    Object.values(views).forEach((v) => v.classList.remove('active'));
    views[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 3D Scenes
  const hero3D = new Math3DScene($('hero-3d-canvas'), { mode: 'hero', autoSpin: true });
  const play3D = new Math3DScene($('play-3d-canvas'), { mode: 'add' });
  const table3D = new Math3DScene($('table-3d-canvas'), { mode: 'mul' });
  const summary3D = new Math3DScene($('summary-3d-canvas'), { mode: 'trophy', autoSpin: true });

  // Topbar & Rank UI
  function getRankLabel(stars) {
    let rank = RANKS[0].label;
    for (const r of RANKS) {
      if (stars >= r.min) rank = r.label;
    }
    return rank;
  }

  function refreshHeader() {
    $('stat-stars').textContent = profile.stars;
    $('stat-streak').textContent = currentStreak;
    $('profile-avatar').textContent = profile.avatar || '🦁';
    $('profile-name').textContent = profile.name || 'Kid';
    $('home-rank').textContent = getRankLabel(profile.stars);
    $('home-heading').textContent = profile.name
      ? `Let's Play & Learn Math, ${profile.name}!`
      : `Let's Play & Learn Math!`;
    $('pet-emoji').textContent = profile.avatar || '🦁';
    $('pet-hearts').textContent = `❤️ ${profile.hearts || 0}`;
    $('btn-feed-buddy').disabled = profile.stars < 5;
  }

  function updateSoundBtn() {
    $('btn-sound').textContent = MathAudio.isMuted() ? '🔇' : '🔊';
  }

  function updateVoiceBtn() {
    $('btn-voice').textContent = MathAudio.isVoiceOn() ? '🗣️' : '🤫';
  }

  function spawnFloatingStar(targetEl, text = '+1 ⭐') {
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

  function speakQuestion(q) {
    if (!q) return;
    const opWord =
      q.op === 'add'
        ? 'plus'
        : q.op === 'sub'
        ? session.level === 'easy'
          ? 'take away'
          : 'minus'
        : 'times';
    MathAudio.speak(`What is ${q.a} ${opWord} ${q.b}?`, 'normal');
  }

  // Confetti
  function launchConfetti(count = 36) {
    const layer = $('confetti-layer');
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

  // Question Generation
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateQuestion(op, level, forcedTable = null) {
    let actualOp = op;
    if (session.mix) {
      const ops = ['add', 'sub', 'mul'];
      actualOp = ops[randInt(0, ops.length - 1)];
    }

    let a, b, answer, symbol, label;

    if (actualOp === 'add') {
      const max = level === 'easy' ? 10 : level === 'medium' ? 20 : 50;
      a = randInt(1, max);
      b = randInt(1, max);
      answer = a + b;
      symbol = '+';
      label = 'Addition';
    } else if (actualOp === 'sub') {
      const max = level === 'easy' ? 10 : level === 'medium' ? 20 : 50;
      a = randInt(2, max);
      b = randInt(1, a); // keep non-negative for kids
      answer = a - b;
      symbol = '−';
      label = 'Subtraction';
    } else {
      if (forcedTable) {
        a = forcedTable;
        b = randInt(1, 12);
      } else {
        const maxT = level === 'easy' ? 5 : level === 'medium' ? 10 : 12;
        a = randInt(1, maxT);
        b = randInt(1, maxT);
      }
      answer = a * b;
      symbol = '×';
      label = 'Multiplication';
    }

    // Generate 4 unique plausible choices
    const choiceSet = new Set([answer]);
    let guard = 0;
    while (choiceSet.size < 4 && guard < 40) {
      guard++;
      const offset = randInt(-5, 5);
      const candidate = answer + offset;
      if (candidate >= 0 && candidate !== answer) {
        choiceSet.add(candidate);
      }
    }
    while (choiceSet.size < 4) {
      choiceSet.add(answer + choiceSet.size);
    }

    const choices = Array.from(choiceSet).sort(() => Math.random() - 0.5);
    return { op: actualOp, a, b, answer, symbol, label, choices };
  }

  // Start Flows
  function openSetup(op) {
    MathAudio.pop();
    session.op = op;
    const titles = { add: '➕ Addition Quest', sub: '➖ Subtraction Quest', mul: '✖️ Multiplication Quest' };
    $('setup-title').textContent = titles[op] || 'Choose Your Level';

    if (op === 'mul') {
      $('desc-easy').textContent = 'Tables 1–5';
      $('desc-medium').textContent = 'Tables 1–10';
      $('desc-hard').textContent = 'Tables 1–12';
    } else {
      $('desc-easy').textContent = 'Numbers 1–10';
      $('desc-medium').textContent = 'Numbers 1–20';
      $('desc-hard').textContent = 'Numbers 1–50';
    }
    showView('setup');
  }

  function startQuest(level) {
    MathAudio.pop();
    stopTimer();
    session.mode = 'quest';
    session.level = level;
    session.mix = $('opt-mix').checked;
    session.useKeypad = $('opt-keypad').checked;
    session.totalQuestions = 10;
    session.index = 0;
    session.correctCount = 0;
    session.starsEarned = 0;
    session.roundBestStreak = 0;
    session.score = 0;

    $('quest-progress-wrap').classList.remove('hidden');
    $('arcade-timer-pill').classList.add('hidden');
    showView('play');
    nextQuestion();
  }

  function startTableQuiz(tableNum) {
    MathAudio.pop();
    stopTimer();
    session.mode = 'table-quiz';
    session.op = 'mul';
    session.mix = false;
    session.useKeypad = false;
    session.tableNum = tableNum;
    session.totalQuestions = 10;
    session.index = 0;
    session.correctCount = 0;
    session.starsEarned = 0;
    session.roundBestStreak = 0;
    session.score = 0;

    $('quest-progress-wrap').classList.remove('hidden');
    $('arcade-timer-pill').classList.add('hidden');
    showView('play');
    nextQuestion();
  }

  function startArcade() {
    MathAudio.pop();
    stopTimer();
    session.mode = 'arcade';
    session.op = 'add';
    session.level = 'medium';
    session.mix = true;
    session.useKeypad = false;
    session.index = 0;
    session.correctCount = 0;
    session.starsEarned = 0;
    session.roundBestStreak = 0;
    session.score = 0;
    session.timeLeft = 60;

    $('quest-progress-wrap').classList.add('hidden');
    $('arcade-timer-pill').classList.remove('hidden');
    $('arcade-timer').textContent = '60';
    showView('play');
    nextQuestion();

    session.timerId = setInterval(() => {
      session.timeLeft--;
      $('arcade-timer').textContent = String(session.timeLeft);
      if (session.timeLeft <= 0) {
        stopTimer();
        finishRound();
      }
    }, 1000);
  }

  function stopTimer() {
    if (session.timerId) {
      clearInterval(session.timerId);
      session.timerId = null;
    }
  }

  function nextQuestion() {
    if (session.mode !== 'arcade' && session.index >= session.totalQuestions) {
      finishRound();
      return;
    }

    session.locked = false;
    session.keypadVal = '';
    session.hintLevel = 0;
    $('hint-box').classList.add('hidden');
    $('hint-visual').innerHTML = '';
    $('keypad-display').textContent = '?';
    $('feedback-banner').textContent = '';
    $('feedback-banner').className = 'feedback-banner';

    const forcedTable = session.mode === 'table-quiz' ? session.tableNum : null;
    const q = generateQuestion(session.op, session.level, forcedTable);
    session.currentQ = q;

    $('question-badge').textContent = session.mode === 'arcade' ? `⚡ Blitz • ${q.label}` : q.label;
    $('question-text').textContent = `${q.a} ${q.symbol} ${q.b} = ?`;
    $('play-score').textContent = session.score;

    if (session.mode !== 'arcade') {
      const pct = ((session.index + 1) / session.totalQuestions) * 100;
      $('quest-progress-fill').style.width = `${pct}%`;
      $('quest-progress-label').textContent = `${session.index + 1} / ${session.totalQuestions}`;
      speakQuestion(q);
    }

    // Update 3D Scene
    play3D.setQuestion(q.op, q.a, q.b);
    const captions = {
      add: `Green (${Math.min(q.a, 24)}) + Blue (${Math.min(q.b, 24)}) cubes • Drag to spin!`,
      sub: `Start with ${Math.min(q.a, 28)} cubes, take away ${q.b} • Tap Animate!`,
      mul: `${q.a} rows × ${q.b} columns of 3D cubes • Drag to spin!`
    };
    $('canvas-caption').textContent = captions[q.op];

    // Render Choices or Keypad
    if (session.useKeypad) {
      $('choices-grid').classList.add('hidden');
      $('keypad-wrap').classList.remove('hidden');
    } else {
      $('keypad-wrap').classList.add('hidden');
      const grid = $('choices-grid');
      grid.classList.remove('hidden');
      grid.innerHTML = '';
      q.choices.forEach((val) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = val;
        btn.addEventListener('click', () => handleAnswer(val, btn));
        grid.appendChild(btn);
      });
    }
  }

  function handleAnswer(val, btnEl = null) {
    if (session.locked) return;
    const q = session.currentQ;
    const isCorrect = Number(val) === q.answer;
    const banner = $('feedback-banner');

    if (isCorrect) {
      session.locked = true;
      MathAudio.correct();
      play3D.triggerAnimation();
      if (btnEl) btnEl.classList.add('correct');

      currentStreak++;
      session.correctCount++;
      session.roundBestStreak = Math.max(session.roundBestStreak, currentStreak);
      profile.bestStreak = Math.max(profile.bestStreak, currentStreak);

      const bonus = currentStreak >= 3 ? 2 : 1;
      session.starsEarned += bonus;
      session.score += 10 * bonus;
      profile.stars += bonus;
      profile.solved += 1;
      if (profile.stats[q.op]) {
        profile.stats[q.op].attempts += 1;
        profile.stats[q.op].correct += 1;
      }
      saveProfile(profile);
      refreshHeader();

      banner.textContent = currentStreak >= 3 ? `🎉 Awesome! ${currentStreak} Streak (+${bonus}⭐)` : '🎉 Great job! (+1⭐)';
      banner.className = 'feedback-banner ok';
      spawnFloatingStar(btnEl || $('question-text'), currentStreak >= 3 ? `🔥 +${bonus}⭐` : `+${bonus}⭐`);

      session.index++;
      setTimeout(nextQuestion, 850);
    } else {
      MathAudio.wrong();
      if (btnEl) {
        btnEl.classList.add('wrong');
        btnEl.disabled = true;
      }
      currentStreak = 0;
      if (profile.stats[q.op]) {
        profile.stats[q.op].attempts += 1;
      }
      saveProfile(profile);
      refreshHeader();
      banner.textContent = '💡 Almost! Try another one or tap Animate!';
      banner.className = 'feedback-banner nope';

      if (session.mode === 'arcade') {
        session.locked = true;
        session.index++;
        setTimeout(nextQuestion, 600);
      }
    }
  }

  function finishRound() {
    stopTimer();
    MathAudio.fanfare();
    launchConfetti(45);

    if (session.mode === 'arcade' && session.score > profile.arcadeBest) {
      profile.arcadeBest = session.score;
      saveProfile(profile);
    }

    $('summary-title').textContent = session.mode === 'arcade' ? '⚡ Time Up!' : '🎉 Quest Complete!';
    $('summary-subtitle').textContent =
      session.mode === 'arcade'
        ? `Final Blitz Score: ${session.score} (Best: ${profile.arcadeBest})`
        : `You answered ${session.correctCount} out of ${session.totalQuestions} questions!`;
    $('sum-correct').textContent =
      session.mode === 'arcade' ? `${session.correctCount}` : `${session.correctCount}/${session.totalQuestions}`;
    $('sum-stars').textContent = `+${session.starsEarned} ⭐`;
    $('sum-best-streak').textContent = `${session.roundBestStreak} 🔥`;

    showView('summary');
    MathAudio.speak(
      `Woohoo! Awesome job${profile.name ? ', ' + profile.name : ''}! You earned ${session.starsEarned} stars!`,
      'cheer'
    );
  }

  // Times Tables Playground
  function openTables(selected = 2) {
    MathAudio.pop();
    session.tableNum = selected;
    const selector = $('table-selector');
    selector.innerHTML = '';
    for (let n = 1; n <= 12; n++) {
      const btn = document.createElement('button');
      btn.className = `table-num-btn ${n === selected ? 'active' : ''}`;
      btn.textContent = `${n}×`;
      btn.addEventListener('click', () => openTables(n));
      selector.appendChild(btn);
    }

    const grid = $('flashcards-grid');
    grid.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const card = document.createElement('button');
      card.className = 'flip-card';
      card.innerHTML = `
        <div class="flip-inner">
          <div class="flip-face flip-front">
            <span>${selected} × ${m}</span>
            <span class="flip-sub">Tap to flip</span>
          </div>
          <div class="flip-face flip-back">
            <span>${selected * m}</span>
            <span class="flip-sub">${selected} × ${m}</span>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        MathAudio.flip();
        card.classList.toggle('flipped');
        table3D.setQuestion('mul', selected, m);
        table3D.triggerAnimation();
        $('table-3d-desc').textContent = `${selected} rows × ${m} columns = ${selected * m} cubes!`;
      });
      grid.appendChild(card);
    }

    table3D.setQuestion('mul', selected, 3);
    $('table-3d-desc').textContent = `Showing ${selected} × 3 = ${selected * 3} cubes. Tap any card!`;
    showView('tables');
  }

  const TOPIC_META = [
    { key: 'add', label: '➕ Addition', color: '#10b981' },
    { key: 'sub', label: '➖ Subtraction', color: '#f97316' },
    { key: 'mul', label: '✖️ Multiplication', color: '#8b5cf6' }
  ];

  function buildReportSummary() {
    let totalAttempts = 0;
    let totalCorrect = 0;
    const topics = TOPIC_META.map((t) => {
      const s = profile.stats[t.key] || { attempts: 0, correct: 0, hints: 0 };
      totalAttempts += s.attempts;
      totalCorrect += s.correct;
      const pct = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : null;
      return { ...t, ...s, pct };
    });
    const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    return { topics, overallPct, totalAttempts, totalCorrect };
  }

  // Progress Report & Trophy Room
  function openTrophies() {
    MathAudio.pop();
    const { topics, overallPct } = buildReportSummary();

    $('report-avatar').textContent = profile.avatar || '🦁';
    $('report-kid-name').textContent = profile.name || 'Math Explorer';
    $('report-kid-rank').textContent = getRankLabel(profile.stars);

    $('tr-stars').textContent = profile.stars;
    $('tr-solved').textContent = profile.solved;
    $('tr-accuracy').textContent = `${overallPct}%`;
    $('tr-arcade').textContent = profile.arcadeBest;

    const strengthsEl = $('report-strengths');
    const focusEl = $('report-focus');
    strengthsEl.innerHTML = '';
    focusEl.innerHTML = '';

    const practiced = topics.filter((t) => t.attempts > 0);
    const strong = practiced.filter((t) => t.pct >= 80);
    const needFocus = practiced.filter((t) => t.pct < 80);
    const unpracticed = topics.filter((t) => t.attempts === 0);

    if (practiced.length === 0) {
      strengthsEl.innerHTML = '<li>Play a quick round to discover your strengths!</li>';
      focusEl.innerHTML = '<li>Try Addition, Subtraction, or Multiplication!</li>';
    } else {
      if (strong.length > 0) {
        strong.forEach((t) => {
          const li = document.createElement('li');
          li.textContent = `${t.label}: ${t.pct}% accuracy (${t.correct}/${t.attempts})`;
          strengthsEl.appendChild(li);
        });
      } else {
        const best = [...practiced].sort((a, b) => b.pct - a.pct)[0];
        strengthsEl.innerHTML = `<li>Best so far: ${best.label} (${best.pct}%) — keep going!</li>`;
      }

      if (needFocus.length > 0) {
        needFocus.forEach((t) => {
          const li = document.createElement('li');
          li.textContent = `${t.label} (${t.pct}% accuracy) — try Starter level or Learning Guides!`;
          focusEl.appendChild(li);
        });
      } else if (unpracticed.length > 0) {
        unpracticed.forEach((t) => {
          const li = document.createElement('li');
          li.textContent = `Not tried yet: ${t.label}`;
          focusEl.appendChild(li);
        });
      } else {
        focusEl.innerHTML = '<li>Awesome! 80%+ in every topic — try Master level or 60s Blitz!</li>';
      }
    }

    const barsEl = $('topic-bars');
    barsEl.innerHTML = '';
    topics.forEach((t) => {
      const pctText = t.pct === null ? 'Not tried yet' : `${t.pct}% (${t.correct}/${t.attempts})`;
      const width = t.pct === null ? 0 : t.pct;
      const row = document.createElement('div');
      row.className = 'topic-row';
      row.innerHTML = `
        <div class="topic-row-top">
          <span>${t.label}</span>
          <span>${pctText}</span>
        </div>
        <div class="topic-bar-bg">
          <div class="topic-bar-fill" style="width:${width}%; background:${t.color};"></div>
        </div>
        <div class="topic-meta">
          <span>Hints used: ${t.hints}</span>
          <button class="mini-btn" data-quick-op="${t.key}">▶ Practice</button>
        </div>
      `;
      row.querySelector('[data-quick-op]').addEventListener('click', () => openSetup(t.key));
      barsEl.appendChild(row);
    });

    const grid = $('badges-grid');
    grid.innerHTML = '';
    BADGES.forEach((b) => {
      const unlocked = b.check(profile);
      const el = document.createElement('div');
      el.className = `badge-card ${unlocked ? 'unlocked' : ''}`;
      el.innerHTML = `
        <span class="badge-emoji">${b.emoji}</span>
        <span class="badge-name">${b.name}</span>
        <span class="badge-req">${unlocked ? 'Unlocked!' : b.req}</span>
      `;
      grid.appendChild(el);
    });

    showView('trophies');
  }

  // Event Wiring
  document.querySelectorAll('[data-action="go-home"]').forEach((el) => {
    el.addEventListener('click', () => {
      MathAudio.pop();
      stopTimer();
      showView('home');
    });
  });

  $('btn-home').addEventListener('click', () => {
    MathAudio.pop();
    stopTimer();
    showView('home');
  });

  document.querySelectorAll('[data-action="start-setup"]').forEach((el) => {
    el.addEventListener('click', () => openSetup(el.dataset.op));
  });

  document.querySelectorAll('.level-btn').forEach((el) => {
    el.addEventListener('click', () => startQuest(el.dataset.level));
  });

  document.querySelectorAll('[data-action="open-tables"]').forEach((el) => {
    el.addEventListener('click', () => openTables(2));
  });
  document.querySelectorAll('[data-action="open-games"]').forEach((el) => {
    el.addEventListener('click', () => {
      MathAudio.pop();
      stopTimer();
      showView('games');
    });
  });
  document.querySelector('[data-action="start-arcade"]').addEventListener('click', startArcade);
  document.querySelector('[data-action="open-trophies"]').addEventListener('click', openTrophies);
  document.querySelector('[data-action="open-learn"]').addEventListener('click', () => openLearn('4-6'));
  $('btn-top-learn').addEventListener('click', () => openLearn('4-6'));

  // Age-based Learning Materials
  const LEARNING_MATERIALS = {
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

  function openLearn(age = '4-6') {
    MathAudio.pop();
    stopTimer();
    document.querySelectorAll('.age-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.age === age);
    });

    const grid = $('lessons-grid');
    grid.innerHTML = '';
    (LEARNING_MATERIALS[age] || LEARNING_MATERIALS['4-6']).forEach((item) => {
      const card = document.createElement('article');
      card.className = 'lesson-card';
      card.innerHTML = `
        <div class="lesson-head">
          <div class="lesson-emoji">${item.emoji}</div>
          <h3>${item.title}</h3>
        </div>
        <p class="lesson-body">${item.body}</p>
        <div class="lesson-example">${item.example}</div>
        <div class="lesson-actions">
          <button class="primary-btn small-btn" data-practice-op="${item.op}" data-practice-lvl="${item.level}">▶ Practice This</button>
        </div>
      `;
      card.querySelector('[data-practice-op]').addEventListener('click', () => {
        session.op = item.op;
        session.mix = false;
        session.useKeypad = false;
        startQuest(item.level);
      });
      grid.appendChild(card);
    });

    showView('learn');
  }

  document.querySelectorAll('.age-tab').forEach((tab) => {
    tab.addEventListener('click', () => openLearn(tab.dataset.age));
  });

  // Step-by-Step Hint System during Gameplay
  function showStepHint(advance = true) {
    if (!session.currentQ) return;
    const q = session.currentQ;
    if (advance) {
      session.hintLevel = Math.min(2, session.hintLevel + 1);
    } else if (session.hintLevel === 0) {
      session.hintLevel = 1;
    }

    MathAudio.pop();
    play3D.triggerAnimation();
    if (session.hintLevel === 1 && profile.stats[q.op]) {
      profile.stats[q.op].hints += 1;
      saveProfile(profile);
    }

    const box = $('hint-box');
    const textEl = $('hint-text');
    const visEl = $('hint-visual');
    const moreBtn = $('btn-hint-more');
    box.classList.remove('hidden');
    visEl.innerHTML = '';

    if (session.hintLevel === 1) {
      moreBtn.classList.remove('hidden');
      if (q.op === 'add') {
        const big = Math.max(q.a, q.b);
        const small = Math.min(q.a, q.b);
        textEl.textContent = `Start at ${big} and count up ${small} more! Watch the green and blue 3D blocks join together.`;
        for (let i = 0; i <= Math.min(small, 8); i++) {
          const chip = document.createElement('span');
          chip.className = `nl-chip ${i === 0 ? 'highlight' : ''}`;
          chip.textContent = i === 0 ? `${big}` : `+1 → ${big + i}`;
          visEl.appendChild(chip);
        }
      } else if (q.op === 'sub') {
        textEl.textContent = `Start at ${q.a} and count backward ${q.b} steps! Watch the red 3D blocks float away.`;
        for (let i = 0; i <= Math.min(q.b, 8); i++) {
          const chip = document.createElement('span');
          chip.className = `nl-chip ${i === 0 ? 'highlight' : ''}`;
          chip.textContent = i === 0 ? `${q.a}` : `−1 → ${q.a - i}`;
          visEl.appendChild(chip);
        }
      } else {
        textEl.textContent = `${q.a} × ${q.b} means ${q.a} rows with ${q.b} blocks in each row! Skip-count by ${q.b}:`;
        for (let i = 1; i <= Math.min(q.a, 8); i++) {
          const chip = document.createElement('span');
          chip.className = `nl-chip ${i === q.a ? 'highlight' : ''}`;
          chip.textContent = `${i * q.b}`;
          visEl.appendChild(chip);
        }
      }
    } else {
      moreBtn.classList.add('hidden');
      if (q.op === 'add' && q.a >= 10 && q.b >= 10) {
        const tA = Math.floor(q.a / 10) * 10;
        const oA = q.a % 10;
        const tB = Math.floor(q.b / 10) * 10;
        const oB = q.b % 10;
        textEl.textContent = `Break it into Tens and Ones: (${tA} + ${tB}) = ${tA + tB}, and (${oA} + ${oB}) = ${oA + oB}. Add those two together!`;
      } else if (q.op === 'mul' && (q.a === 9 || q.b === 9)) {
        const other = q.a === 9 ? q.b : q.a;
        textEl.textContent = `×9 Trick: Tens digit is ${other} − 1 = ${other - 1}. And ${other - 1} + ? = 9!`;
      } else {
        textEl.textContent = `Almost there! Count all the remaining 3D blocks or check the last digit carefully.`;
      }

      // If multiple choice, gently gray out one wrong button to help!
      if (!session.useKeypad) {
        const wrongBtns = Array.from(document.querySelectorAll('.choice-btn:not(:disabled)')).filter(
          (b) => Number(b.textContent) !== q.answer
        );
        if (wrongBtns.length > 1) {
          wrongBtns[0].disabled = true;
          wrongBtns[0].style.opacity = '0.35';
        }
      }
    }

    MathAudio.speak(textEl.textContent, 'gentle');
  }

  $('btn-step-hint').addEventListener('click', () => showStepHint(true));
  $('btn-hint-more').addEventListener('click', () => showStepHint(true));
  $('btn-hint-lesson').addEventListener('click', () => {
    const op = session.currentQ ? session.currentQ.op : 'add';
    const age = op === 'mul' ? '8-10' : session.level === 'easy' ? '4-6' : '6-8';
    openLearn(age);
  });

  // Contextual Help Modal (Setup & Tables)
  function openHelpModal(topic) {
    MathAudio.pop();
    const titleEl = $('help-modal-title');
    const bodyEl = $('help-modal-body');

    if (topic === 'setup') {
      titleEl.textContent = '❓ How Levels Work';
      bodyEl.innerHTML = `
        <ul>
          <li><strong>🐣 Starter (Ages 4–6):</strong> Small numbers (1–10) or tables 1–5.</li>
          <li><strong>🚀 Explorer (Ages 6–8):</strong> Medium numbers (1–20) or tables 1–10.</li>
          <li><strong>👑 Master (Ages 8–10):</strong> Bigger numbers (up to 50) or tables 1–12.</li>
        </ul>
        <p>You can also tap <strong>❓ Hint</strong> on any question if you get stuck!</p>
      `;
    } else if (topic === 'tables') {
      titleEl.textContent = '❓ Times Tables Tricks';
      bodyEl.innerHTML = `
        <ul>
          <li><strong>×2:</strong> Just double the number! (2 × 6 = 6 + 6 = 12)</li>
          <li><strong>×5:</strong> Always ends in <strong>0</strong> or <strong>5</strong>!</li>
          <li><strong>×10:</strong> Just add a <strong>0</strong> to the end! (10 × 7 = 70)</li>
          <li><strong>×9:</strong> Tens digit is 1 less, and digits add to 9! (9 × 4 = 36)</li>
          <li><strong>Flip it:</strong> 3 × 8 is the same as 8 × 3!</li>
        </ul>
      `;
    } else if (topic === 'magic') {
      titleEl.textContent = '🪄 How Magic Mixer Works';
      bodyEl.innerHTML = `
        <ul>
          <li><strong>Drag or Tap:</strong> Drag any 2 Bubbles, Planets, or Fruits into the glowing Magic Portal (or just tap them!).</li>
          <li><strong>🪄 Mix Magic:</strong> When 2 items land in the portal, they auto-mix with a sparkle burst!</li>
          <li><strong>🎯 Target vs 🧪 Free Mix:</strong> Hit the target number to earn ⭐ stars, or switch to Free Mix to experiment with any numbers!</li>
        </ul>
      `;
    } else if (topic === 'snow') {
      titleEl.textContent = '❄️ How Snow Clap AR Works';
      bodyEl.innerHTML = `
        <ul>
          <li><strong>🐢 Pick Speed by Age:</strong> Choose <em>Slow (4–6)</em>, <em>Medium (6–8)</em>, or <em>Fast (8–10)</em>.</li>
          <li><strong>🙌 Hold 2 Snow Numbers:</strong> Catch one snow-shaped number in each open palm (or tap them).</li>
          <li><strong>👏 Clap Sound + Gesture:</strong> Bring both palms together AND clap loudly (or tap <strong>👏 CLAP HANDS!</strong>) to form a giant snow number!</li>
        </ul>
      `;
    } else if (topic === 'squirrel') {
      titleEl.textContent = '🐿️ How Squirrel Bridge Works';
      bodyEl.innerHTML = `
        <ul>
          <li><strong>🙌 Stretch Both Arms:</strong> Stretch your Left Hand to <strong>LEFT HAND</strong> and Right Hand to <strong>RIGHT HAND</strong> in the camera (no fake bridge line—your real arms &amp; shoulders ARE the bridge!).</li>
          <li><strong>🐿️ Walk Over Your Shoulders:</strong> Sammy the Squirrel walks right over your real outstretched hands &amp; shoulders from Left to Right!</li>
          <li><strong>🌰 Bonus Mode:</strong> Tap <em>Stretch &amp; Cross</em> to switch to <em>Math Quiz</em> mode!</li>
        </ul>
      `;
    } else if (topic === 'rock') {
      titleEl.textContent = '🥊 How Rock Blaster AR Works';
      bodyEl.innerHTML = `
        <ul>
          <li><strong>🥊 Punch &amp; 🦶 Kick HARD:</strong> Punch falling rocks, lava, snow, and holiday balls as they drop! Hit HARD to blast one target at a time!</li>
          <li><strong>🚫 Skip Negative Numbers:</strong> Don't punch dark red <strong>-10 / -20 / -50</strong> hazard rocks — hitting them reduces your score!</li>
          <li><strong>🐢🚀⚡ Speed Control:</strong> Pick Slow (4–6), Medium (6–8), or Fast (8–10) for your age!</li>
        </ul>
      `;
    }

    $('help-modal').classList.remove('hidden');
  }

  function closeHelpModal() {
    $('help-modal').classList.add('hidden');
  }

  $('btn-help-setup').addEventListener('click', () => openHelpModal('setup'));
  $('btn-help-tables').addEventListener('click', () => openHelpModal('tables'));
  $('btn-help-magic').addEventListener('click', () => openHelpModal('magic'));
  $('btn-help-snow').addEventListener('click', () => openHelpModal('snow'));
  $('btn-help-squirrel').addEventListener('click', () => openHelpModal('squirrel'));
  $('btn-help-rock').addEventListener('click', () => openHelpModal('rock'));

  // ==========================================
  // SNOW CLAP AR (Camera Arcade Game)
  // ==========================================
  let snowOp = 'add';
  let snowSpeed = 'slow';

  function initSnowGame() {
    if (snowGame) return snowGame;
    snowGame = new SnowClapArcade({
      canvas: $('snow-canvas'),
      onStatus(msg) {
        $('snow-status').textContent = msg;
      },
      onScore(info) {
        $('snow-score').textContent = info.score;
        $('snow-combo').textContent = `x${info.combo}`;
        $('snow-timer').textContent = info.timeLeft;
        $('snow-stars').textContent = info.stars;
        $('snow-left-readout').textContent = `✋ Left: ${info.heldLeft !== null ? info.heldLeft : '--'}`;
        $('snow-right-readout').textContent = `Right: ${info.heldRight !== null ? info.heldRight : '--'} 🤚`;
        $('btn-snow-clap').disabled = !(info.heldLeft !== null && info.heldRight !== null);

        if (info.lastExpr) {
          profile.stars += 2;
          profile.solved += 1;
          if (profile.stats[snowOp]) {
            profile.stats[snowOp].attempts += 1;
            profile.stats[snowOp].correct += 1;
          }
          saveProfile(profile);
          refreshHeader();
          launchConfetti(18);
        }
      },
      onFinish(res) {
        MathAudio.fanfare();
        launchConfetti(40);
        $('snow-status').textContent = `🏆 Time Up! Final Score: ${res.score} • Earned +${res.stars} ⭐! Tap Restart to play again!`;
        if (res.score > profile.arcadeBest) {
          profile.arcadeBest = res.score;
          saveProfile(profile);
        }
      }
    });
    return snowGame;
  }

  function openSnowArcade() {
    MathAudio.pop();
    stopTimer();
    const game = initSnowGame();
    $('snow-score').textContent = '0';
    $('snow-combo').textContent = 'x1';
    $('snow-timer').textContent = snowSpeed === 'slow' ? '90' : '60';
    $('snow-stars').textContent = '0';
    $('snow-left-readout').textContent = '✋ Left: --';
    $('snow-right-readout').textContent = 'Right: -- 🤚';
    $('btn-snow-clap').disabled = true;
    showView('snow');
    game.start(snowOp, snowSpeed);
  }

  document.querySelector('[data-action="open-snow"]').addEventListener('click', openSnowArcade);
  $('btn-snow-back').addEventListener('click', () => {
    MathAudio.pop();
    showView('games');
  });
  $('btn-snow-clap').addEventListener('click', () => {
    if (snowGame) snowGame.triggerClap();
  });
  $('btn-snow-restart').addEventListener('click', () => {
    MathAudio.pop();
    if (snowGame) snowGame.start(snowOp, snowSpeed);
  });
  document.querySelectorAll('[data-snow-op]').forEach((btn) => {
    btn.addEventListener('click', () => {
      snowOp = btn.dataset.snowOp;
      document.querySelectorAll('[data-snow-op]').forEach((b) => b.classList.toggle('active', b === btn));
      MathAudio.pop();
      if (snowGame) snowGame.setOperation(snowOp);
    });
  });
  document.querySelectorAll('[data-snow-speed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      snowSpeed = btn.dataset.snowSpeed;
      document.querySelectorAll('[data-snow-speed]').forEach((b) => b.classList.toggle('active', b === btn));
      MathAudio.pop();
      if (snowGame) snowGame.setSpeed(snowSpeed);
    });
  });

  // ==========================================
  // SQUIRREL BRIDGE AR (Park / Jungle Stretch Hands Game)
  // ==========================================
  let sqOp = 'add';
  let sqSpeed = 'slow';
  let sqQuizMode = false;

  function initSquirrelGame() {
    if (squirrelGame) return squirrelGame;
    squirrelGame = new SquirrelBridgeArcade({
      canvas: $('squirrel-canvas'),
      onStatus(msg) {
        $('sq-status').textContent = msg;
      },
      onScore(info) {
        $('sq-score').textContent = info.score;
        $('sq-crossed').textContent = info.crossed;
        $('sq-stars').textContent = info.stars;
        if (info.problem) {
          $('sq-expr').textContent = `${info.problem.a} ${info.problem.sym} ${info.problem.b}`;
        }
        if (info.completedRound) {
          profile.stars += 2;
          profile.solved += 1;
          if (profile.stats[sqOp]) {
            profile.stats[sqOp].attempts += 1;
            profile.stats[sqOp].correct += 1;
          }
          saveProfile(profile);
          refreshHeader();
          launchConfetti(24);
        }
      }
    });
    return squirrelGame;
  }

  function openSquirrelArcade() {
    MathAudio.pop();
    stopTimer();
    const game = initSquirrelGame();
    $('sq-score').textContent = '0';
    $('sq-crossed').textContent = '0';
    $('sq-stars').textContent = '0';
    showView('squirrel');
    game.start(sqOp, sqSpeed);
  }

  document.querySelector('[data-action="open-squirrel"]').addEventListener('click', openSquirrelArcade);
  $('btn-squirrel-back').addEventListener('click', () => {
    MathAudio.pop();
    showView('games');
  });
  $('btn-sq-connect').addEventListener('click', () => {
    if (squirrelGame) squirrelGame.connectNow();
  });
  $('btn-sq-next').addEventListener('click', () => {
    MathAudio.pop();
    if (squirrelGame) squirrelGame.nextRound();
  });
  $('btn-sq-mode').addEventListener('click', () => {
    sqQuizMode = !sqQuizMode;
    $('btn-sq-mode').textContent = sqQuizMode ? '🌰 Math Quiz Mode' : '🌉 Stretch & Cross';
    MathAudio.pop();
    if (squirrelGame) squirrelGame.setQuizMode(sqQuizMode);
  });
  $('btn-sq-cam').addEventListener('click', () => {
    if (!squirrelGame) return;
    const on = squirrelGame.toggleCameraView();
    $('btn-sq-cam').textContent = on ? '📷 Cam' : '🌴 Jungle';
    MathAudio.pop();
  });
  $('btn-sq-cal').addEventListener('click', () => {
    if (squirrelGame) squirrelGame.recalibrate();
    MathAudio.pop();
  });
  document.querySelectorAll('[data-sq-op]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sqOp = btn.dataset.sqOp;
      document.querySelectorAll('[data-sq-op]').forEach((b) => b.classList.toggle('active', b === btn));
      MathAudio.pop();
      if (squirrelGame) squirrelGame.setOperation(sqOp);
    });
  });
  document.querySelectorAll('[data-sq-speed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sqSpeed = btn.dataset.sqSpeed;
      document.querySelectorAll('[data-sq-speed]').forEach((b) => b.classList.toggle('active', b === btn));
      MathAudio.pop();
      if (squirrelGame) squirrelGame.setSpeed(sqSpeed);
    });
  });

  // ==========================================
  // ROCK BLASTER AR (Fist & Kick Action Game)
  // ==========================================
  let rockSpeed = 'slow';

  function initRockGame() {
    if (rockGame) return rockGame;
    rockGame = new RockBlasterArcade({
      canvas: $('rock-canvas'),
      onStatus(msg) {
        $('rock-status').textContent = msg;
      },
      onScore(info) {
        $('rock-score').textContent = info.score;
        $('rock-blasted').textContent = info.blasted;
        $('rock-timer').textContent = info.timeLeft;
        if (info.score > (profile.rockBest || 0)) {
          profile.rockBest = info.score;
          $('rock-best').textContent = info.score;
          saveProfile(profile);
        }
        if (info.lastPoints >= 50) {
          launchConfetti(16);
        }
      },
      onFinish(res) {
        MathAudio.fanfare();
        launchConfetti(40);
        const starsWon = Math.max(1, Math.floor(res.blasted / 3));
        profile.stars += starsWon;
        saveProfile(profile);
        refreshHeader();
        $('rock-status').textContent = `🏆 Time Up! ${res.score} Points (${res.blasted} rocks blasted) • +${starsWon} ⭐!`;
      }
    });
    return rockGame;
  }

  function openRockArcade() {
    MathAudio.pop();
    stopTimer();
    const game = initRockGame();
    $('rock-score').textContent = '0';
    $('rock-blasted').textContent = '0';
    $('rock-timer').textContent = rockSpeed === 'slow' ? '90' : '60';
    $('rock-best').textContent = profile.rockBest || 0;
    showView('rock');
    game.start(rockSpeed);
  }

  document.querySelector('[data-action="open-rock"]').addEventListener('click', openRockArcade);
  $('btn-rock-back').addEventListener('click', () => {
    MathAudio.pop();
    showView('games');
  });
  $('btn-rock-restart').addEventListener('click', () => {
    MathAudio.pop();
    if (rockGame) rockGame.start(rockSpeed);
  });
  $('btn-rock-cam').addEventListener('click', () => {
    if (!rockGame) return;
    const on = rockGame.toggleCameraView();
    $('btn-rock-cam').textContent = on ? '📷 Cam + Galaxy' : '🌌 Full Galaxy';
    MathAudio.pop();
  });
  document.querySelectorAll('[data-rock-speed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      rockSpeed = btn.dataset.rockSpeed;
      document.querySelectorAll('[data-rock-speed]').forEach((b) => b.classList.toggle('active', b === btn));
      MathAudio.pop();
      if (rockGame) rockGame.setSpeed(rockSpeed);
    });
  });

  // ==========================================
  // MAGIC MIXER LAB (Drag Bubbles / Planets / Fruits)
  // ==========================================
  const MAGIC_ICONS = {
    bubbles: ['🫧', '🫧', '💧', '✨', '🫧', '🌊'],
    planets: ['🪐', '🌍', '🌕', '☄️', '🌟', '🚀'],
    fruits: ['🍓', '🍎', '🍊', '🍉', '🍇', '🍍']
  };

  const magicState = {
    theme: 'bubbles',
    op: 'add',
    mode: 'challenge', // 'challenge' | 'free'
    items: [],
    slotA: null,
    slotB: null,
    target: 10,
    mixed: false,
    streak: 0
  };

  function getMagicOpSymbol(op) {
    return op === 'add' ? '➕' : op === 'sub' ? '➖' : '✖️';
  }

  function computeMagicResult(op, a, b) {
    if (op === 'add') return a + b;
    if (op === 'sub') return a - b;
    return a * b;
  }

  function generateMagicRound() {
    magicState.slotA = null;
    magicState.slotB = null;
    magicState.mixed = false;

    const op = magicState.op;
    let a, b;
    if (op === 'add') {
      a = randInt(2, 10);
      b = randInt(1, 10);
    } else if (op === 'sub') {
      a = randInt(5, 16);
      b = randInt(1, a - 1);
    } else {
      a = randInt(2, 9);
      b = randInt(2, 9);
    }
    magicState.target = computeMagicResult(op, a, b);

    // Build 7 items guaranteed to include (a, b)
    const nums = [a, b];
    while (nums.length < 7) {
      const n = op === 'mul' ? randInt(1, 10) : randInt(1, 15);
      nums.push(n);
    }
    // Shuffle
    nums.sort(() => Math.random() - 0.5);
    const icons = MAGIC_ICONS[magicState.theme];
    magicState.items = nums.map((val, idx) => ({
      id: idx,
      val,
      icon: icons[idx % icons.length],
      used: false
    }));

    renderMagicUI();
  }

  function renderMagicUI() {
    $('magic-op-symbol').textContent = getMagicOpSymbol(magicState.op);
    const banner = $('magic-target-banner');
    if (magicState.mode === 'challenge') {
      banner.classList.remove('hidden');
      $('magic-target-text').innerHTML = `🎯 Drag or tap 2 items to make <strong>${magicState.target}</strong> using <strong>${getMagicOpSymbol(magicState.op)}</strong>!`;
    } else {
      banner.classList.add('hidden');
    }

    // Render Tray
    const tray = $('magic-tray');
    tray.innerHTML = '';
    magicState.items.forEach((item) => {
      const orb = document.createElement('div');
      orb.className = `magic-orb theme-${magicState.theme} ${item.used ? 'used' : ''}`;
      orb.innerHTML = `<span class="orb-icon">${item.icon}</span><span class="orb-num">${item.val}</span>`;
      attachOrbDrag(orb, item);
      tray.appendChild(orb);
    });

    // Render Slots
    const slotAEl = $('magic-slot-a');
    const slotBEl = $('magic-slot-b');
    const resEl = $('magic-result-orb');

    if (magicState.slotA) {
      slotAEl.classList.add('filled');
      slotAEl.innerHTML = `<span class="orb-icon">${magicState.slotA.icon}</span><span>${magicState.slotA.val}</span>`;
    } else {
      slotAEl.classList.remove('filled');
      slotAEl.textContent = '?';
    }

    if (magicState.slotB) {
      slotBEl.classList.add('filled');
      slotBEl.innerHTML = `<span class="orb-icon">${magicState.slotB.icon}</span><span>${magicState.slotB.val}</span>`;
    } else {
      slotBEl.classList.remove('filled');
      slotBEl.textContent = '?';
    }

    if (!magicState.mixed) {
      resEl.classList.remove('revealed');
      resEl.textContent = '✨';
      $('magic-feedback').textContent = '';
      $('magic-visual-parade').innerHTML = '';
    }
    $('magic-streak-pill').textContent = `🪄 Streak: ${magicState.streak}`;

    $('btn-magic-mix').disabled = !(magicState.slotA && magicState.slotB) || magicState.mixed;
  }

  function dropIntoMagicSlot(item) {
    if (item.used || magicState.mixed) return;
    if (!magicState.slotA) {
      magicState.slotA = item;
      item.used = true;
    } else if (!magicState.slotB) {
      magicState.slotB = item;
      item.used = true;
    } else {
      return;
    }
    MathAudio.pop();
    renderMagicUI();
    // Auto-mix magically as soon as 2 items land in the portal!
    if (magicState.slotA && magicState.slotB) {
      setTimeout(triggerMagicMix, 220);
    }
  }

  function attachOrbDrag(orbEl, item) {
    let startX = 0;
    let startY = 0;
    let ghost = null;
    let moved = false;

    orbEl.addEventListener('pointerdown', (e) => {
      if (item.used || magicState.mixed) return;
      e.preventDefault();
      orbEl.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      moved = false;

      ghost = orbEl.cloneNode(true);
      ghost.classList.add('drag-ghost');
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;
      document.body.appendChild(ghost);
    });

    orbEl.addEventListener('pointermove', (e) => {
      if (!ghost) return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) moved = true;
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;

      const portalRect = $('magic-portal').getBoundingClientRect();
      const over =
        e.clientX >= portalRect.left &&
        e.clientX <= portalRect.right &&
        e.clientY >= portalRect.top &&
        e.clientY <= portalRect.bottom;
      $('magic-portal').classList.toggle('drag-over', over);
    });

    const cleanup = (e) => {
      if (!ghost) return;
      const portalRect = $('magic-portal').getBoundingClientRect();
      const over =
        e.clientX >= portalRect.left &&
        e.clientX <= portalRect.right &&
        e.clientY >= portalRect.top &&
        e.clientY <= portalRect.bottom;
      $('magic-portal').classList.remove('drag-over');
      ghost.remove();
      ghost = null;

      // Drop if dragged over portal OR if it was a quick tap
      if (over || !moved) {
        dropIntoMagicSlot(item);
      }
    };

    orbEl.addEventListener('pointerup', cleanup);
    orbEl.addEventListener('pointercancel', cleanup);
  }

  function spawnMagicSparkles() {
    const container = $('magic-sparkles');
    container.innerHTML = '';
    const icons = ['✨', '⭐', '💫', '🌟', '🪄'];
    for (let i = 0; i < 18; i++) {
      const dot = document.createElement('span');
      dot.className = 'sparkle-dot';
      dot.textContent = icons[i % icons.length];
      dot.style.left = '50%';
      dot.style.top = '45%';
      const angle = (Math.PI * 2 * i) / 18;
      const dist = 70 + Math.random() * 90;
      dot.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      dot.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
      container.appendChild(dot);
      setTimeout(() => dot.remove(), 950);
    }
  }

  function triggerMagicMix() {
    if (!magicState.slotA || !magicState.slotB || magicState.mixed) return;
    magicState.mixed = true;

    const a = magicState.slotA.val;
    const b = magicState.slotB.val;
    const result = computeMagicResult(magicState.op, a, b);

    MathAudio.magic();
    spawnMagicSparkles();
    $('magic-portal').classList.add('burst');
    setTimeout(() => $('magic-portal').classList.remove('burst'), 650);

    const resEl = $('magic-result-orb');
    resEl.textContent = result;
    resEl.classList.add('revealed');
    $('btn-magic-mix').disabled = true;

    // Visual Parade of icons!
    const paradeEl = $('magic-visual-parade');
    paradeEl.innerHTML = '';
    const showCount = Math.min(Math.max(0, result), 24);
    for (let i = 0; i < showCount; i++) {
      const sp = document.createElement('span');
      sp.className = 'parade-icon';
      sp.style.animationDelay = `${i * 0.025}s`;
      sp.textContent = i < a ? magicState.slotA.icon : magicState.slotB.icon;
      paradeEl.appendChild(sp);
    }
    if (result > 24) {
      const more = document.createElement('span');
      more.className = 'parade-icon';
      more.textContent = `+${result - 24}!`;
      paradeEl.appendChild(more);
    }

    const fb = $('magic-feedback');
    if (magicState.mode === 'challenge') {
      if (profile.stats[magicState.op]) {
        profile.stats[magicState.op].attempts += 1;
      }
      if (result === magicState.target) {
        magicState.streak += 1;
        profile.stars += 2;
        profile.solved += 1;
        if (profile.stats[magicState.op]) {
          profile.stats[magicState.op].correct += 1;
        }
        saveProfile(profile);
        refreshHeader();
        launchConfetti(28);
        $('magic-streak-pill').textContent = `🪄 Streak: ${magicState.streak}`;
        fb.textContent = `🎉 Magical Match! ${a} ${getMagicOpSymbol(magicState.op)} ${b} = ${result} (+2⭐)`;
        MathAudio.speak(`Magical match! ${result}!`);
        setTimeout(generateMagicRound, 1550);
      } else {
        magicState.streak = 0;
        saveProfile(profile);
        $('magic-streak-pill').textContent = `🪄 Streak: 0`;
        fb.textContent = `✨ Poof! ${a} ${getMagicOpSymbol(magicState.op)} ${b} = ${result}. Try again for ${magicState.target}!`;
        setTimeout(clearMagicSlots, 1250);
      }
    } else {
      fb.textContent = `✨ Magic Result: ${a} ${getMagicOpSymbol(magicState.op)} ${b} = ${result}!`;
    }
  }

  function clearMagicSlots() {
    MathAudio.pop();
    if (magicState.slotA) magicState.slotA.used = false;
    if (magicState.slotB) magicState.slotB.used = false;
    magicState.slotA = null;
    magicState.slotB = null;
    magicState.mixed = false;
    renderMagicUI();
  }

  function openMagic() {
    MathAudio.pop();
    stopTimer();
    generateMagicRound();
    showView('magic');
  }

  $('magic-slot-a').addEventListener('click', () => {
    if (!magicState.slotA || magicState.mixed) return;
    magicState.slotA.used = false;
    magicState.slotA = null;
    MathAudio.pop();
    renderMagicUI();
  });

  $('magic-slot-b').addEventListener('click', () => {
    if (!magicState.slotB || magicState.mixed) return;
    magicState.slotB.used = false;
    magicState.slotB = null;
    MathAudio.pop();
    renderMagicUI();
  });

  document.querySelectorAll('[data-action="open-magic"]').forEach((el) => {
    el.addEventListener('click', openMagic);
  });
  $('btn-magic-mix').addEventListener('click', triggerMagicMix);
  $('btn-magic-clear').addEventListener('click', clearMagicSlots);
  $('btn-magic-new').addEventListener('click', () => {
    MathAudio.pop();
    generateMagicRound();
  });

  document.querySelectorAll('[data-magic-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      magicState.theme = btn.dataset.magicTheme;
      document.querySelectorAll('[data-magic-theme]').forEach((b) => b.classList.toggle('active', b === btn));
      const icons = MAGIC_ICONS[magicState.theme];
      magicState.items.forEach((it, i) => { it.icon = icons[i % icons.length]; });
      MathAudio.pop();
      renderMagicUI();
    });
  });

  document.querySelectorAll('[data-magic-op]').forEach((btn) => {
    btn.addEventListener('click', () => {
      magicState.op = btn.dataset.magicOp;
      document.querySelectorAll('[data-magic-op]').forEach((b) => b.classList.toggle('active', b === btn));
      MathAudio.pop();
      generateMagicRound();
    });
  });

  document.querySelectorAll('[data-magic-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      magicState.mode = btn.dataset.magicMode;
      document.querySelectorAll('[data-magic-mode]').forEach((b) => b.classList.toggle('active', b === btn));
      MathAudio.pop();
      generateMagicRound();
    });
  });
  $('btn-close-help').addEventListener('click', closeHelpModal);
  $('btn-modal-ok').addEventListener('click', closeHelpModal);
  $('btn-modal-learn').addEventListener('click', () => {
    closeHelpModal();
    openLearn('6-8');
  });
  $('help-modal').addEventListener('click', (e) => {
    if (e.target === $('help-modal')) closeHelpModal();
  });

  $('btn-table-quiz').addEventListener('click', () => startTableQuiz(session.tableNum));

  $('btn-play-again').addEventListener('click', () => {
    if (session.mode === 'arcade') startArcade();
    else if (session.mode === 'table-quiz') startTableQuiz(session.tableNum);
    else startQuest(session.level);
  });

  $('btn-3d-hint').addEventListener('click', () => {
    MathAudio.pop();
    play3D.triggerAnimation();
  });

  $('btn-3d-toggle').addEventListener('click', () => {
    session.show3D = !session.show3D;
    $('play-canvas-wrap').classList.toggle('hidden', !session.show3D);
    $('btn-3d-toggle').textContent = session.show3D ? '👁️ Hide' : '👁️ Show';
  });

  $('btn-sound').addEventListener('click', () => {
    MathAudio.toggleMute();
    updateSoundBtn();
    updateVoiceBtn();
  });

  $('btn-voice').addEventListener('click', () => {
    const on = MathAudio.toggleVoice();
    updateVoiceBtn();
    if (on) {
      MathAudio.speak(`Hi${profile.name ? ', ' + profile.name : ''}! Let's play math together!`, 'cheer');
    }
  });

  $('btn-speak-q').addEventListener('click', () => {
    speakQuestion(session.currentQ);
  });

  $('btn-quick-play').addEventListener('click', () => {
    session.op = 'add';
    $('opt-mix').checked = true;
    $('opt-keypad').checked = false;
    startQuest('easy');
  });

  const PET_LINES = [
    'Yay! You are a math superstar! 🌟',
    'Let’s pop some Magic Bubbles! 🫧',
    'Spin the 3D blocks — they love dancing!',
    'Every 5 ⭐ gets me a yummy cupcake! 🧁'
  ];

  $('btn-pet-buddy').addEventListener('click', () => {
    MathAudio.giggle();
    const btn = $('btn-pet-buddy');
    btn.classList.add('happy');
    setTimeout(() => btn.classList.remove('happy'), 350);
    const line = PET_LINES[Math.floor(Math.random() * PET_LINES.length)];
    $('pet-speech').textContent = line;
    MathAudio.speak(line.replace(/[^\w\s!’']/g, ''));
  });

  $('btn-feed-buddy').addEventListener('click', () => {
    if (profile.stars < 5) {
      $('pet-speech').textContent = `Need ${5 - profile.stars} more ⭐ to buy a treat!`;
      MathAudio.pop();
      return;
    }
    profile.stars -= 5;
    profile.hearts = (profile.hearts || 0) + 1;
    saveProfile(profile);
    refreshHeader();
    MathAudio.chomp();
    launchConfetti(22);
    spawnFloatingStar($('btn-pet-buddy'), '❤️ +1!');
    $('pet-speech').textContent = `Yum!! Thank you, ${profile.name || 'friend'}! ❤️ (${profile.hearts} hearts!)`;
    MathAudio.speak('Yum! Thank you!');
  });

  $('btn-reset-progress').addEventListener('click', () => {
    if (confirm(`Reset all stars, scores, and progress for ${profile.name || 'this kid'}?`)) {
      const keepName = profile.name;
      const keepAvatar = profile.avatar;
      profile = createEmptyProfile(keepName, keepAvatar);
      currentStreak = 0;
      saveProfile(profile);
      refreshHeader();
      openTrophies();
    }
  });

  $('btn-copy-report').addEventListener('click', async () => {
    const { topics, overallPct } = buildReportSummary();
    const lines = [
      `MathCube 3D Progress Report — ${profile.name || 'Kid'} (${getRankLabel(profile.stars)})`,
      `Stars: ${profile.stars} | Solved: ${profile.solved} | Overall Accuracy: ${overallPct}% | Blitz Best: ${profile.arcadeBest}`,
      ...topics.map((t) =>
        `${t.label}: ${t.pct === null ? 'Not tried' : `${t.pct}% (${t.correct}/${t.attempts})`} | Hints: ${t.hints}`
      )
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      $('btn-copy-report').textContent = '✅ Copied!';
      setTimeout(() => {
        $('btn-copy-report').textContent = '📋 Copy Report';
      }, 1800);
    } catch (_) {
      alert(lines.join('\n'));
    }
  });

  // Kid Name & Profile Modal
  let selectedAvatar = profile.avatar || '🦁';

  function openNameModal() {
    selectedAvatar = profile.avatar || '🦁';
    $('kid-name-input').value = profile.name || '';
    document.querySelectorAll('.avatar-opt').forEach((b) => {
      b.classList.toggle('active', b.dataset.avatar === selectedAvatar);
    });

    const entries = Object.entries(store.profiles).filter(([, p]) => p.name);
    const wrap = $('saved-profiles-wrap');
    const list = $('saved-profiles-list');
    list.innerHTML = '';
    if (entries.length > 0) {
      wrap.classList.remove('hidden');
      entries.forEach(([id, p]) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'saved-profile-chip';
        chip.textContent = `${p.avatar || '🦁'} ${p.name} (${p.stars}⭐)`;
        chip.addEventListener('click', () => {
          store.activeId = id;
          profile = ensureProfileShape(store.profiles[id]);
          currentStreak = 0;
          saveProfile(profile);
          refreshHeader();
          closeNameModal();
          if (views.trophies.classList.contains('active')) openTrophies();
        });
        list.appendChild(chip);
      });
    } else {
      wrap.classList.add('hidden');
    }

    $('name-modal').classList.remove('hidden');
    setTimeout(() => $('kid-name-input').focus(), 50);
  }

  function closeNameModal() {
    $('name-modal').classList.add('hidden');
  }

  document.querySelectorAll('.avatar-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedAvatar = btn.dataset.avatar;
      document.querySelectorAll('.avatar-opt').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      MathAudio.pop();
    });
  });

  function saveKidName() {
    const raw = $('kid-name-input').value.trim();
    const cleanName = raw || 'Explorer';
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'default';
    if (!store.profiles[slug]) {
      // If current profile had no name yet, rename it in place; otherwise switch/create
      if (!profile.name && store.activeId === 'default') {
        delete store.profiles.default;
      }
      store.activeId = slug;
      profile = profile.name ? createEmptyProfile(cleanName, selectedAvatar) : { ...profile, name: cleanName, avatar: selectedAvatar };
    } else {
      store.activeId = slug;
      profile = ensureProfileShape(store.profiles[slug]);
      profile.name = cleanName;
      profile.avatar = selectedAvatar;
    }
    saveProfile(profile);
    refreshHeader();
    closeNameModal();
    if (views.trophies.classList.contains('active')) openTrophies();
  }

  $('btn-save-name').addEventListener('click', saveKidName);
  $('kid-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveKidName();
  });
  $('btn-close-name').addEventListener('click', closeNameModal);
  $('btn-profile').addEventListener('click', openNameModal);
  $('btn-switch-kid').addEventListener('click', openNameModal);

  // Keypad Events
  document.querySelectorAll('.key-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.key;
      if (k === 'clear') {
        session.keypadVal = session.keypadVal.slice(0, -1);
      } else if (k === 'submit') {
        if (session.keypadVal !== '') handleAnswer(session.keypadVal);
        return;
      } else if (session.keypadVal.length < 4) {
        session.keypadVal += k;
      }
      $('keypad-display').textContent = session.keypadVal || '?';
      MathAudio.pop();
    });
  });

  // Desktop Keyboard Support
  window.addEventListener('keydown', (e) => {
    if (!views.play.classList.contains('active') || !session.useKeypad) return;
    if (e.key >= '0' && e.key <= '9' && session.keypadVal.length < 4) {
      session.keypadVal += e.key;
      $('keypad-display').textContent = session.keypadVal;
    } else if (e.key === 'Backspace') {
      session.keypadVal = session.keypadVal.slice(0, -1);
      $('keypad-display').textContent = session.keypadVal || '?';
    } else if (e.key === 'Enter' && session.keypadVal !== '') {
      handleAnswer(session.keypadVal);
    }
  });

  // PWA Install Prompt
  let deferredPrompt = null;
  const installBtn = $('btn-install');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add('hidden');
  });

  // Register Service Worker (relative path for GitHub Pages repo subpaths)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  refreshHeader();
  updateSoundBtn();
  updateVoiceBtn();
  if (!profile.name) {
    openNameModal();
  }
})();
