const { get, size, getOr, flow, concat, uniqBy } = require('lodash/fp');

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
  const foundAgents = flow(concat(data), uniqBy('id'))(aggAgents);

  if (get('nextCursor', pagination)) {
    return await queryAgents(
      entity,
      currentThreat ? [currentThreat].concat(foundThreats || []) : [],
      options,
      requestWithDefaults,
      Logger,
      get('nextCursor', pagination),
      foundAgents
    );
  }

  if (size(foundThreats)) {
    return await queryAgents(
      entity,
      foundThreats,
      options,
      requestWithDefaults,
      Logger,
      get('nextCursor', pagination),
      foundAgents
    );
  }

  return foundAgents;
};

module.exports = queryAgents;
