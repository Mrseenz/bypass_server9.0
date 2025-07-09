import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Device activation endpoint
http.route({
  path: "/deviceservices/deviceActivation",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get request details
      const body = await request.text();
      const userAgent = request.headers.get("user-agent") || "";
      const ipAddress = request.headers.get("x-forwarded-for") || 
                       request.headers.get("x-real-ip") || 
                       "unknown";

      // Parse device information from the request
      let deviceId = "";
      let serialNumber = "";
      let imei = "";
      let productType = "";

      // Extract activation-info from multipart data
      if (body.includes('activation-info')) {
        const lines = body.split('\n');
        let captureData = false;
        let activationInfo = '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine.includes('name="activation-info"')) {
            captureData = true;
            continue;
          }
          
          if (captureData && trimmedLine.startsWith('--')) {
            break;
          }
          
          if (captureData && trimmedLine) {
            activationInfo += trimmedLine + '\n';
          }
        }

        // Parse the activation info if it's XML/plist
        if (activationInfo) {
          try {
            // Extract device information from the activation data
            if (activationInfo.includes('UniqueDeviceID')) {
              const deviceIdMatch = activationInfo.match(/<string>([a-f0-9]{40})<\/string>/);
              if (deviceIdMatch) deviceId = deviceIdMatch[1];
            }
            
            if (activationInfo.includes('SerialNumber')) {
              const serialMatch = activationInfo.match(/<string>([A-Z0-9]+)<\/string>/);
              if (serialMatch) serialNumber = serialMatch[1];
            }
            
            if (activationInfo.includes('InternationalMobileEquipmentIdentity')) {
              const imeiMatch = activationInfo.match(/<string>(\d{15})<\/string>/);
              if (imeiMatch) imei = imeiMatch[1];
            }
            
            if (activationInfo.includes('ProductType')) {
              const productMatch = activationInfo.match(/<string>(iPhone\d+,\d+)<\/string>/);
              if (productMatch) productType = productMatch[1];
            }
          } catch (parseError) {
            console.error("Error parsing activation info:", parseError);
          }
        }
      }

      // Generate default values if not found
      if (!deviceId) deviceId = generateDeviceId();
      if (!serialNumber) serialNumber = "F4GTGYJZHG7F";
      if (!imei) imei = "355324087826421";
      if (!productType) productType = "iPhone9,3";

      // Log the activation request
      await ctx.runMutation(internal.activation.logActivationRequestInternal, {
        deviceId,
        serialNumber,
        imei,
        productType,
        activationType: "device",
        requestData: body.substring(0, 1000),
        responseData: "",
        ipAddress,
        userAgent,
        status: "success"
      });

      // Update device info
      await ctx.runMutation(internal.activation.updateDeviceInfoInternal, {
        deviceId,
        serialNumber,
        imei,
        productType,
        buildVersion: "19H307"
      });

      // Generate activation response
      const response = generateActivationResponse(deviceId, serialNumber, imei, productType);

      return new Response(response, {
        status: 200,
        headers: {
          "Server": "Apple",
          "Date": new Date().toUTCString(),
          "Content-Type": "text/html",
          "Connection": "close",
          "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
          "Strict-Transport-Security": "max-age=31536000; includeSubdomains",
          "X-Frame-Options": "SAMEORIGIN",
          "X-Content-Type-Options": "nosniff",
          "X-XSS-Protection": "1; mode=block",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });

    } catch (error) {
      console.error("Device activation error:", error);
      
      await ctx.runMutation(internal.activation.logActivationRequestInternal, {
        deviceId: "unknown",
        activationType: "device",
        requestData: "Error processing request",
        responseData: `Error: ${error}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "",
        status: "error"
      });

      return new Response("Internal Server Error", { status: 500 });
    }
  })
});

// DRM handshake endpoint
http.route({
  path: "/deviceservices/drmHandshake", 
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const userAgent = request.headers.get("user-agent") || "";
      const ipAddress = request.headers.get("x-forwarded-for") || 
                       request.headers.get("x-real-ip") || 
                       "unknown";

      let deviceId = "unknown";
      
      if (body.includes('UniqueDeviceID')) {
        const deviceIdMatch = body.match(/<string>([a-f0-9]{40})<\/string>/);
        if (deviceIdMatch) deviceId = deviceIdMatch[1];
      }

      const response = generateDrmResponse();

      await ctx.runMutation(internal.activation.logActivationRequestInternal, {
        deviceId,
        activationType: "drm",
        requestData: body.substring(0, 1000),
        responseData: response.substring(0, 1000),
        ipAddress,
        userAgent,
        status: "success"
      });

      return new Response(response, {
        status: 200,
        headers: {
          "Server": "Apple",
          "Date": new Date().toUTCString(),
          "Content-Type": "application/xml",
          "Connection": "close",
          "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "Strict-Transport-Security": "max-age=31536000; includeSubdomains",
          "X-Frame-Options": "SAMEORIGIN",
          "X-Content-Type-Options": "nosniff",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (error) {
      console.error("DRM handshake error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  })
});

// Handle OPTIONS requests for CORS
http.route({
  path: "/deviceservices/deviceActivation",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  })
});

http.route({
  path: "/deviceservices/drmHandshake",
  method: "OPTIONS", 
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  })
});

// Helper functions
function generateDeviceId(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 40; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateActivationResponse(deviceId: string, serialNumber: string, imei: string, productType: string): string {
  const accountTokenCert = generateBase64Data(1024);
  const deviceCert = generateBase64Data(1024);
  const regulatoryInfo = btoa('{"elabel":{"bis":{"regulatory":"R-41094897"}}}');
  const fairplayKeyData = generateBase64Data(2048);
  const accountToken = generateAccountToken(imei, serialNumber, productType, deviceId);
  const accountTokenSignature = generateBase64Data(64);
  const uniqueDeviceCert = generateBase64Data(2048);

  return `<!DOCTYPE html>
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>iPhone Activation</title>
      <script id="protocol" type="text/x-apple-plist"><plist version="1.0"><dict><key>ActivationRecord</key><dict><key>unbrick</key><true/><key>AccountTokenCertificate</key><data>${accountTokenCert}</data><key>DeviceCertificate</key><data>${deviceCert}</data><key>RegulatoryInfo</key><data>${regulatoryInfo}</data><key>FairPlayKeyData</key><data>${fairplayKeyData}</data><key>AccountToken</key><data>${accountToken}</data><key>AccountTokenSignature</key><data>${accountTokenSignature}</data><key>UniqueDeviceCertificate</key><data>${uniqueDeviceCert}</data></dict></dict></plist></script>
      <script>
         	var protocolElement = document.getElementById("protocol");
         	var protocolContent = protocolElement.innerText;
         	iTunes.addProtocol(protocolContent);
      </script>
   </head>
   <body>
   </body>
</html>`;
}

function generateDrmResponse(): string {
  const serverKP = generateBase64Data(32);
  const fdrBlob = generateBase64Data(20);
  const suInfo = generateBase64Data(64);
  const handshakeResponse = generateBase64Data(128);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>serverKP</key>
	<data>${serverKP}</data>
	<key>FDRBlob</key>
	<data>${fdrBlob}</data>
	<key>SUInfo</key>
	<data>${suInfo}</data>
	<key>HandshakeResponseMessage</key>
	<data>${handshakeResponse}</data>
</dict>
</plist>`;
}

function generateAccountToken(imei: string, serialNumber: string, productType: string, deviceId: string): string {
  const activationRandomness = generateUUID();
  const plist = `{
	"InternationalMobileEquipmentIdentity" = "${imei}";
	"PhoneNumberNotificationURL" = "https://albert.apple.com/deviceservices/phoneHome";
	"SerialNumber" = "${serialNumber}";
	"ProductType" = "${productType}";
	"UniqueDeviceID" = "${deviceId}";
	"WildcardTicket" = "MIICqgIBATALBgkqhkiG9w0BAQsxcJ8/DJNBAOkxALTzeBNbpp9ABGAAAACfSxRTueQpg/yza8WjD9qGr07bukTICZ+HbQc1UyQIeCZCn5c9DAAAAADu7u7u7u7u7+XPgQAAAAA+n5c/BAEAAAcfl0AEAQAAAj+XQQQBAAAn5dMBAAAAAEggEAC/WKb1cn3xEf5xMU8XfI9jbrU/oA+An+bQphyarg8gr6mNhgf6PZ12oEUIiWqscqwOoLSXVqc+dkonlaIZ2apETCc0OX9v03tpjgyPIhfjh/C51VK/xJ5i0/2/Mm0p7TB1QSevukb20J25AZRZOAEs22g4oKLF/Ww9ZgmRz+uQ+8La779PEltgzQ7i9toSaoLzlpFMtvslWVim+Zw+phRX+9I7X7uSTC1vsSxSQzZx6wZkXN+PDzXZ8u3a7HV98gk72LyFkDPU39zlO5F6zvheOVqcfWn4XJnPPvIZ6VvzK2/n4Y3dFIE3hlayPEzatElA3sF6aExMGgA+z6sj2KOCASAwCwYJKoZIhvcNAQEBA4IBDwAwggEKAoIBAQCskU9F2dz8TtWBq2D8AdsqcYS51H66DxZmCHEw6U9p3d8vjaEcBdF5VFwETmWJBcTJo/SiPLezdAmG40RfAsxg4sIok0CPhKsTp1mon0JBqai68SdmN0L+AsEbmNK4AjjMX6GM5t7w5mdXpgZyigRtGQDnV2P7HnOZj69PS9r/D4Q50CJNaLrGJZ1UVBNcKkJNTMD2pxrHnxdSLTj51xVITBU71Tdl7KghSskP8WagOONk5J0IcOCwIaWct9A/+Aso4yk5/PDh1YUhbUiIO+z1TL5TdiHLITgc8NXHagB/yiOEEzOx2pcZVXXjwfSZlKRHj66VlWVHgT+bEHZl0/sdAgMBAAE=";
	"PostponementInfo" = {};
	"ActivationRandomness" = "${activationRandomness}";
	"ActivityURL" = "https://albert.apple.com/deviceservices/activity";
}`;
  return btoa(plist);
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase();
  });
}

function generateBase64Data(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default http;
