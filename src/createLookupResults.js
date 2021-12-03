const { flow, map, get, reduce, size, find, __, filter } = require('lodash/fp');
const {
  ENDPOINT_DISPLAY_FIELD_PROCESSING,
  THREAT_DISPLAY_FIELD_PROCESSING
} = require('./constants');

const createLookupResults = (foundEntities, options, Logger) =>
  map(({ entity, foundAgents, foundThreats, globalPolicy }) => {
    let lookupResult;
    if (size(foundAgents) || size(foundThreats)) {
      const formattedQueryResult = formatQueryResult(
        foundAgents,
        foundThreats,
        globalPolicy,
        options,
        Logger
      );

      lookupResult = {
        entity,
        data: {
          summary: createSummary(formattedQueryResult),
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
  }, foundEntities);

const createSummary = ({ threats, agents }) => {
  const unresolvedThreatsCount = flow(
    filter((threat) => get(`['Incident Status'].value`, threat) === 'Unresolved'),
    size
  )(threats);

  const malicousThreatsCount = flow(
    filter((threat) => get(`['AI Confidence Level'].value`, threat) === 'Undefined'),
    size
  )(threats);

  const unhealthyEndpoints = flow(
    filter((agent) => get(`['Health Status'].value`, agent) !== 'Healthy'),
    size
  )(agents);

  return []
    .concat(unresolvedThreatsCount ? `Unresolved Threats: ${unresolvedThreatsCount}` : [])
    .concat(malicousThreatsCount ? `Malicous Threats: ${malicousThreatsCount}` : [])
    .concat(unhealthyEndpoints ? `Unhealthy Endpoints: ${unhealthyEndpoints}` : []);
};

const formatQueryResult = (foundAgents, foundThreats, globalPolicy, options, Logger) => {
  const selectedEndpointProcessingFields = flow(
    get('endpointFieldsToDisplay'),
    map(({ value }) =>
      find(({ label }) => label === value, ENDPOINT_DISPLAY_FIELD_PROCESSING)
    )
  )(options);

  const selectedThreatProcessingFields = flow(
    get('threatFieldsToDisplay'),
    map(({ value }) =>
      find(({ label }) => label === value, THREAT_DISPLAY_FIELD_PROCESSING)
    )
  )(options);

  return {
    globalPolicy,
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
    unformattedThreats: foundThreats
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

module.exports = createLookupResults;
