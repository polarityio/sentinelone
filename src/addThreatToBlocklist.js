const { getOr } = require('lodash/fp');

const addThreatToBlocklist = async (
  {
    id: threatId,
    previousNumberOfBlocklistItems,
    targetScope,
    foundInBlocklist,
    blocklistScope
  },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    const capitalizedTargetScope =
      targetScope.charAt(0).toUpperCase() + targetScope.slice(1);

    const targetScopeAlreadyExistsInBlocklist =
      foundInBlocklist !== 'No' &&
      blocklistScope.toLowerCase().includes(targetScope.toLowerCase());

    if (targetScopeAlreadyExistsInBlocklist) {
      throw new Error(
        `This Threat at the scope level "${capitalizedTargetScope}" already exists in the Blocklist`
      );
    }

    await requestWithDefaults({
      method: 'POST',
      url: `${options.url}/web/api/v2.1/threats/add-to-blacklist`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: { filter: { ids: [threatId] }, data: { targetScope } },
      options,
      onMessage: true,
      json: true
    });

    callback(null, {
      newFoundInBlocklist: `Yes (${previousNumberOfBlocklistItems + 1})`,
      newBlockingScope: `${blocklistScope}, ${capitalizedTargetScope}`
    });
  } catch (error) {
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    Logger.error(
      {
        detail: 'Failed to Block Threat',
        options,
        formattedError: err
      },
      'Block Threat Failed'
    );
    const { title, detail, code } = getOr(
      {
        title: error.message,
        detail: 'Block Attempt Unsuccessful',
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

module.exports = addThreatToBlocklist;
