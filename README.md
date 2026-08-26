# FFvert

A simple web app for converting video and image files, and downloading YouTube videos.

# Features

## Video Conversion

<img src="./public/image/FFvert_README.png" width="500">

| Step | 
|---|
| **1.** Upload your video file | 
| **2.** Select a video format |
| **3.** Select a video resolution | 
| **4.** Click `Convert` and wait for the conversion to finish |

---

## Image Conversion

<img src="./public/image/FFvert_image.png" width="500">

| Step | 
|---|
| **1.** Upload your image file |
| **2.** Select an image format or the `Remove background` option |
| **3.** Click `Convert` and wait for the conversion to finish | 

---

## YouTube Video Downloader

<img src="./public/image/Yt-downloader.png" width="500">

| Step |
|---|
| **1.** Paste your YouTube video link (YouTube Shorts are supported) 
| **2.** Select a format and resolution 
| **3.** Click `OK` and wait for your video file 

--- 

# Supported formats and resolutions

## FFvert video

| Format| Resolutions |
|---|---|
| `.gif` | `4k` |
| `.mov` | `1440p` |
| `.mp3` | `1080p` | 
| `.mp4` | `720p` |
| `.avi` | `480p` |
| `.mkv` |
| `.wmv` |

> **Note:** The GIF format additionally generates a color palette for better color accuracy.


## FFvert image

| Format |
|---|
| `.png` |
| `.jpg` |
| `.webp` |
| `.bmp` |
| `.tiff` |
| `.ico` |
| `.qoi` |


## YouTube Downloader 
| Format | Resolutions |
|---|---|
| `MP4` | `1440p` |
| `MP3` | `1080p` |
| `MOV` | `720p` |
| `GIF` |  `480p` |
| `MKV` | `360p` |
| `WEBM` | `240p` |
| `AAC` | `144p` |
| `M4A` | 
| `FLAC` | 
| `WAV` | 
| `OPUS` | 
| `VORBIS` |

> **Note:** The GIF format additionally generates a color palette for better color accuracy.

---

## FFvert image background removal system

The background removal system is based on the `@imgly/background-removal-node` package. The AI model `isnet_fp16` is downloaded from IMG.LY servers and runs locally.


## YouTube video downloader

The YouTube Downloader is based on the `youtube-dl-exec` package. The file is downloaded and converted using `FFmpeg` for the user-selected format and resolution.

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
`http://localhost:3003`

## Requirements

- Node.js
- Python 3.9+ (required by `youtube-dl-exec`)