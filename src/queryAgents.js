const { getOr } = require('lodash/fp');

const queryAgents = async (
  entity,
  [currentThreat, ...foundThreats],
  options,
  requestWithDefaults,
  Logger,
  nextCursor,
  aggAgents = []
) => {
  const { data, pagination } = getOr(
    { data: [], pagination: {} },
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/agents`,
      qs: {
        ...(nextCursor
          ? { cursor: nextCursor }
          : {
              query: getOr(
                entity.value,
                'agentRealtimeInfo.agentComputerName',
                currentThreat
              )
            }),
        limit: 100
      },
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );
  const foundAgents = aggAgents.concat(data);

  if (pagination.nextCursor) {
    return await queryAgents(
      entity,
      currentThreat ? [currentThreat].concat(foundThreats || []) : [],
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundAgents
    );
  }

  if (foundThreats.length) {
    return await queryAgents(
      entity,
      foundThreats,
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundAgents
    );
  }

  return foundAgents;
};

module.exports = queryAgents;

const result = [
  {
    accountId: '433241117337583618',
    accountName: 'SentinelOne',
    activeDirectory: {
      computerDistinguishedName: '',
      computerMemberOf: [],
      lastUserDistinguishedName: '',
      lastUserMemberOf: []
    },
    activeThreats: 0,
    agentVersion: '21.7.1.240',
    allowRemoteShell: false,
    appsVulnerabilityStatus: 'up_to_date',
    cloudProviders: {},
    computerName: 'DESKTOP-OP7KE67',
    consoleMigrationStatus: 'N/A',
    coreCount: 12,
    cpuCount: 12,
    cpuId: 'Intel(R) Core(TM) i7-10710U CPU @ 1.10GHz',
    createdAt: '2021-08-18T19:17:42.323996Z',
    domain: 'WORKGROUP',
    encryptedApplications: false,
    externalId: '',
    externalIp: '173.50.120.113',
    firewallEnabled: true,
    groupId: '1196452793787765042',
    groupIp: '173.50.120.x',
    groupName: 'Default Group',
    id: '1225453677941600510',
    inRemoteShellSession: false,
    infected: false,
    installerType: '.exe',
    isActive: false,
    isDecommissioned: false,
    isPendingUninstall: false,
    isUninstalled: false,
    isUpToDate: true,
    lastActiveDate: '2021-09-13T17:43:12.733829Z',
    lastIpToMgmt: '192.168.1.51',
    lastLoggedInUserName: 'polarityadmin',
    licenseKey: '',
    locationEnabled: true,
    locationType: 'fallback',
    locations: [
      {
        id: '629380164464502476',
        name: 'Fallback',
        scope: 'global'
      }
    ],
    machineType: 'laptop',
    mitigationMode: 'protect',
    mitigationModeSuspicious: 'detect',
    modelName: 'Dell Inc. - XPS 13 7390',
    networkInterfaces: [
      {
        gatewayIp: '192.168.1.1',
        gatewayMacAddress: '76:ac:b9:d4:a0:d2',
        id: '1225453677958377728',
        inet: ['192.168.1.51'],
        inet6: ['fe80::fc41:c60e:20f1:9042'],
        name: 'Ethernet',
        physical: '3c:18:a0:95:15:8e'
      }
    ],
    networkQuarantineEnabled: false,
    networkStatus: 'connected',
    operationalState: 'na',
    operationalStateExpiration: null,
    osArch: '64 bit',
    osName: 'Windows 10 Home',
    osRevision: '19043',
    osStartTime: '2021-09-13T17:11:58Z',
    osType: 'windows',
    osUsername: null,
    rangerStatus: 'Enabled',
    rangerVersion: '21.7.1.2',
    registeredAt: '2021-08-18T19:17:42.319926Z',
    remoteProfilingState: 'disabled',
    remoteProfilingStateExpiration: null,
    scanAbortedAt: null,
    scanFinishedAt: '2021-08-18T19:44:58.385741Z',
    scanStartedAt: '2021-08-18T19:18:45.690347Z',
    scanStatus: 'finished',
    siteId: '1196452793770987825',
    siteName: 'Polarity',
    storageName: null,
    storageType: null,
    threatRebootRequired: false,
    totalMemory: 16166,
    updatedAt: '2021-09-29T21:41:25.677251Z',
    userActionsNeeded: [],
    uuid: 'a776b93fbe174c3a88f8088c2c5c65b7'
  }
];