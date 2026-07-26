import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.10';
import { fetchFile, toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.1';
const ffmpeg_package = new FFmpeg();
let ffmpeg_loaded = false;

const convertbutton = document.getElementById('conbutton');
const uploadfile = document.getElementById('fileinput')
const fileformat = document.getElementById('formatselect');

convertbutton.addEventListener('click', async function() {
    console.log("You click convert button");
    const selectconvertfile = uploadfile.files[0];

    console.log("File: ", selectconvertfile)
    console.log(`${fileformat.value}`)
    const nameFileParts = selectconvertfile.name.split('.');
    const inputFileExtension = nameFileParts[nameFileParts.length - 1];
    console.log("Input extension:", inputFileExtension);
    
    if (!selectconvertfile.type.startsWith('video/')) {
        console.log("This is not a video file!");
        return;
    }

    if (!ffmpeg_loaded) {
        const baseFFmpegURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg_package.load({
            coreURL: await toBlobURL(`${baseFFmpegURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseFFmpegURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        ffmpeg_loaded = true
        console.log("FFmpeg_package is loaded")
    } else {
        console.log("FFmpeg_package was loaded")
    }

});