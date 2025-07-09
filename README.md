# iDevice Activation Server

A PHP-based server that mimics Apple's iDevice activation services for educational and development purposes.

## ⚠️ Important Disclaimer

This server is created for **educational and development purposes only**. It should not be used to bypass legitimate device security measures or violate any terms of service.

## Features

- Device activation endpoint (`/deviceservices/deviceActivation.php`)
- DRM handshake endpoint (`/deviceservices/drmHandshake.php`)
- Request/response logging for debugging
- CORS support for cross-origin requests
- Clean web interface for monitoring

## Setup

1. **Web Server Requirements:**
   - PHP 7.4 or higher
   - Apache/Nginx with mod_rewrite enabled
   - Write permissions for error logging

2. **Installation:**
   ```bash
   # Copy files to your web server document root
   cp -r public/* /var/www/html/
   
   # Set proper permissions
   chmod 755 /var/www/html/deviceservices/
   chmod 644 /var/www/html/deviceservices/*.php
   ```

3. **Configuration:**
   - Ensure your web server can write to `/tmp/activation_server.log` for logging
   - Adjust CORS settings in `.htaccess` if needed
   - Configure your activation tool with these URLs:
     ```
     ACTIVATION_DEFAULT_URL = 'http://localhost/deviceservices/deviceActivation.php'
     ACTIVATION_DRM_HANDSHAKE_DEFAULT_URL = 'http://localhost/deviceservices/drmHandshake.php'
     ```

## Endpoints

### Device Activation
- **URL:** `POST /deviceservices/deviceActivation.php`
- **Purpose:** Handles device activation requests
- **Response:** XML plist with activation record and status

### DRM Handshake
- **URL:** `POST /deviceservices/drmHandshake.php`
- **Purpose:** Handles DRM handshake requests
- **Response:** XML plist with DRM certificates and session keys

## Monitoring

- Visit `http://localhost/deviceservices/` for the web interface
- Check `/tmp/activation_server.log` for detailed request/response logs
- Monitor your web server's error logs for any issues

## Request Format

The server expects XML plist format requests containing device information such as:
- DeviceClass
- HardwareModel
- ProductType
- SerialNumber
- IMEI
- UniqueDeviceID

## Response Format

Responses are returned in XML plist format with:
- Activation records (base64 encoded)
- Status information
- Certificates and signatures (simulated)

## Development

The server generates fake certificates, signatures, and activation records. For production use, you would need to implement proper cryptographic operations and certificate management.

## Troubleshooting

1. **500 Internal Server Error:**
   - Check PHP error logs
   - Verify file permissions
   - Ensure mod_rewrite is enabled

2. **CORS Issues:**
   - Adjust `.htaccess` CORS headers
   - Check browser developer tools for specific errors

3. **Logging Issues:**
   - Verify write permissions to log directory
   - Check PHP error_log configuration

## Legal Notice

This software is provided for educational purposes only. Users are responsible for ensuring compliance with all applicable laws and terms of service. The authors are not responsible for any misuse of this software.
