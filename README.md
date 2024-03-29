# Polarity SentinelOne Integration

![image](https://img.shields.io/badge/status-beta-green.svg)

The SentinelOne platform delivers the defenses you need to prevent, detect, and undo—known and unknown—threats.

Polarity's SentinelOne integration allows automated queries of Endpoints and Threats using IP Addresses, URLs, Domains, and Hashes.  This integration allows you to Connect and Disconnect Endpoints from your Network, Add Threats to the Blocklist, and Edit Policy Settings.


To learn more about SentinelOne, visit the [official website](https://www.sentinelone.com/).

> ***NOTE:*** We are searching each entity for Threat in a ways specific to the entity's type.  Meaning IP Addresses are searched using the `filePath__contains` query field, Hashes are searched by `contentHashes` query field, and Domains/URLs are searched by `threatDetails__contains` query field.  This may cause Threats that contain entities not found in these fields to not show results when searching.

## SentinelOne Integration Options

### SentinelOne Instance URL
The URL of the SentinelOne instance you would like to connect to (including http:// or https://)

### API Token
The API Token associated with the SentinelOne Account.  Can be created from the Username Dropdown from Upper Right -> "My User" -> "Options" Dropdown.

### Query Type
The type(s) of data we query from Sentinel One.

### Max Concurrent Requests
Maximum number of concurrent requests.  Integration must be restarted after changing this option. Defaults to 15.

### Minimum Time Between Lookups
Minimum amount of time in milliseconds between lookups (defaults to 250).  Integration must be restarted after changing this option. Defaults to 250.

### Allow Connecting and Disconnecting Endpoints
When checked, users can Connecting and Disconnecting Endpoints from the Network.

> This option must be set to "Users can view only".

### Allow Adding Threats to Blocklist
When checked, users can add Threats to all Scope Levels in the Blocklist.

> This option must be set to "Users can view only".

### Allow Policy Edits
When checked, users can Edit Policy Fields on Accounts, Sites, Groups, and on the Global Policy.

> This option must be set to "Users can view only".

### Endpoint Display Fields
The fields you would like displayed on the Endpoints Tab if a value is available.

> This option must be set to "Users can view only".

### Threat Display Fields
The fields you would like displayed on the Threats Tab if a value is available.

> This option must be set to "Users can view only".

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).


## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
