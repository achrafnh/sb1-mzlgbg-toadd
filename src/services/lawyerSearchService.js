const elasticClient = require('../config/elasticsearch');
const Lawyer = require('../models/Lawyer');
const redisClient = require('../config/redis');

class LawyerSearchService {
  static async searchLawyers({
    query,
    specialization,
    languages_spoken,
    hourly_rate_min,
    hourly_rate_max,
    years_of_experience,
    status = 'active',
    page = 1,
    limit = 10
  }) {
    const cacheKey = `search:${JSON.stringify({
      query, specialization, languages_spoken, hourly_rate_min,
      hourly_rate_max, years_of_experience, status, page, limit
    })}`;
    
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const from = (page - 1) * limit;
    const searchBody = {
      from,
      size: limit,
      query: {
        bool: {
          must: [
            { term: { status: status } }
          ],
          should: [],
          filter: []
        }
      },
      sort: [
        { years_of_experience: { order: "desc" } },
        "_score"
      ]
    };

    if (query) {
      searchBody.query.bool.should.push(
        {
          multi_match: {
            query,
            fields: ['full_name^3', 'bio^2', 'specialization^2'],
            fuzziness: 'AUTO',
            operator: 'and'
          }
        }
      );
      searchBody.query.bool.minimum_should_match = 1;
    }

    if (specialization) {
      searchBody.query.bool.must.push({
        match: {
          specialization: {
            query: specialization,
            operator: 'and'
          }
        }
      });
    }

    if (languages_spoken) {
      searchBody.query.bool.must.push({
        match: {
          languages_spoken: {
            query: languages_spoken,
            operator: 'and'
          }
        }
      });
    }

    if (hourly_rate_min || hourly_rate_max) {
      const rangeQuery = {
        range: {
          hourly_rate: {}
        }
      };
      if (hourly_rate_min) rangeQuery.range.hourly_rate.gte = hourly_rate_min;
      if (hourly_rate_max) rangeQuery.range.hourly_rate.lte = hourly_rate_max;
      searchBody.query.bool.filter.push(rangeQuery);
    }

    if (years_of_experience) {
      searchBody.query.bool.filter.push({
        range: {
          years_of_experience: {
            gte: years_of_experience
          }
        }
      });
    }

    try {
      const result = await elasticClient.search({
        index: 'lawyers',
        body: searchBody
      });

      const lawyerIds = result.hits.hits.map(hit => hit._id);
      const lawyers = await Lawyer.findAll({
        where: {
          id: lawyerIds,
          status: 'active'
        },
        attributes: { exclude: ['password', 'refresh_token'] }
      });

      const lawyersWithScore = result.hits.hits.map(hit => {
        const lawyer = lawyers.find(l => l.id.toString() === hit._id);
        return lawyer ? {
          ...lawyer.toJSON(),
          score: hit._score
        } : null;
      }).filter(Boolean);

      const searchResults = {
        lawyers: lawyersWithScore,
        total: result.hits.total.value,
        page,
        limit,
        totalPages: Math.ceil(result.hits.total.value / limit)
      };

      await redisClient.set(cacheKey, JSON.stringify(searchResults), {
        EX: 300
      });

      return searchResults;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search lawyers');
    }
  }

  static async indexLawyer(lawyer) {
    try {
      const indexDoc = {
        full_name: lawyer.full_name,
        bio: lawyer.bio,
        specialization: lawyer.specialization,
        office_address: lawyer.office_address,
        languages_spoken: lawyer.languages_spoken,
        years_of_experience: lawyer.years_of_experience,
        hourly_rate: lawyer.hourly_rate,
        status: lawyer.status
      };

      await elasticClient.index({
        index: 'lawyers',
        id: lawyer.id,
        body: indexDoc
      });
      return true;
    } catch (error) {
      console.error('Indexing error:', error);
      throw new Error('Failed to index lawyer');
    }
  }

  static async syncToElasticsearch() {
    try {
      const lawyers = await Lawyer.findAll({
        attributes: { exclude: ['password', 'refresh_token'] }
      });
      
      for (const lawyer of lawyers) {
        await this.indexLawyer(lawyer);
      }
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      throw new Error('Failed to sync data to Elasticsearch');
    }
  }
}