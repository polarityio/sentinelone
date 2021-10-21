
const ALL_ENDPOINT_DISPLAY_FIELDS = [
  { display: 'Endpoint Name', value: 'Endpoint Name' },
  { display: 'Account', value: 'Account' },
  { display: 'Site', value: 'Site' },
  { display: 'Last Logged In User', value: 'Last Logged In User' },
  { display: 'Group', value: 'Group' },
  { display: 'Domain', value: 'Domain' },
  { display: 'Console Visible IP', value: 'Console Visible IP' },
  { display: 'Agent Version', value: 'Agent Version' },
  { display: 'Last Active', value: 'Last Active' },
  { display: 'Registered On', value: 'Registered On' },
  { display: 'Health Status', value: 'Health Status' },
  { display: 'Device Type', value: 'Device Type' },
  { display: 'OS', value: 'OS' },
  { display: 'OS Version', value: 'OS Version' },
  { display: 'Architecture', value: 'Architecture' },
  { display: 'Memory', value: 'Memory' },
  { display: 'CPU Count', value: 'CPU Count' },
  { display: 'Core Count', value: 'Core Count' },
  { display: 'MAC Address', value: 'MAC Address' },
  {
    display: 'Management Connectivity',
    value: 'Management Connectivity'
  },
  { display: 'Network Status', value: 'Network Status' },
  { display: 'Update Status', value: 'Update Status' },
  { display: 'Full Disk Scan', value: 'Full Disk Scan' },
  { display: 'IP Addresses', value: 'IP Addresses' },
  { display: 'Pending Uninstall', value: 'Pending Uninstall' },
  { display: 'Pending Threat Reboot', value: 'Pending Threat Reboot' },
  { display: 'Disk Encryption', value: 'Disk Encryption' },
  { display: 'Vulnerability Status', value: 'Vulnerability Status' },
  { display: 'Installer Type', value: 'Installer Type' },
  { display: 'Customer Identifier', value: 'Customer Identifier' },
  { display: 'Firewall Status', value: 'Firewall Status' },
  {
    display: 'Configurable Network Quarantine',
    value: 'Configurable Network Quarantine'
  },
  {
    display: 'Agent Operational State',
    value: 'Agent Operational State'
  },
  { display: 'Ranger Version', value: 'Ranger Version' },
  { display: 'Storage Name', value: 'Storage Name' },
  { display: 'Storage Type', value: 'Storage Type' },
  { display: 'Locations', value: 'Locations' }
];

const DEFAULT_ENDPOINT_DISPLAY_FIELDS = [
  { display: 'Endpoint Name', value: 'Endpoint Name' },
  { display: 'Account', value: 'Account' },
  { display: 'Site', value: 'Site' },
  { display: 'Last Logged In User', value: 'Last Logged In User' },
  { display: 'Group', value: 'Group' },
  { display: 'Domain', value: 'Domain' },
  { display: 'Console Visible IP', value: 'Console Visible IP' },
  { display: 'Last Active', value: 'Last Active' },
  { display: 'Registered On', value: 'Registered On' },
  { display: 'Health Status', value: 'Health Status' },
  { display: 'Device Type', value: 'Device Type' },
  { display: 'OS Version', value: 'OS Version' },
  { display: 'MAC Address', value: 'MAC Address' },
  {
    display: 'Management Connectivity',
    value: 'Management Connectivity'
  },
  { display: 'Network Status', value: 'Network Status' },
  { display: 'Update Status', value: 'Update Status' },
  { display: 'Full Disk Scan', value: 'Full Disk Scan' },
  { display: 'IP Addresses', value: 'IP Addresses' },
  { display: 'Pending Uninstall', value: 'Pending Uninstall' },
  { display: 'Pending Threat Reboot', value: 'Pending Threat Reboot' },
  { display: 'Installer Type', value: 'Installer Type' },
  { display: 'Locations', value: 'Locations' }
];

