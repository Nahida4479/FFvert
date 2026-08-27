const youtubedl = require('youtube-dl-exec');
const ffmpegPath = require('ffmpeg-static');
const crypto = require(`crypto`);

async function downloadVideo(url, resolution) {
    const height = resolution.replace('p', '');

    const outputPath = `uploads/ytfile-FFvert-${crypto.randomUUID()}.%(ext)s`;
    
    await youtubedl(url, {
        output: outputPath,
        format: `bv*[height<=${height}]+ba/b`,
        mergeOutputFormat: 'mp4',
        ffmpegLocation: ffmpegPath
    });

    return outputPath.replace('%(ext)s', 'mp4');
}


module.exports = {downloadVideo}