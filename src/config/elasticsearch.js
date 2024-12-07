const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const elasticClient = new Client({
  node: 'http://172.173.137.254:9222',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  }
});

module.exports = elasticClient;