const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static')
const { execFile, exec, spawn } = require('child_process');
const ffmpeg_probe = require('@andrkrn/ffprobe-static');
const upload = multer({ dest: 'uploads/', limits: { fileSize: 2 * 1024 * 1024 * 1024}});
const app = express();
const fs = require('fs');
const progressConmections = {};
const { removeBackground } = require('@imgly/background-removal-node');
const { arrayBuffer } = require('stream/consumers');
const { downloadVideo } = require('./services/yt-dlp');
const crypto = require('crypto')

if (!fs.existsSync('uploads/')) {
    try {
    fs.mkdirSync('uploads/');
    console.log('Create folder: uploads')
} catch (err) {
    console.log('Could not create uploads folder. Check permissions.', err)
    }
}



const uploadedFiles = fs.readdirSync('uploads/');

uploadedFiles.forEach(function(fileName) {
    if (fileName !== '.gitkeep') {
        fs.unlinkSync('uploads/' + fileName);
    }
});
console.log("Cleaned up", uploadedFiles.length, "old files from uploads/");

const validVideoFormats = ['gif', 'mov', 'mp3', 'mp4', 'avi', 'mkv', 'wmv']

app.use(express.static('./public'))
app.post('/convert', upload.single('video'), function(req, res) {
    if (!req.file) {
        res.status(400).send("No file uploaded!");
        return;
    }

    if (!validVideoFormats.includes(req.body.format.toLowerCase())) {
        res.status(400).send("Unsupported format");
        return;
    }

    console.log(req.file)
    console.log(res.body)
    const inputPath = req.file.path
    const conversionId = req.body.conversionId;
    const nameParts = req.file.originalname.split('.');
    const basefileextenstion = nameParts[nameParts.length - 1];
    const outputfile = `uploads/finalfile-${req.file.filename}.${req.body.format}`;

    execFile(ffmpeg_probe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', inputPath], function(error, stdout, stderr) {
        console.log("PROBE ERROR:", error);
        console.log("PROBE STDOUT:", stdout);
        const probeData = JSON.parse(stdout);
        const originalWidth = probeData.streams[0].width
        const originalHeight = probeData.streams[0].height
        const videoDuration = Number(probeData.format.duration);
        const selectResolution = req.body.resolution.split("x")
        const selectResolutionWidth = Number(selectResolution[0]);
        const selectResolutionHeight = Number(selectResolution[1]);
        let FinalWidth;
        let FinalHeight;

        if ((originalHeight > originalWidth) ) {
            FinalWidth = selectResolutionHeight;
            FinalHeight = selectResolutionWidth;
        } else {
            FinalWidth = selectResolutionWidth;
            FinalHeight = selectResolutionHeight
        }


        if (req.body.format === "gif") {
    if (progressConmections[conversionId]) {
        progressConmections[conversionId].write(`data: Generating Color Palette\n\n`);
    }

    let palleteFilter;
    if (req.body.resolution === 'default') {
        palleteFilter = 'palettegen'
    } else {
        palleteFilter = `scale=${FinalWidth}:${FinalHeight}, palettegen`
    }

    const gifPalleteGeneratePath = `uploads/palette-${req.file.filename}.png`;
    const ffmpeg_progres_ = spawn(ffmpegPath, ['-i', inputPath, '-vf', palleteFilter, gifPalleteGeneratePath]);

    ffmpeg_progres_.on('close', function(code) {
        console.log("PALETTE finished, code:", code);
        let useFilter;

        if(req.body.resolution === 'default') {
            useFilter = '[0:v][1:v]paletteuse';
        } else {
            useFilter = `scale=${FinalWidth}:${FinalHeight}[x];[x][1:v]paletteuse`;
        }

        const ffmpeg_progres_gif = spawn(ffmpegPath, ['-i', inputPath, '-i', gifPalleteGeneratePath, '-filter_complex', useFilter, outputfile]);
        
        ffmpeg_progres_gif.stderr.on('data', function(chunk) {
            const match = chunk.toString().match(/time=(\d+):(\d+):(\d+\.\d+)/);
            if (match) {
                const currentSeconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
                const convertProgressPercent = (currentSeconds / videoDuration) * 100;
                if (progressConmections[conversionId]) {
                    progressConmections[conversionId].write(`data: ${convertProgressPercent.toFixed(1)}\n\n`);
                }
            }
        });

        ffmpeg_progres_gif.on('close', function(code2) {
            console.log('FFmpeg GIF finished, code:', code2);
            res.download(outputfile);

            fs.unlink(inputPath, function(err) {
                if (err) console.log("Failed to delete input file", err);
            });

            fs.unlink(gifPalleteGeneratePath, function(err) {
                if (err) console.log("Failed to delete palette file", err);
            });

            setTimeout(function() {
                fs.unlink(outputfile, function(err) {
                    if (err) console.log("Failed to delete output file:", err);
                });
            }, 60000);
        });
    });
    } else {
        let ffmpegArgs = ['-i', inputPath]

        if(req.body.resolution === 'default') {
            ffmpegArgs.push(outputfile)
        } else {
            ffmpegArgs.push('-vf', `scale=${FinalWidth}:${FinalHeight}`, outputfile)
        }
        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        ffmpegProcess.stderr.on('data', function(chunk) {
            console.log('LIVE CHUNK:', chunk.toString());
            const match = chunk.toString().match(/time=(\d+):(\d+):(\d+\.\d+)/);
            if (match) {
            console.log(match);
            const currentSeconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
            const convertProgressPercent = (currentSeconds / videoDuration) * 100;
            console.log("Progress:", convertProgressPercent.toFixed(1) + "%");


            if (progressConmections[conversionId]) {
                progressConmections[conversionId].write(`data: ${convertProgressPercent.toFixed(1)}\n\n`);
            }
            }
        });

        ffmpegProcess.on('close', function(code) {
        console.log('FFmpeg finished, code:', code);
        res.download(outputfile);

        fs.unlink(inputPath, function(err) {
            if (err) console.log("Failed to delete input file", err);

            setTimeout(function() {
            fs.unlink(outputfile, function(err) {
                if (err) console.log("Failed to delete output file:", err);
            });
            }, 60000);
        });
    }); 
}

});


});

