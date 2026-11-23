/* Math Quest, 60s Speed Blitz & Step-by-Step Hint Controller */

(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, $, launchConfetti, spawnFloatingPop } = app;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class MathQuestController {
  constructor({ profileStore, play3D, showView, refreshHeader, openLearn }) {
    this.profileStore = profileStore;
    this.play3D = play3D;
    this.showView = showView;
    this.refreshHeader = refreshHeader;
    this.openLearn = openLearn;

    this.session = {
      mode: 'quest',
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

    this._bindEvents();
  }

  _bindEvents() {
    $('btn-step-hint').addEventListener('click', () => this.showStepHint(true));
    $('btn-hint-more').addEventListener('click', () => this.showStepHint(true));
    $('btn-hint-lesson').addEventListener('click', () => {
      const op = this.session.currentQ ? this.session.currentQ.op : 'add';
      const age = op === 'mul' ? '8-10' : this.session.level === 'easy' ? '4-6' : '6-8';
      this.openLearn('math', age);
    });

    $('btn-play-again').addEventListener('click', () => {
      if (this.session.mode === 'arcade') this.startArcade();
      else if (this.session.mode === 'table-quiz') this.startTableQuiz(this.session.tableNum);
      else this.startQuest(this.session.level);
    });

    $('btn-3d-hint').addEventListener('click', () => {
      AudioEngine.pop();
      this.play3D.triggerAnimation();
    });

    $('btn-3d-toggle').addEventListener('click', () => {
      this.session.show3D = !this.session.show3D;
      $('play-canvas-wrap').classList.toggle('hidden', !this.session.show3D);
      $('btn-3d-toggle').textContent = this.session.show3D ? '👁️ Hide' : '👁️ Show';
    });

    $('btn-speak-q').addEventListener('click', () => {
      this.speakQuestion(this.session.currentQ);
    });

    document.querySelectorAll('.key-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.key;
        if (k === 'clear') {
          this.session.keypadVal = this.session.keypadVal.slice(0, -1);
        } else if (k === 'submit') {
          if (this.session.keypadVal !== '') this.handleAnswer(this.session.keypadVal);
          return;
        } else if (this.session.keypadVal.length < 4) {
          this.session.keypadVal += k;
        }
        $('keypad-display').textContent = this.session.keypadVal || '?';
        AudioEngine.pop();
      });
    });

    window.addEventListener('keydown', (e) => {
      if (!$('view-play').classList.contains('active') || !this.session.useKeypad) return;
      if (e.key >= '0' && e.key <= '9' && this.session.keypadVal.length < 4) {
        this.session.keypadVal += e.key;
        $('keypad-display').textContent = this.session.keypadVal;
      } else if (e.key === 'Backspace') {
        this.session.keypadVal = this.session.keypadVal.slice(0, -1);
        $('keypad-display').textContent = this.session.keypadVal || '?';
      } else if (e.key === 'Enter' && this.session.keypadVal !== '') {
        this.handleAnswer(this.session.keypadVal);
      }
    });
  }

  stopTimer() {
    if (this.session.timerId) {
      clearInterval(this.session.timerId);
      this.session.timerId = null;
    }
  }

  speakQuestion(q) {
    if (!q) return;
    const opWord =
      q.op === 'add'
        ? 'plus'
        : q.op === 'sub'
        ? this.session.level === 'easy'
          ? 'take away'
          : 'minus'
        : 'times';
    AudioEngine.speak(`What is ${q.a} ${opWord} ${q.b}?`, 'normal');
  }

  generateQuestion(op, level, forcedTable = null) {
    let actualOp = op;
    if (this.session.mix) {
      const ops = ['add', 'sub', 'mul'];
      actualOp = ops[randInt(0, ops.length - 1)];
    }

    let a;
    let b;
    let answer;
    let symbol;
    let label;

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
      b = randInt(1, a);
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

  openSetup(op) {
    AudioEngine.pop();
    this.session.op = op;
    const titles = {
      add: '➕ Addition Quest',
      sub: '➖ Subtraction Quest',
      mul: '✖️ Multiplication Quest'
    };
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
    this.showView('setup');
  }

  startQuest(level, forcedOp = null, forcedMix = null) {
    AudioEngine.pop();
    this.stopTimer();
    if (forcedOp) this.session.op = forcedOp;
    this.session.mode = 'quest';
    this.session.level = level;
    this.session.mix = forcedMix !== null ? forcedMix : $('opt-mix').checked;
    this.session.useKeypad = $('opt-keypad').checked;
    this.session.totalQuestions = 10;
    this.session.index = 0;
    this.session.correctCount = 0;
    this.session.starsEarned = 0;
    this.session.roundBestStreak = 0;
    this.session.score = 0;

    $('quest-progress-wrap').classList.remove('hidden');
    $('arcade-timer-pill').classList.add('hidden');
    this.showView('play');
    this.nextQuestion();
  }

  startTableQuiz(tableNum) {
    AudioEngine.pop();
    this.stopTimer();
    this.session.mode = 'table-quiz';
    this.session.op = 'mul';
    this.session.mix = false;
    this.session.useKeypad = false;
    this.session.tableNum = tableNum;
    this.session.totalQuestions = 10;
    this.session.index = 0;
    this.session.correctCount = 0;
    this.session.starsEarned = 0;
    this.session.roundBestStreak = 0;
    this.session.score = 0;

    $('quest-progress-wrap').classList.remove('hidden');
    $('arcade-timer-pill').classList.add('hidden');
    this.showView('play');
    this.nextQuestion();
  }

  startArcade() {
    AudioEngine.pop();
    this.stopTimer();
    this.session.mode = 'arcade';
    this.session.op = 'add';
    this.session.level = 'medium';
    this.session.mix = true;
    this.session.useKeypad = false;
    this.session.index = 0;
    this.session.correctCount = 0;
    this.session.starsEarned = 0;
    this.session.roundBestStreak = 0;
    this.session.score = 0;
    this.session.timeLeft = 60;

    $('quest-progress-wrap').classList.add('hidden');
    $('arcade-timer-pill').classList.remove('hidden');
    $('arcade-timer').textContent = '60';
    this.showView('play');
    this.nextQuestion();

    this.session.timerId = setInterval(() => {
      this.session.timeLeft--;
      $('arcade-timer').textContent = String(this.session.timeLeft);
      if (this.session.timeLeft <= 0) {
        this.stopTimer();
        this.finishRound();
      }
    }, 1000);
  }

  nextQuestion() {
    if (this.session.mode !== 'arcade' && this.session.index >= this.session.totalQuestions) {
      this.finishRound();
      return;
    }

    this.session.locked = false;
    this.session.keypadVal = '';
    this.session.hintLevel = 0;
    $('hint-box').classList.add('hidden');
    $('hint-visual').innerHTML = '';
    $('keypad-display').textContent = '?';
    $('feedback-banner').textContent = '';
    $('feedback-banner').className = 'feedback-banner';

    const forcedTable = this.session.mode === 'table-quiz' ? this.session.tableNum : null;
    const q = this.generateQuestion(this.session.op, this.session.level, forcedTable);
    this.session.currentQ = q;

    $('question-badge').textContent = this.session.mode === 'arcade' ? `⚡ Blitz • ${q.label}` : q.label;
    $('question-text').textContent = `${q.a} ${q.symbol} ${q.b} = ?`;
    $('play-score').textContent = this.session.score;

    if (this.session.mode !== 'arcade') {
      const pct = ((this.session.index + 1) / this.session.totalQuestions) * 100;
      $('quest-progress-fill').style.width = `${pct}%`;
      $('quest-progress-label').textContent = `${this.session.index + 1} / ${this.session.totalQuestions}`;
      this.speakQuestion(q);
    }

    this.play3D.setQuestion(q.op, q.a, q.b);
    const captions = {
      add: `Green (${Math.min(q.a, 24)}) + Blue (${Math.min(q.b, 24)}) cubes • Drag to spin!`,
      sub: `Start with ${Math.min(q.a, 28)} cubes, take away ${q.b} • Tap Animate!`,
      mul: `${q.a} rows × ${q.b} columns of 3D cubes • Drag to spin!`
    };
    $('canvas-caption').textContent = captions[q.op];

    if (this.session.useKeypad) {
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
        btn.addEventListener('click', () => this.handleAnswer(val, btn));
        grid.appendChild(btn);
      });
    }
  }

  handleAnswer(val, btnEl = null) {
    if (this.session.locked) return;
    const q = this.session.currentQ;
    const isCorrect = Number(val) === q.answer;
    const banner = $('feedback-banner');
    const profile = this.profileStore.profile;

    if (isCorrect) {
      this.session.locked = true;
      AudioEngine.correct();
      this.play3D.triggerAnimation();
      if (btnEl) btnEl.classList.add('correct');

      this.profileStore.currentStreak++;
      const streak = this.profileStore.currentStreak;
      this.session.correctCount++;
      this.session.roundBestStreak = Math.max(this.session.roundBestStreak, streak);
      profile.bestStreak = Math.max(profile.bestStreak, streak);

      const bonus = streak >= 3 ? 2 : 1;
      this.session.starsEarned += bonus;
      this.session.score += 10 * bonus;
      profile.stars += bonus;
      this.profileStore.recordAttempt(q.op, true);

      let foundMat = null;
      if (streak >= 2 || Math.random() < 0.4) {
        const picked = pickRandomTreasure();
        foundMat = this.profileStore.awardTreasure(picked.id, true);
        this.session.starsEarned += picked.stars;
      }
      this.refreshHeader();

      banner.textContent = foundMat
        ? `🎉 Great! (+${bonus}⭐) • Found ${foundMat.emoji} ${foundMat.name} (+${foundMat.stars}⭐)!`
        : streak >= 3
        ? `🎉 Awesome! ${streak} Streak (+${bonus}⭐)`
        : '🎉 Great job! (+1⭐)';
      banner.className = 'feedback-banner ok';
      spawnFloatingPop(
        btnEl || $('question-text'),
        foundMat ? `${foundMat.emoji} +${foundMat.stars}⭐` : streak >= 3 ? `🔥 +${bonus}⭐` : `+${bonus}⭐`
      );

      this.session.index++;
      setTimeout(() => this.nextQuestion(), 850);
    } else {
      AudioEngine.wrong();
      if (btnEl) {
        btnEl.classList.add('wrong');
        btnEl.disabled = true;
      }
      this.profileStore.currentStreak = 0;
      this.profileStore.recordAttempt(q.op, false);
      this.refreshHeader();
      banner.textContent = '💡 Almost! Try another one or tap Animate!';
      banner.className = 'feedback-banner nope';

      if (this.session.mode === 'arcade') {
        this.session.locked = true;
        this.session.index++;
        setTimeout(() => this.nextQuestion(), 600);
      }
    }
  }

  finishRound() {
    this.stopTimer();
    AudioEngine.fanfare();
    launchConfetti(45);

    const profile = this.profileStore.profile;
    if (this.session.mode === 'arcade' && this.session.score > profile.arcadeBest) {
      profile.arcadeBest = this.session.score;
      this.profileStore.save(profile);
    }

    $('summary-title').textContent = this.session.mode === 'arcade' ? '⚡ Time Up!' : '🎉 Quest Complete!';
    $('summary-subtitle').textContent =
      this.session.mode === 'arcade'
        ? `Final Blitz Score: ${this.session.score} (Best: ${profile.arcadeBest})`
        : `You answered ${this.session.correctCount} out of ${this.session.totalQuestions} questions!`;
    $('sum-correct').textContent =
      this.session.mode === 'arcade'
        ? `${this.session.correctCount}`
        : `${this.session.correctCount}/${this.session.totalQuestions}`;
    $('sum-stars').textContent = `+${this.session.starsEarned} ⭐`;
    $('sum-best-streak').textContent = `${this.session.roundBestStreak} 🔥`;

    this.showView('summary');
    AudioEngine.speak(
      `Woohoo! Awesome job${profile.name ? ', ' + profile.name : ''}! You earned ${this.session.starsEarned} stars!`,
      'cheer'
    );
  }

  showStepHint(advance = true) {
    if (!this.session.currentQ) return;
    const q = this.session.currentQ;
    if (advance) {
      this.session.hintLevel = Math.min(2, this.session.hintLevel + 1);
    } else if (this.session.hintLevel === 0) {
      this.session.hintLevel = 1;
    }

    AudioEngine.pop();
    this.play3D.triggerAnimation();
    if (this.session.hintLevel === 1) {
      this.profileStore.recordHint(q.op);
    }

    const box = $('hint-box');
    const textEl = $('hint-text');
    const visEl = $('hint-visual');
    const moreBtn = $('btn-hint-more');
    box.classList.remove('hidden');
    visEl.innerHTML = '';

    if (this.session.hintLevel === 1) {
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

      if (!this.session.useKeypad) {
        const wrongBtns = Array.from(document.querySelectorAll('.choice-btn:not(:disabled)')).filter(
          (b) => Number(b.textContent) !== q.answer
        );
        if (wrongBtns.length > 1) {
          wrongBtns[0].disabled = true;
          wrongBtns[0].style.opacity = '0.35';
        }
      }
    }

    AudioEngine.speak(textEl.textContent, 'gentle');
  }
}

  app.MathQuestController = MathQuestController;
})(window.KidApp = window.KidApp || {});
