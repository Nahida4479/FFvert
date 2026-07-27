const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});
const app = express();

app.use(express.static('./public'))
app.post('/convert', upload.single('video'), function(req, res) {
    console.log(req.file)
    console.log(res.body)
});

app.listen(3003, () => {
    console.log("Active: Port 3003")
})