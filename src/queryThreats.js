const { getOr, uniqBy } = require('lodash/fp');

const queryThreats = async (
  entity,
  [currentAgent, ...foundAgents],
  options,
  requestWithDefaults,
  Logger,
  nextCursor,
  aggThreats = []
) => {
  const { data, pagination } = getOr(
    { data: [], pagination: {} },
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `${options.url}/web/api/v2.1/threats`,
      qs: {
        ...(nextCursor
          ? { cursor: nextCursor }
          : { query: getOr(entity.value, 'computerName', currentAgent) }),
        limit: 100
      },
      headers: {
        Authorization: `ApiToken ${options.apiToken}`
      },
      json: true
    })
  );
  const foundThreats = aggThreats.concat(data);

  if (pagination.nextCursor) {
    return await queryThreats(
      entity,
      currentAgent ? [currentAgent].concat(foundAgents || []) : [],
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundThreats
    );
  }

  if (currentAgent) {
    return await queryThreats(
      entity,
      foundAgents,
      options,
      requestWithDefaults,
      Logger,
      pagination.nextCursor,
      foundThreats
    );
  }
  
  return uniqBy('id', foundThreats);
};

module.exports = queryThreats;

const result = [
  {
    agentDetectionInfo: {
      accountId: '433241117337583618',
      accountName: 'SentinelOne',
      agentDomain: 'WORKGROUP',
      agentIpV4: '192.168.1.51',
      agentIpV6: 'fe80::fc41:c60e:20f1:9042',
      agentLastLoggedInUserName: 'polarityadmin',
      agentMitigationMode: 'protect',
      agentOsName: 'Windows 10 Home',
      agentOsRevision: '19043',
      agentRegisteredAt: '2021-08-18T19:17:42.319926Z',
      agentUuid: 'a776b93fbe174c3a88f8088c2c5c65b7',
      agentVersion: '21.7.1.240',
      externalIp: '173.50.120.113',
      groupId: '1196452793787765042',
      groupName: 'Default Group',
      siteId: '1196452793770987825',
      siteName: 'Polarity'
    },
    agentRealtimeInfo: {
      accountId: '433241117337583618',
      accountName: 'SentinelOne',
      activeThreats: 0,
      agentComputerName: 'DESKTOP-OP7KE67',
      agentDecommissionedAt: null,
      agentDomain: 'WORKGROUP',
      agentId: '1225453677941600510',
      agentInfected: false,
      agentIsActive: false,
      agentIsDecommissioned: false,
      agentMachineType: 'laptop',
      agentMitigationMode: 'protect',
      agentNetworkStatus: 'connected',
      agentOsName: 'Windows 10 Home',
      agentOsRevision: '19043',
      agentOsType: 'windows',
      agentUuid: 'a776b93fbe174c3a88f8088c2c5c65b7',
      agentVersion: '21.7.1.240',
      groupId: '1196452793787765042',
      groupName: 'Default Group',
      networkInterfaces: [
        {
          id: '1225453677958377728',
          inet: ['192.168.1.51'],
          inet6: ['fe80::fc41:c60e:20f1:9042'],
          name: 'Ethernet',
          physical: '3c:18:a0:95:15:8e'
        }
      ],
      operationalState: 'na',
      rebootRequired: false,
      scanAbortedAt: null,
      scanFinishedAt: '2021-08-18T19:44:58.385741Z',
      scanStartedAt: '2021-08-18T19:18:45.690347Z',
      scanStatus: 'finished',
      siteId: '1196452793770987825',
      siteName: 'Polarity',
      storageName: null,
      storageType: null,
      userActionsNeeded: []
    },
    containerInfo: {
      id: null,
      image: null,
      labels: null,
      name: null
    },
    id: '1225454542832251195',
    indicators: [
      {
        category: 'General',
        description: 'Detected by the Static Engine.',
        ids: [43],
        tactics: []
      }
    ],
    kubernetesInfo: {
      cluster: null,
      controllerKind: null,
      controllerLabels: null,
      controllerName: null,
      namespace: null,
      namespaceLabels: null,
      node: null,
      pod: null,
      podLabels: null
    },
    mitigationStatus: [
      {
        action: 'quarantine',
        actionsCounters: {
          failed: 0,
          notFound: 0,
          pendingReboot: 0,
          success: 1,
          total: 1
        },
        agentSupportsReport: true,
        groupNotFound: false,
        lastUpdate: '2021-08-18T19:19:25.517190Z',
        latestReport: '/threats/mitigation-report/1225454543587225928',
        mitigationEndedAt: '2021-08-18T19:19:24.009000Z',
        mitigationStartedAt: '2021-08-18T19:19:24.009000Z',
        status: 'success'
      },
      {
        action: 'kill',
        actionsCounters: {
          failed: 0,
          notFound: 0,
          pendingReboot: 0,
          success: 1,
          total: 1
        },
        agentSupportsReport: true,
        groupNotFound: false,
        lastUpdate: '2021-08-18T19:19:25.475724Z',
        latestReport: '/threats/mitigation-report/1225454543234904386',
        mitigationEndedAt: '2021-08-18T19:19:23.994000Z',
        mitigationStartedAt: '2021-08-18T19:19:23.994000Z',
        status: 'success'
      }
    ],
    threatInfo: {
      analystVerdict: 'undefined',
      analystVerdictDescription: 'Undefined',
      automaticallyResolved: false,
      browserType: null,
      certificateId: 'OPEN SOURCE DEVELOPER, BENJAMIN DELPY',
      classification: 'Infostealer',
      classificationSource: 'Cloud',
      cloudFilesHashVerdict: 'black',
      collectionId: '1225454542849028412',
      confidenceLevel: 'malicious',
      createdAt: '2021-08-18T19:19:25.427247Z',
      detectionEngines: [
        {
          key: 'pre_execution',
          title: 'On-Write Static AI'
        }
      ],
      detectionType: 'dynamic',
      engines: ['On-Write DFI'],
      externalTicketExists: false,
      externalTicketId: null,
      failedActions: false,
      fileExtension: 'EXE',
      fileExtensionType: 'Executable',
      filePath: '\\Device\\HarddiskVolume3\\malware\\mimikatz.exe',
      fileSize: 1355680,
      fileVerificationType: 'SignedVerified',
      identifiedAt: '2021-08-18T19:19:23.994000Z',
      incidentStatus: 'unresolved',
      incidentStatusDescription: 'Unresolved',
      initiatedBy: 'agent_policy',
      initiatedByDescription: 'Agent Policy',
      initiatingUserId: null,
      initiatingUsername: null,
      isFileless: false,
      isValidCertificate: true,
      maliciousProcessArguments: 'mimikatz.exe',
      md5: null,
      mitigatedPreemptively: true,
      mitigationStatus: 'mitigated',
      mitigationStatusDescription: 'Mitigated',
      originatorProcess: 'cmd.exe (interactive session)',
      pendingActions: false,
      processUser: 'DESKTOP-OP7KE67\\polarityadmin',
      publisherName: 'OPEN SOURCE DEVELOPER, BENJAMIN DELPY',
      reachedEventsLimit: false,
      rebootRequired: false,
      sha1: '70df765f554ed7392200422c18776b8992c09231',
      sha256: null,
      storyline: '8DE5F5B4CE487163',
      threatId: '1225454542832251195',
      threatName: 'mimikatz.exe',
      updatedAt: '2021-08-18T19:19:25.514579Z'
    },
    whiteningOptions: ['hash', 'certificate', 'path']
  },
  {
    agentDetectionInfo: {
      accountId: '433241117337583618',
      accountName: 'SentinelOne',
      agentDomain: 'WORKGROUP',
      agentIpV4: '192.168.1.51',
      agentIpV6: 'fe80::fc41:c60e:20f1:9042',
      agentLastLoggedInUserName: 'polarityadmin',
      agentMitigationMode: 'protect',
      agentOsName: 'Windows 10 Home',
      agentOsRevision: '19043',
      agentRegisteredAt: '2021-08-18T19:17:42.319926Z',
      agentUuid: 'a776b93fbe174c3a88f8088c2c5c65b7',
      agentVersion: '21.7.1.240',
      externalIp: '173.50.120.113',
      groupId: '1196452793787765042',
      groupName: 'Default Group',
      siteId: '1196452793770987825',
      siteName: 'Polarity'
    },
    agentRealtimeInfo: {
      accountId: '433241117337583618',
      accountName: 'SentinelOne',
      activeThreats: 0,
      agentComputerName: 'DESKTOP-OP7KE67',
      agentDecommissionedAt: null,
      agentDomain: 'WORKGROUP',
      agentId: '1225453677941600510',
      agentInfected: false,
      agentIsActive: false,
      agentIsDecommissioned: false,
      agentMachineType: 'laptop',
      agentMitigationMode: 'protect',
      agentNetworkStatus: 'connected',
      agentOsName: 'Windows 10 Home',
      agentOsRevision: '19043',
      agentOsType: 'windows',
      agentUuid: 'a776b93fbe174c3a88f8088c2c5c65b7',
      agentVersion: '21.7.1.240',
      groupId: '1196452793787765042',
      groupName: 'Default Group',
      networkInterfaces: [
        {
          id: '1225453677958377728',
          inet: ['192.168.1.51'],
          inet6: ['fe80::fc41:c60e:20f1:9042'],
          name: 'Ethernet',
          physical: '3c:18:a0:95:15:8e'
        }
      ],
      operationalState: 'na',
      rebootRequired: false,
      scanAbortedAt: null,
      scanFinishedAt: '2021-08-18T19:44:58.385741Z',
      scanStartedAt: '2021-08-18T19:18:45.690347Z',
      scanStatus: 'finished',
      siteId: '1196452793770987825',
      siteName: 'Polarity',
      storageName: null,
      storageType: null,
      userActionsNeeded: []
    },
    containerInfo: {
      id: null,
      image: null,
      labels: null,
      name: null
    },
    id: '1225467789945845043',
    indicators: [],
    kubernetesInfo: {
      cluster: null,
      controllerKind: null,
      controllerLabels: null,
      controllerName: null,
      namespace: null,
      namespaceLabels: null,
      node: null,
      pod: null,
      podLabels: null
    },
    mitigationStatus: [
      {
        action: 'quarantine',
        actionsCounters: {
          failed: 0,
          notFound: 0,
          pendingReboot: 0,
          success: 1,
          total: 1
        },
        agentSupportsReport: true,
        groupNotFound: false,
        lastUpdate: '2021-08-18T19:45:44.859785Z',
        latestReport: '/threats/mitigation-report/1225467792068162889',
        mitigationEndedAt: '2021-08-18T19:45:43.223000Z',
        mitigationStartedAt: '2021-08-18T19:45:43.223000Z',
        status: 'success'
      },
      {
        action: 'kill',
        actionsCounters: null,
        agentSupportsReport: true,
        groupNotFound: false,
        lastUpdate: '2021-08-18T19:45:44.780207Z',
        latestReport: null,
        mitigationEndedAt: '2021-08-18T19:45:44.774612Z',
        mitigationStartedAt: '2021-08-18T19:45:44.774611Z',
        status: 'success'
      }
    ],
    threatInfo: {
      analystVerdict: 'undefined',
      analystVerdictDescription: 'Undefined',
      automaticallyResolved: false,
      browserType: null,
      certificateId: 'BENJAMIN DELPY',
      classification: 'Infostealer',
      classificationSource: 'Cloud',
      cloudFilesHashVerdict: 'black',
      collectionId: '1225467789962622260',
      confidenceLevel: 'malicious',
      createdAt: '2021-08-18T19:45:44.605909Z',
      detectionEngines: [
        {
          key: 'sentinelone_cloud',
          title: 'SentinelOne Cloud'
        }
      ],
      detectionType: 'static',
      engines: ['SentinelOne Cloud'],
      externalTicketExists: false,
      externalTicketId: null,
      failedActions: false,
      fileExtension: 'SYS',
      fileExtensionType: 'Executable',
      filePath: '\\Device\\HarddiskVolume3\\malware\\mimidrv.sys',
      fileSize: 37208,
      fileVerificationType: 'Expired',
      identifiedAt: '2021-08-18T19:45:43.223000Z',
      incidentStatus: 'unresolved',
      incidentStatusDescription: 'Unresolved',
      initiatedBy: 'agent_policy',
      initiatedByDescription: 'Agent Policy',
      initiatingUserId: null,
      initiatingUsername: null,
      isFileless: false,
      isValidCertificate: false,
      maliciousProcessArguments: null,
      md5: null,
      mitigatedPreemptively: false,
      mitigationStatus: 'mitigated',
      mitigationStatusDescription: 'Mitigated',
      originatorProcess: null,
      pendingActions: false,
      processUser: '',
      publisherName: 'BENJAMIN DELPY',
      reachedEventsLimit: false,
      rebootRequired: false,
      sha1: 'c66a1c6fbeacaf2db288bff8c064dfe775fd1508',
      sha256: null,
      storyline: '8E2C0888B9B39465',
      threatId: '1225467789945845043',
      threatName: 'mimidrv.sys',
      updatedAt: '2021-08-18T19:45:44.857334Z'
    },
    whiteningOptions: ['hash']
  },
  {
    agentDetectionInfo: {
      accountId: '433241117337583618',
      accountName: 'SentinelOne',
      agentDomain: 'WORKGROUP',
      agentIpV4: '192.168.1.51',
      agentIpV6: 'fe80::fc41:c60e:20f1:9042',
      agentLastLoggedInUserName: 'polarityadmin',
      agentMitigationMode: 'protect',
      agentOsName: 'Windows 10 Home',
      agentOsRevision: '19043',
      agentRegisteredAt: '2021-08-18T19:17:42.319926Z',
      agentUuid: 'a776b93fbe174c3a88f8088c2c5c65b7',
      agentVersion: '21.7.1.240',
      externalIp: '173.50.120.113',
      groupId: '1196452793787765042',
      groupName: 'Default Group',
      siteId: '1196452793770987825',
      siteName: 'Polarity'
    },
    agentRealtimeInfo: {
      accountId: '433241117337583618',
      accountName: 'SentinelOne',
      activeThreats: 0,
      agentComputerName: 'DESKTOP-OP7KE67',
      agentDecommissionedAt: null,
      agentDomain: 'WORKGROUP',
      agentId: '1225453677941600510',
      agentInfected: false,
      agentIsActive: false,
      agentIsDecommissioned: false,
      agentMachineType: 'laptop',
      agentMitigationMode: 'protect',
      agentNetworkStatus: 'connected',
      agentOsName: 'Windows 10 Home',
      agentOsRevision: '19043',
      agentOsType: 'windows',
      agentUuid: 'a776b93fbe174c3a88f8088c2c5c65b7',
      agentVersion: '21.7.1.240',
      groupId: '1196452793787765042',
      groupName: 'Default Group',
      networkInterfaces: [
        {
          id: '1225453677958377728',
          inet: ['192.168.1.51'],
          inet6: ['fe80::fc41:c60e:20f1:9042'],
          name: 'Ethernet',
          physical: '3c:18:a0:95:15:8e'
        }
      ],
      operationalState: 'na',
      rebootRequired: false,
      scanAbortedAt: null,
      scanFinishedAt: '2021-08-18T19:44:58.385741Z',
      scanStartedAt: '2021-08-18T19:18:45.690347Z',
      scanStatus: 'finished',
      siteId: '1196452793770987825',
      siteName: 'Polarity',
      storageName: null,
      storageType: null,
      userActionsNeeded: []
    },
    containerInfo: {
      id: null,
      image: null,
      labels: null,
      name: null
    },
    id: '1225467791027975481',
    indicators: [],
    kubernetesInfo: {
      cluster: null,
      controllerKind: null,
      controllerLabels: null,
      controllerName: null,
      namespace: null,
      namespaceLabels: null,
      node: null,
      pod: null,
      podLabels: null
    },
    mitigationStatus: [
      {
        action: 'quarantine',
        actionsCounters: {
          failed: 0,
          notFound: 0,
          pendingReboot: 0,
          success: 1,
          total: 1
        },
        agentSupportsReport: true,
        groupNotFound: false,
        lastUpdate: '2021-08-18T19:45:44.900509Z',
        latestReport: '/threats/mitigation-report/1225467792412095823',
        mitigationEndedAt: '2021-08-18T19:45:43.223000Z',
        mitigationStartedAt: '2021-08-18T19:45:43.223000Z',
        status: 'success'
      },
      {
        action: 'kill',
        actionsCounters: null,
        agentSupportsReport: true,
        groupNotFound: false,
        lastUpdate: '2021-08-18T19:45:44.821697Z',
        latestReport: null,
        mitigationEndedAt: '2021-08-18T19:45:44.816215Z',
        mitigationStartedAt: '2021-08-18T19:45:44.816214Z',
        status: 'success'
      }
    ],
    threatInfo: {
      analystVerdict: 'undefined',
      analystVerdictDescription: 'Undefined',
      automaticallyResolved: false,
      browserType: null,
      certificateId: 'OPEN SOURCE DEVELOPER, BENJAMIN DELPY',
      classification: 'Infostealer',
      classificationSource: 'Cloud',
      cloudFilesHashVerdict: 'black',
      collectionId: '1225467791044752698',
      confidenceLevel: 'malicious',
      createdAt: '2021-08-18T19:45:44.735231Z',
      detectionEngines: [
        {
          key: 'sentinelone_cloud',
          title: 'SentinelOne Cloud'
        }
      ],
      detectionType: 'static',
      engines: ['SentinelOne Cloud'],
      externalTicketExists: false,
      externalTicketId: null,
      failedActions: false,
      fileExtension: 'DLL',
      fileExtensionType: 'Executable',
      filePath: '\\Device\\HarddiskVolume3\\malware\\mimilib.dll',
      fileSize: 57760,
      fileVerificationType: 'SignedVerified',
      identifiedAt: '2021-08-18T19:45:43.223000Z',
      incidentStatus: 'unresolved',
      incidentStatusDescription: 'Unresolved',
      initiatedBy: 'agent_policy',
      initiatedByDescription: 'Agent Policy',
      initiatingUserId: null,
      initiatingUsername: null,
      isFileless: false,
      isValidCertificate: true,
      maliciousProcessArguments: null,
      md5: null,
      mitigatedPreemptively: false,
      mitigationStatus: 'mitigated',
      mitigationStatusDescription: 'Mitigated',
      originatorProcess: null,
      pendingActions: false,
      processUser: '',
      publisherName: 'OPEN SOURCE DEVELOPER, BENJAMIN DELPY',
      reachedEventsLimit: false,
      rebootRequired: false,
      sha1: 'b82787dc098eefa8bf917f76cfb294ac3f8349f0',
      sha256: null,
      storyline: '65A82DD192BEA6C7',
      threatId: '1225467791027975481',
      threatName: 'mimilib.dll',
      updatedAt: '2021-08-18T19:45:44.897474Z'
    },
    whiteningOptions: ['hash']
  }
];
