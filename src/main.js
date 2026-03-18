// Main Entry Point - Router & App Shell
import { store } from './store.js';
import { renderHome, renderRoundDetail } from './home.js';
import { renderVocab } from './vocab.js';
import { renderTest } from './test.js';
import { renderDictation } from './dictation.js';
import { renderResults } from './results.js';

const main = document.getElementById('app-main');
const breadcrumb = document.getElementById('nav-breadcrumb');

// --- Data Loading ---
const dataCache = {};

export async function loadRoundData(round) {
  if (dataCache[round]) return dataCache[round];
  try {
    const res = await fetch(`/data/round${round}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    dataCache[round] = data;
    return data;
  } catch {
    return null;
  }
}

// --- Router ---
function parseRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  return { path: parts[0] || 'home', params: parts.slice(1) };
}

function setBreadcrumb(items) {
  breadcrumb.innerHTML = items
    .map((item, i) => {
      if (i === items.length - 1) {
        return `<span class="current">${item.label}</span>`;
      }
      return `<a href="${item.href}">${item.label}</a><span class="sep">›</span>`;
    })
    .join('');
}

async function navigate() {
  const { path, params } = parseRoute();
  main.innerHTML = '';
  main.style.animation = 'none';
  main.offsetHeight; // trigger reflow
  main.style.animation = 'fadeIn 0.3s ease';

  switch (path) {
    case 'home':
    default:
      setBreadcrumb([{ label: '홈' }]);
      renderHome(main);
      break;

    case 'round': {
      const round = parseInt(params[0]);
      setBreadcrumb([
        { label: '홈', href: '#/' },
        { label: `${round}회` },
      ]);
      renderRoundDetail(main, round);
      break;
    }

    case 'vocab': {
      const round = parseInt(params[0]);
      setBreadcrumb([
        { label: '홈', href: '#/' },
        { label: `${round}회`, href: `#/round/${round}` },
        { label: '어휘 학습' },
      ]);
      const data = await loadRoundData(round);
      renderVocab(main, round, data);
      break;
    }

    case 'test': {
      const round = parseInt(params[0]);
      setBreadcrumb([
        { label: '홈', href: '#/' },
        { label: `${round}회`, href: `#/round/${round}` },
        { label: '듣기 모의고사' },
      ]);
      const data = await loadRoundData(round);
      renderTest(main, round, data);
      break;
    }

    case 'dictation': {
      const round = parseInt(params[0]);
      setBreadcrumb([
        { label: '홈', href: '#/' },
        { label: `${round}회`, href: `#/round/${round}` },
        { label: '받아쓰기' },
      ]);
      const data = await loadRoundData(round);
      renderDictation(main, round, data);
      break;
    }

    case 'results': {
      const round = parseInt(params[0]);
      setBreadcrumb([
        { label: '홈', href: '#/' },
        { label: `${round}회`, href: `#/round/${round}` },
        { label: '결과' },
      ]);
      const data = await loadRoundData(round);
      renderResults(main, round, data);
      break;
    }
  }
}

// Setup
window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);
