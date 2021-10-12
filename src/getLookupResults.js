const fp = require('lodash/fp');

const { splitOutIgnoredIps,objectPromiseAll } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const queryAgents = require('./queryAgents');
const queryThreats = require('./queryThreats');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {

  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);

  const foundEntities = await _getFoundEntities(
    entitiesPartition,
    options,
    requestWithDefaults,
    Logger
  );

  const lookupResults = createLookupResults(foundEntities, options, Logger);

  return lookupResults.concat(ignoredIpLookupResults);
};

const _getFoundEntities = async (
  entitiesPartition,
  options,
  requestWithDefaults,
  Logger
) =>
  Promise.all(
    fp.map(async (entity) => {
      const { foundAgents, foundThreats } = await objectPromiseAll({
        foundAgents: async () =>
          await queryAgents(entity, options, requestWithDefaults, Logger),
        foundThreats: async () =>
          await queryThreats(entity, options, requestWithDefaults, Logger)
      });
      return { entity, foundAgents, foundThreats };
    }, entitiesPartition)
  );

module.exports = {
  getLookupResults
};
