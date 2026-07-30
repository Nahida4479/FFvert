const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static')
const { execFile } = require('child_process');
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

    execFile(ffmpeg_probe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', inputPath], function(error, stdout, stderr) {
        console.log("PROBE ERROR:", error);
        console.log("PROBE STDOUT:", stdout);
        const probeData = JSON.parse(stdout);
        const originalWidth = probeData.streams[0].width
        const originalHeight = probeData.streams[0].height
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

        execFile(ffmpegPath, ['-i', inputPath, '-vf', `scale=${FinalWidth}:${FinalHeight}`, outputfile], function(error, stdout, stderr) {
        console.log(error)
        console.log("FFMPEG ERROR:", error);
        console.log("FFMPEG STDERR:", stderr);
        res.download(outputfile);

        fs.unlink(inputPath, function(err) {
            if (err) console.log("Failed to delete input file", err);
        });
    });

    setTimeout(function() {
    fs.unlink(outputfile, function(err) {
        if (err) console.log("Failed to delete output file:", err);
    });
    }, 60000);

});


});

app.listen(3003, () => {
    console.log("Active: Port 3003")
})