const fs = require('fs');
const { identity, isEmpty, getOr } = require('lodash/fp');
const request = require('postman-request');
const { parseErrorToReadableJSON } = require('./dataTransformations');
const Bottleneck = require('bottleneck/es5');

let limiter;

function _setupLimiter(options) {
  limiter = new Bottleneck({
    maxConcurrent: Number.parseInt(options.maxConcurrent, 10), // no more than 5 lookups can be running at single time
    highWater: 50, // no more than 50 lookups can be queued up
    strategy: Bottleneck.strategy.OVERFLOW,
    minTime: Number.parseInt(options.minTime, 10) // don't run lookups faster than 1 every options.minTime ms
  });
}
const createRequestWithDefaults = (Logger) => {
  const requestWithDefaults = (
    preRequestFunction = async () => ({}),
    postRequestSuccessFunction = async (x) => x,
    postRequestFailureFunction = async (e) => {
      throw e;
    }
  ) => {
    const defaultsRequest = request.defaults({ json: true });

    const _requestWithDefault = (requestOptions) =>
      new Promise((resolve, reject) => {
        defaultsRequest(requestOptions, (err, res, body) => {
          if (err) return reject(err);
          resolve({ ...res, body });
        });
      });

    return async (requestOptions) => {
      if (!limiter) _setupLimiter(requestOptions.options);

      const preRequestFunctionResults = await preRequestFunction(requestOptions);
      const _requestOptions = {
        ...requestOptions,
        ...preRequestFunctionResults
      };

      let postRequestFunctionResults;
      let result;
      try {
        result = await limiter.schedule(_requestWithDefault, _requestOptions);

        checkForStatusError(result, _requestOptions);

        postRequestFunctionResults = await postRequestSuccessFunction(
          result,
          _requestOptions
        );
      } catch (error) {
        try {
          postRequestFunctionResults = await postRequestFailureFunction(
            error,
            _requestOptions
          );
        } catch (_error) {
          const err = parseErrorToReadableJSON(_error);
          _error.maxRequestQueueLimitHit =
            (isEmpty(err) && isEmpty(result)) ||
            (err && err.message === 'This job has been dropped by Bottleneck');

          _error.isConnectionReset =
            getOr('', 'errors[0].meta.err.code', err) === 'ECONNRESET';
          _error.entity = JSON.stringify(_requestOptions.entity);
          throw _error;
        }
      }
      return postRequestFunctionResults;
    };
  };

  const checkForStatusError = ({ statusCode, body }, requestOptions) => {
    Logger.trace({ statusCode, body, requestOptions });

    const roundedStatus = Math.round(statusCode / 100) * 100;
    if (![200].includes(roundedStatus)) {
      const requestError = Error('Request Error');
      requestError.status = statusCode;
      requestError.description = JSON.stringify(body);
      requestError.requestOptions = JSON.stringify({
        ...requestOptions,
        headers: '{*****}'
      });
      throw requestError;
    }
  };

  const requestDefaultsWithInterceptors = requestWithDefaults(
    (requestOptions) => ({
      ...requestOptions,
      headers: {
        ...requestOptions.headers,
        Authorization: `ApiToken ${requestOptions.options.apiToken}`
      }
    }),
    identity,
    (error, requestOptions) => {
      const err = parseErrorToReadableJSON(error);
      if (err.status === 500) {
        Logger.error(
          { requestOptions, err },
          'Received a 500 from the service on this Request'
        );
        return;
      }
      if (err.status === 401) {
        Logger.error(
          { requestOptions, err },
          'Received a 401 from the service on this Request'
        );
        const formattedError = new Error('Authentication Failed');
        formattedError.description =
          "Your API Token provided in the User Options for this integration isn't recognized by SentinelOne.";
        formattedError.status = err.status;
        formattedError.SentinelOneResponseBody = err.description;
        formattedError.stack = err.stack;

        throw formattedError;
      }

      throw error;
    }
  );

  return requestDefaultsWithInterceptors;
};

module.exports = createRequestWithDefaults;
