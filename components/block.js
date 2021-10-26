const orderFields = (listOfObjects, fieldsOrder) =>
  listOfObjects.map((obj) =>
    fieldsOrder.reduce(
      (agg, fieldName, i) =>
        Object.assign(
          {},
          agg,
          obj[fieldName] && {
            [fieldName]: Object.assign(
              {},
              obj[fieldName],
              Object.keys(agg).length === 0 && { first: true }
            )
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
  blockingScope: {},
  connectOrDisconnectMessages: {},
  connectOrDisconnectErrorMessages: {},
  connectOrDisconnectIsRunning: {},
  blockingMessages: {},
  blockingErrorMessages: {},
  blockingIsRunning: {},
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
      ).map((threat) => {
        const thisUnformattedThreat = this.get('details.unformattedThreats').find(
          ({ threatInfo }) =>
            threatInfo &&
            (threatInfo.md5 === threat.Hash.value ||
              threatInfo.sha1 === threat.Hash.value ||
              threatInfo.sha256 === threat.Hash.value)
        );

        return Object.assign({}, threat, {
          id: thisUnformattedThreat.id,
          numberOfBlocklistItems: thisUnformattedThreat.blocklistInfo.length,
          blocklistScope: (threat['Blocklist Scope'] || {}).value || 'Unknown'
        });
      })
    );

    this.set(
      'blockingScope',
      this.get('details.threats').reduce(
        (agg, x, i) => Object.assign({}, agg, { [i]: 'site' }),
        {}
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

      this.setMessages(index, 'connectOrDisconnect', '');
      this.setErrorMessages(index, 'connectOrDisconnect', '');
      this.setIsRunning(index, 'connectOrDisconnect', true);

      this.sendIntegrationMessage({
        action: 'connectOrDisconnectEndpoint',
        data: { id: agent.id, networkStatus: agent.networkStatus }
      })
        .then(({ networkStatus }) => {
          outerThis.setMessages(
            index,
            'connectOrDisconnect',
            `Successfully ${
              networkStatus === 'connected' || networkStatus === 'connecting'
                ? 'Initiated Connecting to'
                : 'Initiated Disconnecting from'
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
          outerThis.setErrorMessages(
            index,
            'connectOrDisconnect',
            `Failed to ${
              networkStatus === 'connected' || networkStatus === 'connecting'
                ? 'Disconnect'
                : 'Connect'
            }: ${
              (err &&
                (err.detail || err.message || err.err || err.title || err.description)) ||
              'Unknown Reason'
            }`
          );
        })
        .finally(() => {
          this.setIsRunning(index, 'connectOrDisconnect', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.setMessages(index, 'connectOrDisconnect', '');
            outerThis.setErrorMessages(index, 'connectOrDisconnect', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    addThreatToBlocklist: function (threat, index) {
      const outerThis = this;

      this.setMessages(index, 'blocking', '');
      this.setErrorMessages(index, 'blocking', '');
      this.setIsRunning(index, 'blocking', true);

      this.sendIntegrationMessage({
        action: 'addThreatToBlocklist',
        data: {
          id: threat.id,
          targetScope: this.get('blockingScope')[index],
          blocklistScope: threat.blocklistScope,
          foundInBlocklist: threat['Found in Blocklist'],
          previousNumberOfBlocklistItems: threat.numberOfBlocklistItems
        }
      })
        .then(({ newFoundInBlocklist, newBlockingScope }) => {
          outerThis.setMessages(index, 'blocking', 'Successfully Blocked Threat!');
          const threats = outerThis.get('details.threats');

          outerThis.set('details.threats', [
            ...threats.slice(0, index),
            orderFields(
              [
                Object.assign({}, threat, {
                  ['Found in Blocklist']: { value: newFoundInBlocklist },
                  ['Blocklist Scope']: { value: newBlockingScope }
                })
              ],
              outerThis
                .get('block.userOptions.threatFieldsToDisplay')
                .map(({ value }) => value)
            )[0],
            ...threats.slice(index + 1, threats.length)
          ]);
        })
        .catch((err) => {
          outerThis.setErrorMessages(
            index,
            'blocking',
            `Failed to Block Threat: ${
              (err &&
                (err.detail || err.message || err.err || err.title || err.description)) ||
              'Unknown Reason'
            }`
          );
        })
        .finally(() => {
          this.setIsRunning(index, 'blocking', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.setMessages(index, 'blocking', '');
            outerThis.setErrorMessages(index, 'blocking', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    setBlockingScope: function (index, e) {
      this.set(
        'blockingScope',
        Object.assign({}, this.get('blockingScope'), { [index]: e.target.value })
      );
    }
  },

  setMessages: function (index, prefix, message) {
    this.set(
      `${prefix}Messages`,
      Object.assign({}, this.get(`${prefix}Messages`), { [index]: message })
    );
  },
  setErrorMessages: function (index, prefix, message) {
    this.set(
      `${prefix}ErrorMessages`,
      Object.assign({}, this.get(`${prefix}ErrorMessages`), {
        [index]: message
      })
    );
  },
  setIsRunning: function (index, prefix, value) {
    this.set(
      `${prefix}IsRunning`,
      Object.assign({}, this.get(`${prefix}IsRunning`), { [index]: value })
    );
  }
});
