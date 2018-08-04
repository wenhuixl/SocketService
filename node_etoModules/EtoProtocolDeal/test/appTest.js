var app = require('../app.js');

function saveDevCode(devCode) {
    console.log(devCode);
}

app.createDevCode(saveDevCode);