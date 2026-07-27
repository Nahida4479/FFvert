const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});

const app = express();

app.use((req, res, next) => {
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
next();
});

app.use(express.static('./public'))

app.listen(3003, () => {
    console.log("Active: Port 3003")
})