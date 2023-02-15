const IGNORE_KEYS = [];

const objectsDeepEquals = (a, b) => {
  if (a === b) return true;

  if (typeof a != 'object' || typeof b != 'object' || a == null || b == null)
    return false;

  let keysA = Object.keys(a).filter((key) => !IGNORE_KEYS.includes(key)),
    keysB = Object.keys(b).filter((key) => !IGNORE_KEYS.includes(key));

  if (keysA.length != keysB.length) return false;

  for (let key of keysA) {
    if (!keysB.includes(key)) return false;

    if (typeof a[key] === 'function' || typeof b[key] === 'function') {
      if (a[key].toString() != b[key].toString()) return false;
    } else {
      if (!objectsDeepEquals(a[key], b[key])) return false;
    }
  }

  return true;
};

const cloneDeep = (entity, cache = new WeakMap()) => {
  const referenceTypes = ['Array', 'Object'];
  const entityType = Object.prototype.toString.call(entity);
  if (!new RegExp(referenceTypes.join('|')).test(entityType)) return entity;
  if (cache.has(entity)) {
    return cache.get(entity);
  }
  const c = new entity.constructor();
  cache.set(entity, c);
  return Object.assign(
    c,
    ...Object.keys(entity).map((prop) => ({ [prop]: cloneDeep(entity[prop], cache) }))
  );
};

const orderFields = (listOfObjects = [], fieldsOrder = []) =>
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

const policySubmissionDefaults = {
  // Protection Mode
  mitigationMode: 'protect',
  mitigationModeSuspicious: 'detect',
  autoMitigationAction: 'mitigation.quarantineThreat',
  networkQuarantineOn: false,
  // Detection Engines
  monitorOnWrite: true,
  monitorOnExecute: true,
  engines: {
    preExecution: 'on',
    preExecutionSuspicious: 'on',
    executables: 'on',
    dataFiles: 'on',
    lateralMovement: 'on',
    exploits: 'on',
    pup: 'on',
    applicationControl: 'off',
    penetration: 'on'
  },
  // Agent
  antiTamperingOn: true,
  snapshotsOn: true,
  agentLoggingOn: true,
  scanNewAgents: true,
  agentUi: {
    agentUiOn: true,
    threatPopUpNotifications: true,
    devicePopUpNotifications: true,
    showSuspicious: true,
    showAgentWarnings: false,
    maxEventAgeDays: 30,
    showDeviceTab: false,
    showQuarantineTab: true,
    showSupport: false
  },

  // Deep Visiblity
  ioc: true,
  iocAttributes: {
    process: true,
    file: true,
    url: true,
    dns: true,
    ip: true,
    login: true,
    registry: true,
    scheduledTask: true,
    fds: false,
    behavioralIndicators: false,
    commandScripts: false,
    crossProcess: true,
    dataMasking: false,
    autoInstallBrowserExtensions: true
  },
  // More Options
  autoDecommissionOn: true,
  autoDecommissionDays: 21,
  allowRemoteShell: false,

  // Code derived
  inheritedFrom: 'site'
};

