import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const AUDIO_BASE = 'D:/안티그래비티 작업물/능률 초등영어 듣기 모의고사/4학년/1학기';

function audioMiddlewarePlugin() {
  return {
    name: 'serve-audio',
    configureServer(server) {
      server.middlewares.use('/audio', (req, res, next) => {
        const url = decodeURIComponent(req.url);
        let filePath = '';

        // /audio/q/{round}/{question} → 문항별 MP3/{round}회/{RR}-{QQ}.mp3
        const qMatch = url.match(/^\/q\/(\d+)\/(\d+)$/);
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

        // /audio/full/{round} → 4-1/{round}회_문제편.mp3
        const fullMatch = url.match(/^\/full\/(\d+)$/);
        if (fullMatch) {
          const round = parseInt(fullMatch[1]);
          filePath = path.join(
            AUDIO_BASE,
            '4-1',
            `4-1_${round}회_문제편.mp3`
          );
        }

        // /audio/fast/{round} → 빠르게 듣기
        const fastMatch = url.match(/^\/fast\/(\d+)$/);
        if (fastMatch) {
          const round = parseInt(fastMatch[1]);
          filePath = path.join(
            AUDIO_BASE,
            '4-1',
            `4-1_${round}회_문제편_빠르게 듣기.mp3`
          );
        }

        // /audio/dict/{round}/step{n} → Dictation Step N
        const dictMatch = url.match(/^\/dict\/(\d+)\/step(\d+)$/);
        if (dictMatch) {
          const round = parseInt(dictMatch[1]);
          const step = parseInt(dictMatch[2]);
          filePath = path.join(
            AUDIO_BASE,
            '4-1',
            `4-1_${round}회_Dictation Step ${step}.mp3`
          );
        }

        // /audio/dict/{round}/step1-fast → Dictation Step 1 빠르게
        const dictFastMatch = url.match(/^\/dict\/(\d+)\/step1-fast$/);
        if (dictFastMatch) {
          const round = parseInt(dictFastMatch[1]);
          filePath = path.join(
            AUDIO_BASE,
            '4-1',
            `4-1_${round}회_Dictation Step 1_빠르게 듣기.mp3`
          );
        }

        if (filePath && fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
          });
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  base: '/listening-app/',
  plugins: [audioMiddlewarePlugin()],
  server: {
    port: 5173,
    open: true,
  },
});
