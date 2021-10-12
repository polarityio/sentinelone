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
  init() {
    if (!this.get('details.agents').length) this.set('activeTab', 'threats');
    this.set(
      'details.agents',
      orderFields(
        this.get('details.agents'),
        this.get('block.userOptions.endpointFieldsToDisplay').map(({ value }) => value)
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
    }
  }
});
