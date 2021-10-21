const orderFields = (listOfObjects, fieldsOrder) =>
  listOfObjects.map((obj) =>
    fieldsOrder.reduce(
      (agg, fieldName, i) =>
        Object.assign(
          {},
          agg,
          obj[fieldName] && {
            [fieldName]: Object.assign({}, obj[fieldName], Object.keys(agg).length === 0 && { first: true })
          }
        ),
      {}
    )
  );


polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  activeTab: 'endpoints',
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  connectOrDisconnectMessages: {},
  connectOrDisconnectErrorMessages: {},
  connectOrDisconnectIsRunning: {},
  init() {
    if (!this.get('details.agents').length) this.set('activeTab', 'threats');
    this.set(
      'details.agents',
      orderFields(
        this.get('details.agents'),
        this.get('block.userOptions.endpointFieldsToDisplay').map(({ value }) => value)
      ).map((agent) =>
        Object.assign({}, agent, {
          id: this.get('details.unformattedAgents').find(
            ({ computerName }) => computerName === agent['Endpoint Name'].value
          ).id,
          networkStatus: (agent['Network Status'] || {}).value || 'Unknown'
        })
      )
    );
    this.set(
      'details.threats',
      orderFields(
        this.get('details.threats'),
        this.get('block.userOptions.threatFieldsToDisplay').map(({ value }) => value)
      )
    );

    
    this._super(...arguments);
  },

  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    },
    connectOrDisconnectEndpoint: function (agent, index) {
      const outerThis = this;

      this.setConnectOrDisconnectMessages(index, '');
      this.setConnectOrDisconnectErrorMessages(index, '');
      this.setConnectOrDisconnectIsRunningMessage(index, true);

      this.sendIntegrationMessage({
        action: 'connectOrDisconnectEndpoint',
        data: { id: agent.id, networkStatus: agent.networkStatus }
      })
        .then(({ networkStatus }) => {
          outerThis.setConnectOrDisconnectMessages(
            index,
            `Successfully ${
              networkStatus === 'connected' ? 'Connected to' : 'Disconnected from'
            } Network!`
          );
          const agents = outerThis.get('details.agents');

          outerThis.set('details.agents', [
            ...agents.slice(0, index),
            Object.assign(
              {},
              orderFields(
                [
                  Object.assign({}, agent, {
                    ['Network Status']: { value: networkStatus, capitalize: true }
                  })
                ],
                outerThis
                  .get('block.userOptions.endpointFieldsToDisplay')
                  .map(({ value }) => value)
              )[0],
              {
                networkStatus
              }
            ),
            ...agents.slice(index + 1, agents.length)
          ]);
        })
        .catch((err) => {
          outerThis.setConnectOrDisconnectErrorMessages(
            index,
            `Failed to ${agent.networkStatus === 'connected' ? 'Disconnect': 'Connect'}: ${
              (err &&
                (err.detail || err.message || err.err || err.title || err.description)) ||
              'Unknown Reason'
            }`
          );
        })
        .finally(() => {
          this.setConnectOrDisconnectIsRunningMessage(index, false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.setConnectOrDisconnectMessages(index, '');
            outerThis.setConnectOrDisconnectErrorMessages(index, '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    }
  },
  setConnectOrDisconnectMessages: function(index, message) {
    this.set(
      'connectOrDisconnectMessages',
      Object.assign({}, this.get('connectOrDisconnectMessages'), { [index]: message })
    );
  },
  setConnectOrDisconnectErrorMessages: function(index, message) {
    this.set(
      'connectOrDisconnectErrorMessages',
      Object.assign({}, this.get('connectOrDisconnectErrorMessages'), { [index]: message })
    );
  },
  setConnectOrDisconnectIsRunningMessage: function(index, value) {
    this.set(
      'connectOrDisconnectIsRunning',
      Object.assign({}, this.get('connectOrDisconnectIsRunning'), { [index]: value })
    );
  }
});
