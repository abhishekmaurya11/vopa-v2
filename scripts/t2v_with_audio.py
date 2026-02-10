#!/usr/bin/env python3
import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import wave

import torch
from diffusers import DiffusionPipeline
from diffusers.utils import export_to_video


def make_silent_wav(path: str, duration_sec: float, sample_rate: int = 22050):
    frames = int(max(duration_sec, 1.0) * sample_rate)
    with wave.open(path, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(b'\x00\x00' * frames)


def make_tts_wav(text: str, out_wav: str) -> bool:
    try:
        import pyttsx3  # type: ignore

        engine = pyttsx3.init()
        engine.setProperty('rate', 165)
        engine.save_to_file(text, out_wav)
        engine.runAndWait()
        return os.path.exists(out_wav) and os.path.getsize(out_wav) > 1024
    except Exception:
        return False


def ffprobe_duration(path: str) -> float:
    try:
        result = subprocess.run(
            [
                'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', path,
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return float(result.stdout.strip())
    except Exception:
        return 4.0


def concat_videos_ffmpeg(video_paths, out_path):
    list_path = f'{out_path}.list.txt'
    with open(list_path, 'w', encoding='utf-8') as f:
        for p in video_paths:
            f.write(f"file '{os.path.abspath(p)}'\n")

    subprocess.run(
        [
            'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', list_path,
            '-c', 'copy', out_path,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--prompt', required=True)
    parser.add_argument('--out-dir', default='generated')
    parser.add_argument('--job-id', required=True)
    parser.add_argument('--model-path', default='models/text-to-video-ms-1.7b')
    parser.add_argument('--steps', type=int, default=25)
    parser.add_argument('--frames', type=int, default=24)
    parser.add_argument('--guidance', type=float, default=9.0)
    parser.add_argument('--fps', type=int, default=8)
    parser.add_argument('--duration-seconds', type=int, default=20)
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)

    if not os.path.isdir(args.model_path):
        raise RuntimeError(
            f'Offline model folder not found: {args.model_path}. '
            'Download once, then run unlimited offline.'
        )

    base = os.path.join(args.out_dir, args.job_id)
    stitched_video = f'{base}_video_stitched.mp4'
    wav_file = f'{base}_voice.wav'
    final_video = f'{base}_final.mp4'

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    dtype = torch.float16 if device == 'cuda' else torch.float32

    steps = max(10, min(args.steps, 60))
    frames_per_chunk = max(8, min(args.frames, 64))
    guidance = max(1.0, min(args.guidance, 15.0))
    fps = max(6, min(args.fps, 24))
    target_duration = max(4, min(args.duration_seconds, 6 * 60 * 60))

    chunk_duration = frames_per_chunk / fps
    chunk_count = max(1, math.ceil(target_duration / chunk_duration))

    pipe = DiffusionPipeline.from_pretrained(
        args.model_path,
        torch_dtype=dtype,
        local_files_only=True,
    )
    pipe = pipe.to(device)
    if hasattr(pipe, 'enable_model_cpu_offload') and device == 'cuda':
        pipe.enable_model_cpu_offload()

    chunk_files = []
    for index in range(chunk_count):
        output = pipe(
            args.prompt,
            num_inference_steps=steps,
            num_frames=frames_per_chunk,
            guidance_scale=guidance,
        )
        frames = output.frames
        chunk_file = f'{base}_chunk_{index:05d}.mp4'
        export_to_video(frames, chunk_file, fps=fps)
        chunk_files.append(chunk_file)

    ffmpeg_exists = shutil.which('ffmpeg') is not None

    if len(chunk_files) == 1:
        shutil.copyfile(chunk_files[0], stitched_video)
    elif ffmpeg_exists:
        concat_videos_ffmpeg(chunk_files, stitched_video)
    else:
        # fallback when ffmpeg missing: first chunk only
        shutil.copyfile(chunk_files[0], stitched_video)

    actual_duration = ffprobe_duration(stitched_video)
    tts_ok = make_tts_wav(args.prompt, wav_file)
    if not tts_ok:
        make_silent_wav(wav_file, actual_duration)

    if ffmpeg_exists:
        subprocess.run(
            [
                'ffmpeg', '-y', '-i', stitched_video, '-i', wav_file,
                '-shortest', '-c:v', 'copy', '-c:a', 'aac', final_video,
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        shutil.copyfile(stitched_video, final_video)

    print(json.dumps({
        'ok': True,
        'video': final_video,
        'audio': wav_file,
        'tts_used': tts_ok,
        'device': device,
        'offline_mode': True,
        'target_duration': target_duration,
        'actual_duration': actual_duration,
        'chunks': chunk_count,
    }))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(json.dumps({'ok': False, 'error': str(exc)}))
        sys.exit(1)
