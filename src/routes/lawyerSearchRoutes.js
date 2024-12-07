const express = require('express');
const LawyerSearchController = require('../controllers/lawyerSearchController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/lawyers/search
 * @desc Search lawyers with various filters
 * @access Public
 */
router.get('/search', LawyerSearchController.searchLawyers);

/**
 * @route POST /api/lawyers/sync
 * @desc Sync MySQL data to Elasticsearch
 * @access Private
 */
router.post('/sync', auth, LawyerSearchController.syncToElasticsearch);

module.exports = router;