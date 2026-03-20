// State Management - localStorage wrapper
const STORAGE_KEY = 'listening-master-data';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

function getDefaultState() {
  return {
    rounds: {}, // { "1": { vocab: true, test: { score: 12, total: 15, answers: {...} }, dictation: {...} } }
  };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const store = {
  _state: loadState(),

  get state() {
    return this._state;
  },

  // Get round progress
  getRound(roundNum) {
    return this._state.rounds[roundNum] || {};
  },

  // Save vocab completion
  saveVocabComplete(roundNum) {
    if (!this._state.rounds[roundNum]) this._state.rounds[roundNum] = {};
    this._state.rounds[roundNum].vocab = true;
    saveState(this._state);
  },

  // Save test results
  saveTestResults(roundNum, score, total, answers) {
    if (!this._state.rounds[roundNum]) this._state.rounds[roundNum] = {};
    this._state.rounds[roundNum].test = { score, total, answers, completedAt: Date.now() };
    saveState(this._state);
  },

  // Save dictation results
  saveDictationResults(roundNum, step, score, total) {
    if (!this._state.rounds[roundNum]) this._state.rounds[roundNum] = {};
    if (!this._state.rounds[roundNum].dictation) this._state.rounds[roundNum].dictation = {};
    this._state.rounds[roundNum].dictation[`step${step}`] = { score, total, completedAt: Date.now() };
    saveState(this._state);
  },

  // Get overall progress (0-1)
  getOverallProgress() {
    let completed = 0;
    const totalStages = 10 * 3; // 10 rounds × 3 stages (vocab, test, dictation)
    for (let i = 1; i <= 10; i++) {
      const round = this.getRound(i);
      if (round.vocab) completed++;
      if (round.test) completed++;
      if (round.dictation && Object.keys(round.dictation).length >= 3) completed++;
    }
    return completed / totalStages;
  },

  // Get round completion status (for progress dots)
  getRoundStatus(roundNum) {
    const round = this.getRound(roundNum);
    return {
      vocab: !!round.vocab,
      test: !!round.test,
      dictation: !!(round.dictation && Object.keys(round.dictation).length >= 3),
    };
  },

  // Clear all data
  reset() {
    this._state = getDefaultState();
    saveState(this._state);
  },
};
