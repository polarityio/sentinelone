const { getOr, get } = require('lodash/fp');

const retryLookup = async (
  { entity },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    const { doLookup } = require('../integration');

    doLookup([entity], options, (err, lookupResults) => {
      if (err) {
        Logger.error({ err }, 'Error retrying lookup');
        callback(err);
      } else {
        callback(
          null,
          get('0.data', lookupResults) === null
            ? { data: { summary: ['No Results Found on Retry'] } }
            : lookupResults[0]
        );
      }
    });
  } catch (error) {
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    Logger.error(
      {
        detail: 'Failed to Retry Lookup',
        options,
        formattedError: err
      },
      'Retry Lookup Failed'
    );
    const { title, detail, code } = getOr(
      {
        title: error.message,
        detail: 'Retrying Lookup Unsuccessful',
        code: error.status
      },
      'errors.0',
      err.description && err.description[0] === '{'
        ? JSON.parse(err.description)
        : err.description
    );
    return callback({
      errors: [
        {
          err: error,
          detail: `${title}${detail ? ` - ${detail}` : ''}${
            code ? `, Code: ${code}` : ''
          }`
        }
      ]
    });
  }
};

module.exports = retryLookup;
