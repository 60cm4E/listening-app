// Listening Test Page
import { store } from './store.js';

// --- TTS Helper for Scripts ---
let ttsQueue = [];
let ttsSpeaking = false;
let ttsCancelled = false;

function stopTTS() {
  ttsCancelled = true;
  ttsQueue = [];
  ttsSpeaking = false;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function speakLine(text, pitch = 1, rate = 0.9) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || ttsCancelled) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    u.pitch = pitch;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

async function speakScript(scriptText, onDone) {
  if (!scriptText) { if (onDone) onDone(); return; }
  ttsCancelled = false;
  ttsSpeaking = true;

  // Parse script lines: "M: text\nW: text\nB: text\nG: text"
  const lines = scriptText.split('\\n').filter(l => l.trim());

  for (const line of lines) {
    if (ttsCancelled) break;

    let text = line.trim();
    let pitch = 1.0;

    // Detect speaker and set pitch
    if (text.match(/^[MW][\s]*:/)) {
      // M = Man (lower pitch), W = Woman (higher pitch)
      pitch = text.startsWith('M') ? 0.8 : 1.3;
      text = text.replace(/^[MW][\s]*:\s*/, '');
    } else if (text.match(/^[BG][\s]*:/)) {
      // B = Boy (medium), G = Girl (higher)
      pitch = text.startsWith('B') ? 1.0 : 1.4;
      text = text.replace(/^[BG][\s]*:\s*/, '');
    }

    if (text) {
      await speakLine(text, pitch, 0.6);
      // Small pause between lines
      if (!ttsCancelled) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  ttsSpeaking = false;
  if (onDone && !ttsCancelled) onDone();
}

// --- Question type detection & student-friendly hints ---
function getQuestionHint(q) {
  const choices = q.choices || [];
  
  // All choices are single short English words → pronunciation/sound question
  const allSingleWords = choices.every(c => c.split(' ').length <= 2 && c.length < 15 && /^[a-zA-Z\s]+$/.test(c));
  
  // Choices are sentences (longer text) → listening comprehension
  const hasSentences = choices.some(c => c.length > 20);
  
  // Choices are numbers like ①②③④ → image-based question
  const allSymbols = choices.every(c => /^[①②③④]$/.test(c.trim()));
  
  if (allSingleWords) {
    return `<div class="question-hint">💡 네 단어의 발음을 잘 듣고, <strong>첫소리가 다른 것</strong> 하나를 골라보세요!</div>`;
  } else if (allSymbols) {
    return `<div class="question-hint">💡 대화를 잘 듣고, 알맞은 <strong>그림</strong>을 골라보세요!</div>`;
  } else if (hasSentences) {
    return `<div class="question-hint">💡 대화를 잘 듣고, <strong>알맞은 답</strong>을 골라보세요!</div>`;
  }
  return '';
}

export function renderTest(container, round, data) {
  if (!data || !data.questions || data.questions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎧</div>
        <p>${round}회 문제 데이터가 없습니다.</p>
        <a href="#/round/${round}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
      </div>
    `;
    return;
  }

  const questions = data.questions;
  const totalQ = questions.length;
  let currentQ = 0;
  let answers = {};
  let showFeedback = false;
  let playCounts = {};

  function render() {
    const q = questions[currentQ];
    const qNum = q.number || currentQ + 1;
    const answered = answers[qNum] !== undefined;
    const isCorrect = answered && answers[qNum] === q.answer;
    const plays = playCounts[qNum] || 0;
    const canPlay = plays < 1;
    const isImageQ = q.imageQuestion;

    container.innerHTML = `
      <div class="test-container">
        <div class="test-progress">
          <div class="progress-bar-wrapper">
            <div class="progress-bar-fill" style="width: ${((currentQ + 1) / totalQ) * 100}%"></div>
          </div>
          <div class="progress-text">${currentQ + 1} / ${totalQ} 문항</div>
        </div>

        <div class="question-card">
          <div class="question-number">
            <span>📋 ${qNum}번</span>
            ${isImageQ ? '<span class="img-badge">🖼️ 그림문제</span>' : ''}
          </div>
          <div class="question-instruction">${q.instruction || '잘 듣고, 알맞은 것을 고르세요.'}</div>
          ${getQuestionHint(q)}

          ${isImageQ && q.questionImage ? `
            <div class="question-image-wrapper">
              <img src="${q.questionImage}" alt="${qNum}번 문제 그림" class="question-image" />
            </div>
          ` : ''}

          <div class="audio-player" id="audio-player">
            <button class="play-btn ${!canPlay && !ttsSpeaking ? 'disabled' : ''}" id="btn-play">
              ${ttsSpeaking ? '⏸' : '▶'}
            </button>
            <div class="audio-info">
              <div class="audio-title">듣기 음원</div>
              <div class="audio-status" id="audio-status">${ttsSpeaking ? '재생 중...' : canPlay ? '재생 버튼을 눌러주세요' : '재생 횟수를 모두 사용했습니다'}</div>
            </div>
            <span class="play-count">${plays}/1회</span>
          </div>

          <div class="answer-choices ${isImageQ ? 'image-choices' : ''}">
            ${q.choices.map((choice, i) => {
              const choiceNum = i + 1;
              let classes = 'answer-choice';
              if (isImageQ) classes += ' image-choice';
              if (answered && answers[qNum] === choiceNum) {
                classes += isCorrect ? ' correct selected' : ' wrong selected';
              }
              if (answered && choiceNum === q.answer && !isCorrect) {
                classes += ' correct';
              }
              if (answered) classes += ' disabled';
              return `
                <button class="${classes}" data-choice="${choiceNum}" id="choice-${choiceNum}">
                  <span class="choice-marker">${choiceNum}</span>
                  <span class="choice-text">${choice}</span>
                </button>
              `;
            }).join('')}
          </div>

          ${showFeedback && answered ? renderFeedback(q, isCorrect) : ''}
        </div>

        <div class="nav-buttons">
          <button class="btn btn-secondary" id="btn-prev-q" ${currentQ === 0 ? 'disabled' : ''}>← 이전</button>
          ${currentQ === totalQ - 1 && Object.keys(answers).length === totalQ ? `
            <button class="btn btn-success" id="btn-finish">결과 보기 →</button>
          ` : `
            <button class="btn btn-primary" id="btn-next-q" ${currentQ === totalQ - 1 ? 'disabled' : ''}>다음 →</button>
          `}
        </div>
      </div>
    `;

    attachEvents(q, qNum, canPlay);
  }

  function renderFeedback(q, isCorrect) {
    return `
      <div class="feedback-area ${isCorrect ? 'correct' : 'wrong'}">
        <div class="feedback-title">${isCorrect ? '🎉 정답!' : '😢 오답'}</div>
        ${!isCorrect ? `<div class="feedback-explanation">정답은 <strong>${q.answer}번</strong>입니다.</div>` : ''}
        ${q.script ? `
          <div class="feedback-script">
            <strong>📝 스크립트</strong><br/>
            ${q.script.replace(/\\n/g, '<br/>')}
          </div>
        ` : ''}
        ${q.explanation ? `
          <div class="feedback-explanation mt-8">
            <strong>💡 해설</strong><br/>
            ${q.explanation}
          </div>
        ` : ''}
      </div>
    `;
  }

  function attachEvents(q, qNum, canPlay) {
    // Play button
    const playBtn = document.getElementById('btn-play');
    playBtn?.addEventListener('click', () => {
      if (ttsSpeaking) {
        stopTTS();
        render();
        return;
      }

      if (!canPlay) return;
      if (!q.script) {
        const statusEl = document.getElementById('audio-status');
        if (statusEl) statusEl.textContent = '음원 스크립트가 없습니다';
        return;
      }

      playCounts[qNum] = (playCounts[qNum] || 0) + 1;
      render();

      speakScript(q.script, () => {
        render();
      });
    });

    // Choice buttons
    document.querySelectorAll('.answer-choice:not(.disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answers[qNum] !== undefined) return;
        const choice = parseInt(btn.dataset.choice);
        answers[qNum] = choice;
        showFeedback = true;

        if (ttsSpeaking) {
          stopTTS();
        }

        render();
      });
    });

    // Nav buttons
    document.getElementById('btn-prev-q')?.addEventListener('click', () => {
      if (currentQ > 0) {
        stopAudio();
        currentQ--;
        showFeedback = answers[questions[currentQ].number || currentQ + 1] !== undefined;
        render();
      }
    });

    document.getElementById('btn-next-q')?.addEventListener('click', () => {
      if (currentQ < totalQ - 1) {
        stopAudio();
        currentQ++;
        showFeedback = answers[questions[currentQ].number || currentQ + 1] !== undefined;
        render();
      }
    });

    document.getElementById('btn-finish')?.addEventListener('click', () => {
      stopAudio();
      let score = 0;
      questions.forEach(q => {
        const qn = q.number || questions.indexOf(q) + 1;
        if (answers[qn] === q.answer) score++;
      });
      store.saveTestResults(round, score, totalQ, answers);
      window.location.hash = `#/results/${round}`;
    });
  }

  function stopAudio() {
    stopTTS();
  }

  render();
}
