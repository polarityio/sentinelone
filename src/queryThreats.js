const {
  __,
  get,
  getOr,
  join,
  eq,
  concat,
  find,
  uniqBy,
  filter,
  map,
  flow
} = require('lodash/fp');

const queryThreats = async (
  entity,
  [currentAgent, ...foundAgents],
  options,
  requestWithDefaults,
  Logger,
  nextCursor,
  aggThreats = []
) => {
  const { data, pagination } = await getThreats(
    entity,
    nextCursor,
    currentAgent,
    options,
    requestWithDefaults
  );

  let foundThreats = aggThreats.concat(data);

  foundThreats = await addBlocklistInfoToThreats(
    foundThreats,
    options,
    requestWithDefaults
  );

  if (pagination.nextCursor) {
    return await queryThreats(
      entity,
      currentAgent ? [currentAgent].concat(foundAgents || []) : [],
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundThreats
    );
  }

  if (currentAgent) {
    return await queryThreats(
      entity,
      foundAgents,
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundThreats
    );
  }

  return uniqBy('id', foundThreats);
};

const getThreats = async (
  entity,
  nextCursor,
  currentAgent,
  options,
  requestWithDefaults
) =>
  getOr(
    { data: [], pagination: {} },
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/threats`,
      qs: {
        ...(nextCursor
          ? { cursor: nextCursor }
          : { query: getOr(entity.value, 'computerName', currentAgent) }),
        limit: 100
      },
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );

const addBlocklistInfoToThreats = async (
  foundThreats,
  options,
  requestWithDefaults,
  nextCursor,
  allBlacklistResults = []
) => {
  if (!nextCursor) {
    foundThreats = map(
      (threat) => ({
        ...threat,
        hash: getPossiblePaths(
          ['threatInfo.md5', 'threatInfo.sha1', 'threatInfo.sha256'],
          threat
        )
      }),
      foundThreats
    );
  }

  const { data, pagination } = getOr(
    { data: [], pagination: {} },
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/restrictions`,
      qs: {
        ...(nextCursor
          ? { cursor: nextCursor }
          : {
              value__contains: flow(
                map(flow(get('hash'), (hash) => `"${hash}"`)),
                join(',')
              )(foundThreats)
            }),
        includeChildren: true,
        includeParents: true,
        limit: 100
      },
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );

  const foundBlocklistItems = flow(concat(data), uniqBy('id'))(allBlacklistResults);

  if (pagination.nextCursor) {
    return await addBlocklistInfoToThreats(
      foundThreats,
      options,
      requestWithDefaults,
      pagination.nextCursor,
      foundBlocklistItems
    );
  }

  const foundThreatsWithBlocklistInfo = flow(
    map((threat) => ({
      ...threat,
      blocklistInfo: filter(flow(get('value'), eq(threat.hash)), foundBlocklistItems)
    }))
  )(foundThreats);

  return foundThreatsWithBlocklistInfo;
};

const getPossiblePaths = (possiblePaths = [], obj) =>
  get(find(get(__, obj), possiblePaths), obj);

module.exports = queryThreats;
