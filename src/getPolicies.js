const { getOr } = require('lodash/fp');
const addPoliciesToAgents = require('./addPoliciesToAgents');

const getPolicies = async (
  { foundAgents },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    const { globalPolicy, foundAgentsWithPolicies } = await addPoliciesToAgents(
      foundAgents,
      options,
      requestWithDefaults,
      Logger
    );

    callback(null, { globalPolicy, foundAgentsWithPolicies });
  } catch (error) {
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    Logger.error(
      {
        detail: 'Failed to Getting Policies',
        options,
        formattedError: err
      },
      'Getting Policies Failed'
    );
    const { title, detail, code } = getOr(
      {
        title: error.message,
        detail: 'Getting Policies was Unsuccessful',
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

module.exports = getPolicies;
