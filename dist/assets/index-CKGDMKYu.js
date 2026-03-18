(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const v of i.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&n(v)}).observe(document,{childList:!0,subtree:!0});function s(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(e){if(e.ep)return;e.ep=!0;const i=s(e);fetch(e.href,i)}})();const Q="listening-master-data";function D(){try{const a=localStorage.getItem(Q);return a?JSON.parse(a):j()}catch{return j()}}function j(){return{rounds:{}}}function A(a){localStorage.setItem(Q,JSON.stringify(a))}const B={_state:D(),get state(){return this._state},getRound(a){return this._state.rounds[a]||{}},saveVocabComplete(a){this._state.rounds[a]||(this._state.rounds[a]={}),this._state.rounds[a].vocab=!0,A(this._state)},saveTestResults(a,t,s,n){this._state.rounds[a]||(this._state.rounds[a]={}),this._state.rounds[a].test={score:t,total:s,answers:n,completedAt:Date.now()},A(this._state)},saveDictationResults(a,t,s,n){this._state.rounds[a]||(this._state.rounds[a]={}),this._state.rounds[a].dictation||(this._state.rounds[a].dictation={}),this._state.rounds[a].dictation[`step${t}`]={score:s,total:n,completedAt:Date.now()},A(this._state)},getOverallProgress(){let a=0;const t=30;for(let s=1;s<=10;s++){const n=this.getRound(s);n.vocab&&a++,n.test&&a++,n.dictation&&Object.keys(n.dictation).length>=1&&a++}return a/t},getRoundStatus(a){const t=this.getRound(a);return{vocab:!!t.vocab,test:!!t.test,dictation:!!(t.dictation&&Object.keys(t.dictation).length>=1)}},reset(){this._state=j(),A(this._state)}};function W(a){const t=B.getOverallProgress(),s=Math.round(t*100);let n=`
    <div class="home-hero">
      <h1>🎧 리스닝 마스터</h1>
      <p>초등영어 듣기 모의고사 4-1</p>
    </div>
    <div class="overall-progress">
      <div class="overall-progress-label">
        <span>전체 진도율</span>
        <span>${s}%</span>
      </div>
      <div class="overall-progress-bar">
        <div class="overall-progress-fill" style="width: ${s}%"></div>
      </div>
    </div>
    <div class="round-grid stagger">
  `;for(let e=1;e<=10;e++){const i=B.getRoundStatus(e);n+=`
      <a href="#/round/${e}" class="round-card" id="round-card-${e}">
        <div class="round-number">${e}</div>
        <div class="round-label">${e}회 모의고사</div>
        <div class="round-progress">
          <div class="progress-dot ${i.vocab?"completed":""}" title="어휘"></div>
          <div class="progress-dot ${i.test?"completed":""}" title="듣기"></div>
          <div class="progress-dot ${i.dictation?"completed":""}" title="받아쓰기"></div>
        </div>
      </a>
    `}n+="</div>",n+=`
    <div class="mt-16" style="display:flex;gap:16px;justify-content:center;font-size:12px;color:var(--text-muted)">
      <span style="display:flex;align-items:center;gap:4px">
        <span class="progress-dot completed" style="display:inline-block"></span> 완료
      </span>
      <span style="display:flex;align-items:center;gap:4px">
        <span class="progress-dot" style="display:inline-block"></span> 미완료
      </span>
    </div>
  `,a.innerHTML=n}function F(a,t){const s=B.getRoundStatus(t),n=B.getRound(t);let e="";s.test&&n.test?e=`<span class="stage-badge">${Math.round(n.test.score/n.test.total*100)}점</span>`:e='<span class="stage-badge incomplete">미완료</span>',a.innerHTML=`
    <div class="stage-header">
      <h2>${t}회 모의고사</h2>
      <p>학습할 단계를 선택하세요</p>
    </div>
    <div class="stage-list stagger">
      <a href="#/vocab/${t}" class="stage-card" id="stage-vocab">
        <div class="stage-icon">📚</div>
        <div class="stage-info">
          <div class="stage-name">어휘 학습</div>
          <div class="stage-desc">핵심 단어를 먼저 익혀보세요</div>
        </div>
        <span class="stage-badge ${s.vocab?"":"incomplete"}">${s.vocab?"완료":"미완료"}</span>
      </a>
      <a href="#/test/${t}" class="stage-card" id="stage-test">
        <div class="stage-icon">🎧</div>
        <div class="stage-info">
          <div class="stage-name">듣기 모의고사</div>
          <div class="stage-desc">문항별로 듣고 문제를 풀어보세요</div>
        </div>
        ${e}
      </a>
      <a href="#/dictation/${t}" class="stage-card" id="stage-dictation">
        <div class="stage-icon">✍️</div>
        <div class="stage-info">
          <div class="stage-name">받아쓰기</div>
          <div class="stage-desc">3단계로 받아쓰기 연습하세요</div>
        </div>
        <span class="stage-badge ${s.dictation?"":"incomplete"}">${s.dictation?"완료":"미완료"}</span>
      </a>
      <a href="#/results/${t}" class="stage-card" id="stage-results">
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
  `}function C(a,t="en-US",s=.6){return new Promise(n=>{if(!window.speechSynthesis){n();return}window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(a);e.lang=t,e.rate=s,e.onend=n,e.onerror=n,window.speechSynthesis.speak(e)})}const x=typeof AudioContext<"u"?new AudioContext:typeof webkitAudioContext<"u"?new webkitAudioContext:null;function _(a,t,s="sine",n=.3){if(!x)return;x.state==="suspended"&&x.resume();const e=x.createOscillator(),i=x.createGain();e.type=s,e.frequency.value=a,i.gain.setValueAtTime(n,x.currentTime),i.gain.exponentialRampToValueAtTime(.01,x.currentTime+t),e.connect(i),i.connect(x.destination),e.start(),e.stop(x.currentTime+t)}function G(){x&&(x.state==="suspended"&&x.resume(),_(523,.15,"sine",.25),setTimeout(()=>_(659,.15,"sine",.25),100),setTimeout(()=>_(784,.3,"sine",.2),200))}function U(){x&&(x.state==="suspended"&&x.resume(),_(330,.2,"triangle",.2),setTimeout(()=>_(260,.3,"triangle",.15),150))}function J(a,t,s){if(!s||!s.vocabulary||s.vocabulary.length===0){a.innerHTML=`
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p>${t}회 어휘 데이터가 없습니다.</p>
        <a href="#/round/${t}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
      </div>
    `;return}const n=s.vocabulary;let e=0,i=!1,v="flashcard",p=0,w=0,m=!1,y=[];function L(d){const u=[...d];for(let r=u.length-1;r>0;r--){const g=Math.floor(Math.random()*(r+1));[u[r],u[g]]=[u[g],u[r]]}return u}function q(d){const u=n.filter(b=>b.word!==d.word&&b.meaning),r=L(u).slice(0,3);return L([d,...r])}function l(){v==="flashcard"?o():c()}function o(){var u,r,g,b,E,h,k;const d=n[e];a.innerHTML=`
      <div class="vocab-container">
        <div class="vocab-tabs">
          <button class="vocab-tab active" id="tab-flashcard">플래시카드</button>
          <button class="vocab-tab" id="tab-quiz">단어 퀴즈</button>
        </div>
        <div class="flashcard-wrapper" id="flashcard-wrapper">
          <div class="flashcard ${i?"flipped":""}" id="flashcard">
            <div class="flashcard-face flashcard-front">
              <div class="word">${d.word}</div>
              <button class="speak-btn" id="speak-front" aria-label="발음 듣기">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
              </button>
              <div class="hint">탭하여 뜻 확인</div>
            </div>
            <div class="flashcard-face flashcard-back">
              <div class="meaning">${d.meaning||"뜻 없음"}</div>
              <div class="word-en">${d.word}</div>
              ${d.example?`<div class="example">${d.example}</div>`:""}
              <button class="speak-btn speak-btn-back" id="speak-back" aria-label="발음 듣기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="flashcard-controls">
          <button class="btn btn-secondary btn-sm" id="btn-prev" ${e===0?"disabled":""}>← 이전</button>
          <span class="flashcard-counter">${e+1} / ${n.length}</span>
          <button class="btn btn-secondary btn-sm" id="btn-next" ${e===n.length-1?"disabled":""}>다음 →</button>
        </div>
        <div class="flashcard-controls mt-8">
          <button class="btn btn-secondary btn-sm" id="btn-shuffle">🔀 섞기</button>
        </div>
        ${e===n.length-1?`
          <div class="mt-24 text-center">
            <button class="btn btn-success btn-lg btn-full" id="btn-vocab-complete">✅ 어휘 학습 완료!</button>
          </div>
        `:""}
      </div>
    `,(u=document.getElementById("speak-front"))==null||u.addEventListener("click",f=>{f.stopPropagation(),C(d.word)}),(r=document.getElementById("speak-back"))==null||r.addEventListener("click",f=>{f.stopPropagation(),C(d.word)}),document.getElementById("flashcard").addEventListener("click",()=>{i=!i,document.getElementById("flashcard").classList.toggle("flipped"),i&&C(d.word)}),(g=document.getElementById("btn-prev"))==null||g.addEventListener("click",()=>{e>0&&(e--,i=!1,l())}),(b=document.getElementById("btn-next"))==null||b.addEventListener("click",()=>{e<n.length-1&&(e++,i=!1,l())}),(E=document.getElementById("btn-shuffle"))==null||E.addEventListener("click",()=>{const f=L(n);s.vocabulary.splice(0,s.vocabulary.length,...f),e=0,i=!1,l()}),(h=document.getElementById("tab-quiz"))==null||h.addEventListener("click",()=>{v="quiz",p=0,w=0,m=!1,y=L(n),l()}),(k=document.getElementById("btn-vocab-complete"))==null||k.addEventListener("click",()=>{B.saveVocabComplete(t),window.location.hash=`#/round/${t}`})}function c(){var r,g,b,E;if(w>=y.length){const h=Math.round(p/y.length*100);a.innerHTML=`
        <div class="vocab-container">
          <div class="vocab-tabs">
            <button class="vocab-tab" id="tab-flashcard">플래시카드</button>
            <button class="vocab-tab active" id="tab-quiz">단어 퀴즈</button>
          </div>
          <div class="score-card" style="margin-top: 20px;">
            <div class="score-number">${h}</div>
            <div class="score-label">점</div>
            <div class="score-detail">
              <span><span class="value">${p}</span>맞힘</span>
              <span><span class="value">${y.length-p}</span>틀림</span>
            </div>
            <div class="score-message">${h>=80?"🎉 잘했어요!":h>=60?"👍 괜찮아요!":"💪 한 번 더!"}</div>
          </div>
          <div class="mt-24 flex gap-8" style="justify-content:center">
            <button class="btn btn-secondary" id="btn-retry">다시 도전</button>
            <button class="btn btn-primary" id="btn-done-quiz">완료</button>
          </div>
        </div>
      `,(r=document.getElementById("btn-retry"))==null||r.addEventListener("click",()=>{p=0,w=0,m=!1,y=L(n),l()}),(g=document.getElementById("btn-done-quiz"))==null||g.addEventListener("click",()=>{B.saveVocabComplete(t),window.location.hash=`#/round/${t}`}),(b=document.getElementById("tab-flashcard"))==null||b.addEventListener("click",()=>{v="flashcard",e=0,i=!1,l()});return}const d=y[w],u=q(d);a.innerHTML=`
      <div class="vocab-container">
        <div class="vocab-tabs">
          <button class="vocab-tab" id="tab-flashcard">플래시카드</button>
          <button class="vocab-tab active" id="tab-quiz">단어 퀴즈</button>
        </div>
        <div class="quiz-score">
          <span>${w+1} / ${y.length}</span> · 
          <span>맞힘: ${p}</span>
        </div>
        <div class="vocab-quiz mt-12">
          <div class="quiz-prompt">
            <div class="quiz-instruction">이 단어의 뜻은?</div>
            <div class="quiz-word">${d.word}</div>
          </div>
          <div class="quiz-choices mt-12">
            ${u.map((h,k)=>`
              <button class="quiz-choice" data-word="${h.word}" id="quiz-choice-${k}">
                <span class="quiz-choice-marker">${["①","②","③","④"][k]}</span>
                <span class="quiz-choice-text">${h.meaning||"?"}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `,C(d.word),document.querySelectorAll(".quiz-choice").forEach(h=>{h.addEventListener("click",()=>{if(m)return;m=!0,h.dataset.word===d.word?(p++,h.classList.add("correct"),G()):(h.classList.add("wrong"),U(),document.querySelectorAll(".quiz-choice").forEach($=>{$.dataset.word===d.word&&$.classList.add("correct")})),setTimeout(()=>{w++,m=!1,l()},1200)})}),(E=document.getElementById("tab-flashcard"))==null||E.addEventListener("click",()=>{v="flashcard",e=0,i=!1,l()})}l()}let T=!1,z=!1;function R(){z=!0,T=!1,window.speechSynthesis&&window.speechSynthesis.cancel()}function K(a,t=1,s=.9){return new Promise(n=>{if(!window.speechSynthesis||z){n();return}const e=new SpeechSynthesisUtterance(a);e.lang="en-US",e.rate=s,e.pitch=t,e.onend=n,e.onerror=n,window.speechSynthesis.speak(e)})}async function N(a,t){if(!a){t&&t();return}z=!1,T=!0;const s=a.split("\\n").filter(n=>n.trim());for(const n of s){if(z)break;let e=n.trim(),i=1;e.match(/^[MW][\s]*:/)?(i=e.startsWith("M")?.8:1.3,e=e.replace(/^[MW][\s]*:\s*/,"")):e.match(/^[BG][\s]*:/)&&(i=e.startsWith("B")?1:1.4,e=e.replace(/^[BG][\s]*:\s*/,"")),e&&(await K(e,i,.6),z||await new Promise(v=>setTimeout(v,400)))}T=!1,t&&!z&&t()}function Y(a){const t=a.choices||[],s=t.every(i=>i.split(" ").length<=2&&i.length<15&&/^[a-zA-Z\s]+$/.test(i)),n=t.some(i=>i.length>20),e=t.every(i=>/^[①②③④]$/.test(i.trim()));return s?'<div class="question-hint">💡 네 단어의 발음을 잘 듣고, <strong>첫소리가 다른 것</strong> 하나를 골라보세요!</div>':e?'<div class="question-hint">💡 대화를 잘 듣고, 알맞은 <strong>그림</strong>을 골라보세요!</div>':n?'<div class="question-hint">💡 대화를 잘 듣고, <strong>알맞은 답</strong>을 골라보세요!</div>':""}function Z(a,t,s){if(!s||!s.questions||s.questions.length===0){a.innerHTML=`
      <div class="empty-state">
        <div class="empty-icon">🎧</div>
        <p>${t}회 문제 데이터가 없습니다.</p>
        <a href="#/round/${t}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
      </div>
    `;return}const n=s.questions,e=n.length;let i=0,v={},p=!1,w={},m=!1;function y(){const o=n[i],c=o.number||i+1,d=v[c]!==void 0,u=d&&v[c]===o.answer,r=w[c]||0,g=r<2,b=o.imageQuestion;a.innerHTML=`
      <div class="test-container">
        <div class="test-progress">
          <div class="progress-bar-wrapper">
            <div class="progress-bar-fill" style="width: ${(i+1)/e*100}%"></div>
          </div>
          <div class="progress-text">${i+1} / ${e} 문항</div>
        </div>

        <div class="question-card">
          <div class="question-number">
            <span>📋 ${c}번</span>
            ${b?'<span class="img-badge">🖼️ 그림문제</span>':""}
          </div>
          <div class="question-instruction">${o.instruction||"잘 듣고, 알맞은 것을 고르세요."}</div>
          ${Y(o)}

          ${b&&o.testPageImage?`
            <div class="test-page-viewer">
              <button class="btn btn-secondary btn-sm btn-full" id="btn-show-page" style="margin-bottom: 12px;">
                📄 문제지 보기 (선택지 그림 확인)
              </button>
              ${m?`
                <div class="test-page-image-wrapper">
                  <img src="${o.testPageImage}" alt="문제지 ${c}번" class="test-page-img" id="test-page-img" />
                </div>
              `:""}
            </div>
          `:""}

          <div class="audio-player" id="audio-player">
            <button class="play-btn ${!g&&!T?"disabled":""}" id="btn-play">
              ${T?"⏸":"▶"}
            </button>
            <div class="audio-info">
              <div class="audio-title">듣기 음원</div>
          <div class="audio-status" id="audio-status">${T?"재생 중...":g?"재생 버튼을 눌러주세요":"재생 횟수를 모두 사용했습니다"}</div>
            </div>
            <span class="play-count">${r}/2회</span>
          </div>

          <div class="answer-choices ${b?"image-choices":""}">
            ${o.choices.map((E,h)=>{const k=h+1;let f="answer-choice";return b&&(f+=" image-choice"),d&&v[c]===k&&(f+=u?" correct selected":" wrong selected"),d&&k===o.answer&&!u&&(f+=" correct"),d&&(f+=" disabled"),`
                <button class="${f}" data-choice="${k}" id="choice-${k}">
                  <span class="choice-marker">${k}</span>
                  <span class="choice-text">${E}</span>
                </button>
              `}).join("")}
          </div>

          ${p&&d?L(o,u):""}
        </div>

        <div class="nav-buttons">
          <button class="btn btn-secondary" id="btn-prev-q" ${i===0?"disabled":""}>← 이전</button>
          ${i===e-1&&Object.keys(v).length===e?`
            <button class="btn btn-success" id="btn-finish">결과 보기 →</button>
          `:`
            <button class="btn btn-primary" id="btn-next-q" ${i===e-1?"disabled":""}>다음 →</button>
          `}
        </div>
      </div>

      <!-- Image Modal -->
      <div class="img-modal-overlay" id="img-modal" style="display:none;">
        <div class="img-modal-content">
          <button class="img-modal-close" id="img-modal-close">✕</button>
          <img id="img-modal-img" src="" alt="문제지" />
        </div>
      </div>
    `,q(o,c,g)}function L(o,c){return`
      <div class="feedback-area ${c?"correct":"wrong"}">
        <div class="feedback-title">${c?"🎉 정답!":"😢 오답"}</div>
        ${c?"":`<div class="feedback-explanation">정답은 <strong>${o.answer}번</strong>입니다.</div>`}
        ${o.script?`
          <div class="feedback-script">
            <strong>📝 스크립트</strong><br/>
            ${o.script.replace(/\n/g,"<br/>")}
          </div>
        `:""}
        ${o.explanation?`
          <div class="feedback-explanation mt-8">
            <strong>💡 해설</strong><br/>
            ${o.explanation}
          </div>
        `:""}
      </div>
    `}function q(o,c,d){var r,g,b,E,h,k,f;(r=document.getElementById("btn-show-page"))==null||r.addEventListener("click",()=>{m=!m,y()}),(g=document.getElementById("test-page-img"))==null||g.addEventListener("click",()=>{const $=document.getElementById("img-modal"),I=document.getElementById("img-modal-img");$&&I&&(I.src=o.testPageImage,$.style.display="flex")}),(b=document.getElementById("img-modal-close"))==null||b.addEventListener("click",()=>{document.getElementById("img-modal").style.display="none"}),(E=document.getElementById("img-modal"))==null||E.addEventListener("click",$=>{$.target.id==="img-modal"&&($.target.style.display="none")});const u=document.getElementById("btn-play");u==null||u.addEventListener("click",()=>{if(T){R(),y();return}if(d){if(!o.script){const $=document.getElementById("audio-status");$&&($.textContent="음원 스크립트가 없습니다");return}w[c]=(w[c]||0)+1,y(),N(o.script,()=>{y()})}}),document.querySelectorAll(".answer-choice:not(.disabled)").forEach($=>{$.addEventListener("click",()=>{if(v[c]!==void 0)return;const I=parseInt($.dataset.choice);v[c]=I,p=!0,T&&R(),y()})}),(h=document.getElementById("btn-prev-q"))==null||h.addEventListener("click",()=>{i>0&&(l(),i--,p=v[n[i].number||i+1]!==void 0,m=!1,y())}),(k=document.getElementById("btn-next-q"))==null||k.addEventListener("click",()=>{i<e-1&&(l(),i++,p=v[n[i].number||i+1]!==void 0,m=!1,y())}),(f=document.getElementById("btn-finish"))==null||f.addEventListener("click",()=>{l();let $=0;n.forEach(I=>{const O=I.number||n.indexOf(I)+1;v[O]===I.answer&&$++}),B.saveTestResults(t,$,e,v),window.location.hash=`#/results/${t}`})}function l(){R()}y()}function X(a,t,s){if(!s||!s.dictation){a.innerHTML=`
      <div class="empty-state">
        <div class="empty-icon">✍️</div>
        <p>${t}회 받아쓰기 데이터가 없습니다.</p>
        <a href="#/round/${t}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
      </div>
    `;return}let n=1,e=0,i={},v={},p=null;function w(){return s.dictation[`step${n}`]||[]}function m(){const c=w();if(c.length===0){a.innerHTML=`
        <div class="empty-state">
          <div class="empty-icon">✍️</div>
          <p>Step ${n} 데이터가 없습니다.</p>
          <a href="#/round/${t}" class="btn btn-secondary btn-sm mt-16">← 돌아가기</a>
        </div>
      `;return}const d=c[e],u=`${n}-${e}`,r=v[u],g=i[u]||"";let b=!1;r&&(b=L(g)===L(d.answer)),a.innerHTML=`
      <div class="dict-container">
        <div class="step-selector">
          ${[1,2,3].map(E=>`
            <button class="step-btn ${n===E?"active":""}" data-step="${E}" id="step-btn-${E}">
              Step ${E} <span class="step-star">${"⭐".repeat(E)}</span>
            </button>
          `).join("")}
        </div>

        <div class="test-progress">
          <div class="progress-bar-wrapper">
            <div class="progress-bar-fill" style="width: ${(e+1)/c.length*100}%"></div>
          </div>
          <div class="progress-text">${e+1} / ${c.length}</div>
        </div>

        <div class="dict-card">
          <div class="question-number">
            <span>✍️ ${e+1}번</span>
          </div>

          <div class="audio-player" style="background: linear-gradient(135deg, #e17055, #d63031);">
            <button class="play-btn" id="btn-play-dict">
              ${p?"⏸":"▶"}
            </button>
            <div class="audio-info">
              <div class="audio-title">Step ${n} 음원</div>
              <div class="audio-status">재생 버튼을 눌러 들어보세요</div>
            </div>
          </div>

          ${d.sentence?`
            <div class="dict-sentence">${y(d.sentence)}</div>
          `:`
            <div class="dict-sentence" style="color: var(--text-muted); font-style: italic;">
              음원을 듣고 전체 문장을 써보세요
            </div>
          `}

          <div class="mt-12">
            <input 
              type="text" 
              class="dict-input ${r?b?"correct":"wrong":""}" 
              id="dict-answer-input"
              placeholder="정답을 입력하세요..." 
              value="${g}"
              ${r?"disabled":""}
              autocomplete="off"
              spellcheck="false"
            />
            ${d.hint&&!r?`<div class="dict-hint">💡 힌트: ${d.hint}</div>`:""}
            ${r&&!b?`<div class="dict-answer-reveal">정답: ${d.answer}</div>`:""}
            ${r&&b?'<div class="dict-answer-reveal" style="color: var(--success);">✅ 정답!</div>':""}
          </div>

          ${r?"":`
            <div class="mt-16">
              <button class="btn btn-primary btn-full" id="btn-check">확인</button>
            </div>
          `}
        </div>

        <div class="nav-buttons">
          <button class="btn btn-secondary" id="btn-prev-s" ${e===0?"disabled":""}>← 이전</button>
          ${e===c.length-1&&q(c)?`
            <button class="btn btn-success" id="btn-dict-finish">완료 ✅</button>
          `:`
            <button class="btn btn-primary" id="btn-next-s" ${e===c.length-1?"disabled":""}>다음 →</button>
          `}
        </div>
      </div>
    `,l(c,d,u)}function y(c){return c.replace(/___+/g,'<span class="dict-blank">______</span>')}function L(c){return c.trim().toLowerCase().replace(/[.,!?;:'"]/g,"").replace(/\s+/g," ")}function q(c){for(let d=0;d<c.length;d++)if(!v[`${n}-${d}`])return!1;return!0}function l(c,d,u){var g,b,E,h,k;document.querySelectorAll(".step-btn").forEach(f=>{f.addEventListener("click",()=>{o(),n=parseInt(f.dataset.step),e=0,m()})}),(g=document.getElementById("btn-play-dict"))==null||g.addEventListener("click",()=>{if(p){p.pause(),p.currentTime=0,p=null,m();return}const f=new Audio(`/audio/dict/${t}/step${n}`);p=f,f.addEventListener("ended",()=>{p=null,m()}),f.addEventListener("error",()=>{p=null}),f.play().catch(()=>{p=null}),m()});const r=document.getElementById("dict-answer-input");r==null||r.addEventListener("input",()=>{i[u]=r.value}),r==null||r.addEventListener("keydown",f=>{var $;f.key==="Enter"&&(($=document.getElementById("btn-check"))==null||$.click())}),(b=document.getElementById("btn-check"))==null||b.addEventListener("click",()=>{const f=(r==null?void 0:r.value)||"";i[u]=f,v[u]=!0,m()}),(E=document.getElementById("btn-prev-s"))==null||E.addEventListener("click",()=>{e>0&&(o(),e--,m())}),(h=document.getElementById("btn-next-s"))==null||h.addEventListener("click",()=>{e<c.length-1&&(o(),e++,m())}),(k=document.getElementById("btn-dict-finish"))==null||k.addEventListener("click",()=>{o();let f=0;c.forEach(($,I)=>{const O=`${n}-${I}`;L(i[O]||"")===L(c[I].answer)&&f++}),B.saveDictationResults(t,n,f,c.length),window.location.hash=`#/round/${t}`}),v[u]||r==null||r.focus()}function o(){p&&(p.pause(),p.currentTime=0,p=null)}m()}function ee(a,t,s){const n=B.getRound(t);if(!n.test){a.innerHTML=`
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>아직 모의고사를 풀지 않았습니다.</p>
        <div class="mt-16">
          <a href="#/test/${t}" class="btn btn-primary">모의고사 풀기 →</a>
        </div>
      </div>
    `;return}const{score:e,total:i,answers:v}=n.test,p=Math.round(e/i*100);let w="all";function m(l){return l>=90?"⭐⭐⭐":l>=70?"⭐⭐":l>=50?"⭐":"💪"}function y(l){return l>=90?"🎉 훌륭해요! 완벽에 가까워요!":l>=70?"👏 잘했어요! 조금만 더 노력해요!":l>=50?"👍 괜찮아요! 오답을 다시 확인해보세요.":"💪 조금 더 연습하면 잘 할 수 있어요!"}function L(){const l=(s==null?void 0:s.questions)||[];let o=l;w==="wrong"?o=l.filter(c=>{const d=c.number||l.indexOf(c)+1;return v[d]!==c.answer}):w==="correct"&&(o=l.filter(c=>{const d=c.number||l.indexOf(c)+1;return v[d]===c.answer})),a.innerHTML=`
      <div class="results-container">
        <div class="score-card">
          <div class="score-stars">${m(p)}</div>
          <div class="score-number">${p}</div>
          <div class="score-label">점</div>
          <div class="score-detail">
            <span>
              <span class="value">${e}</span>
              맞힘
            </span>
            <span>
              <span class="value">${i-e}</span>
              틀림
            </span>
            <span>
              <span class="value">${i}</span>
              전체
            </span>
          </div>
          <div class="score-message">${y(p)}</div>
        </div>

        <div class="review-filters">
          <button class="filter-btn ${w==="all"?"active":""}" data-filter="all" id="filter-all">전체 (${l.length})</button>
          <button class="filter-btn ${w==="wrong"?"active":""}" data-filter="wrong" id="filter-wrong">오답 (${i-e})</button>
          <button class="filter-btn ${w==="correct"?"active":""}" data-filter="correct" id="filter-correct">정답 (${e})</button>
        </div>

        <div class="review-list">
          ${o.length===0?`
            <div class="empty-state">
              <div class="empty-icon">🎉</div>
              <p>표시할 문항이 없습니다.</p>
            </div>
          `:o.map(c=>{const d=c.number||l.indexOf(c)+1,u=v[d],r=u===c.answer;return`
              <div class="review-item ${r?"correct":"wrong"}" id="review-${d}">
                <div class="review-header">
                  <span class="review-q-num">${d}번</span>
                  <span class="review-result ${r?"correct":"wrong"}">
                    ${r?"✅ 정답":"❌ 오답"}
                  </span>
                </div>
                <div class="review-body">
                  ${c.instruction||""}
                  <br/>
                  <span style="color: ${r?"var(--success)":"var(--danger)"}; font-weight: 600;">
                    내 답: ${u}번
                  </span>
                  ${r?"":`<span style="color: var(--success); font-weight: 600;"> · 정답: ${c.answer}번</span>`}
                </div>
                <button class="review-toggle" data-qnum="${d}" id="toggle-${d}">상세 보기 ▼</button>
                <div class="review-detail" id="detail-${d}">
                  ${c.choices?`
                    <div style="margin-bottom: 8px;">
                      ${c.choices.map((g,b)=>`
                        <div style="padding: 4px 0; ${b+1===c.answer?"color: var(--success); font-weight: 600;":""} ${b+1===u&&!r?"color: var(--danger); text-decoration: line-through;":""}">
                          ${b+1}. ${g}
                        </div>
                      `).join("")}
                    </div>
                  `:""}
                  ${c.script?`
                    <div class="feedback-script">
                      <strong>📝 스크립트</strong><br/>
                      ${c.script.replace(/\n/g,"<br/>")}
                    </div>
                  `:""}
                  ${c.explanation?`
                    <div class="feedback-explanation mt-8">
                      <strong>💡 해설</strong><br/>
                      ${c.explanation}
                    </div>
                  `:""}
                  <div class="mt-8">
                    <button class="btn btn-sm btn-secondary" data-replay="${d}" id="replay-${d}">🔊 다시 듣기</button>
                  </div>
                </div>
              </div>
            `}).join("")}
        </div>

        <div class="mt-24 flex gap-8" style="justify-content: center;">
          <a href="#/test/${t}" class="btn btn-secondary">다시 풀기</a>
          <a href="#/round/${t}" class="btn btn-primary">돌아가기</a>
        </div>
      </div>
    `,q()}function q(){document.querySelectorAll(".filter-btn").forEach(l=>{l.addEventListener("click",()=>{w=l.dataset.filter,L()})}),document.querySelectorAll(".review-toggle").forEach(l=>{l.addEventListener("click",()=>{const o=l.dataset.qnum,c=document.getElementById(`detail-${o}`);c&&(c.classList.toggle("show"),l.textContent=c.classList.contains("show")?"접기 ▲":"상세 보기 ▼")})}),document.querySelectorAll("[data-replay]").forEach(l=>{l.addEventListener("click",()=>{const o=l.dataset.replay,c=new Audio(`/audio/q/${t}/${o}`);c.play().catch(()=>{}),l.textContent="🔊 재생 중...",c.addEventListener("ended",()=>{l.textContent="🔊 다시 듣기"})})})}L()}const S=document.getElementById("app-main"),te=document.getElementById("nav-breadcrumb"),P={};async function H(a){if(P[a])return P[a];try{const t=await fetch(`/data/round${a}.json`);if(!t.ok)return null;const s=await t.json();return P[a]=s,s}catch{return null}}function se(){const t=(window.location.hash.slice(1)||"/").split("/").filter(Boolean);return{path:t[0]||"home",params:t.slice(1)}}function M(a){te.innerHTML=a.map((t,s)=>s===a.length-1?`<span class="current">${t.label}</span>`:`<a href="${t.href}">${t.label}</a><span class="sep">›</span>`).join("")}async function V(){const{path:a,params:t}=se();switch(S.innerHTML="",S.style.animation="none",S.offsetHeight,S.style.animation="fadeIn 0.3s ease",a){case"home":default:M([{label:"홈"}]),W(S);break;case"round":{const s=parseInt(t[0]);M([{label:"홈",href:"#/"},{label:`${s}회`}]),F(S,s);break}case"vocab":{const s=parseInt(t[0]);M([{label:"홈",href:"#/"},{label:`${s}회`,href:`#/round/${s}`},{label:"어휘 학습"}]);const n=await H(s);J(S,s,n);break}case"test":{const s=parseInt(t[0]);M([{label:"홈",href:"#/"},{label:`${s}회`,href:`#/round/${s}`},{label:"듣기 모의고사"}]);const n=await H(s);Z(S,s,n);break}case"dictation":{const s=parseInt(t[0]);M([{label:"홈",href:"#/"},{label:`${s}회`,href:`#/round/${s}`},{label:"받아쓰기"}]);const n=await H(s);X(S,s,n);break}case"results":{const s=parseInt(t[0]);M([{label:"홈",href:"#/"},{label:`${s}회`,href:`#/round/${s}`},{label:"결과"}]);const n=await H(s);ee(S,s,n);break}}}window.addEventListener("hashchange",V);window.addEventListener("DOMContentLoaded",V);
