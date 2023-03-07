const { includes, isEmpty, flow, get, negate } = require('lodash/fp');
const { and } = require('./dataTransformations');
const reduce = require('lodash/fp/reduce').convert({ cap: false });


const validateOptions = (options, callback) => {
  const stringOptionsErrorMessages = {
    url: 'You must provide a valid URL from your SentinelOne Account',
    apiToken: 'You must provide a valid API Token from your SentinelOne Account'
  };

  const stringValidationErrors = _validateStringOptions(
    stringOptionsErrorMessages,
    options
  );

  const urlValidationError = _validateUrlOption(options.url);

  const endpointDisplayFieldsError =
    options.endpointFieldsToDisplay.value.length === 0
      ? {
          key: 'endpointFieldsToDisplay',
          message: 'You must accept one or more fields to display'
        }
      : [];

  const threatDisplayFieldsError =
    options.threatFieldsToDisplay.value.length === 0
      ? {
          key: 'threatFieldsToDisplay',
          message: 'You must accept one or more fields to display'
        }
      : [];

  const mustSearchBlocklistError = and(
    flow(get('queryType.value.value'), negate(includes('Blocklists'))),
    get('allowAddingThreatsToBlocklist.value')
  )(options)
    ? {
        key: 'allowAddingThreatsToBlocklist',
        message: 'Adding Threats to Blocklist is only possible if your `Query Type` includes "Blocklists".'
      }
    : [];

  callback(
    null,
    stringValidationErrors
      .concat(urlValidationError)
      .concat(endpointDisplayFieldsError)
      .concat(threatDisplayFieldsError)
      .concat(mustSearchBlocklistError)
  );
};

const _validateStringOptions = (stringOptionsErrorMessages, options, otherErrors = []) =>
  reduce((agg, message, optionName) => {
    const isString = typeof options[optionName].value === 'string';
    const isEmptyString = isString && isEmpty(options[optionName].value);

    return !isString || isEmptyString
      ? agg.concat({
          key: optionName,
          message
        })
      : agg;
  }, otherErrors)(stringOptionsErrorMessages);

const _validateUrlOption = ({ value: url }, otherErrors = []) =>
  url && url.endsWith('//')
    ? otherErrors.concat({
        key: 'url',
        message: 'Your Url must not end with a //'
      })
    : otherErrors;

module.exports = validateOptions;
