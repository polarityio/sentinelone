const { getOr } = require('lodash/fp');

const connectOrDisconnectEndpoint = async (
  { id: endpointId, networkStatus },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    await requestWithDefaults({
      method: 'POST',
      url: `${options.url}/web/api/v2.1/agents/actions/${
        networkStatus === 'connected' || networkStatus === 'connecting'
          ? 'disconnect'
          : 'connect'
      }`,
      headers: {
        Authorization: `ApiToken ${options.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: { filter: { ids: [endpointId] } },
      json: true
    });

    callback(null, {
      networkStatus:
        networkStatus === 'connected' || networkStatus === 'connecting'
          ? 'disconnecting'
          : 'connecting'
    });
  } catch (error) {
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    Logger.error(
      {
        detail: 'Failed to Get Connect or Disconnect Endpoint/Agent',
        networkStatus,
        options,
        formattedError: err
      },
      'Connect or Disconnect Endpoint/Agent Failed'
    );
    const { title, detail, code } = getOr(
      {
        title: error.message,
        detail: 'Failed to Get Connect or Disconnect Endpoint/Agent',
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
          detail: `${title}${detail ? ` - ${detail}` : ''}, Code: ${code}`
        }
      ]
    });
  }
};

module.exports = connectOrDisconnectEndpoint;
