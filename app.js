const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static')
const { execFile, exec, spawn } = require('child_process');
const ffmpeg_probe = require('@andrkrn/ffprobe-static');
const upload = multer({ dest: 'uploads/'});
const app = express();
const fs = require('fs'); 

app.use(express.static('./public'))
app.post('/convert', upload.single('video'), function(req, res) {
    if (!req.file) {
        res.status(400).send("No file uploaded!");
        return;
    }
    console.log(req.file)
    console.log(res.body)
    const inputPath = req.file.path
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
        // Gif pallete
        const gifPalleteGeneratePath = `uploads/palette-${req.file.filename}.png`;
        execFile(ffmpegPath, ['-i', inputPath, '-vf', `scale=${FinalWidth}:${FinalHeight}, palettegen`, gifPalleteGeneratePath], function(error, stdout, stdeer) {
            console.log("PALETTE ERROR: ", error);

        // Normal convert
        execFile(ffmpegPath, ['-i', inputPath, '-i', gifPalleteGeneratePath, '-filter_complex', `scale=${FinalWidth}:${FinalHeight}[x];[x][1:v]paletteuse`, outputfile], function(error, stdout, stderr) {
            console.log(error)
            console.log("FFMPEG ERROR:", error);
            console.log("FFMPEG STDERR:", stderr);
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
});


app.listen(3003, () => {
    console.log("Active: Port 3003")
})