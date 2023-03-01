'use strict';
const fp = require('lodash/fp');

const validateOptions = require('./src/validateOptions');
const createRequestWithDefaults = require('./src/createRequestWithDefaults');
const getPolicies = require('./src/getPolicies');
const connectOrDisconnectEndpoint = require('./src/connectOrDisconnectEndpoint');
const addThreatToBlocklist = require('./src/addThreatToBlocklist');
const submitPolicyEdits = require('./src/submitPolicyEdits');
const {
  parseErrorToReadableJSON,
  organizeEntities,
  buildIgnoreResults
} = require('./src/dataTransformations');

const searchEntities = require('./src/searchEntities');
const assembleLookupResults = require('./src/assembleLookupResults');

let Logger;
let requestWithDefaults;
const startup = (logger) => {
  Logger = logger;
  requestWithDefaults = createRequestWithDefaults(Logger);
};

const doLookup = async (entities, options, cb) => {
  Logger.debug({ entities }, 'Entities');
  options.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;

  let lookupResults;
  try {
    const { searchableEntities, nonSearchableEntities } = organizeEntities(entities);

    const foundEntities = await searchEntities(
      searchableEntities,
      options,
      requestWithDefaults,
      Logger
    );

    lookupResults = assembleLookupResults(foundEntities, options, Logger);

    const ignoreResults = buildIgnoreResults(nonSearchableEntities);

    Logger.trace({ lookupResults, ignoreResults }, 'Lookup Results');
    cb(null, lookupResults.concat(ignoreResults));
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');

    return cb({ detail: error.message || 'Search Failed', err });
  }
};

const getOnMessage = {
  getPolicies,
  connectOrDisconnectEndpoint,
  addThreatToBlocklist,
  submitPolicyEdits
};

const onMessage = ({ action, data: actionParams }, options, callback) =>
  getOnMessage[action](actionParams, options, requestWithDefaults, callback, Logger);

module.exports = {
  startup,
  validateOptions,
  doLookup,
  onMessage
};
