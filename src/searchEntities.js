const fp = require('lodash/fp');

const queryAgents = require('./queryAgents');
const queryThreats = require('./queryThreats');
const addPoliciesToAgents = require('./addPoliciesToAgents');

const searchEntities = async (entities, options, requestWithDefaults, Logger) =>
  await Promise.all(
    fp.map(async (entity) => {
      const { foundThreats, foundThreatsCount } =
        options.queryType.value === 'both' || options.queryType.value === 'threats'
          ? await queryThreats(entity, options, requestWithDefaults, Logger)
          : { foundThreats: [], foundThreatsCount: 0 };

      const { foundAgents, foundAgentsCount } =
        options.queryType.value === 'both' || options.queryType.value === 'endpoints'
          ? await queryAgents(entity, options, requestWithDefaults, Logger)
          : { foundAgents: [], foundAgentsCount: 0 };

      const { globalPolicy, foundAgentsWithPolicies } = options.allowPolicyEdits
        ? await addPoliciesToAgents(foundAgents, options, requestWithDefaults, Logger)
        : { globalPolicy: {}, foundAgentsWithPolicies: foundAgents };

      return {
        entity,
        foundAgents: foundAgentsWithPolicies,
        foundAgentsCount,
        foundThreats,
        foundThreatsCount,
        globalPolicy
      };
    }, entities)
  );

module.exports = searchEntities;
