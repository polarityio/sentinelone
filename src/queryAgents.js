const { getOr, flow, uniqBy, orderBy } = require('lodash/fp');
const { MAX_PAGE_SIZE } = require('./constants');

const queryAgents = async (entity, options, requestWithDefaults, Logger) => {
  const {
    data,
    pagination: { totalItems: foundAgentsCount }
  } = getOr(
    { data: [], pagination: { totalItems: 0 } },
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/agents`,
      qs: {
        query: entity.value,
        limit: MAX_PAGE_SIZE
      },
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );

  const foundAgents = flow(uniqBy('id'), orderBy('isDecommissioned', 'desc'))(data);

  Logger.trace({ foundAgents, foundAgentsCount, entity }, 'Found Agents For Entity');

  return {
    foundAgents,
    foundAgentsCount
  };
};

module.exports = queryAgents;
