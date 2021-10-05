const fp = require('lodash/fp');

const createLookupResults = (foundEntities, Logger) =>
  fp.flow(
    fp.map(({ entity, result }) => {
      let lookupResult;
      if (fp.size(result)) {
        const formattedQueryResult = formatQueryResult(result);
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
    fp.compact
  )(foundEntities);

const createSummary = (result) => [];

const formatQueryResult = fp.map((result) => ({
  
}));

module.exports = createLookupResults;
