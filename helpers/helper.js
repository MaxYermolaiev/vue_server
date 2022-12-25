const https = require('https');

//helper for random avatar creating
class Helper {
    async getRandomImageUrl() {
        return new Promise((resolve,reject)=>{
             https.get("https://aws.random.cat/meow", response=>{
                 response
                    .on('data', (data) => {
                        resolve(JSON.parse(data.toString())['file'])
                    });
            })
                 .on('error', (e) => {
                     resolve("https://purr.objects-us-east-1.dream.io/i/OIlLAN4.jpg");
                 });
        })
    }
}

module.exports = new Helper();