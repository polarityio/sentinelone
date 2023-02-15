const _ = require('lodash');
const { keys, values, zipObject, map } = require('lodash/fp');

const { IGNORED_IPS } = require('./constants');

const organizeEntities = (entities) => {
  const isNotIgnoredIp = (isIP, value) => !isIP || (isIP && !IGNORED_IPS.has(value));

  const { searchableEntities, nonSearchableEntities } = _.groupBy(
    entities,
    ({ isIP, value }) =>
      isNotIgnoredIp(isIP, value) ? 'searchableEntities' : 'nonSearchableEntities'
  );

  return {
    searchableEntities,
    nonSearchableEntities
  };
};

const buildIgnoreResults = map((entity) => ({
  entity,
  data: null
}));

const getKeys = (keys, items) =>
  Array.isArray(items)
    ? items.map((item) => _.pickBy(item, (v, key) => keys.includes(key)))
    : _.pickBy(items, (v, key) => keys.includes(key));

const groupEntities = (entities) =>
  _.chain(entities)
    .groupBy(({ isIP, isDomain, type }) =>
      isIP
        ? 'ip'
        : isDomain
        ? 'domain'
        : type === 'MAC'
        ? 'mac'
        : type === 'MD5'
        ? 'md5'
        : type === 'SHA1'
        ? 'sha1'
        : type === 'SHA256'
        ? 'sha256'
        : 'unknown'
    )
    .omit('unknown')
    .value();

const splitOutIgnoredIps = (_entitiesPartition) => {
  const { ignoredIPs, entitiesPartition } = _.groupBy(
    _entitiesPartition,
    ({ isIP, value }) =>
      !isIP || (isIP && !IGNORED_IPS.has(value)) ? 'entitiesPartition' : 'ignoredIPs'
  );

  return {
    entitiesPartition,
    ignoredIpLookupResults: _.map(ignoredIPs, (entity) => ({
      entity,
      data: null
    }))
  };
};

const objectPromiseAll = async (obj = { fn1: async () => {} }) => {
  const labels = keys(obj);
  const functions = values(obj);
  const executedFunctions = await Promise.all(map((func) => func(), functions));

  return zipObject(labels, executedFunctions);
};

const parseErrorToReadableJSON = (error) =>
  JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));

module.exports = {
  getKeys,
  groupEntities,
  splitOutIgnoredIps,
  objectPromiseAll,
  parseErrorToReadableJSON,
  organizeEntities,
  buildIgnoreResults
};
