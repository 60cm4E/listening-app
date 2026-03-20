// Vocabulary Learning Page - Flashcards & Quiz with TTS & SFX
import { store } from './store.js';

// --- TTS Helper ---
function speak(text, lang = 'en-US', rate = 0.6) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

// --- Sound Effects (Web Audio API) ---
const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : 
                 typeof webkitAudioContext !== 'undefined' ? new webkitAudioContext() : null;

function playTone(freq, duration, type = 'sine', gain = 0.3) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playCorrectSfx() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  // Pleasant ascending chime
  playTone(523, 0.15, 'sine', 0.25);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100);
  setTimeout(() => playTone(784, 0.3, 'sine', 0.2), 200);
}

function playWrongSfx() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  // Soft descending buzz
  playTone(330, 0.2, 'triangle', 0.2);
  setTimeout(() => playTone(260, 0.3, 'triangle', 0.15), 150);
}

export function renderVocab(container, round, data) {
  if (!data || !data.vocabulary || data.vocabulary.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p>${round}회 어휘 데이터가 없습니다.</p>
        <a href="#/round/${round}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
      </div>
    `;
    return;
  }

  const vocab = data.vocabulary;
  let currentIndex = 0;
  let isFlipped = false;
  let mode = 'flashcard'; // 'flashcard' | 'quiz'
  let quizScore = 0;
  let quizIndex = 0;
  let quizAnswered = false;
  let quizWords = [];

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getQuizChoices(correctWord) {
    const others = vocab.filter(v => v.word !== correctWord.word && v.meaning);
    const shuffled = shuffleArray(others).slice(0, 3);
    const choices = shuffleArray([correctWord, ...shuffled]);
    return choices;
  }

  function render() {
    if (mode === 'flashcard') {
      renderFlashcardMode();
    } else {
      renderQuizMode();
    }
  }

  function renderFlashcardMode() {
    const word = vocab[currentIndex];
    container.innerHTML = `
      <div class="vocab-container">
        <div class="vocab-tabs">
          <button class="vocab-tab active" id="tab-flashcard">플래시카드</button>
          <button class="vocab-tab" id="tab-quiz">단어 퀴즈</button>
        </div>
        <div class="flashcard-wrapper" id="flashcard-wrapper">
          <div class="flashcard ${isFlipped ? 'flipped' : ''}" id="flashcard">
            <div class="flashcard-face flashcard-front">
              <div class="word">${word.word}</div>
              <button class="speak-btn" id="speak-front" aria-label="발음 듣기">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
              </button>
              <div class="hint">탭하여 뜻 확인</div>
            </div>
            <div class="flashcard-face flashcard-back">
              <div class="meaning">${word.meaning || '뜻 없음'}</div>
              <div class="word-en">${word.word}</div>
              ${word.example ? `<div class="example">${word.example}</div>` : ''}
              <button class="speak-btn speak-btn-back" id="speak-back" aria-label="발음 듣기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="flashcard-controls">
          <button class="btn btn-secondary btn-sm" id="btn-prev" ${currentIndex === 0 ? 'disabled' : ''}>← 이전</button>
          <span class="flashcard-counter">${currentIndex + 1} / ${vocab.length}</span>
          <button class="btn btn-secondary btn-sm" id="btn-next" ${currentIndex === vocab.length - 1 ? 'disabled' : ''}>다음 →</button>
        </div>
        <div class="flashcard-controls mt-8">
          <button class="btn btn-secondary btn-sm" id="btn-shuffle">🔀 섞기</button>
        </div>
        ${currentIndex === vocab.length - 1 ? `
          <div class="mt-24 text-center">
            <button class="btn btn-success btn-lg btn-full" id="btn-vocab-complete">✅ 어휘 학습 완료!</button>
          </div>
        ` : ''}
        <div class="shortcut-hints">
          <span class="shortcut-hint"><kbd>←</kbd><kbd>→</kbd> 이전/다음</span>
          <span class="shortcut-hint"><kbd>Space</kbd> 뒤집기</span>
          <span class="shortcut-hint"><kbd>S</kbd> 발음</span>
          <span class="shortcut-hint"><kbd>R</kbd> 섞기</span>
        </div>
      </div>
    `;

    // Speak buttons (stop event propagation so card doesn't flip)
    document.getElementById('speak-front')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speak(word.word);
    });

    document.getElementById('speak-back')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speak(word.word);
    });

    // Card flip (no auto-speak, use speaker button instead)
    document.getElementById('flashcard').addEventListener('click', () => {
      isFlipped = !isFlipped;
      document.getElementById('flashcard').classList.toggle('flipped');
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        isFlipped = false;
        render();
      }
    });

    document.getElementById('btn-next')?.addEventListener('click', () => {
      if (currentIndex < vocab.length - 1) {
        currentIndex++;
        isFlipped = false;
        render();
      }
    });

    document.getElementById('btn-shuffle')?.addEventListener('click', () => {
      const shuffled = shuffleArray(vocab);
      data.vocabulary.splice(0, data.vocabulary.length, ...shuffled);
      currentIndex = 0;
      isFlipped = false;
      render();
    });

    document.getElementById('tab-quiz')?.addEventListener('click', () => {
      mode = 'quiz';
      quizScore = 0;
      quizIndex = 0;
      quizAnswered = false;
      quizWords = shuffleArray(vocab);
      render();
    });

    document.getElementById('btn-vocab-complete')?.addEventListener('click', () => {
      store.saveVocabComplete(round);
      window.location.hash = `#/round/${round}`;
    });

    attachKeyboard('flashcard');

    // Auto-play pronunciation when card appears
    speak(word.word);
  }

  function renderQuizMode() {
    if (quizIndex >= quizWords.length) {
      // Quiz finished
      const pct = Math.round((quizScore / quizWords.length) * 100);
      container.innerHTML = `
        <div class="vocab-container">
          <div class="vocab-tabs">
            <button class="vocab-tab" id="tab-flashcard">플래시카드</button>
            <button class="vocab-tab active" id="tab-quiz">단어 퀴즈</button>
          </div>
          <div class="score-card" style="margin-top: 20px;">
            <div class="score-number">${pct}</div>
            <div class="score-label">점</div>
            <div class="score-detail">
              <span><span class="value">${quizScore}</span>정답</span>
              <span><span class="value">${quizWords.length - quizScore}</span>오답</span>
            </div>
            <div class="score-message">${pct >= 80 ? '🎉 잘했어요!' : pct >= 60 ? '👍 괜찮아요!' : '💪 한 번 더!'}</div>
          </div>
          <div class="mt-24 flex gap-8" style="justify-content:center">
            <button class="btn btn-secondary" id="btn-retry">다시 도전</button>
            <button class="btn btn-primary" id="btn-done-quiz">완료</button>
          </div>
        </div>
      `;

      document.getElementById('btn-retry')?.addEventListener('click', () => {
        quizScore = 0;
        quizIndex = 0;
        quizAnswered = false;
        quizWords = shuffleArray(vocab);
        render();
      });

      document.getElementById('btn-done-quiz')?.addEventListener('click', () => {
        store.saveVocabComplete(round);
        window.location.hash = `#/round/${round}`;
      });

      document.getElementById('tab-flashcard')?.addEventListener('click', () => {
        mode = 'flashcard';
        currentIndex = 0;
        isFlipped = false;
        render();
      });
      return;
    }

    const current = quizWords[quizIndex];
    const choices = getQuizChoices(current);

    container.innerHTML = `
      <div class="vocab-container">
        <div class="vocab-tabs">
          <button class="vocab-tab" id="tab-flashcard">플래시카드</button>
          <button class="vocab-tab active" id="tab-quiz">단어 퀴즈</button>
        </div>
        <div class="quiz-score">
          <span>${quizIndex + 1} / ${quizWords.length}</span> · 
          <span>맞힘: ${quizScore}</span>
        </div>
        <div class="vocab-quiz mt-12">
          <div class="quiz-prompt">
            <div class="quiz-instruction">이 단어의 뜻은?</div>
            <div class="quiz-word">${current.word}</div>
          </div>
          <div class="quiz-choices mt-12">
            ${choices.map((c, i) => `
              <button class="quiz-choice" data-word="${c.word}" id="quiz-choice-${i}">
                <span class="quiz-choice-marker">${['①','②','③','④'][i]}</span>
                <span class="quiz-choice-text">${c.meaning || '?'}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Speak the quiz word
    speak(current.word);

    document.querySelectorAll('.quiz-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;

        const selected = btn.dataset.word;
        const isCorrect = selected === current.word;

        if (isCorrect) {
          quizScore++;
          btn.classList.add('correct');
          playCorrectSfx();
        } else {
          btn.classList.add('wrong');
          playWrongSfx();
          // Highlight correct
          document.querySelectorAll('.quiz-choice').forEach(b => {
            if (b.dataset.word === current.word) b.classList.add('correct');
          });
        }

        setTimeout(() => {
          quizIndex++;
          quizAnswered = false;
          render();
        }, 1200);
      });
    });

    document.getElementById('tab-flashcard')?.addEventListener('click', () => {
      mode = 'flashcard';
      currentIndex = 0;
      isFlipped = false;
      render();
    });

    attachKeyboard('quiz');
  }

  let keyHandler = null;
  function attachKeyboard(currentMode) {
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (currentMode === 'flashcard') {
        if (e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('btn-prev')?.click(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); document.getElementById('btn-next')?.click(); }
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          isFlipped = !isFlipped;
          const card = document.getElementById('flashcard');
          if (card) card.classList.toggle('flipped');
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          document.getElementById('speak-front')?.click();
          document.getElementById('speak-back')?.click();
        }
        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); document.getElementById('btn-shuffle')?.click(); }
      }

      if (currentMode === 'quiz') {
        if (['1','2','3','4'].includes(e.key)) {
          e.preventDefault();
          document.getElementById(`quiz-choice-${parseInt(e.key) - 1}`)?.click();
        }
      }
    };
    document.addEventListener('keydown', keyHandler);
    window._vocabKeyHandler = keyHandler;
  }

  render();
}
