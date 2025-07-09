# Sample Activation Files

This directory contains sample request and response files that demonstrate the format and structure of iDevice activation communications.

## Files Overview

### DRM Handshake
- **`sample_drmHandshake_request.xml`** - Example DRM handshake request from device
- **`sample_drmHandshake_response.json`** - Example DRM handshake response from server

### Device Activation
- **`sample_deviceActivation_request.xml`** - Example device activation request from device
- **`sample_deviceActivation_response.xml`** - Example device activation response from server

## Request/Response Flow

### 1. DRM Handshake Process
```
Device → Server: sample_drmHandshake_request.xml
Server → Device: sample_drmHandshake_response.json
```

The DRM handshake establishes secure communication and exchanges certificates and session keys.

### 2. Device Activation Process
```
Device → Server: sample_deviceActivation_request.xml
Server → Device: sample_deviceActivation_response.xml
```

The device activation process validates the device and provides activation records.

## Key Components

### Device Information (Request)
- **DeviceClass**: iPhone, iPad, iPod, etc.
- **ProductType**: Specific device model (e.g., iPhone14,2)
- **SerialNumber**: Device serial number
- **UniqueDeviceID**: Unique device identifier (UDID)
- **IMEI/MEID**: Mobile equipment identifiers
- **BuildVersion**: iOS/iPadOS build version

### Activation Response Components
- **ActivationRecord**: Base64-encoded activation data
- **ActivationState**: "Activated" or "Unactivated"
- **FairPlayCertChain**: DRM certificate chain
- **FairPlaySignature**: DRM signature
- **AccountToken**: Account authentication token

### Security Elements
- **Certificates**: X.509 certificates for device authentication
- **Signatures**: Cryptographic signatures for data integrity
- **Session Keys**: Encrypted session keys for secure communication
- **Random Values**: Cryptographic nonces and random data

## Data Formats

### XML Plist Format
Most activation communications use Apple's XML Property List format:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>KeyName</key>
    <string>StringValue</string>
    <key>DataKey</key>
    <data>Base64EncodedData</data>
</dict>
</plist>
```

### Base64 Encoding
Binary data (certificates, signatures, keys) is Base64-encoded within the XML structure.

## Important Notes

⚠️ **Sample Data Only**: All certificates, signatures, and keys in these files are fake/sample data for educational purposes.

⚠️ **Not for Production**: These samples should not be used in production environments or for bypassing legitimate security measures.

## Usage with Test Server

These sample files can be used to test the PHP activation server:

```bash
# Test DRM handshake
curl -X POST -H "Content-Type: application/xml" \
  -d @sample_drmHandshake_request.xml \
  http://localhost/deviceservices/drmHandshake.php

# Test device activation
curl -X POST -H "Content-Type: application/xml" \
  -d @sample_deviceActivation_request.xml \
  http://localhost/deviceservices/deviceActivation.php
```

## Real-World Considerations

In a production environment, these files would contain:
- Valid cryptographic certificates from Apple's PKI
- Real device identifiers and hardware information
- Properly signed activation records
- Valid carrier and network information
- Encrypted session keys and secure tokens

The sample server generates mock responses that mimic the structure but do not provide real activation capabilities.