const ALL_THREAT_DISPLAY_FIELDS = [
  { display: 'Status', value: 'Status' },
  { display: 'Threat Details', value: 'Threat Details' },
  { display: 'AI Confidence Level', value: 'AI Confidence Level' },
  { display: 'Analyst Verdict', value: 'Analyst Verdict' },
  { display: 'Incident Status', value: 'Incident Status' },
  { display: 'Endpoints', value: 'Endpoints' },
  { display: 'EndPoint IPv4 Address', value: 'EndPoint IPv4 Address' },
  { display: 'EndPoint IPv6 Address', value: 'EndPoint IPv6 Address' },
  { display: 'External IP Address', value: 'External IP Address' },
  { display: 'Reported Time', value: 'Reported Time' },
  { display: 'Identifying Time', value: 'Identifying Time' },
  { display: 'Detecting Engine', value: 'Detecting Engine' },
  { display: 'Initiated By', value: 'Initiated By' },
  { display: 'Classification', value: 'Classification' },
  {
    display: 'Agent Version On Detection',
    value: 'Agent Version On Detection'
  },
  { display: 'Agent Version', value: 'Agent Version' },
  { display: 'Hash', value: 'Hash' },
  { display: 'Path', value: 'Path' },
  { display: 'Completed Actions', value: 'Completed Actions' },
  { display: 'Pending Actions', value: 'Pending Actions' },
  { display: 'Reboot Required', value: 'Reboot Required' },
  { display: 'Failed Actions', value: 'Failed Actions' },
  { display: 'Policy At Detection', value: 'Policy At Detection' },
  {
    display: 'Mitigated Preemptivley',
    value: 'Mitigated Preemptivley'
  },
  { display: 'External Ticket', value: 'External Ticket' },
  { display: 'Accounts', value: 'Accounts' },
  { display: 'Site', value: 'Site' },
  { display: 'Group', value: 'Group' },
  { display: 'Originating Process', value: 'Originating Process' },
  { display: 'Pod Name', value: 'Pod Name' },
  { display: 'Pod Label', value: 'Pod Label' },
  { display: 'Namespace Name', value: 'Namespace Name' },
  { display: 'Controller Type', value: 'Controller Type' },
  { display: 'Controller Name', value: 'Controller Name' },
  { display: 'Node Name', value: 'Node Name' },
  { display: 'Node Label', value: 'Node Label' },
  { display: 'Cluster Name', value: 'Cluster Name' },
  { display: 'Container ID', value: 'Container ID' },
  { display: 'Container Name', value: 'Container Name' },
  { display: 'Container Image', value: 'Container Image' }
];

const DEFAULT_THREAT_DISPLAY_FIELDS = [
  { display: 'Threat Details', value: 'Threat Details' },
  { display: 'Status', value: 'Status' },
  { display: 'AI Confidence Level', value: 'AI Confidence Level' },
  { display: 'Analyst Verdict', value: 'Analyst Verdict' },
  { display: 'Incident Status', value: 'Incident Status' },
  { display: 'Endpoints', value: 'Endpoints' },
  { display: 'Reported Time', value: 'Reported Time' },
  { display: 'Detecting Engine', value: 'Detecting Engine' },
  { display: 'Initiated By', value: 'Initiated By' },
  { display: 'Classification', value: 'Classification' },
  { display: 'Hash', value: 'Hash' },
  { display: 'Path', value: 'Path' },
  { display: 'Completed Actions', value: 'Completed Actions' },
  { display: 'Pending Actions', value: 'Pending Actions' },
  { display: 'Reboot Required', value: 'Reboot Required' },
  { display: 'Failed Actions', value: 'Failed Actions' },
  { display: 'Policy At Detection', value: 'Policy At Detection' },
  {
    display: 'Mitigated Preemptivley',
    value: 'Mitigated Preemptivley'
  },
  { display: 'Accounts', value: 'Accounts' },
  { display: 'Site', value: 'Site' },
  { display: 'Group', value: 'Group' },
  { display: 'Originating Process', value: 'Originating Process' }
];


module.exports = {
  name: 'SentinelOne',
  acronym: 'S1',
  description: '', //TODO:
  entityTypes: ['IPv4', 'IPv6', 'domain', 'url', 'hash'],
  defaultColor: 'light-purple',
  styles: ['./styles/styles.less'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: '',
    rejectUnauthorized: false
  },
  logging: {
    level: 'trace' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'url',
      name: 'SentinelOne Instance URL',
      description:
        'The URL of the SentinelOne instance you would like to connect to (including http:// or https://)',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiToken',
      name: 'API Token',
      description:
        'The API Token associated with the SentinelOne Account.  ' +
        'Can be created from the Username Dropdown from Upper Right -> "My User" -> "Options" Dropdown.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'endpointFieldsToDisplay',
      name: 'Endpoint Display Fields',
      description:
        'The fields you would like displayed on the Endpoints Tab if a value is available.',
      default: DEFAULT_ENDPOINT_DISPLAY_FIELDS,
      type: 'select',
      options: ALL_ENDPOINT_DISPLAY_FIELDS,
      multiple: true,
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'threatFieldsToDisplay',
      name: 'Threat Display Fields',
      description:
        'The fields you would like displayed on the Threats Tab if a value is available.',
      default: DEFAULT_THREAT_DISPLAY_FIELDS,
      type: 'select',
      options: ALL_THREAT_DISPLAY_FIELDS,
      multiple: true,
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
