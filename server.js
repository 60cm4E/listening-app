// Production server - serves built app + audio files from D: drive
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const AUDIO_BASE = 'D:/안티그래비티 작업물/능률 초등영어 듣기 모의고사/4학년/1학기';
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': getMime(filePath),
    'Content-Length': stat.size,
    'Cache-Control': 'public, max-age=86400',
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function handleAudio(url, res) {
  let filePath = '';

  // /audio/q/{round}/{question}
  const qMatch = url.match(/^\/audio\/q\/(\d+)\/(\d+)$/);
  if (qMatch) {
    const round = parseInt(qMatch[1]);
    const question = parseInt(qMatch[2]);
    const rr = String(round).padStart(2, '0');
    const qq = String(question).padStart(2, '0');
    filePath = path.join(
      AUDIO_BASE,
      '능률 초등영어 듣기모의고사 10회 4-1_문항별 MP3',
      `${round}회`,
      `${rr}-${qq}.mp3`
    );
  }

  // /audio/full/{round}
  const fullMatch = url.match(/^\/audio\/full\/(\d+)$/);
  if (fullMatch) {
    const round = parseInt(fullMatch[1]);
    filePath = path.join(AUDIO_BASE, '4-1', `4-1_${round}회_문제편.mp3`);
  }

  // /audio/fast/{round}
  const fastMatch = url.match(/^\/audio\/fast\/(\d+)$/);
  if (fastMatch) {
    const round = parseInt(fastMatch[1]);
    filePath = path.join(AUDIO_BASE, '4-1', `4-1_${round}회_문제편_빠르게 듣기.mp3`);
  }

  // /audio/dict/{round}/step{n}
  const dictMatch = url.match(/^\/audio\/dict\/(\d+)\/step(\d+)$/);
  if (dictMatch) {
    const round = parseInt(dictMatch[1]);
    const step = parseInt(dictMatch[2]);
    filePath = path.join(AUDIO_BASE, '4-1', `4-1_${round}회_Dictation Step ${step}.mp3`);
  }

  // /audio/dict/{round}/step1-fast
  const dictFastMatch = url.match(/^\/audio\/dict\/(\d+)\/step1-fast$/);
  if (dictFastMatch) {
    const round = parseInt(dictFastMatch[1]);
    filePath = path.join(AUDIO_BASE, '4-1', `4-1_${round}회_Dictation Step 1_빠르게 듣기.mp3`);
  }

  if (filePath && fs.existsSync(filePath)) {
    return serveFile(filePath, res);
  }
  return false;
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  // Audio routing
  if (url.startsWith('/audio/')) {
    if (handleAudio(url, res)) return;
    res.writeHead(404);
    res.end('Audio not found');
    return;
  }

  // Static file serving from dist
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);

  if (serveFile(filePath, res)) return;

  // SPA fallback - serve index.html for all routes
  filePath = path.join(DIST_DIR, 'index.html');
  if (serveFile(filePath, res)) return;

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n  🎧 리스닝 마스터 서버 실행 중`);
  console.log(`  ➜  Local:   http://localhost:${PORT}/`);
  console.log(`  ➜  Audio:   ${AUDIO_BASE}\n`);
});
