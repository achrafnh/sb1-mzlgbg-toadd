const elasticClient = require('../config/elasticsearch');

async function setupElasticsearch() {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: 'lawyers'
    });

    if (!indexExists) {
      await elasticClient.indices.create({
        index: 'lawyers',
        body: {
          settings: {
            analysis: {
              analyzer: {
                custom_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding']
                }
              }
            }
          },
          mappings: {
            properties: {
              full_name: { 
                type: 'text',
                analyzer: 'custom_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              bio: { 
                type: 'text',
                analyzer: 'custom_analyzer'
              },
              specialization: { 
                type: 'text',
                analyzer: 'custom_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              office_address: { 
                type: 'text',
                analyzer: 'custom_analyzer'
              },
              languages_spoken: { 
                type: 'keyword'
              },
              years_of_experience: { 
                type: 'integer'
              },
              hourly_rate: { 
                type: 'float'
              },
              status: { 
                type: 'keyword'
              }
            }
          }
        }
      });
      console.log('Elasticsearch index created successfully');
    }
  } catch (error) {
    console.error('Elasticsearch setup error:', error);
    throw error;
  }
}

module.exports = { setupElasticsearch };