module.exports = {
  name: 'SentinelOne',
  acronym: 'S1',
  description: '', //TODO:
  entityTypes: ['IPv4', 'IPv6', 'domain', 'url', 'hash'],
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
  options: []
};