const descriptions = {
  // Protection Mode
  containmentDescription:
    "Upon detection, blocks all agent's network connections besides the link to the " +
    'management console.',
  // Detection Engines
  onWriteDescription:
    'Use Static AI And Reputation To Monitor Files Written To Disk. Disabling On Write ' +
    'will also disable Static AI engines (i.e. Static AI, and Static AI - Suspicious)',
  onExecuteDescription:
    'Monitor Behavior And Detect Malicious Activity When Process Initiates. Disabling On ' +
    'Execute will also disable the following engines: Behavioral AI - Executables, ' +
    'Documents Scripts, Lateral Movement, Anti Exploitation / Fileless, Application ' +
    'Control (Containers only), Potentially Unwanted Applications, Detect Interactive Threat',
  staticAiDescription:
    'A preventive Static AI engine that scans for malicious files written to the disk. It ' +
    'supports portable executable (PE) files. For Windows Agents 2.7+: The Engine runs ' +
    'scans upon file execution in addition to when files are written to the disk.',
  staticAiSuspiciousDescription:
    'A Static AI engine that scans for suspicious files written to the disk. When in ' +
    'Protect mode, this engine is preventive. It supports portable executable (PE) files.',
  behaviorAiExecutablesDescription:
    'A Behavioral AI engine that implements advanced machine learning tools. This engine ' +
    'detects malicious activities in real-time, when processes execute.',
  documentsScriptsDescription:
    'A Behavioral AI engine, focused on all types of documents and scripts.',
  lateralMovementDescription:
    'A Behavioral AI engine that detects attacks initiated by remote devices.',
  antiExploitationFilelessDescription:
    'A Behavioral AI engine, focused on exploits and all fileless attack attempts, such as' +
    ' web-related and command line exploits.',
  potentiallyUnwantedApplicationsDescription:
    'A Static AI engine on macOS devices that inspects applications that are not ' +
    'malicious, but are considered unsuitable for business networks.',
  applicationControlContainersOnlyDescription:
    'The Application Control engine makes sure that only executables from the original ' +
    'container image run in the container. This maintains the immutability of ' +
    'containerized workloads. (Containers only)',
  detectInteractiveThreatDescription:
    'The Intrusion Detection engine is part of the Behavioral AI and focuses on insider ' +
    'threats (for example, an authenticated user runs malicious actions from a CMD or ' +
    'PowerShell command line). This engine detects malicious commands in interactive ' +
    'sessions. Intrusion Detection is disabled by default. If you want to protect your ' +
    'endpoints from malicious commands that are entered in a CLI, enable this engine. ' +
    'But, if you enable this engine for endpoints of active users of CLIs, you may expect ' +
    'a number of false positives. (Windows only)',
  // Agent
  antiTamperDescription:
    'Do not allow end users or malware to manipulate, uninstall, or disable the agent.' +
    'Recommended to keep on.',
  snapshotsDescription: 'Set Windows agents to keep VSS snapshots for Rollback.',
  loggingDescription:
    'Save logs for troubleshooting and support. If disabled, you can free some disk ' +
    'space. Recommended to keep on.',
  scanNewAgentsDescription: 'Run Full Disk Scan after installation.',
  showAgentUiAndTrayIconOnEndpointsDescription: 'Supported for all Agent versions',
  showNotificationsThreatsAndMitigationDescription:
    'Notify end-user on new threats or successful mitigation of existing threats. ' +
    'Supported for Windows Agent 21.7 EA2+, macOS Agent 21.10+.',
  showNotificationsBlockedDevicesDescription:
    'If Device Control is enabled, notify end-user when a Device is blocked or set as ' +
    'read-only based on Device Control policy.\nSupported for Windows Agent 21.7 EA2+, ' +
    'macOS Agent 21.10+.',
  includeSuspiciousDescription:
    'If enabled, Suspicious threats will be shown in the Agent UI, and be reflected in ' +
    'the Agent UI status. Supported for all Agent versions.',
  includeWarningsDescription:
    'If enabled, Agent functional warnings will be shown in the Agent UI.\nSupported for ' +
    'Windows Agent 21.7 EA2+, macOS Agent 21.10+.',
  showInUiEventsFromLastDaysDescription:
    'Threats older than this do not show in the Agent UI and do not cause the endpoint to ' +
    'show as infected in the Agent UI.\nSupported for Windows Agent 21.7 EA2+, macOS ' +
    'Agent 21.10+.',
  // Deep Visiblity
  enableDeepVisibilityDescription:
    'When enabled, the browser extension collects URL data for Deep Visibility. When ' +
    'disabled, the browser extension is uninstalled.',
  processDescription: 'Collect created and changed processes',
  fileDescription: 'Collect created, changed, or deleted files',
  urlDescription:
    'Collect visited sites - requires SentinelOne browser extension for most browsers',
  dnsDescription: 'Collect DNS connection data',
  ipDescription: 'Collect incoming and outgoing connection data',
  loginDescription: 'Collect login related events - macOS and Windows only',
  registryKeysDescription:
    'Collect events that add, edit, or remove Registry Keys - Windows Only',
  scheduledTaskDescription: 'Collect scheduled task data - Windows only',
  scheduledTaskDescription:
    'Collect data from Full Disk Scan - can consume significant network bandwidth',
  behavioralIndicatorsDescription:
    'Collect and organize data on suspicious behavior and techniques',
  commandScriptsDescription:
    'Collect PowerShell and other Command line scripts - Windows Only',
  crossProcessDescription: 'Collect events between processes',
  dataMaskingDescription:
    'When enabled, paths of zip, pdf and office documents will be masked',
  // More Options
  shouldAutoDecommissionWithinDaysDescription:
    'Remove Agents from the Management Console after days of no communication.'
};

