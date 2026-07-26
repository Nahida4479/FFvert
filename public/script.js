const convertbutton = document.getElementById('conbutton');
const uploadfile = document.getElementById('fileinput')
const fileformat = document.getElementById('formatselect');


convertbutton.addEventListener('click', function() {
    console.log("You click convert button");
    const selectconvertfile = uploadfile.files[0];

    console.log("File: ", selectconvertfile)
    console.log(`${fileformat.value}`)
    
    if (!selectconvertfile.type.startsWith('video/')) {
        console.log("This is not a video file!");
        return;
    }
});