const convertbutton = document.getElementById('conbutton');
const uploadfile = document.getElementById('fileinput')
const fileformat = document.getElementById('formatselect');
const videoresolutionlist = document.getElementById('resolutionselect')
const outputdownloadbutton = document.getElementById('downloadoutput')
const funfact = document.getElementById('funfact');
let hideButtonTime
const processContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar')
const progressText = document.getElementById('progressText');
const dropzone = document.getElementById('dropzone');
const optionsPanel = document.getElementById('optionsPanel');
const selectedFileName = document.getElementById('selectedFileName');
const formatupload = document.getElementById('formatupload');

convertbutton.addEventListener("click", async function() {
    optionsPanel.hidden = true;
    const useruploadfile = uploadfile.files[0];
    const conversionId = `FFvert-${Date.now()}` + Math.random().toString(36).slice(2);
    console.log("Conversion ID:", conversionId);

    processContainer.style.display = 'block';
    progressBar.style.width = '0%';

    const eventSource = new EventSource('/progress/' + conversionId);
    eventSource.onmessage = function(event) {
    if (event.data === "Generating Color Palette") {
        progressText.textContent = event.data;
    } else {
        progressBar.style.width = event.data + '%';
        progressText.textContent = event.data + "%";   
    }
    };  


    const formDatatoServer = new FormData();
    formDatatoServer.append('video', useruploadfile); // User upload file
    formDatatoServer.append('resolution', videoresolutionlist.value); 
    formDatatoServer.append('format', fileformat.value);
    formDatatoServer.append('conversionId', conversionId)

    const response = await fetch('/convert', {
       method: 'POST',
       body: formDatatoServer 
    });

    const outputBlob = await response.blob();
    const downloadURL = URL.createObjectURL(outputBlob);
    outputdownloadbutton.hidden = false;
    processContainer.style.display = 'none';


    function startDownload() {
        const a = document.createElement('a');
        a.href = downloadURL;
        a.download = `${conversionId}.${fileformat.value}`;
        a.click();  
    }
    startDownload();

    outputdownloadbutton.addEventListener("click", function() {
        startDownload();
    });

    clearTimeout(hideButtonTime);
    hideButtonTime = setTimeout(function() {
        outputdownloadbutton.hidden = true;
    }, 60000);


});

let currentFactIndex = 0;

 const funFacts = [
        "Note: upscaling to a higher resolution will not improve video quality.",
        "GIFs support a maximum of 256 colors per frame.",
        "MP4 videos usually use H.264 or H.265 codecs for compression.",
        "H.264 is one of the most widely supported video codecs, used by most phones and cameras.",
        "Converting video to GIF often increases file size compared to the original video."

    ];

    funfact.textContent = funFacts[currentFactIndex];
    setInterval(function() {
      currentFactIndex = (currentFactIndex + 1) % funFacts.length;
      funfact.textContent = funFacts[currentFactIndex];
    }, 10000);

dropzone.addEventListener('click', function() {
    uploadfile.click();
});

uploadfile.addEventListener('change', function(){
    dropzone.hidden = true;
    optionsPanel.hidden = false;

    const fileName = uploadfile.files[0].name;
    if (fileName.length > 30) {
        selectedFileName.textContent = fileName.slice(0, 30) + '...';
        formatupload.hidden = true;
    } else {
        selectedFileName.textContent = fileName;
        formatupload.hidden = true
    }

});

dropzone.addEventListener('dragover', function(event) {
        event.preventDefault();
        dropzone.style.borderColor = 'purple';
});

    dropzone.addEventListener('dragleave', function(event) {
        event.preventDefault();
        dropzone.style.borderColor = '';
});

    dropzone.addEventListener('drop', function(event) {
        event.preventDefault();
        dropzone.style.borderColor = '';

    const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            uploadfile.files = droppedFiles;
            uploadfile.dispatchEvent(new Event('change'));
    }
});