app.get('/progress/:conversionId', function(req, res) {
    const conversionId = req.params.conversionId;
    console.log("New SSE connection for:", conversionId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    progressConmections[conversionId] = res;
});


const validImageFormats = ['png', 'jpg', 'webp', 'bmp', 'tiff', 'ico', 'qoi']

app.post('/convert-image', upload.single('image'), function(req, res) {
    if (!req.file) {
        req.status(400).send("No file uploaded!")
        return;
    }

    const targetFormat = req.body.format;
    const inputPath = req.file.path;
    const outputFile = `uploads/finalfile-${req.file.filename}.${targetFormat}`;

    if (targetFormat === 'removebackground') {
        console.time('pobieranie');
    removeBackground(inputPath, {
        progress: (key, current, total) => {
            console.log(`Pobieranie ${key}: ${current} / ${total}`);
        }
    }).then((blob) => {
        console.timeEnd('pobieranie');
        return blob.arrayBuffer();
    }).then((arrayBuffer) => {
        const buffer = Buffer.from(arrayBuffer);
        res.set('Content-Type', 'image/png');
        res.send(buffer);
        // reszta bez zmian

            fs.unlink(inputPath, (err) => {
                if (err) console.log("Failed to delete input file" , err);
            });
        }).catch((err) => {
            console.log('Background removal failed', err)
            res.status(500).send("Background removal failed")
        })

    } else {
    let ffmpegArgs = ['-i', inputPath];

    if (req.body.resolution && req.body.resolution !== 'default') {
        const [targetWidth, targetHeigt] = req.body.resolution.split('x');
        ffmpegArgs.push('-vf', `scale=${targetWidth}:${targetHeigt}`);
    }

    if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
        ffmpegArgs.push('-pix_fmt', 'yuvj420p');
    }

    ffmpegArgs.push(outputFile);

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

    let ffmpegStderr = '';
    ffmpegProcess.stderr.on('data', (chunk) => {
        ffmpegStderr += chunk.toString();
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`FFmpeg image conversion finished ${code}`);

        if (code !== 0) {
            console.log('FFmpeg stderr:', ffmpegStderr);
            res.status(500).send("Conversion failed: This format combination might not be supported.")
        } else {
            res.download(outputFile)
        }
    

        fs.unlink(inputPath, (err) => {
            if (err) console.log("Failed to delete input file", err);
        });

        setTimeout(() => {
            fs.unlink(outputFile, (err) => {
                if (err) console.log('Failed to delete output file', err);
            });
        }, 60000)
    }) 

}
});

const validYtFormats = ['mp4', 'mp3', 'mov', 'gif', 'mkv', 'webm', 'aac', 'm4a', 'flac', 'wav', 'opus', 'vorbis']

