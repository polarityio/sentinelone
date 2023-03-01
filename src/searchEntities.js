const {map, flow, get, includes } = require('lodash/fp');

const queryAgents = require('./queryAgents');
const queryThreats = require('./queryThreats');

const searchEntities = async (entities, options, requestWithDefaults, Logger) =>
  await Promise.all(
    map(async (entity) => {
      const { foundThreats, foundThreatsCount } =
        options.queryType.value === 'both' || flow(get('queryType.value'), includes('Threats'))(options)
          ? await queryThreats(entity, options, requestWithDefaults, Logger)
          : { foundThreats: [], foundThreatsCount: 0 };

      const { foundAgents, foundAgentsCount } =
        options.queryType.value === 'both' || flow(get('queryType.value'), includes('Endpoints'))(options)
          ? await queryAgents(entity, options, requestWithDefaults, Logger)
          : { foundAgents: [], foundAgentsCount: 0 };

      return {
        entity,
        foundAgents,
        foundAgentsCount,
        foundThreats,
        foundThreatsCount
      };
    }, entities)
  );

module.exports = searchEntities;
