const fp = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {

  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);

  const foundEntities = await _getFoundEntities(
    entitiesPartition,
    options,
    requestWithDefaults,
    Logger
  );

  const lookupResults = createLookupResults(foundEntities, Logger);

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
      let foundAgents = await queryAgents(entity, [], options, requestWithDefaults, Logger);
      
      const foundThreats = await queryThreats(
        entity,
        foundAgents,
        options,
        requestWithDefaults,
        Logger
      ); 

      foundAgents = !foundAgents.length
        ? await queryAgents(entity, foundThreats, options, requestWithDefaults, Logger)
        : foundAgents;

      const { globalPolicy, foundAgentsWithPolicies } = options.allowPolicyEdits
        ? await addPoliciesToAgents(foundAgents, options, requestWithDefaults, Logger)
        : { globalPolicy: {}, foundAgentsWithPolicies: foundAgents};

      foundAgents = foundAgentsWithPolicies;
      
      return { entity, foundAgents, foundThreats, globalPolicy };
    }, entitiesPartition)
  );

module.exports = {
  getLookupResults
};
