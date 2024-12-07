const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./src/config/database');
const lawyerSearchRoutes = require('./src/routes/lawyerSearchRoutes');
const { setupElasticsearch } = require('./src/utils/elasticsearchSetup');
const rateLimiter = require('./src/middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/lawyers', lawyerSearchRoutes);

// Initialize services
async function initializeServices() {
  try {
    // Database connection
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connected to MySQL database');

    // Elasticsearch setup
    await setupElasticsearch();
    console.log('Elasticsearch initialized');

  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
}

initializeServices();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});