const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static')
const { execFile, exec, spawn } = require('child_process');
const ffmpeg_probe = require('@andrkrn/ffprobe-static');
const upload = multer({ dest: 'uploads/'});
const app = express();
const fs = require('fs');
const progressConmections = {};

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

app.use(express.static('./public'))
app.post('/convert', upload.single('video'), function(req, res) {
    if (!req.file) {
        res.status(400).send("No file uploaded!");
        return;
    }
    console.log(req.file)
    console.log(res.body)
    const inputPath = req.file.path
    const conversionId = req.body.conversionId;
    const nameParts = req.file.originalname.split('.');
    const basefileextenstion = nameParts[nameParts.length - 1];
    const outputfile = `uploads/output-${req.file.filename}.${req.body.format}`;

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

    const gifPalleteGeneratePath = `uploads/palette-${req.file.filename}.png`;
    const ffmpeg_progres_ = spawn(ffmpegPath, ['-i', inputPath, '-vf', `scale=${FinalWidth}:${FinalHeight}, palettegen`, gifPalleteGeneratePath]);

    ffmpeg_progres_.on('close', function(code) {
        console.log("PALETTE finished, code:", code);

        const ffmpeg_progres_gif = spawn(ffmpegPath, ['-i', inputPath, '-i', gifPalleteGeneratePath, '-filter_complex', `scale=${FinalWidth}:${FinalHeight}[x];[x][1:v]paletteuse`, outputfile]);

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
        const ffmpegProcess = spawn(ffmpegPath, ['-i', inputPath, '-vf', `scale=${FinalWidth}:${FinalHeight}`, outputfile]);

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


app.listen(3003, () => {
    console.log("Active: Port 3003")
})