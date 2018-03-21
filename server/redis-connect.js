const redis = require("redis");
const redisClient = redis.createClient(
    {
        host : 'localhost', 
        port : 6379
    });

const client = new Promise((resolve, reject) => {

redisClient.on('ready',function() {
    resolve("Redis is ready");
    });
    
redisClient.on('error',function() {
    reject("Error in Redis");
    });
});



module.exports = {
    client,
    redisClient
}