// Results & Review Page
import { store } from './store.js';

export function renderResults(container, round, data) {
  const roundState = store.getRound(round);

  if (!roundState.test) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>아직 모의고사를 풀지 않았습니다.</p>
        <div class="mt-16">
          <a href="#/test/${round}" class="btn btn-primary">모의고사 풀기 →</a>
        </div>
      </div>
    `;
    return;
  }

  const { score, total, answers } = roundState.test;
  const pct = Math.round((score / total) * 100);
  let filter = 'all'; // 'all' | 'wrong' | 'correct'

  function getStars(pct) {
    if (pct >= 90) return '⭐⭐⭐';
    if (pct >= 70) return '⭐⭐';
    if (pct >= 50) return '⭐';
    return '💪';
  }

  function getMessage(pct) {
    if (pct >= 90) return '🎉 훌륭해요! 완벽에 가까워요!';
    if (pct >= 70) return '👏 잘했어요! 조금만 더 노력해요!';
    if (pct >= 50) return '👍 괜찮아요! 오답을 다시 확인해보세요.';
    return '💪 조금 더 연습하면 잘 할 수 있어요!';
  }

  function render() {
    const questions = data?.questions || [];

    let filteredQuestions = questions;
    if (filter === 'wrong') {
      filteredQuestions = questions.filter(q => {
        const qNum = q.number || questions.indexOf(q) + 1;
        return answers[qNum] !== q.answer;
      });
    } else if (filter === 'correct') {
      filteredQuestions = questions.filter(q => {
        const qNum = q.number || questions.indexOf(q) + 1;
        return answers[qNum] === q.answer;
      });
    }

    container.innerHTML = `
      <div class="results-container">
        <div class="score-card">
          <div class="score-stars">${getStars(pct)}</div>
          <div class="score-number">${pct}</div>
          <div class="score-label">점</div>
          <div class="score-detail">
            <span>
              <span class="value">${score}</span>
              정답
            </span>
            <span>
              <span class="value">${total - score}</span>
              오답
            </span>
            <span>
              <span class="value">${total}</span>
              전체
            </span>
          </div>
          <div class="score-message">${getMessage(pct)}</div>
        </div>

        <div class="review-filters">
          <button class="filter-btn ${filter === 'all' ? 'active' : ''}" data-filter="all" id="filter-all">전체 (${questions.length})</button>
          <button class="filter-btn ${filter === 'wrong' ? 'active' : ''}" data-filter="wrong" id="filter-wrong">오답 (${total - score})</button>
          <button class="filter-btn ${filter === 'correct' ? 'active' : ''}" data-filter="correct" id="filter-correct">정답 (${score})</button>
        </div>

        <div class="review-list">
          ${filteredQuestions.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🎉</div>
              <p>표시할 문항이 없습니다.</p>
            </div>
          ` : filteredQuestions.map(q => {
            const qNum = q.number || questions.indexOf(q) + 1;
            const userAns = answers[qNum];
            const isCorrect = userAns === q.answer;
            return `
              <div class="review-item ${isCorrect ? 'correct' : 'wrong'}" id="review-${qNum}">
                <div class="review-header">
                  <span class="review-q-num">${qNum}번</span>
                  <span class="review-result ${isCorrect ? 'correct' : 'wrong'}">
                    ${isCorrect ? '✅ 정답' : '❌ 오답'}
                  </span>
                </div>
                <div class="review-body">
                  ${q.instruction || ''}
                  <br/>
                  <span style="color: ${isCorrect ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                    내 답: ${userAns}번
                  </span>
                  ${!isCorrect ? `<span style="color: var(--success); font-weight: 600;"> · 정답: ${q.answer}번</span>` : ''}
                </div>
                <button class="review-toggle" data-qnum="${qNum}" id="toggle-${qNum}">상세 보기 ▼</button>
                <div class="review-detail" id="detail-${qNum}">
                  ${q.choices ? `
                    <div style="margin-bottom: 8px;">
                      ${q.choices.map((c, i) => `
                        <div style="padding: 4px 0; ${i + 1 === q.answer ? 'color: var(--success); font-weight: 600;' : ''} ${i + 1 === userAns && !isCorrect ? 'color: var(--danger); text-decoration: line-through;' : ''}">
                          ${i + 1}. ${c}
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  ${q.script ? `
                    <div class="feedback-script">
                      <strong>📝 스크립트</strong><br/>
                      ${q.script.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>')}
                    </div>
                  ` : ''}
                  ${q.explanation ? `
                    <div class="feedback-explanation mt-8">
                      <strong>💡 해설</strong><br/>
                      ${q.explanation}
                    </div>
                  ` : ''}
                  <div class="mt-8">
                    <button class="btn btn-sm btn-secondary" data-replay="${qNum}" id="replay-${qNum}">🔊 다시 듣기</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="mt-24 flex gap-8" style="justify-content: center;">
          <a href="#/test/${round}" class="btn btn-secondary">다시 풀기</a>
          <a href="#/round/${round}" class="btn btn-primary">돌아가기</a>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filter = btn.dataset.filter;
        render();
      });
    });

    // Toggle details
    document.querySelectorAll('.review-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const qNum = btn.dataset.qnum;
        const detail = document.getElementById(`detail-${qNum}`);
        if (detail) {
          detail.classList.toggle('show');
          btn.textContent = detail.classList.contains('show') ? '접기 ▲' : '상세 보기 ▼';
        }
      });
    });

    // Replay buttons
    document.querySelectorAll('[data-replay]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qNum = btn.dataset.replay;
        const audio = new Audio(`/audio/q/${round}/${qNum}`);
        audio.play().catch(() => {
          btn.textContent = '⚠️ 음원 없음';
          btn.style.opacity = '0.5';
        });
        btn.textContent = '🔊 재생 중...';
        audio.addEventListener('ended', () => {
          btn.textContent = '🔊 다시 듣기';
        });
        audio.addEventListener('error', () => {
          btn.textContent = '⚠️ 음원 없음';
          btn.style.opacity = '0.5';
        });
      });
    });
  }

  render();
}
