const { flow, map, get, reduce, size, compact, find, __ } = require('lodash/fp');
const {
  ENDPOINT_DISPLAY_FIELD_PROCESSING,
  THREAT_DISPLAY_FIELD_PROCESSING
} = require('./constants');


const createLookupResults = (foundEntities, options, Logger) =>
  flow(
    map(({ entity, foundAgents, foundThreats }) => {
      let lookupResult;
      if (size(foundAgents) || size(foundThreats)) {
        const formattedQueryResult = formatQueryResult(
          foundAgents,
          foundThreats,
          options
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
    }),
    compact
  )(foundEntities);

const createSummary = (result) => [];

const formatQueryResult = (foundAgents, foundThreats, options) => {
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
    agents: getDisplayFieldsFromOptions(foundAgents, selectedEndpointProcessingFields, options),
    threats: getDisplayFieldsFromOptions(foundThreats, selectedThreatProcessingFields, options)
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
    : get(
        possiblePaths ? find(get(__, foundItem), possiblePaths) : valuePath,
        foundItem
      );

module.exports = createLookupResults;
