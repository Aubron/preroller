const https = require('https');
const fs = require('fs');

const getFileAsync = (url,path) => {
    return new Promise((res,rej) => {
        const file = fs.createWriteStream(path);
        https.get(url, function(response) {
            response.pipe(file);
            response.on('end', () => res())
            response.on('error', (e) => rej(e))
        });
    })
}

module.exports = {
    getFileAsync
}