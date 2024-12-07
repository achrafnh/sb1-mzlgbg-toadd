const Redis = require('redis');
require('dotenv').config();

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

module.exports = redisClient;