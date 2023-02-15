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
  size
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
        threatDetails__contains: entity.value, // TODO: Test if filters use And logic, and if so might need to use query again, in which case choose query or only one field
        [entityTypeToFilterKey(entity.type)]: entity.value,
        limit: MAX_PAGE_SIZE
      },
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );

  const foundThreats = uniqBy('id', data);

  const foundThreatWithBlocklistInfo = batchAddBlocklistInfoToThreats(
    foundThreats,
    options,
    requestWithDefaults
  );

  Logger.trace(
    { foundThreatWithBlocklistInfo, foundThreatsCount, entity },
    'Found Threats For Entity'
  );

  return {
    foundThreats: foundThreatWithBlocklistInfo,
    foundThreatsCount
  };
};

const batchAddBlocklistInfoToThreats = async (
  foundThreats,
  options,
  requestWithDefaults
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
              requestWithDefaults
            )
        )
      )(foundThreats)
    )
  );
const addBlocklistInfoToThreats = async (foundThreats, options, requestWithDefaults) => {
  const value__contains = flow(
    map(
      (threat) =>
        `"${getPossiblePaths(
          ['threatInfo.md5', 'threatInfo.sha1', 'threatInfo.sha256'],
          threat
        )}"`
    ),
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
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
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
