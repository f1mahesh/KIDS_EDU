/* Learn & Guides Hub Controller (Categorized Math & English Lessons) */

(function (app) {
  'use strict';

  const { AudioEngine, $, ENGLISH_LESSONS, MATH_LESSONS } = app;

class LearnController {
  constructor({ showView, onPracticeMath, onPracticeEnglish }) {
    this.showView = showView;
    this.onPracticeMath = onPracticeMath;
    this.onPracticeEnglish = onPracticeEnglish;
    this.subject = 'math'; // 'math' | 'english'
    this.mathAge = '4-6';

    this._bindEvents();
  }

  _bindEvents() {
    document.querySelectorAll('[data-learn-subject]').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.open(tab.dataset.learnSubject, this.mathAge);
      });
    });

    document.querySelectorAll('.age-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.open('math', tab.dataset.age);
      });
    });
  }

  open(subject = this.subject, mathAge = this.mathAge) {
    AudioEngine.pop();
    this.subject = subject === 'english' ? 'english' : 'math';
    this.mathAge = mathAge || '4-6';

    document.querySelectorAll('[data-learn-subject]').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.learnSubject === this.subject);
    });

    $('age-tabs').classList.toggle('hidden', this.subject !== 'math');
    document.querySelectorAll('.age-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.age === this.mathAge);
    });

    const grid = $('lessons-grid');
    grid.innerHTML = '';

    if (this.subject === 'math') {
      (MATH_LESSONS[this.mathAge] || MATH_LESSONS['4-6']).forEach((item) => {
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
            <button class="primary-btn small-btn">▶ Practice Math</button>
          </div>
        `;
        card.querySelector('button').addEventListener('click', () => {
          this.onPracticeMath(item.op, item.level);
        });
        grid.appendChild(card);
      });
    } else {
      ENGLISH_LESSONS.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'lesson-card';
        card.innerHTML = `
          <div class="lesson-head">
            <div class="lesson-emoji">${item.emoji}</div>
            <h3>${item.title}</h3>
          </div>
          <p class="lesson-body">${item.body}</p>
          <div class="lesson-example">${item.example}</div>
          <div class="lesson-actions lesson-actions-row">
            <button type="button" class="secondary-btn small-btn btn-hear-lesson">🔊 Hear</button>
            <button type="button" class="primary-btn small-btn btn-practice-lesson">▶ Practice</button>
          </div>
        `;
        card.querySelector('.btn-hear-lesson').addEventListener('click', () => {
          AudioEngine.speak(item.speakText, 'gentle');
        });
        card.querySelector('.btn-practice-lesson').addEventListener('click', () => {
          this.onPracticeEnglish(item.tierId);
        });
        grid.appendChild(card);
      });
    }

    this.showView('learn');
  }
}

  app.LearnController = LearnController;
})(window.KidApp = window.KidApp || {});
