// Dictation Practice Page
import { store } from './store.js';

// --- TTS Helper for Dictation ---
function speakSentence(text, rate = 0.55) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

let isSpeaking = false;

function stopSpeaking() {
  isSpeaking = false;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function renderDictation(container, round, data) {
  if (!data || !data.dictation) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✍️</div>
        <p>${round}회 받아쓰기 데이터가 없습니다.</p>
        <a href="#/round/${round}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
      </div>
    `;
    return;
  }

  let currentStep = 1;
  let currentSentence = 0;
  let userAnswers = {};
  let checkedItems = {};

  function getStepData() {
    return data.dictation[`step${currentStep}`] || [];
  }

  function render() {
    const stepData = getStepData();

    if (stepData.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✍️</div>
          <p>Step ${currentStep} 데이터가 없습니다.</p>
          <a href="#/round/${round}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
        </div>
      `;
      return;
    }

    const item = stepData[currentSentence];
    const key = `${currentStep}-${currentSentence}`;
    const isChecked = checkedItems[key];
    const userAns = userAnswers[key] || '';
    let isCorrect = false;
    if (isChecked) {
      isCorrect = normalizeText(userAns) === normalizeText(item.answer);
    }

    container.innerHTML = `
      <div class="dict-container">
        <div class="step-selector">
          ${[1, 2, 3].map(s => `
            <button class="step-btn ${currentStep === s ? 'active' : ''}" data-step="${s}" id="step-btn-${s}">
              Step ${s} <span class="step-star">${'⭐'.repeat(s)}</span>
            </button>
          `).join('')}
        </div>

        <div class="test-progress">
          <div class="progress-bar-wrapper">
            <div class="progress-bar-fill" style="width: ${((currentSentence + 1) / stepData.length) * 100}%"></div>
          </div>
          <div class="progress-text">${currentSentence + 1} / ${stepData.length}</div>
        </div>

        <div class="dict-card">
          <div class="question-number">
            <span>✍️ ${currentSentence + 1}번</span>
          </div>

          <div class="audio-player" style="background: linear-gradient(135deg, #e17055, #d63031);">
            <button class="play-btn" id="btn-play-dict">
              ${isSpeaking ? '⏸' : '▶'}
            </button>
            <div class="audio-info">
              <div class="audio-title">Step ${currentStep} 음원 (TTS)</div>
              <div class="audio-status">${isSpeaking ? '재생 중...' : '재생 버튼을 눌러 들어보세요'}</div>
            </div>
          </div>

          ${item.sentence ? `
            <div class="dict-sentence">${highlightBlanks(item.sentence)}</div>
          ` : `
            <div class="dict-sentence" style="color: var(--text-muted); font-style: italic;">
              음원을 듣고 전체 문장을 써보세요
            </div>
          `}

          <div class="mt-12">
            <input 
              type="text" 
              class="dict-input ${isChecked ? (isCorrect ? 'correct' : 'wrong') : ''}" 
              id="dict-answer-input"
              placeholder="정답을 입력하세요..." 
              value="${userAns}"
              ${isChecked ? 'disabled' : ''}
              autocomplete="off"
              spellcheck="false"
            />
            ${item.hint && !isChecked ? `<div class="dict-hint">💡 힌트: ${item.hint}</div>` : ''}
            ${isChecked && !isCorrect ? `<div class="dict-answer-reveal">정답: ${item.answer}</div>` : ''}
            ${isChecked && isCorrect ? `<div class="dict-answer-reveal" style="color: var(--success);">✅ 정답!</div>` : ''}
          </div>

          ${!isChecked ? `
            <div class="mt-16">
              <button class="btn btn-primary btn-full" id="btn-check">확인</button>
            </div>
          ` : ''}
        </div>

        <div class="nav-buttons">
          <button class="btn btn-secondary" id="btn-prev-s" ${currentSentence === 0 ? 'disabled' : ''}>← 이전</button>
          ${currentSentence === stepData.length - 1 && allChecked(stepData) ? `
            <button class="btn btn-success" id="btn-dict-finish">완료 ✅</button>
          ` : `
            <button class="btn btn-primary" id="btn-next-s" ${currentSentence === stepData.length - 1 ? 'disabled' : ''}>다음 →</button>
          `}
        </div>
        <div class="shortcut-hints">
          <span class="shortcut-hint"><kbd>1</kbd>~<kbd>3</kbd> Step 선택</span>
          <span class="shortcut-hint"><kbd>Space</kbd> 재생</span>
          <span class="shortcut-hint"><kbd>←</kbd><kbd>→</kbd> 이전/다음</span>
          <span class="shortcut-hint"><kbd>Enter</kbd> 확인</span>
        </div>
      </div>
    `;

    attachEvents(stepData, item, key);
    attachKeyboard(stepData);
  }

  function highlightBlanks(sentence) {
    return sentence.replace(/___+/g, '<span class="dict-blank">______</span>');
  }

  function normalizeText(text) {
    return text.trim().toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ');
  }

  function allChecked(stepData) {
    for (let i = 0; i < stepData.length; i++) {
      if (!checkedItems[`${currentStep}-${i}`]) return false;
    }
    return true;
  }

  function attachEvents(stepData, item, key) {
    // Step buttons
    document.querySelectorAll('.step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        stopSpeaking();
        currentStep = parseInt(btn.dataset.step);
        currentSentence = 0;
        render();
      });
    });

    // Play audio via TTS
    document.getElementById('btn-play-dict')?.addEventListener('click', async () => {
      if (isSpeaking) {
        stopSpeaking();
        render();
        return;
      }

      // Use full answer sentence for TTS (or sentence if available)
      const textToSpeak = item.sentence 
        ? item.sentence.replace(/___+/g, item.answer)
        : item.answer;

      isSpeaking = true;
      render();

      await speakSentence(textToSpeak);
      isSpeaking = false;
      render();
    });

    // Answer input
    const input = document.getElementById('dict-answer-input');
    input?.addEventListener('input', () => {
      userAnswers[key] = input.value;
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-check')?.click();
      }
    });

    // Check button
    document.getElementById('btn-check')?.addEventListener('click', () => {
      const val = input?.value || '';
      userAnswers[key] = val;
      checkedItems[key] = true;
      render();
    });

    // Navigation
    document.getElementById('btn-prev-s')?.addEventListener('click', () => {
      if (currentSentence > 0) {
        stopSpeaking();
        currentSentence--;
        render();
      }
    });

    document.getElementById('btn-next-s')?.addEventListener('click', () => {
      if (currentSentence < stepData.length - 1) {
        stopSpeaking();
        currentSentence++;
        render();
      }
    });

    // Finish
    document.getElementById('btn-dict-finish')?.addEventListener('click', () => {
      stopSpeaking();
      let score = 0;
      stepData.forEach((_, i) => {
        const k = `${currentStep}-${i}`;
        if (normalizeText(userAnswers[k] || '') === normalizeText(stepData[i].answer)) {
          score++;
        }
      });
      store.saveDictationResults(round, currentStep, score, stepData.length);
      window.location.hash = `#/round/${round}`;
    });

    // Auto-focus input
    if (!checkedItems[key]) {
      input?.focus();
    }
  }

  let keyHandler = null;
  function attachKeyboard(stepData) {
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => {
      const input = document.getElementById('dict-answer-input');
      const isFocusedOnInput = document.activeElement === input;

      // Enter: check answer (works even when input focused)
      if (e.key === 'Enter' && isFocusedOnInput) {
        const checkBtn = document.getElementById('btn-check');
        const finishBtn = document.getElementById('btn-dict-finish');
        if (checkBtn) { e.preventDefault(); checkBtn.click(); }
        else if (finishBtn) { e.preventDefault(); finishBtn.click(); }
        return;
      }

      // Don't handle other shortcuts when typing
      if (isFocusedOnInput) return;

      // 1-3: step select
      if (['1','2','3'].includes(e.key)) {
        e.preventDefault();
        document.getElementById(`step-btn-${e.key}`)?.click();
      }
      // Space: play audio
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        document.getElementById('btn-play-dict')?.click();
      }
      // ArrowLeft: previous
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        document.getElementById('btn-prev-s')?.click();
      }
      // ArrowRight: next
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        document.getElementById('btn-next-s')?.click();
      }
    };
    document.addEventListener('keydown', keyHandler);
    window._dictKeyHandler = keyHandler;
  }

  render();
}
