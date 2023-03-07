const {
  __,
  get,
  getOr,
  join,
  eq,
  find,
  uniqBy,
  filter,
  map,
  flow,
  chunk,
  flatten,
  size,
  toLower,
  includes
} = require('lodash/fp');
const { MAX_PAGE_SIZE } = require('./constants');

const MAX_THREAT_PARALLEL_PROCESS_SIZE = 5;

const entityTypeToFilterKey = ({ isIP, isHash }) =>
  isIP ? 'filePath__contains' : isHash ? 'contentHashes' : 'threatDetails__contains';

const queryThreats = async (entity, options, requestWithDefaults, Logger) => {
  const {
    data,
    pagination: { totalItems: foundThreatsCount }
  } = await getOr(
    { data: [], pagination: { totalItems: 0 } },
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/threats`,
      qs: {
        // query: entity.value,
        [entityTypeToFilterKey(entity)]: flow(get('value'), toLower)(entity),
        limit: MAX_PAGE_SIZE
      },
      options,
      json: true
    })
  );

  let foundThreats = uniqBy('id', data);

  if(flow(get('queryType.value'), includes('Blocklist'))(options)) {
    const foundThreatWithBlocklistInfo = await batchAddBlocklistInfoToThreats(
      foundThreats,
      options,
      requestWithDefaults,
      Logger
    );

    foundThreats = foundThreatWithBlocklistInfo;
  }

  Logger.trace(
    { foundThreats, foundThreatsCount, entity },
    'Found Threats For Entity'
  );

  return {
    foundThreats,
    foundThreatsCount
  };
};

const batchAddBlocklistInfoToThreats = async (
  foundThreats,
  options,
  requestWithDefaults,
  Logger
) =>
  flatten(
    await Promise.all(
      flow(
        chunk(MAX_THREAT_PARALLEL_PROCESS_SIZE),
        map(
          async (foundThreatsChunk) =>
            await addBlocklistInfoToThreats(
              foundThreatsChunk,
              options,
              requestWithDefaults,
              Logger
            )
        )
      )(foundThreats)
    )
  );
const addBlocklistInfoToThreats = async (
  foundThreats,
  options,
  requestWithDefaults,
  Logger
) => {
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

  const value__contains = flow(
    map(flow(get('hash'), (hash) => `"${hash}"`)),
    join(',')
  )(foundThreats);

  const blocklistData = getOr(
    [],
    'body.data',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/restrictions`,
      qs: {
        value__contains,
        includeChildren: true,
        includeParents: true,
        limit: MAX_PAGE_SIZE * MAX_THREAT_PARALLEL_PROCESS_SIZE
      },
      options,
      json: true
    })
  );

  const foundBlocklistItems = uniqBy('id', blocklistData);

  const foundThreatsWithBlocklistInfo = flow(
    map((threat) => {
      const blocklistInfo = filter(
        flow(get('value'), eq(threat.hash)),
        foundBlocklistItems
      );
      return {
        ...threat,
        blocklistInfo,
        blocklistInfoCount: size(blocklistInfo)
      };
    })
  )(foundThreats);

  return foundThreatsWithBlocklistInfo;
};

const getPossiblePaths = (possiblePaths = [], obj) =>
  get(find(get(__, obj), possiblePaths), obj);

module.exports = queryThreats;
