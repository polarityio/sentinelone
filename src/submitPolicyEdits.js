const { getOr } = require('lodash/fp');

const submitPolicyEdits = async (
  { policySubmission, endpointToEditPolicyOn, policyEditScope },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    await requestWithDefaults({
      method: 'PUT',
      url: `${options.url}/web/api/v2.1/${
        policyEditScope === 'global'
          ? 'tenant/policy'
          : `${policyEditScope}s/${endpointToEditPolicyOn[`${policyEditScope}Id`]}/policy`
      }`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: { data: policySubmission },
      options,
      onMessage: true,
      json: true
    });

    callback(null, {});
  } catch (error) {
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    Logger.error(
      {
        detail: 'Failed to Submit Policy Edit Changes',
        options,
        formattedError: err
      },
      'Submit Policy Edit Changes Failed'
    );
    const { title, detail, code } = getOr(
      {
        title: error.message,
        detail: 'Saving Policy Changes Unsuccessful',
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

module.exports = submitPolicyEdits;
