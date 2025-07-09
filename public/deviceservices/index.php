<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iDevice Activation Server</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f7;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #1d1d1f;
            margin-bottom: 20px;
        }
        .endpoint {
            background: #f6f6f6;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .active {
            background: #d4edda;
            color: #155724;
        }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍎 iDevice Activation Server</h1>
        
        <div class="warning">
            <strong>⚠️ Educational Purpose Only</strong><br>
            This server mimics Apple's activation services for educational and development purposes only. 
            Do not use this for bypassing legitimate device security measures.
        </div>

        <h2>Available Endpoints</h2>
        
        <div class="endpoint">
            <strong>Device Activation:</strong><br>
            <code>POST /deviceservices/deviceActivation.php</code>
            <span class="status active">ACTIVE</span>
        </div>
        
        <div class="endpoint">
            <strong>DRM Handshake:</strong><br>
            <code>POST /deviceservices/drmHandshake.php</code>
            <span class="status active">ACTIVE</span>
        </div>

        <h2>Server Information</h2>
        <ul>
            <li><strong>Server Time:</strong> <?php echo date('Y-m-d H:i:s T'); ?></li>
            <li><strong>PHP Version:</strong> <?php echo PHP_VERSION; ?></li>
            <li><strong>Server Software:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></li>
        </ul>

        <h2>Usage</h2>
        <p>Configure your iDevice activation tool to use these URLs:</p>
        <div class="endpoint">
            ACTIVATION_DEFAULT_URL = 'http://localhost/deviceservices/deviceActivation.php'<br>
            ACTIVATION_DRM_HANDSHAKE_DEFAULT_URL = 'http://localhost/deviceservices/drmHandshake.php'
        </div>

        <h2>Request Logs</h2>
        <p>Check your PHP error log for detailed request/response information.</p>
    </div>
</body>
</html>
