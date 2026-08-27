const youtubedl = require('youtube-dl-exec');
const ffmpegPath = require('ffmpeg-static');
const crypto = require(`crypto`);
const path = require('path');
const fs = require('fs');

async function downloadVideo(url, resolution) {
const height = resolution.replace('p', '');

const outputPath = `uploads/ytfile-FFvert-${crypto.randomUUID()}.%(ext)s`;

const options = {
output: outputPath,
format: `bv*[height<=${height}]+ba/b`,
mergeOutputFormat: 'mp4',
ffmpegLocation: ffmpegPath
};

const cookiesPath = path.join(__dirname, '..', 'cook.txt');
if (fs.existsSync(cookiesPath)) {
options.cookies = cookiesPath;
}

await youtubedl(url, options);

return outputPath.replace('%(ext)s', 'mp4');
}


module.exports = {downloadVideo}