app.post(`/download-youtube`, upload.none(), async function (req, res) {
    if (!validYtFormats.includes(req.body.format.toLowerCase())) {
        res.status(400).send('Unsupported format');
        return;
    }
    const link = req.body.link;
    const format = req.body.format;
    const resolution = req.body.resolution;
    const conversionId = req.body.conversionId;

    if (progressConmections[conversionId]) {
        progressConmections[conversionId].write(`data: Your video is downloading, please wait...\n\n`)
    }

    try {
    console.log(`Start downloading`)
    const downloadedPath = await downloadVideo(link, resolution);
    console.log(`Download finished`, downloadedPath)
    const outputfile = `uploads/FFvert-${crypto.randomUUID()}.${req.body.format}`

     execFile(ffmpeg_probe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', downloadedPath], function(error, stdout, stderr) {
        console.log("PROBE ERROR:", error);
        console.log("PROBE STDOUT:", stdout);
        const probeData = JSON.parse(stdout);
        const originalWidth = probeData.streams[0].width
        const originalHeight = probeData.streams[0].height
        const videoDuration = Number(probeData.format.duration);
       


        if (req.body.format === "gif") {
    if (progressConmections[conversionId]) {
        progressConmections[conversionId].write(`data: Generating Color Palette\n\n`);
    } 

    let palleteFilter = 'palettegen';
    const gifPalleteGeneratePath = `uploads/palette-${crypto.randomUUID()}.png`;
    const ffmpeg_progres_ = spawn(ffmpegPath, ['-i', downloadedPath, '-vf', palleteFilter, gifPalleteGeneratePath]);

    ffmpeg_progres_.on('close', function(code) {
        console.log("PALETTE finished, code:", code);
        let useFilter = '[0:v][1:v]paletteuse';
        const ffmpeg_progres_gif = spawn(ffmpegPath, ['-i', downloadedPath, '-i', gifPalleteGeneratePath, '-filter_complex', useFilter, outputfile]);
        
        ffmpeg_progres_gif.stderr.on('data', function(chunk) {
            const match = chunk.toString().match(/time=(\d+):(\d+):(\d+\.\d+)/);
            if (match) {
                const currentSeconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
                const convertProgressPercent = (currentSeconds / videoDuration) * 100;
                if (progressConmections[conversionId]) {
                    progressConmections[conversionId].write(`data: ${convertProgressPercent.toFixed(1)}\n\n`);
                }
            }
        });

        ffmpeg_progres_gif.on('close', function(code2) {
            console.log('FFmpeg GIF finished, code:', code2);
            res.download(outputfile);

            fs.unlink(downloadedPath, function(err) {
                if (err) console.log("Failed to delete input file", err);
            });

            fs.unlink(gifPalleteGeneratePath, function(err) {
                if (err) console.log("Failed to delete palette file", err);
            });

            setTimeout(function() {
                fs.unlink(outputfile, function(err) {
                    if (err) console.log("Failed to delete output file:", err);
                });
            }, 60000);
        });
    });
    } else {
        let ffmpegArgs = ['-i', downloadedPath]

            ffmpegArgs.push(outputfile)
        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        ffmpegProcess.stderr.on('data', function(chunk) {
            console.log('LIVE CHUNK:', chunk.toString());
            const match = chunk.toString().match(/time=(\d+):(\d+):(\d+\.\d+)/);
            if (match) {
            console.log(match);
            const currentSeconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
            const convertProgressPercent = (currentSeconds / videoDuration) * 100;
            console.log("Progress:", convertProgressPercent.toFixed(1) + "%");


            if (progressConmections[conversionId]) {
                progressConmections[conversionId].write(`data: ${convertProgressPercent.toFixed(1)}\n\n`);
            }
            }
        });

        ffmpegProcess.on('close', function(code) {
        console.log('FFmpeg finished, code:', code);
        res.download(outputfile);

        fs.unlink(downloadedPath, function(err) {
            if (err) console.log("Failed to delete input file", err);

            setTimeout(function() {
            fs.unlink(outputfile, function(err) {
                if (err) console.log("Failed to delete output file:", err);
            });
            }, 60000);
        });
    }); 
}
})
    } catch (err) {
        console.log(`Download/conversion error:`, err);
        res.status(500).send(`Something went wrong.`);
    }
})

app.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send("File is too large. Maximum size is 2GB.");
    }
    next(err)
})

app.listen(3003, () => {
    console.log("Active: Port 3003")
})  