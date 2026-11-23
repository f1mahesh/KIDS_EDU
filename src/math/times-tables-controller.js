/* Times Tables Playground (1-12) Controller */

(function (app) {
  'use strict';

  const { AudioEngine, $ } = app;

class TimesTablesController {
  constructor({ table3D, showView, onStartTableQuiz }) {
    this.table3D = table3D;
    this.showView = showView;
    this.onStartTableQuiz = onStartTableQuiz;
    this.selectedTable = 2;

    $('btn-table-quiz').addEventListener('click', () => {
      this.onStartTableQuiz(this.selectedTable);
    });
  }

  open(selected = 2) {
    AudioEngine.pop();
    this.selectedTable = selected;
    const selector = $('table-selector');
    selector.innerHTML = '';

    for (let n = 1; n <= 12; n++) {
      const btn = document.createElement('button');
      btn.className = `table-num-btn ${n === selected ? 'active' : ''}`;
      btn.textContent = `${n}×`;
      btn.addEventListener('click', () => this.open(n));
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
        AudioEngine.flip();
        card.classList.toggle('flipped');
        this.table3D.setQuestion('mul', selected, m);
        this.table3D.triggerAnimation();
        $('table-3d-desc').textContent = `${selected} rows × ${m} columns = ${selected * m} cubes!`;
      });
      grid.appendChild(card);
    }

    this.table3D.setQuestion('mul', selected, 3);
    $('table-3d-desc').textContent = `Showing ${selected} × 3 = ${selected * 3} cubes. Tap any card!`;
    this.showView('tables');
  }
}

  app.TimesTablesController = TimesTablesController;
})(window.KidApp = window.KidApp || {});
