import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = process.env.PORT || 3000;
const ROOT = process.cwd();
const GENERATED_DIR = path.join(ROOT, 'generated');
const PY_SCRIPT = path.join(ROOT, 'scripts', 't2v_with_audio.py');
const MODEL_PATH = process.env.OFFLINE_MODEL_PATH || path.join(ROOT, 'models', 'text-to-video-ms-1.7b');

if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

const jobs = new Map();

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
    if (body.length > 1024 * 1024) {
      reject(new Error('Payload too large.'));
      req.destroy();
    }
  });
  req.on('end', () => {
    try {
      resolve(JSON.parse(body || '{}'));
    } catch {
      reject(new Error('Invalid JSON payload.'));
    }
  });
  req.on('error', reject);
});

const renderHtml = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>One-Click Text to Long Video + Auto Download</title>
  <style>
    :root { --bg:#070b14; --panel:#0e1730; --line:#253a67; --txt:#ebf1ff; --muted:#9eb0d7; --ok:#4ade80; --err:#fb7185; --a1:#7c88ff; --a2:#61e8ff; }
    *{box-sizing:border-box}
    body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:radial-gradient(circle at top left,#162548,var(--bg) 45%);color:var(--txt)}
    .wrap{max-width:860px;margin:24px auto;padding:0 14px}
    .card{background:linear-gradient(180deg,#0e1730,#0a1328);border:1px solid var(--line);border-radius:14px;padding:16px}
    h1{margin:0 0 8px;font-size:1.5rem}
    p{margin:0 0 12px;color:var(--muted)}
    textarea,input{width:100%;padding:11px;border-radius:10px;border:1px solid #2b4170;background:#0a1224;color:var(--txt);font:inherit}
    textarea{min-height:120px;resize:vertical}
    .row{display:grid;grid-template-columns:1fr 180px;gap:10px}
    button{margin-top:12px;width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(90deg,var(--a1),var(--a2));color:#081226;font-weight:800;cursor:pointer}
    .status{margin-top:12px;font-size:.92rem}
    .status.ok{color:var(--ok)} .status.err{color:var(--err)}
    .hidden{display:none}
    video{width:100%;margin-top:12px;border-radius:10px;border:1px solid #2b4170;background:#000}
    code{background:#091127;padding:2px 6px;border-radius:6px;border:1px solid #253b67}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>One-Click Text → Long Video + Auto Download</h1>
      <p>Offline local generation. After build, your MP4 auto-downloads and is also playable below.</p>

      <div class="row">
        <textarea id="prompt" placeholder="A cinematic mountain river scene at dawn..."></textarea>
        <div>
          <label>Duration (hours)</label>
          <input id="hours" type="number" min="0.01" max="6" step="0.01" value="0.1" />
        </div>
      </div>

      <button id="goBtn">Build My Video</button>

      <div id="status" class="status"></div>
      <video id="video" class="hidden" controls></video>
      <p id="meta" class="status"></p>
      <p class="status">Model source: <code>models/text-to-video-ms-1.7b</code> (offline local folder, unlimited runs)</p>
    </div>
  </div>

  <script>
    const promptEl = document.getElementById('prompt');
    const hoursEl = document.getElementById('hours');
    const goBtn = document.getElementById('goBtn');
    const statusEl = document.getElementById('status');
    const videoEl = document.getElementById('video');
    const metaEl = document.getElementById('meta');

    const setStatus = (txt, type='') => {
      statusEl.className = ('status ' + type).trim();
      statusEl.textContent = txt;
    };

    const triggerDownload = (url, filename) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    const pollJob = async (jobId) => {
      const tick = async () => {
        const res = await fetch('/status/' + jobId);
        const data = await res.json();

        if (data.status === 'queued' || data.status === 'running') {
          setStatus('Job ' + data.status + '... ' + (data.message || ''));
          setTimeout(tick, 2500);
          return;
        }

        if (data.status === 'failed') {
          setStatus('Failed: ' + (data.error || 'Unknown error'), 'err');
          goBtn.disabled = false;
          return;
        }

        if (data.status === 'done') {
          setStatus('Done! Video ready and download started.', 'ok');
          videoEl.src = data.videoUrl;
          videoEl.classList.remove('hidden');
          metaEl.textContent = 'Device: ' + (data.device || 'unknown') + ' | Duration: ' + (data.actualDuration || 0).toFixed(1) + 's | Chunks: ' + (data.chunks || 1);
          triggerDownload(data.downloadUrl, data.fileName || 'output.mp4');
          goBtn.disabled = false;
        }
      };
      tick();
    };

    goBtn.addEventListener('click', async () => {
      const prompt = promptEl.value.trim();
      const hours = Number.parseFloat(hoursEl.value || '0.1');
      if (!prompt) {
        setStatus('Please enter prompt first.', 'err');
        return;
      }

      goBtn.disabled = true;
      videoEl.classList.add('hidden');
      videoEl.removeAttribute('src');
      metaEl.textContent = '';
      setStatus('Submitting generation job...');

      try {
        const res = await fetch('/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, hours })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Request failed');
        }
        pollJob(data.jobId);
      } catch (err) {
        setStatus(err.message || 'Unexpected error', 'err');
        goBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;

const runJob = (jobId, prompt, durationSeconds) => {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'running';
  job.message = 'Starting offline python pipeline...';

  const args = [
    PY_SCRIPT,
    '--prompt', prompt,
    '--out-dir', GENERATED_DIR,
    '--job-id', jobId,
    '--model-path', MODEL_PATH,
    '--steps', '25',
    '--frames', '24',
    '--guidance', '9',
    '--fps', '8',
    '--duration-seconds', String(durationSeconds)
  ];

  const py = spawn('python3', args, { cwd: ROOT });

  let stdout = '';
  let stderr = '';

  py.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
    job.message = 'Generating long video chunks...';
  });

  py.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  py.on('close', (code) => {
    if (code !== 0) {
      job.status = 'failed';
      job.error = stderr || stdout || `Python process exited with ${code}`;
      return;
    }

    try {
      const lines = stdout.trim().split('\n').filter(Boolean);
      const result = JSON.parse(lines[lines.length - 1]);
      if (!result.ok) {
        job.status = 'failed';
        job.error = result.error || 'Unknown generation error';
        return;
      }

      const finalPath = path.resolve(result.video);
      if (!finalPath.startsWith(GENERATED_DIR)) {
        job.status = 'failed';
        job.error = 'Invalid output path';
        return;
      }

      job.status = 'done';
      job.videoFile = path.basename(finalPath);
      job.ttsUsed = Boolean(result.tts_used);
      job.device = result.device || 'unknown';
      job.actualDuration = Number(result.actual_duration || 0);
      job.chunks = Number(result.chunks || 1);
    } catch (err) {
      job.status = 'failed';
      job.error = `Failed parsing result: ${err instanceof Error ? err.message : 'unknown'}`;
    }
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHtml());
    return;
  }

  if (req.method === 'POST' && req.url === '/generate') {
    try {
      const payload = await readJsonBody(req);
      const prompt = String(payload.prompt || '').trim();
      const hours = Number.parseFloat(String(payload.hours || '0.1'));
      const durationSeconds = Math.max(4, Math.min(Math.round((Number.isFinite(hours) ? hours : 0.1) * 3600), 6 * 3600));

      if (!prompt) {
        sendJson(res, 400, { error: 'Prompt is required.' });
        return;
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      jobs.set(jobId, {
        status: 'queued',
        prompt,
        message: 'Queued',
        createdAt: Date.now(),
        videoFile: null,
        error: null,
        ttsUsed: false,
        device: 'unknown',
        actualDuration: 0,
        chunks: 1
      });

      runJob(jobId, prompt, durationSeconds);
      sendJson(res, 202, { jobId, status: 'queued' });
      return;
    } catch (err) {
      sendJson(res, 400, { error: err instanceof Error ? err.message : 'Invalid request' });
      return;
    }
  }

  if (req.method === 'GET' && req.url.startsWith('/status/')) {
    const jobId = req.url.replace('/status/', '');
    const job = jobs.get(jobId);

    if (!job) {
      sendJson(res, 404, { error: 'Job not found' });
      return;
    }

    const videoUrl = job.videoFile ? `/generated/${encodeURIComponent(job.videoFile)}` : null;
    sendJson(res, 200, {
      status: job.status,
      message: job.message,
      error: job.error,
      videoUrl,
      downloadUrl: videoUrl,
      fileName: job.videoFile,
      ttsUsed: job.ttsUsed,
      device: job.device,
      actualDuration: job.actualDuration,
      chunks: job.chunks
    });
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/generated/')) {
    const fileName = decodeURIComponent(req.url.replace('/generated/', ''));
    const filePath = path.join(GENERATED_DIR, fileName);

    if (!filePath.startsWith(GENERATED_DIR) || !fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
