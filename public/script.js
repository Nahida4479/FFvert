import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.10';
import { fetchFile, toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.1';
const ffmpeg_package = new FFmpeg();
let ffmpeg_loaded = false;

const convertbutton = document.getElementById('conbutton');
const uploadfile = document.getElementById('fileinput')
const fileformat = document.getElementById('formatselect');
const videoresolutionlist = document.getElementById('resolutionselect')
const outputdownloadbutton = document.getElementById('downloadoutput')

ffmpeg_package.on('log', ({ type, message }) =>{
    console.log(`[ffmpeg ${type}]`, message);
});

convertbutton.addEventListener('click', async function() {
    try {
    console.log("You click convert button");
    const selectconvertfile = uploadfile.files[0];

    console.log("File: ", selectconvertfile)
    console.log(`${fileformat.value}`)
    const nameFileParts = selectconvertfile.name.split('.');
    const inputFileExtension = nameFileParts[nameFileParts.length - 1]; // Extension 
    console.log("Input extension:", inputFileExtension);
    
    if (!selectconvertfile.type.startsWith('video/')) {
        console.log("This is not a video file!");
        return;
    }

    if (!ffmpeg_loaded) {
        console.log("Starting FFmpeg load...")
        try {
        const baseFFmpegURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        console.log("Before package.load")
        console.log("Fetching core.js...");
        const coreURL = await toBlobURL(`${baseFFmpegURL}/ffmpeg-core.js`, 'text/javascript');
        console.log("core.js done, fetching core.wasm...");

        const wasmURL = await toBlobURL(`${baseFFmpegURL}/ffmpeg-core.wasm`, 'application/wasm');
        console.log("core.wasm done, fetching worker.js...");

        const workerURL = await toBlobURL('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js', 'text/javascript');
        console.log("worker.js done, calling load()...");

        await ffmpeg_package.load({ coreURL, wasmURL, classWorkerURL: workerURL });
        console.log("load() finished!");
        ffmpeg_loaded = true
        console.log("FFmpeg_package is loaded")
    } catch (error) {
        console.log("FFmpeg load failed");
        return;
    }
    } else {
        console.log("FFmpeg_package was loaded")
    }

    console.log("After package.load")
    const inputFileName = `input.${inputFileExtension}`;
    const outputFileName = `output.${fileformat.value}`;

    const TempVideo = document.createElement('video');
    TempVideo.src = URL.createObjectURL(selectconvertfile)

    await new Promise((resolve, reject) => {
        TempVideo.addEventListener("loadedmetadata", function(){
            resolve()
        });
    });

    const OriginalVideoHeight = TempVideo.videoHeight
    const OriginalVideoWidth = TempVideo.videoWidth
    const UserSelectedResolution = videoresolutionlist.value.split('x');
    const UserSelectedHeight = Number(UserSelectedResolution[1]); // np. 1080
    const UserSelectedWidth = Number(UserSelectedResolution[0]); // np. 1920

    if (OriginalVideoHeight < UserSelectedHeight || OriginalVideoWidth < UserSelectedWidth) {
        console.log('Invalid resolution: the selected resolution is higher than the original video resolution.')
        return;
    };

    let FinalWidth;
    let FinalHeight;

    if (OriginalVideoHeight > OriginalVideoWidth) {
        FinalWidth = UserSelectedHeight;
        FinalHeight = UserSelectedWidth;
    } else {
        FinalWidth = UserSelectedWidth;
        FinalHeight = UserSelectedHeight;
    }

    const mimeTypes = {
        gif: 'image/gif',
        mov: 'video/quicktime',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        avi: 'video/x-msvideo',
        mkv: 'video/x-matroska',
        wmv: 'video/x-ms-wmv'
    };

    await ffmpeg_package.writeFile(inputFileName, await fetchFile(selectconvertfile));
    await ffmpeg_package.exec(['-i', inputFileName, '-vf', `scale=${FinalWidth}:${FinalHeight}`, outputFileName]); //FFmpeg command
    const outputfinishdata = await ffmpeg_package.readFile(outputFileName);
    const outputBlob = new Blob([outputfinishdata], {type: mimeTypes[fileformat.value]});
    const downloadURL = URL.createObjectURL(outputBlob)
    outputdownloadbutton.hidden = false

    outputdownloadbutton.addEventListener("click", function() {
        const createdownloadlinka = document.createElement('a');
        createdownloadlinka.href = downloadURL;
        createdownloadlinka.download = outputFileName;
        createdownloadlinka.click();

    });

    ffmpeg_package.on('process', (data) => {
        console.log(data.progress);
    });
    } catch (error) {
        console.error("Error: ", error)
    }
});