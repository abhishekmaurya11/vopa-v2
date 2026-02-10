# VOPA v2 — Offline One-Click Text-to-Video (Auto Download + Long Duration)

Yes, now it does both:

1. **Auto download** starts when generation is done.
2. **Long duration** generation is supported by stitching many generated chunks.

## How long can it generate?

- UI accepts duration in **hours**.
- Current hard cap is **6 hours** per run (safety cap in code).
- It builds long video by generating chunk videos and concatenating them with ffmpeg.

## Offline unlimited usage

After one-time model download, generation is offline and reusable unlimited times.

Model folder used by default:

`models/text-to-video-ms-1.7b`

One-time download:

```bash
mkdir -p models
huggingface-cli download damo-vilab/text-to-video-ms-1.7b --local-dir models/text-to-video-ms-1.7b
```

Optional custom model path:

```bash
OFFLINE_MODEL_PATH=/your/local/model/folder node server.mjs
```

## Run app

```bash
node server.mjs
```

Open `http://localhost:3000`.

## Python dependencies

```bash
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install diffusers transformers accelerate safetensors imageio imageio-ffmpeg pyttsx3
```

## Notes

- The pipeline is strict offline runtime (`local_files_only=True`).
- Audio is auto-generated using offline TTS (`pyttsx3`), with silent fallback.
- `ffmpeg` is required for proper long-video chunk concatenation and audio muxing.


## Quick fix for `axios` / module errors

If you see `ERR_MODULE_NOT_FOUND: Cannot find package 'axios'` or module-type warnings, run:

```bash
npm install
npm run start
```

This repo now sets `"type": "module"` and includes `axios` in dependencies.
