const {
  flow,
  map,
  get,
  reduce,
  size,
  find,
  __,
  filter,
  compact,
  uniq,
  join,
  capitalize
} = require('lodash/fp');
const {
  ENDPOINT_DISPLAY_FIELD_PROCESSING,
  THREAT_DISPLAY_FIELD_PROCESSING,
  MAX_PAGE_SIZE
} = require('./constants');

const assembleLookupResults = (foundEntities, options, Logger) =>
  map(
    ({
      entity,
      foundAgents,
      foundThreats,
      foundAgentsCount,
      foundThreatsCount
    }) => {
      let lookupResult;
      if (size(foundAgents) || size(foundThreats)) {
        const formattedQueryResult = formatQueryResult(
          foundAgents,
          foundThreats,
          options,
          Logger
        );

        lookupResult = {
          entity,
          data: {
            summary: createSummary(
              formattedQueryResult,
              foundAgentsCount,
              foundThreatsCount
            ),
            details: formattedQueryResult
          }
        };
      } else {
        lookupResult = {
          entity,
          data: null
        };
      }
      return lookupResult;
    },
    foundEntities
  );

const createSummary = ({ threats, agents }, foundAgentsCount, foundThreatsCount) => {
  const unresolvedThreatsCount = flow(
    filter((threat) => get(`['Incident Status'].value`, threat) === 'unresolved'),
    size
  )(threats);

  const malicousThreatsCount = flow(
    filter((threat) => get(`['AI Confidence Level'].value`, threat) === 'malicious'),
    size
  )(threats);

  const threatClassifications = flow(
    map(flow(get(`['Classification'].value`), capitalize)),
    uniq,
    join(', '),
    (threatClassifications) =>
      threatClassifications && `Threat Classifications: ${threatClassifications}`
  )(threats);

  const unhealthyEndpoints = flow(
    filter((agent) => get(`['Health Status'].value`, agent) !== 'Healthy'),
    size
  )(agents);

  const deviceTypes = flow(
    map(flow(get(`['Device Type'].value`), capitalize)),
    uniq,
    join(', '),
    (deviceTypes) => deviceTypes && `Device Types: ${deviceTypes}`
  )(agents);

  const diskScanStatuses = flow(
    map(flow(get(`['Full Disk Scan'].value`), capitalize)),
    uniq,
    join(', '),
    (discScanStatuses) => discScanStatuses && `Disk Scan Statuses: ${discScanStatuses}`
  )(agents);

  const networkStatuses = flow(
    map(flow(get(`['Network Status'].value`), capitalize)),
    uniq,
    join(', '),
    (networkStatuses) => networkStatuses && `Network Statuses: ${networkStatuses}`
  )(agents);

  const managementConnectivity = flow(
    map(flow(get(`['Management Connectivity'].value`), capitalize)),
    uniq,
    join(', '),
    (managementConnectivity) =>
      managementConnectivity && `Management Connectivity: ${managementConnectivity}`
  )(agents);

  return []
    .concat(unresolvedThreatsCount ? `Unresolved Threats: ${unresolvedThreatsCount}` : [])
    .concat(malicousThreatsCount ? `Malicious Threats: ${malicousThreatsCount}` : [])
    .concat(unhealthyEndpoints ? `Unhealthy Endpoints: ${unhealthyEndpoints}` : [])
    .concat(foundAgentsCount ? `Endpoints: ${foundAgentsCount}`:[])
    .concat(foundThreatsCount ? `Threats: ${foundThreatsCount}`:[])
    .concat(threatClassifications || [])
    .concat(deviceTypes || [])
    .concat(diskScanStatuses || [])
    .concat(networkStatuses || [])
    .concat(managementConnectivity || []);
};

const formatQueryResult = (foundAgents, foundThreats, options, Logger) => {
  const selectedEndpointProcessingFields = flow(
    get('endpointFieldsToDisplay'),
    map(({ value }) =>
      find(({ label }) => label === value, ENDPOINT_DISPLAY_FIELD_PROCESSING)
    ),
    compact
  )(options);

  const selectedThreatProcessingFields = flow(
    get('threatFieldsToDisplay'),
    map(({ value }) =>
      find(({ label }) => label === value, THREAT_DISPLAY_FIELD_PROCESSING)
    ),
    compact
  )(options);

  return {
    agents: getDisplayFieldsFromOptions(
      foundAgents,
      selectedEndpointProcessingFields,
      options
    ),
    threats: getDisplayFieldsFromOptions(
      foundThreats,
      selectedThreatProcessingFields,
      options
    ),
    unformattedAgents: foundAgents,
    unformattedThreats: foundThreats,
    maxPageSize: MAX_PAGE_SIZE
  };
};

const getDisplayFieldsFromOptions = (foundItems, displayFields, options) =>
  map(
    (foundItem) =>
      reduce(
        (agg, { label, path, possiblePaths, process, link, ...fieldProperties }) => {
          const displayValue = getDisplayValue(path, foundItem, possiblePaths, process);
          return displayValue
            ? {
                ...agg,
                [label]: {
                  value: displayValue,
                  ...(link && { link: link({ ...foundItem, ...options }) }),
                  ...fieldProperties
                }
              }
            : agg;
        },
        {},
        displayFields
      ),
    foundItems
  );

const getDisplayValue = (valuePath, foundItem, possiblePaths, process) =>
  process
    ? flow(
        get(possiblePaths ? find(get(__, foundItem), possiblePaths) : valuePath),
        process
      )(foundItem)
    : get(possiblePaths ? find(get(__, foundItem), possiblePaths) : valuePath, foundItem);

module.exports = assembleLookupResults;
