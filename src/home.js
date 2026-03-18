// Home Page & Round Detail
import { store } from './store.js';

export function renderHome(container) {
  const progress = store.getOverallProgress();
  const pct = Math.round(progress * 100);

  let html = `
    <div class="home-hero">
      <h1>🎧 리스닝 마스터</h1>
      <p>초등영어 듣기 모의고사 4-1</p>
    </div>
    <div class="overall-progress">
      <div class="overall-progress-label">
        <span>전체 진도율</span>
        <span>${pct}%</span>
      </div>
      <div class="overall-progress-bar">
        <div class="overall-progress-fill" style="width: ${pct}%"></div>
      </div>
    </div>
    <div class="round-grid stagger">
  `;

  for (let i = 1; i <= 10; i++) {
    const status = store.getRoundStatus(i);
    html += `
      <a href="#/round/${i}" class="round-card" id="round-card-${i}">
        <div class="round-number">${i}</div>
        <div class="round-label">${i}회 모의고사</div>
        <div class="round-progress">
          <div class="progress-dot ${status.vocab ? 'completed' : ''}" title="어휘"></div>
          <div class="progress-dot ${status.test ? 'completed' : ''}" title="듣기"></div>
          <div class="progress-dot ${status.dictation ? 'completed' : ''}" title="받아쓰기"></div>
        </div>
      </a>
    `;
  }

  html += `</div>`;

  // Legend
  html += `
    <div class="mt-16" style="display:flex;gap:16px;justify-content:center;font-size:12px;color:var(--text-muted)">
      <span style="display:flex;align-items:center;gap:4px">
        <span class="progress-dot completed" style="display:inline-block"></span> 완료
      </span>
      <span style="display:flex;align-items:center;gap:4px">
        <span class="progress-dot" style="display:inline-block"></span> 미완료
      </span>
    </div>
  `;

  container.innerHTML = html;
}

export function renderRoundDetail(container, round) {
  const status = store.getRoundStatus(round);
  const roundData = store.getRound(round);

  let testBadge = '';
  if (status.test && roundData.test) {
    const pct = Math.round((roundData.test.score / roundData.test.total) * 100);
    testBadge = `<span class="stage-badge">${pct}점</span>`;
  } else {
    testBadge = `<span class="stage-badge incomplete">미완료</span>`;
  }

  container.innerHTML = `
    <div class="stage-header">
      <h2>${round}회 모의고사</h2>
      <p>학습할 단계를 선택하세요</p>
    </div>
    <div class="stage-list stagger">
      <a href="#/vocab/${round}" class="stage-card" id="stage-vocab">
        <div class="stage-icon">📚</div>
        <div class="stage-info">
          <div class="stage-name">어휘 학습</div>
          <div class="stage-desc">핵심 단어를 먼저 익혀보세요</div>
        </div>
        <span class="stage-badge ${status.vocab ? '' : 'incomplete'}">${status.vocab ? '완료' : '미완료'}</span>
      </a>
      <a href="#/test/${round}" class="stage-card" id="stage-test">
        <div class="stage-icon">🎧</div>
        <div class="stage-info">
          <div class="stage-name">듣기 모의고사</div>
          <div class="stage-desc">문항별로 듣고 문제를 풀어보세요</div>
        </div>
        ${testBadge}
      </a>
      <a href="#/dictation/${round}" class="stage-card" id="stage-dictation">
        <div class="stage-icon">✍️</div>
        <div class="stage-info">
          <div class="stage-name">받아쓰기</div>
          <div class="stage-desc">3단계로 받아쓰기 연습하세요</div>
        </div>
        <span class="stage-badge ${status.dictation ? '' : 'incomplete'}">${status.dictation ? '완료' : '미완료'}</span>
      </a>
      <a href="#/results/${round}" class="stage-card" id="stage-results">
        <div class="stage-icon">📊</div>
        <div class="stage-info">
          <div class="stage-name">결과 & 오답 노트</div>
          <div class="stage-desc">성적과 틀린 문제를 확인하세요</div>
        </div>
      </a>
    </div>
    <div class="mt-24 text-center">
      <a href="#/" class="btn btn-secondary btn-sm">← 홈으로</a>
    </div>
  `;
}
