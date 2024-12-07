const LawyerSearchService = require('../services/lawyerSearchService');

class LawyerSearchController {
  static async searchLawyers(req, res) {
    try {
      const {
        query,
        specialization,
        languages_spoken,
        hourly_rate_min,
        hourly_rate_max,
        years_of_experience,
        status,
        page = 1,
        limit = 10
      } = req.query;

      const searchResults = await LawyerSearchService.searchLawyers({
        query,
        specialization,
        languages_spoken,
        hourly_rate_min: hourly_rate_min ? parseFloat(hourly_rate_min) : null,
        hourly_rate_max: hourly_rate_max ? parseFloat(hourly_rate_max) : null,
        years_of_experience: years_of_experience ? parseInt(years_of_experience) : null,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        status: 'success',
        data: searchResults,
        message: 'Lawyers retrieved successfully'
      });
    } catch (error) {
      console.error('Search controller error:', error);
      res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  static async syncToElasticsearch(req, res) {
    try {
      await LawyerSearchService.syncToElasticsearch();
      res.json({
        status: 'success',
        message: 'Successfully synced MySQL data to Elasticsearch'
      });
    } catch (error) {
      console.error('Sync controller error:', error);
      res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}