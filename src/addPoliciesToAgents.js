const { get, reduce, map, find } = require('lodash/fp');
const { objectPromiseAll } = require('./dataTransformations');

const getPolicy = async (id, policyType, options, requestWithDefaults) =>
  get(
    'body.data',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/${policyType}/${id}/policy`,
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );

const addPolicyRequestIfUnique = (policyType, agent, agg) =>
  !find(({ id }) => id === agent[`${policyType}Id`], agg)
    ? [{ id: agent[`${policyType}Id`], policyType: `${policyType}s` }]
    : [];

const addPoliciesToAgents = async (foundAgents, options, requestWithDefaults, Logger) => {
  const allUniquePolicyRequests = reduce(
    (agg, agent) => [
      ...agg,
      ...addPolicyRequestIfUnique('site', agent, agg),
      ...addPolicyRequestIfUnique('account', agent, agg),
      ...addPolicyRequestIfUnique('group', agent, agg)
    ],
    [],
    foundAgents
  );

  const allUniquePolicyResults = await objectPromiseAll(
    reduce(
      (agg, { id, policyType }) => ({
        ...agg,
        [id]: async () => {
          try {
            return await getPolicy(id, policyType, options, requestWithDefaults);
          } catch (e) {
            return;
          }
        }
      }),
      {},
      allUniquePolicyRequests
    )
  );

  const agentsWithPolicies = map(
    (agent) => ({
      ...agent,
      sitePolicy: allUniquePolicyResults[agent.siteId],
      accountPolicy: allUniquePolicyResults[agent.accountId],
      groupPolicy: allUniquePolicyResults[agent.groupId]
    }),
    foundAgents
  );

  const globalPolicy = get(
    'body.data',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/tenant/policy`,
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );

  return {
    globalPolicy,
    foundAgentsWithPolicies: agentsWithPolicies
  };
};

module.exports = addPoliciesToAgents;
