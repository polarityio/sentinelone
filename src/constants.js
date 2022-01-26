const { map, flow, get, filter, join, capitalize, eq, size } = require('lodash/fp');

const IGNORED_IPS = new Set(['127.0.0.1', '255.255.255.255', '0.0.0.0']);

const yesNoProcess = (x) => (x ? 'Yes' : 'No');
const defaultNaProcess = (x) => x || 'N/A';

const THREAT_DISPLAY_FIELD_PROCESSING = [
  { label: 'Status', path: 'threatInfo.mitigationStatusDescription' },
  {
    label: 'Threat Details',
    path: 'threatInfo.threatName',
    link: ({ threatInfo: { threatId }, url }) =>
      `${url}/incidents/threats/${threatId}/overview`
  },
  {
    label: 'AI Confidence Level',
    path: 'threatInfo.confidenceLevel',
    capitalize: true
  },
  { label: 'Analyst Verdict', path: 'threatInfo.analystVerdictDescription' },
  { label: 'Incident Status', path: 'threatInfo.incidentStatusDescription' },
  {
    label: 'Endpoints',
    path: 'agentRealtimeInfo.agentComputerName',
    link: ({ agentRealtimeInfo: { agentComputerName }, url }) =>
      `${url}/sentinels/devices?page=1&filter={"computerName__contains":"\"${agentComputerName}\""}`
  },
  {
    label: 'EndPoint IPv4 Address',
    path: 'agentDetectionInfo.agentIpV4'
  },
  {
    label: 'EndPoint IPv6 Address',
    path: 'agentDetectionInfo.agentIpV6'
  },
  {
    label: 'External IP Address',
    path: 'agentDetectionInfo.externalIp'
  },
  { label: 'Reported Time', path: 'threatInfo.createdAt', date: true },
  { label: 'Identifying Time', path: 'threatInfo.identifiedAt', date: true },
  { label: 'Detecting Engine', path: 'threatInfo.detectionEngines.0.title' },
  { label: 'Initiated By', path: 'threatInfo.initiatedByDescription' },
  { label: 'Classification', path: 'threatInfo.classification' },
  { label: 'Agent Version On Detection', path: 'agentDetectionInfo.agentVersion' },
  { label: 'Agent Version', path: 'agentRealtimeInfo.agentVersion' },
  {
    label: 'Hash',
    possiblePaths: ['threatInfo.md5', 'threatInfo.sha1', 'threatInfo.sha256']
  },
  { label: 'Path', path: 'threatInfo.filePath' },
  {
    label: 'Completed Actions',
    path: 'mitigationStatus',
    process: (mitigationStatuses) =>
      flow(
        filter(flow(get('status'), eq('success'))),
        map(flow(get('action'), capitalize)),
        join(', ')
      )(mitigationStatuses)
  },
  {
    label: 'Found in Blocklist',
    path: 'blocklistInfo',
    process: (blocklistInfo) =>
      blocklistInfo && size(blocklistInfo) ? `Yes (${size(blocklistInfo)})` : 'No'
  },
  {
    label: 'Blocklist Scope',
    path: 'blocklistInfo',
    process: (blocklistInfo) =>
      blocklistInfo && size(blocklistInfo)
        ? flow(map(flow(get('scopeName'), capitalize)), join(', '))(blocklistInfo)
        : undefined
  },
  {
    label: 'Pending Actions',
    path: 'threatInfo.pendingActions',
    process: yesNoProcess
  },
  {
    label: 'Reboot Required',
    path: 'threatInfo.rebootRequired',
    process: yesNoProcess
  },
  {
    label: 'Failed Actions',
    path: 'threatInfo.failedActions',
    process: yesNoProcess
  },
  {
    label: 'Policy At Detection',
    path: 'agentDetectionInfo.agentMitigationMode',
    capitalize: true
  },
  {
    label: 'Mitigated Preemptivley',
    path: 'threatInfo.mitigatedPreemptively',
    process: yesNoProcess
  },
  {
    label: 'External Ticket',
    path: 'threatInfo.externalTicketId',
    process: defaultNaProcess
  },
  { label: 'Accounts', path: 'agentDetectionInfo.accountName' },
  { label: 'Site', path: 'agentDetectionInfo.siteName' },
  { label: 'Group', path: 'agentDetectionInfo.groupName' },
  {
    label: 'Originating Process',
    path: 'threatInfo.originatorProcess',
    capitalize: true
  },
  {
    label: 'Pod Name',
    path: 'kubernetesInfo.pod',
    process: defaultNaProcess
  },
  {
    label: 'Pod Label',
    path: 'kubernetesInfo.podLabels',
    process: defaultNaProcess
  },
  {
    label: 'Namespace Name',
    path: 'kubernetesInfo.namespace',
    process: defaultNaProcess
  },
  {
    label: 'Controller Type',
    path: 'kubernetesInfo.namespaceLabels',
    process: defaultNaProcess
  },
  {
    label: 'Controller Name',
    path: 'kubernetesInfo.controllerName',
    process: defaultNaProcess
  },
  {
    label: 'Node Name',
    possiblePaths: ['kubernetesInfo.node.name', 'kubernetesInfo.node'],
    process: defaultNaProcess
  },
  {
    label: 'Node Label',
    possiblePaths: ['kubernetesInfo.node.labels', 'kubernetesInfo.node'],
    process: defaultNaProcess
  },
  {
    label: 'Cluster Name',
    possiblePaths: ['kubernetesInfo.cluster.name', 'kubernetesInfo.cluster'],
    process: defaultNaProcess
  },
  {
    label: 'Container ID',
    path: 'containerInfo.id',
    process: defaultNaProcess
  },
  {
    label: 'Container Name',
    path: 'containerInfo.name',
    process: defaultNaProcess
  },
  {
    label: 'Container Image',
    path: 'containerInfo.image',
    process: defaultNaProcess
  }
];

