const convertbutton = document.getElementById('conbutton');
const uploadfile = document.getElementById('fileinput')
const fileformat = document.getElementById('formatselect');
const videoresolutionlist = document.getElementById('resolutionselect')
const outputdownloadbutton = document.getElementById('downloadoutput')

convertbutton.addEventListener("click", async function() {
    const useruploadfile = uploadfile.files[0];

    const formDatatoServer = new FormData();
    formDatatoServer.append('video', useruploadfile); // User upload file
    formDatatoServer.append('resolution', videoresolutionlist.value); 
    formDatatoServer.append('format', fileformat.value);

    const response = await fetch('/convert', {
       method: 'POST',
       body: formDatatoServer 
    });


});