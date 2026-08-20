# FFvert

A simple web app for converting video files - upload a video, pick a format and resolution, and download the converted file. Conversion runs entirely on the server using FFmpeg.

## Features

- Convert videos between several common formats
- Pick a target resolution (4K down to 480p)
- Automatically keeps the original orientation - a portrait (9:16) video stays portrait, a landscape (16:9) video stays landscape
- Live progress bar during conversion
- High-quality GIF output using a custom two-pass color palette
- Drag & drop or click-to-browse file upload
- Automatic cleanup of temporary files on the server

---

## Supported video formats

| Format | Extension |
|---|---|
| GIF | `.gif` |
| QuickTime | `.mov` |
| MP3 (audio only) | `.mp3` |
| MP4 | `.mp4` |
| AVI | `.avi` |
| Matroska | `.mkv` |
| Windows Media Video | `.wmv` |

## Video resolution & orientation

Available target resolutions: **4K, 1440p, 1080p, 720p, 480p**.

---

## Supported image formats
| Format |
|---|
| `.png` |
| `.jpg`|
| `.webp` |
| `.bmp`|
| `.tiff` |
| `.ico` |
| `.qoi` |


---

## Installation

```bash
git clone https://github.com/Nahida4479/FFvert.git
cd FFvert
npm install
```

## Running the app

```bash
node app.js
```

Then open your browser at:

```
http://localhost:3003
```
