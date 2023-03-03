const { map, flow, get, includes } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('./dataTransformations');

const queryAgents = require('./queryAgents');
const queryThreats = require('./queryThreats');

const searchEntities = async (entities, options, requestWithDefaults, Logger) =>
  await Promise.all(
    map(async (entity) => {
      try {
        const { foundThreats, foundThreatsCount } =
          options.queryType.value === 'both' ||
          flow(get('queryType.value'), includes('Threats'))(options)
            ? await queryThreats(entity, options, requestWithDefaults, Logger)
            : { foundThreats: [], foundThreatsCount: 0 };

        const { foundAgents, foundAgentsCount } =
          options.queryType.value === 'both' ||
          flow(get('queryType.value'), includes('Endpoints'))(options)
            ? await queryAgents(entity, options, requestWithDefaults, Logger)
            : { foundAgents: [], foundAgentsCount: 0 };

        return {
          entity,
          foundAgents,
          foundAgentsCount,
          foundThreats,
          foundThreatsCount
        };
      } catch (error) {
        const err = parseErrorToReadableJSON(error);

        if (err.maxRequestQueueLimitHit || err.isConnectionReset) {
          return {
            retry: {
              entity,
              isVolatile: true, // prevent limit reached results from being cached
              data: {
                summary: ['Lookup Limit Reached'],
                details: {
                  errorMessage: 'The SentinelOne Lookup Limit was Reached.'
                }
              }
            }
          };
        } else {
          throw error;
        }
      }
    }, entities)
  );

module.exports = searchEntities;
