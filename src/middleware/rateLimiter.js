const rateLimit = require('express-rate-limit');
require('dotenv').config();

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW),
  max: parseInt(process.env.RATE_LIMIT_MAX),
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  }
});

module.exports = limiter;