polarity.export = PolarityComponent.extend(
  Object.assign(descriptions, {
    details: Ember.computed.alias('block.data.details'),
    activeTab: 'endpoints',
    timezone: Ember.computed('Intl', function () {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }),
    threatCountMinusOne: 0,
    agentCountMinusOne: 0,
    blockingScope: {},
    connectOrDisconnectMessages: {},
    connectOrDisconnectErrorMessages: {},
    connectOrDisconnectIsRunning: {},
    blockingMessages: {},
    blockingErrorMessages: {},
    blockingIsRunning: {},
    endpointToEditPolicyOn: {},
    protectionLevels: {
      mitigation: {
        quarantineThreat: 'Kill & Quarantine',
        remediateThreat: 'Kill & Quarantine, Remediate',
        rollbackThreat: 'Kill & Quarantine, Remediate, Rollback'
      }
    },
    editPolicyIsRunning: false,
    editPolicyMessages: '',
    editPolicyErrorMessages: '',
    expandableTitleStates: {},
    policyStateNotChanged: true,
    policyEditScope: 'site',
    interactionDisabled: Ember.computed(
      'editPolicyIsRunning',
      'editPolicyMessages',
      'editPolicyErrorMessages',
      function () {
        return (
          this.get('editPolicyIsRunning') ||
          this.get('editPolicyMessages') ||
          this.get('editPolicyErrorMessages')
        );
      }
    ),
    observer: Ember.on(
      'willUpdate',
      Ember.observer('operations', function () {
        this.set(
          'policyStateNotChanged',
          objectsDeepEquals(
            this.get('policySubmission'),
            this.get('defaultPolicySubmission')
          )
        );
      })
    ),
    orderFieldsByUserOption: function (fieldToOrder, optionName) {
      const fieldsToDisplay = this.get(`block.userOptions.${optionName}`);

      const fieldsToDisplayValues =
        fieldsToDisplay && fieldsToDisplay.map(({ value }) => value);

      const fieldsOrderedByUserOption = orderFields(fieldToOrder, fieldsToDisplayValues);

      return fieldsOrderedByUserOption;
    },
    init() {
      if (!this.get('details.agents').length) {
        this.set('activeTab', 'threats');
      } else {
        this.set('endpointToEditPolicyOn', this.get('details.unformattedAgents.0'));
      }

      // Agents
      const newAgents = this.orderFieldsByUserOption(
        this.get('details.agents'),
        'endpointFieldsToDisplay'
      );

      const formattedNewAgents =
        newAgents &&
        newAgents.map((agent) => {
          const unformattedAgents = this.get('details.unformattedAgents')
          const thisUnformattedAgent =
            unformattedAgents &&
            unformattedAgents.find(
              ({ computerName }) => computerName === (agent['Endpoint Name'] || {}).value
            );

          return Object.assign({}, agent, {
            id: thisUnformattedAgent.id,
            endpointName: thisUnformattedAgent.computerName,
            networkStatus: (agent['Network Status'] || {}).value || 'Unknown'
          });
        });

      this.set('agentCountMinusOne', this.get('details.unformattedAgents').length -1)

      this.set('details.agents', formattedNewAgents || []);

      // Threats
      const oldThreats = this.get('details.threats');
      const newThreats = this.orderFieldsByUserOption(oldThreats, 'threatFieldsToDisplay');

      const formattedNewThreats =
        newThreats &&
        newThreats.map((threat) => {
          const unformattedThreats =this.get('details.unformattedThreats')
          const thisUnformattedThreat =
            unformattedThreats &&
            unformattedThreats.find(({ threatInfo }) => {
              if (!threatInfo) return;
              const threatHashValue = threat && threat.Hash && threat.Hash.value;
              return (
                threatInfo.md5 === threatHashValue ||
                threatInfo.sha1 === threatHashValue ||
                threatInfo.sha256 === threatHashValue
              );
            });

          const { id, blocklistInfo } = thisUnformattedThreat || {};

          return Object.assign({}, threat, {
            id: id,
            numberOfBlocklistItems: blocklistInfo ? blocklistInfo.length : 0,
            blocklistScope: (threat['Blocklist Scope'] || {}).value || 'Unknown'
          });
        });

      this.set('details.threats', formattedNewThreats);

      this.set('threatCountMinusOne', this.get('details.unformattedThreats').length -1)

      this.set(
        'blockingScope',
        formattedNewThreats &&
          formattedNewThreats.reduce(
            (agg, x, i) => Object.assign({}, agg, { [i]: 'site' }),
            {}
          )
      );

      // Policy
      const policySubmission =
        this.get('details.unformattedAgents.0.sitePolicy') || policySubmissionDefaults;

      this.set('policySubmission', policySubmission);
      this.set(
        'defaultPolicySubmission',
        policySubmission && cloneDeep(policySubmission)
      );

      const defaultEngineValues = policySubmission.engines;

      Object.keys(defaultEngineValues).forEach((defaultEngineKey) =>
        this.set(defaultEngineKey, defaultEngineValues[defaultEngineKey] === 'on')
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

            //Modifying the agent's `Network Status` property to reflect the change in network status
            //Ordering fields based on the user option for consistency with other agent objects
            const modifiedAgent = Object.assign(
              {},
              outerThis.orderFieldsByUserOption(
                [
                  Object.assign({}, agent, {
                    ['Network Status']: { value: networkStatus, capitalize: true }
                  })
                ],
                'endpointFieldsToDisplay'
              )[0],
              {
                networkStatus
              }
            );

            outerThis.set('details.agents', [
              ...agents.slice(0, index),
              modifiedAgent,
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
                  (err.detail ||
                    err.message ||
                    err.err ||
                    err.title ||
                    err.description)) ||
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
      setBlockingScope: function (index, e) {
        this.set(
          'blockingScope',
          Object.assign({}, this.get('blockingScope'), { [index]: e.target.value })
        );
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

            const newThreat = outerThis.orderFieldsByUserOption(
              [
                Object.assign({}, threat, {
                  ['Found in Blocklist']: { value: newFoundInBlocklist },
                  ['Blocklist Scope']: { value: newBlockingScope }
                })
              ],
              'threatFieldsToDisplay'
            )[0];

            const threats = outerThis.get('details.threats');
            outerThis.set('details.threats', [
              ...threats.slice(0, index),
              newThreat,
              ...threats.slice(index + 1, threats.length)
            ]);
          })
          .catch((err) => {
            outerThis.setErrorMessages(
              index,
              'blocking',
              `Failed to Block Threat: ${
                (err &&
                  (err.detail ||
                    err.message ||
                    err.err ||
                    err.title ||
                    err.description)) ||
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
      changeEndpointToEditPolicyOn: function (index) {
        this.set('endpointToEditPolicyOn', this.get('details.agents')[index]);
      },

      toggleExpandableTitle: function (key) {
        const modifiedExpandableTitleStates = Object.assign(
          {},
          this.get('expandableTitleStates'),
          {
            [key]: !this.get('expandableTitleStates')[key]
          }
        );

        this.set(`expandableTitleStates`, modifiedExpandableTitleStates);
      },
      changePolicyEditScope: function (newValue) {
        const newPolicy =
          newValue === 'global'
            ? this.get('details.globalPolicy')
            : this.get(`endpointToEditPolicyOn.${newValue}Policy`) ||
              policySubmissionDefaults;

        this.set('policySubmission', newPolicy);
        this.set('defaultPolicySubmission', newPolicy && cloneDeep(newPolicy));
        const defaultEngineValues = newPolicy.engines;

        Object.keys(defaultEngineValues).forEach((defaultEngineKey) =>
          this.set(defaultEngineKey, defaultEngineValues[defaultEngineKey] === 'on')
        );
        this.set('policyStateNotChanged', true);
        this.set('policyEditScope', newValue);
      },
      updateDetectionEngine: function (fullUpdatePath, e) {
        const splitFullUpdatePath = fullUpdatePath.split('.');
        const propertyPath = splitFullUpdatePath[splitFullUpdatePath.length - 1];
        const newValueBoolean = !this.get(propertyPath);
        const newValue = newValueBoolean ? 'on' : 'off';

        this.set(fullUpdatePath, newValue);
        this.set(propertyPath, newValueBoolean);
      },
      setWithinRange: function (propertyPath, minStr, maxStr) {
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        const propertyPathValue = parseInt(this.get(propertyPath), 10);

        if (propertyPathValue < min) {
          this.set(propertyPath, min);
        } else if (propertyPathValue > max) {
          this.set(propertyPath, max);
        } else {
          this.set(propertyPath, propertyPathValue);
        }
      },
      submitPolicyEdits: function () {
        console.log({
          PS: this.get('policySubmission'),
          DPS: this.get('defaultPolicySubmission')
        });

        const outerThis = this;

        outerThis.set('editPolicyMessages', '');
        outerThis.set('editPolicyErrorMessages', '');
        outerThis.set('editPolicyIsRunning', true);

        this.sendIntegrationMessage({
          action: 'submitPolicyEdits',
          data: {
            policySubmission: this.get('policySubmission'),
            endpointToEditPolicyOn: this.get('endpointToEditPolicyOn'),
            policyEditScope: this.get('policyEditScope')
          }
        })
          .then(({}) => {
            outerThis.set('editPolicyMessages', 'Successfully Saved Policy Changes!');
            const policySubmission = this.get('policySubmission');
            setTimeout(() => {
              outerThis.set(
                'defaultPolicySubmission',
                policySubmission && cloneDeep(policySubmission)
              );
              outerThis.get('block').notifyPropertyChange('data');
            }, 5100);
          })
          .catch((err) => {
            outerThis.set(
              'editPolicyErrorMessages',
              `Failed to Save Policy Edit Changes: ${
                (err &&
                  (err.detail ||
                    err.message ||
                    err.err ||
                    err.title ||
                    err.description)) ||
                'Unknown Reason'
              }`
            );
          })
          .finally(() => {
            outerThis.set('editPolicyIsRunning', false);
            outerThis.get('block').notifyPropertyChange('data');
            setTimeout(() => {
              outerThis.set('editPolicyMessages', '');
              outerThis.set('editPolicyErrorMessages', '');
              outerThis.get('block').notifyPropertyChange('data');
            }, 5000);
          });
      },
      toggleState: function (path) {
        this.toggleProperty(path);
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
  })
);
