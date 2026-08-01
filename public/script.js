const convertbutton = document.getElementById('conbutton');
const uploadfile = document.getElementById('fileinput')
const fileformat = document.getElementById('formatselect');
const videoresolutionlist = document.getElementById('resolutionselect')
const outputdownloadbutton = document.getElementById('downloadoutput')
const funfact = document.getElementById('funfact');
let hideButtonTime

convertbutton.addEventListener("click", async function() {
    const useruploadfile = uploadfile.files[0];
    const conversionId = Date.now() + "-" + Math.random().toString(36).slice(2);
    console.log("Conversion ID:", conversionId);

    const eventSource = new EventSource('/progress/' + conversionId);
    eventSource.onmessage = function(event) {
        console.log("Progress update:", event.data);
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


    function startDownload() {
        const a = document.createElement('a');
        a.href = downloadURL;
        a.download = `finalfile.${fileformat.value}`;
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