const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static')
const { execFile } = require('child_process');
const ffmpeg_probe = require('@andrkrn/ffprobe-static');
const upload = multer({ dest: 'uploads/'});
const app = express();


app.use(express.static('./public'))
app.post('/convert', upload.single('video'), function(req, res) {
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

        execFile(ffmpegPath, ['-i', inputPath, outputfile], function(error, stdout, stderr) {
        console.log(error)
        res.send('Plik odebrany!');
    });

});


});

app.listen(3003, () => {
    console.log("Active: Port 3003")
})