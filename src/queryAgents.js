const { getOr } = require('lodash/fp');

const queryAgents = async (
  entity,
  [currentThreat, ...foundThreats],
  options,
  requestWithDefaults,
  Logger,
  nextCursor,
  aggAgents = []
) => {
  const { data, pagination } = getOr(
    { data: [], pagination: {} },
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/agents`,
      qs: {
        ...(nextCursor
          ? { cursor: nextCursor }
          : {
              query: getOr(
                entity.value,
                'agentRealtimeInfo.agentComputerName',
                currentThreat
              )
            }),
        limit: 100
      },
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );
  const foundAgents = aggAgents.concat(data);

  if (pagination.nextCursor) {
    return await queryAgents(
      entity,
      currentThreat ? [currentThreat].concat(foundThreats || []) : [],
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundAgents
    );
  }

  if (foundThreats.length) {
    return await queryAgents(
      entity,
      foundThreats,
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundAgents
    );
  }

  return foundAgents;
};

module.exports = queryAgents;
