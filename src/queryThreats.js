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
  flow,
  chunk,
  flatten
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

  let foundThreats = flow(concat(data), uniqBy('id'))(aggThreats);

  foundThreats = flatten(
    await Promise.all(
      flow(
        chunk(19),
        map(
          async (foundThreatsChunk) =>
            await addBlocklistInfoToThreats(
              foundThreatsChunk,
              options,
              requestWithDefaults
            )
        )
      )(foundThreats)
    )
  );

  if (get('nextCursor', pagination)) {
    return await queryThreats(
      entity,
      currentAgent ? [currentAgent].concat(foundAgents || []) : [],
      options,
      requestWithDefaults,
      Logger,
      get('nextCursor', pagination),
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
      get('nextCursor', pagination),
      foundThreats
    );
  }

  Logger.trace({ foundThreats, entity }, 'Found Threats For Entity');
  
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

  if (get('nextCursor', pagination)) {
    return await addBlocklistInfoToThreats(
      foundThreats,
      options,
      requestWithDefaults,
      get('nextCursor', pagination),
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