const ENDPOINT_DISPLAY_FIELD_PROCESSING = [
  {
    label: 'Endpoint Name',
    path: 'computerName',
    link: ({ computerName, url }) =>
      `${url}/sentinels/devices?page=1&filter={"computerName__contains":"\"${computerName}\""}`
  },
  { label: 'Account', path: 'accountName' },
  { label: 'Site', path: 'siteName' },
  { label: 'Last Logged In User', path: 'lastLoggedInUserName', capitalize: true },
  { label: 'Group', path: 'groupName' },
  { label: 'Domain', path: 'domain' },
  { label: 'Console Visible IP', path: 'externalIp' },
  { label: 'Agent Version', path: 'agentVersion' },
  { label: 'Last Active', path: 'lastActiveDate', date: true },
  { label: 'Registered On', path: 'registeredAt', date: true },
  {
    label: 'Health Status',
    path: 'infected',
    process: (infected) => (infected ? 'Infected' : 'Healthy')
  },
  { label: 'Device Type', path: 'machineType', capitalize: true },
  { label: 'OS', path: 'osType', capitalize: true },
  { label: 'OS Version', path: 'osName', capitalize: true },
  { label: 'Architecture', path: 'osArch' },
  {
    label: 'Memory',
    path: 'totalMemory',
    process: (totalMemory) => `${Math.round(totalMemory / 1000)} GB`
  },
  { label: 'CPU Count', path: 'cpuCount' },
  { label: 'Core Count', path: 'coreCount' },
  { label: 'MAC Address', path: 'networkInterfaces.0.physical' },
  {
    label: 'Management Connectivity',
    path: 'isActive',
    process: (isActive) => (isActive ? 'Online' : 'Offline')
  },
  { label: 'Network Status', path: 'networkStatus', capitalize: true },
  {
    label: 'Update Status',
    path: 'isUpToDate',
    process: (isUpToDate) => (isUpToDate ? 'Up to date' : 'Pending Update')
  },
  {
    label: 'Full Disk Scan',
    path: 'scanStatus',
    process: (scanStatus) =>
      scanStatus === 'finished'
        ? 'Completed'
        : scanStatus === 'started'
        ? 'In Progress'
        : scanStatus === 'aborted'
        ? 'Aborted'
        : 'Not Started'
  },
  { label: 'IP Addresses', path: 'lastIpToMgmt' },
  {
    label: 'Pending Uninstall',
    path: 'isPendingUninstall',
    process: (isPendingUninstall) => (isPendingUninstall ? 'In Progress' : 'None')
  },
  {
    label: 'Pending Threat Reboot',
    path: 'threatRebootRequired',
    process: (isPendingUninstall) => (isPendingUninstall ? 'In Progress' : 'None')
  },
  {
    label: 'Disk Encryption',
    path: 'encryptedApplications',
    process: (encryptedApplications) => (encryptedApplications ? 'On' : 'Off')
  },
  { label: 'Vulnerability Status', path: 'appsVulnerabilityStatus', capitalize: true },
  { label: 'Installer Type', path: 'installerType' },
  { label: 'Customer Identifier', path: 'externalId' },
  {
    label: 'Firewall Status',
    path: 'firewallEnabled',
    process: (firewallEnabled) => (firewallEnabled ? 'Enabled' : 'Disabled')
  },
  {
    label: 'Configurable Network Quarantine',
    path: 'networkQuarantineEnabled',
    process: (networkQuarantineEnabled) =>
      networkQuarantineEnabled ? 'Enabled' : 'Disabled'
  },
  {
    label: 'Agent Operational State',
    path: 'operationalState',
    process: (operationalState) =>
      operationalState === 'na' ? 'Not disabled' : operationalState
  },

  {
    label: 'Storage Name',
    path: 'storageName',
    process: defaultNaProcess
  },
  {
    label: 'Storage Type',
    path: 'storageType',
    process: defaultNaProcess
  },
  {
    label: 'Locations',
    path: 'locations',
    process: (locations) => locations.map(({ name }) => name).join(', ')
  }
];

module.exports = {
  IGNORED_IPS,
  THREAT_DISPLAY_FIELD_PROCESSING,
  ENDPOINT_DISPLAY_FIELD_PROCESSING
};
