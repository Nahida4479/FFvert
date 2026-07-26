const express = require('express');
const app = express();


app.use(express.static('./public'))

app.listen(3003, () => {
    console.log("Active: Port 3003")
})