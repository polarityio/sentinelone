const { get, size, getOr, flow, concat, uniqBy, orderBy } = require('lodash/fp');

const queryAgents = async (
  entity,
  [currentThreat, ...foundThreats],
  options,
  requestWithDefaults,
  Logger,
  nextCursor,
  aggAgents = [],
  isDecommissioned = false
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
              ),
              isDecommissioned
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
      foundAgents,
      isDecommissioned
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
      foundAgents,
      isDecommissioned
    );
  }

  if (!isDecommissioned) {
    return await queryAgents(
      entity,
      foundThreats,
      options,
      requestWithDefaults,
      Logger,
      get('nextCursor', pagination),
      foundAgents,
      true
    );
  }


  return orderBy('isDecommissioned', 'desc')(foundAgents);
};

module.exports = queryAgents;
